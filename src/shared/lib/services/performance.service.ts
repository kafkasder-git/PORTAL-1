/**
 * Performance Monitoring Service
 * Tracks and analyzes application performance
 */

export interface PerformanceMetrics {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface WebVitals {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

export interface PageLoadMetrics {
  url: string;
  loadTime: number;
  domContentLoaded: number;
  fullyLoaded: number;
  resourceCount: number;
  resourceSize: number;
  webVitals: WebVitals;
}

export interface PerformanceReport {
  timestamp: number;
  url: string;
  metrics: PageLoadMetrics;
  userAgent: string;
  connection?: string;
}

export class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private reports: PerformanceReport[] = [];

  /**
   * Record a custom metric
   */
  record(name: string, value: number, unit: string = 'ms', tags?: Record<string, string>): void {
    const metric: PerformanceMetrics = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Send to analytics service
    this.sendMetric(metric);
  }

  /**
   * Measure function execution time
   */
  async measure<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.record(name, duration, 'ms', { ...tags, status: 'success' });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(name, duration, 'ms', { ...tags, status: 'error' });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measureSync<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.record(name, duration, 'ms', { ...tags, status: 'success' });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(name, duration, 'ms', { ...tags, status: 'error' });
      throw error;
    }
  }

  /**
   * Get Web Vitals
   */
  async getWebVitals(): Promise<WebVitals> {
    const vitals: WebVitals = {};

    // Measure First Contentful Paint
    await new Promise<void>((resolve) => {
      if (typeof window === 'undefined') return resolve();

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            vitals.FCP = entry.startTime;
            resolve();
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Timeout after 5 seconds
      setTimeout(() => resolve(), 5000);
    });

    // Measure Largest Contentful Paint
    await new Promise<void>((resolve) => {
      if (typeof window === 'undefined') return resolve();

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry.startTime;
        resolve();
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      setTimeout(() => resolve(), 5000);
    });

    // Measure First Input Delay
    await new Promise<void>((resolve) => {
      if (typeof window === 'undefined') return resolve();

      new PerformanceObserver((list) => {
        const entry = list.getEntries()[0] as any;
        vitals.FID = entry.processingStart - entry.startTime;
        resolve();
      }).observe({ entryTypes: ['first-input'] });

      setTimeout(() => resolve(), 5000);
    });

    // Measure Cumulative Layout Shift
    await new Promise<void>((resolve) => {
      if (typeof window === 'undefined') return resolve();

      let clsScore = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        vitals.CLS = clsScore;
        resolve();
      }).observe({ entryTypes: ['layout-shift'] });

      setTimeout(() => resolve(), 5000);
    });

    return vitals;
  }

  /**
   * Track page load
   */
  async trackPageLoad(url: string): Promise<PageLoadMetrics> {
    if (typeof window === 'undefined') {
      throw new Error('trackPageLoad can only be called in browser');
    }

    return new Promise((resolve) => {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const resources = performance.getEntriesByType('resource');

          const metrics: PageLoadMetrics = {
            url,
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            fullyLoaded: navigation.loadEventEnd - navigation.fetchStart,
            resourceCount: resources.length,
            resourceSize: resources.reduce((sum, resource) => sum + (resource as any).transferSize || 0, 0),
            webVitals: {},
          };

          this.getWebVitals().then((vitals) => {
            metrics.webVitals = vitals;
            resolve(metrics);
          });
        }, 0);
      });
    });
  }

  /**
   * Get all metrics
   */
  getMetrics(filter?: { name?: string; startTime?: number; endTime?: number }): PerformanceMetrics[] {
    let filtered = this.metrics;

    if (filter?.name) {
      filtered = filtered.filter(m => m.name === filter.name);
    }

    if (filter?.startTime) {
      filtered = filtered.filter(m => m.timestamp >= filter.startTime!);
    }

    if (filter?.endTime) {
      filtered = filtered.filter(m => m.timestamp <= filter.endTime!);
    }

    return filtered;
  }

  /**
   * Get average metric value
   */
  getAverage(name: string, startTime?: number, endTime?: number): number {
    const filtered = this.getMetrics({ name, startTime, endTime });
    if (filtered.length === 0) return 0;

    const sum = filtered.reduce((acc, metric) => acc + metric.value, 0);
    return sum / filtered.length;
  }

  /**
   * Get percentile value
   */
  getPercentile(name: string, percentile: number, startTime?: number, endTime?: number): number {
    const filtered = this.getMetrics({ name, startTime, endTime })
      .map(m => m.value)
      .sort((a, b) => a - b);

    if (filtered.length === 0) return 0;

    const index = Math.ceil((percentile / 100) * filtered.length) - 1;
    return filtered[index];
  }

  /**
   * Generate performance report
   */
  generateReport(startTime?: number, endTime?: number): {
    metrics: PerformanceMetrics[];
    summary: {
      totalMetrics: number;
      avgLoadTime: number;
      avgFCP: number;
      avgLCP: number;
      errorRate: number;
    };
  } {
    const metrics = this.getMetrics({ startTime, endTime });
    const errorMetrics = metrics.filter(m => m.tags?.status === 'error');
    const loadMetrics = metrics.filter(m => m.name.includes('load'));

    const summary = {
      totalMetrics: metrics.length,
      avgLoadTime: this.getAverage('api-call') || this.getAverage('page-load'),
      avgFCP: this.getAverage('FCP'),
      avgLCP: this.getAverage('LCP'),
      errorRate: (errorMetrics.length / metrics.length) * 100,
    };

    return { metrics, summary };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Send metric to analytics service
   */
  private sendMetric(metric: PerformanceMetrics): void {
    // In production, send to analytics service (e.g., Datadog, New Relic, etc.)
    console.log('Performance Metric:', metric);
  }
}

// Global performance service instance
export const performanceService = new PerformanceService();

// Performance monitoring decorator
export function MonitorPerformance(name?: string, tags?: Record<string, string>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const methodName = name || propertyKey;
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return performanceService.measure(methodName, () => originalMethod.apply(this, args), tags);
    };

    return descriptor;
  };
}
