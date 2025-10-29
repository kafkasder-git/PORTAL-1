/**
 * Network Request Monitoring and Failed Request Detection
 *
 * Intercepts all fetch requests and logs failed requests with detailed information.
 * Tracks timing, headers, payload, and response for debugging.
 *
 * Usage: Call NetworkMonitor.init() in your root provider
 */

type RequestLog = {
  id: string;
  url: string;
  method: string;
  timestamp: Date;
  duration?: number;
  status?: number;
  success: boolean;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  error?: string;
};

class NetworkMonitorClass {
  private requests: RequestLog[] = [];
  private isInitialized = false;
  private originalFetch: typeof fetch;
  private requestIdCounter = 0;

  // URLs to ignore in logging (internal/debug tools)
  private readonly ignoredUrls = [
    'localhost:54278', // MCP Browser extension
    '__nextjs_original-stack-frames', // Next.js internal
    '/_next/webpack-hmr', // Next.js HMR
  ];

  constructor() {
    // Safe initialization for SSR - fetch is available on both server and client
    if (typeof window !== 'undefined') {
    this.originalFetch = fetch.bind(window);
    } else {
      // Fallback for server-side
      this.originalFetch = fetch;
    }
  }

  /**
   * Initialize network monitoring (development only)
   */
  init() {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    if (this.isInitialized) {
      console.warn('⚠️ NetworkMonitor already initialized');
      return;
    }

    this.isInitialized = true;
    this.interceptFetch();

    console.log('🔍 NetworkMonitor initialized');

    // Expose to window for manual debugging
    if (typeof window !== 'undefined') {
      (window as any).__NETWORK_MONITOR__ = this;
    }
  }

  /**
   * Intercept global fetch function
   */
  private interceptFetch() {
    if (typeof window === 'undefined') return;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const requestId = `req_${++this.requestIdCounter}`;
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const method = init?.method || 'GET';
      const startTime = performance.now();

      // Check if URL should be ignored
      const shouldIgnore = this.ignoredUrls.some((ignoredUrl) => url.includes(ignoredUrl));

      // Create request log
      const log: RequestLog = {
        id: requestId,
        url,
        method,
        timestamp: new Date(),
        success: false,
      };

      // Capture request headers
      if (init?.headers) {
        log.requestHeaders = this.headersToObject(init.headers);
      }

      // Capture request body
      if (init?.body) {
        try {
          log.requestBody = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        } catch {
          log.requestBody = init.body;
        }
      }

      // Only log if not ignored
      if (!shouldIgnore) {
      console.log(`📤 [${requestId}] ${method} ${url}`);
      }

      try {
        // Make the actual request
        const response = await this.originalFetch(input, init);
        const endTime = performance.now();

        log.duration = endTime - startTime;
        log.status = response.status;
        log.success = response.ok;

        // Capture response headers
        log.responseHeaders = this.headersToObject(response.headers);

        // Clone response to read body without consuming it
        const clonedResponse = response.clone();

        try {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            log.responseBody = await clonedResponse.json();
          } else {
            log.responseBody = await clonedResponse.text();
          }
        } catch (error) {
          log.responseBody = 'Failed to parse response body';
        }

        // Log request
        this.requests.push(log);

        // Log failed requests (always log failures even if otherwise ignored)
        if (!response.ok) {
          if (!shouldIgnore) {
          this.logFailedRequest(log);
          }
        } else {
          // Only log success if not ignored
          if (!shouldIgnore) {
          console.log(
            `✅ [${requestId}] ${method} ${url} - ${response.status} (${log.duration.toFixed(2)}ms)`
          );
          }
        }

        // Track specific endpoints (only if not ignored)
        if (!shouldIgnore) {
        this.trackSpecialEndpoints(url, log);
        }

        return response;
      } catch (error: any) {
        const endTime = performance.now();

        log.duration = endTime - startTime;
        log.success = false;
        log.error = error.message || 'Network request failed';

        this.requests.push(log);
        // Always log failed requests even if URL is ignored
        if (!shouldIgnore) {
        this.logFailedRequest(log);
        }

        throw error;
      }
    };
  }

  /**
   * Convert Headers object to plain object
   */
  private headersToObject(headers: Headers | Record<string, string> | string[][]): Record<string, string> {
    const obj: Record<string, string> = {};

    if (headers instanceof Headers) {
      headers.forEach((value, key) => {
        obj[key] = value;
      });
    } else if (Array.isArray(headers)) {
      headers.forEach(([key, value]) => {
        obj[key] = value;
      });
    } else {
      Object.assign(obj, headers);
    }

    return obj;
  }

  /**
   * Log failed request with detailed information
   */
  private logFailedRequest(log: RequestLog) {
    console.group(`❌ [${log.id}] FAILED REQUEST`);

    console.error('URL:', log.url);
    console.error('Method:', log.method);
    console.error('Status:', log.status || 'N/A');
    console.error('Duration:', log.duration ? `${log.duration.toFixed(2)}ms` : 'N/A');

    if (log.error) {
      console.error('Error:', log.error);
    }

    if (log.requestHeaders) {
      console.log('Request Headers:', log.requestHeaders);
    }

    if (log.requestBody) {
      console.log('Request Body:', log.requestBody);
    }

    if (log.responseHeaders) {
      console.log('Response Headers:', log.responseHeaders);
    }

    if (log.responseBody) {
      console.error('Response Body:', log.responseBody);
    }

    // Provide suggestions
    console.warn('💡 Debugging Suggestions:');

    if (log.status === 401) {
      console.warn('  - Check if user is authenticated');
      console.warn('  - Verify session token is valid');
      console.warn('  - Check if cookies are being sent');
    } else if (log.status === 403) {
      console.warn('  - Check user permissions');
      console.warn('  - Verify CSRF token is included');
      console.warn('  - Check CORS headers');
    } else if (log.status === 404) {
      console.warn('  - Verify endpoint URL is correct');
      console.warn('  - Check if API route exists');
    } else if (log.status === 500) {
      console.warn('  - Check server logs for error details');
      console.warn('  - Verify database connection');
      console.warn('  - Check Appwrite status');
    } else if (log.error) {
      console.warn('  - Check network connection');
      console.warn('  - Verify API is running');
      console.warn('  - Check for CORS issues');
    }

    console.groupEnd();
  }

  /**
   * Track special endpoints (auth, CSRF, etc.)
   */
  private trackSpecialEndpoints(url: string, log: RequestLog) {
    // Track CSRF token requests
    if (url.includes('/api/csrf')) {
      if (log.success) {
        console.log('✅ CSRF token obtained');
      } else {
        console.error('❌ Failed to obtain CSRF token');
      }
    }

    // Track login requests
    if (url.includes('/api/auth/login')) {
      if (log.success) {
        console.log('✅ Login successful');

        // Check if Set-Cookie header exists
        const setCookie = log.responseHeaders?.['set-cookie'];
        if (setCookie) {
          console.log('✅ Session cookie set');
        } else {
          console.warn('⚠️ No Set-Cookie header in response');
        }
      } else {
        console.error('❌ Login failed');
      }
    }

    // Track logout requests
    if (url.includes('/api/auth/logout')) {
      if (log.success) {
        console.log('✅ Logout successful');
      } else {
        console.error('❌ Logout failed');
      }
    }

    // Track session requests
    if (url.includes('/api/auth/session')) {
      if (log.success) {
        console.log('✅ Session check successful');
      } else {
        console.error('❌ Session check failed');
      }
    }
  }

  /**
   * Get all logged requests
   */
  getRequests(): RequestLog[] {
    return this.requests;
  }

  /**
   * Get failed requests only
   */
  getFailedRequests(): RequestLog[] {
    return this.requests.filter((req) => !req.success);
  }

  /**
   * Get requests for a specific URL
   */
  getRequestsByUrl(url: string): RequestLog[] {
    return this.requests.filter((req) => req.url.includes(url));
  }

  /**
   * Generate comprehensive network report
   */
  getNetworkReport() {
    const totalRequests = this.requests.length;
    const successfulRequests = this.requests.filter((req) => req.success).length;
    const failedRequests = this.requests.filter((req) => !req.success).length;

    const averageDuration =
      this.requests.reduce((sum, req) => sum + (req.duration || 0), 0) / totalRequests;

    const endpointStats = new Map<string, { total: number; failed: number }>();

    this.requests.forEach((req) => {
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
        const endpoint = new URL(req.url, baseUrl).pathname;
        const stats = endpointStats.get(endpoint) || { total: 0, failed: 0 };
        stats.total++;
        if (!req.success) {
          stats.failed++;
        }
        endpointStats.set(endpoint, stats);
      } catch (error) {
        // Fallback if URL parsing fails
        const endpoint = req.url.split('?')[0];
      const stats = endpointStats.get(endpoint) || { total: 0, failed: 0 };
      stats.total++;
      if (!req.success) {
        stats.failed++;
      }
      endpointStats.set(endpoint, stats);
      }
    });

    const slowestRequests = [...this.requests]
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 5);

    return {
      summary: {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
        averageDuration: averageDuration.toFixed(2) + 'ms',
      },
      endpoints: Array.from(endpointStats.entries()).map(([endpoint, stats]) => ({
        endpoint,
        total: stats.total,
        failed: stats.failed,
        failureRate: stats.total > 0 ? (stats.failed / stats.total) * 100 : 0,
      })),
      slowestRequests: slowestRequests.map((req) => ({
        url: req.url,
        method: req.method,
        duration: req.duration?.toFixed(2) + 'ms',
        status: req.status,
      })),
      failedRequests: this.getFailedRequests().map((req) => ({
        id: req.id,
        url: req.url,
        method: req.method,
        status: req.status,
        error: req.error,
        timestamp: req.timestamp.toISOString(),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Print network report to console
   */
  printReport() {
    const report = this.getNetworkReport();

    console.group('📊 Network Report');

    console.log('Summary:');
    console.table(report.summary);

    if (report.endpoints.length > 0) {
      console.log('Endpoints:');
      console.table(report.endpoints);
    }

    if (report.slowestRequests.length > 0) {
      console.log('Slowest Requests:');
      console.table(report.slowestRequests);
    }

    if (report.failedRequests.length > 0) {
      console.error('Failed Requests:');
      console.table(report.failedRequests);
    }

    console.groupEnd();
  }

  /**
   * Export report as JSON
   */
  exportReport(): string {
    return JSON.stringify(this.getNetworkReport(), null, 2);
  }

  /**
   * Clear all logged requests
   */
  clearRequests() {
    this.requests = [];
    console.log('🗑️ Network requests cleared');
  }
}

// Singleton instance
export const NetworkMonitor = new NetworkMonitorClass();
