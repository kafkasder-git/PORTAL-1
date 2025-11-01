interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

interface LoggingProvider {
  name: string;
  send: (log: LogEntry) => Promise<void>;
  isEnabled: () => boolean;
}

class ConsoleLoggingProvider implements LoggingProvider {
  name = 'console';

  isEnabled(): boolean {
    return process.env.NODE_ENV === 'development' || process.env.LOG_TO_CONSOLE === 'true';
  }

  async send(log: LogEntry): Promise<void> {
    const prefix = `[${log.timestamp}] ${log.level.toUpperCase()}`;
    const message = `${prefix}: ${log.message}`;

    switch (log.level) {
      case 'error':
        console.error(message, log.context);
        break;
      case 'warn':
        console.warn(message, log.context);
        break;
      case 'debug':
        console.debug(message, log.context);
        break;
      default:
        console.log(message, log.context);
    }
  }
}

class SentryLoggingProvider implements LoggingProvider {
  name = 'sentry';

  isEnabled(): boolean {
    return !!process.env.SENTRY_DSN && typeof window !== 'undefined';
  }

  async send(log: LogEntry): Promise<void> {
    try {
      // Dynamic import to avoid loading Sentry in environments where it's not available
      const Sentry = await import('@sentry/nextjs');

      const sentryLevel = {
        debug: 'debug' as const,
        info: 'info' as const,
        warn: 'warning' as const,
        error: 'error' as const,
      }[log.level] || 'info';

      Sentry.captureMessage(log.message, {
        level: sentryLevel,
        extra: {
          ...log.context,
          userId: log.userId,
          sessionId: log.sessionId,
        },
        tags: {
          logger: 'external-logger',
          level: log.level,
        },
      });
    } catch (error) {
      console.warn('Failed to send log to Sentry:', error);
    }
  }
}

class LogRocketLoggingProvider implements LoggingProvider {
  name = 'logrocket';

  isEnabled(): boolean {
    return !!process.env.LOGROCKET_APP_ID && typeof window !== 'undefined';
  }

  async send(log: LogEntry): Promise<void> {
    try {
      // Check if LogRocket is available on window
      if (typeof window !== 'undefined' && (window as any).LogRocket) {
        const LogRocket = (window as any).LogRocket;

        LogRocket.track(log.message, {
          level: log.level,
          ...log.context,
          userId: log.userId,
          sessionId: log.sessionId,
        });
      }
    } catch (error) {
      console.warn('Failed to send log to LogRocket:', error);
    }
  }
}

class HTTPLoggingProvider implements LoggingProvider {
  name = 'http';

  isEnabled(): boolean {
    return !!process.env.LOGGING_ENDPOINT;
  }

  async send(log: LogEntry): Promise<void> {
    try {
      const response = await fetch(process.env.LOGGING_ENDPOINT!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LOGGING_API_KEY || ''}`,
        },
        body: JSON.stringify(log),
      });

      if (!response.ok) {
        throw new Error(`HTTP logging failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to send log via HTTP:', error);
    }
  }
}

class ExternalLogger {
  private providers: LoggingProvider[] = [];
  private queue: LogEntry[] = [];
  private isProcessing = false;

  constructor() {
    // Initialize providers
    this.providers = [
      new ConsoleLoggingProvider(),
      new SentryLoggingProvider(),
      new LogRocketLoggingProvider(),
      new HTTPLoggingProvider(),
    ];
  }

  async log(
    level: LogEntry['level'],
    message: string,
    context?: Record<string, any>
  ): Promise<void> {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      // Add user and session context if available
      userId: this.getCurrentUserId(),
      sessionId: this.getCurrentSessionId(),
    };

    // Add to queue for processing
    this.queue.push(logEntry);

    // Process queue
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.queue.length > 0) {
        const logEntry = this.queue.shift()!;

        // Send to all enabled providers
        const enabledProviders = this.providers.filter(provider => provider.isEnabled());

        await Promise.allSettled(
          enabledProviders.map(provider => provider.send(logEntry))
        );
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Try to get from auth store or localStorage
      if (typeof window !== 'undefined') {
        const authData = localStorage.getItem('auth-session');
        if (authData) {
          const parsed = JSON.parse(authData);
          return parsed.userId || parsed.id;
        }
      }
    } catch (error) {
      // Ignore errors when getting user ID
    }
    return undefined;
  }

  private getCurrentSessionId(): string | undefined {
    try {
      // Try to get from localStorage or generate a session ID
      if (typeof window !== 'undefined') {
        let sessionId = sessionStorage.getItem('session-id');
        if (!sessionId) {
          sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('session-id', sessionId);
        }
        return sessionId;
      }
    } catch (error) {
      // Ignore errors when getting session ID
    }
    return undefined;
  }

  // Convenience methods
  async info(message: string, context?: Record<string, any>): Promise<void> {
    return this.log('info', message, context);
  }

  async warn(message: string, context?: Record<string, any>): Promise<void> {
    return this.log('warn', message, context);
  }

  async error(message: string, context?: Record<string, any>): Promise<void> {
    return this.log('error', message, context);
  }

  async debug(message: string, context?: Record<string, any>): Promise<void> {
    return this.log('debug', message, context);
  }
}

// Create singleton instance
export const externalLogger = new ExternalLogger();

// Export types for use in other files
export type { LogEntry, LoggingProvider };
