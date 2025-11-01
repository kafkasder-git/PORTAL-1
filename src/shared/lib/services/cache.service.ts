/**
 * Caching Service
 * Provides in-memory caching with TTL support
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  compression?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  hits: number;
  lastAccessed: number;
  size: number;
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private defaultTTL: number;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    evictions: 0,
  };

  constructor(maxSize: number = 1000, defaultTTL: number = 300) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl ?? this.defaultTTL;

    // If cache is full, evict least recently used items
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      expiresAt: Date.now() + ttl * 1000,
      hits: 0,
      lastAccessed: Date.now(),
      size: this.calculateSize(data),
    };

    this.cache.set(key, entry);
    this.stats.sets++;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    const avgHits = entries.reduce((sum, entry) => sum + entry.hits, 0) / entries.length || 0;

    return {
      ...this.stats,
      size: this.cache.size,
      maxSize: this.maxSize,
      utilization: (this.cache.size / this.maxSize) * 100,
      totalSize,
      avgHits,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100,
    };
  }

  /**
   * Get all keys matching a pattern
   */
  keys(pattern?: string): string[] {
    const allKeys = Array.from(this.cache.keys());

    if (!pattern) return allKeys;

    // Simple pattern matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return allKeys.filter(key => regex.test(key));
  }

  /**
   * Delete keys matching a pattern
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let deleted = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Evict least recently used item
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Calculate approximate size of data
   */
  private calculateSize(data: any): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }
}

// Global cache instance
export const cache = new CacheService(1000, 300);

// Cache decorator for functions
export function Cacheable(options: CacheOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;

      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, result, options);

      return result;
    };

    return descriptor;
  };
}

// Middleware for Next.js API routes
export function withCache(handler: any, options: CacheOptions = {}) {
  return async (request: any, params?: any) => {
    // Generate cache key from URL and params
    const cacheKey = `api:${request.nextUrl.pathname}:${JSON.stringify(request.nextUrl.searchParams)}`;

    // Try to get from cache
    const cached = cache.get(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Execute handler
    const response = await handler(request, params);

    // Cache successful GET requests only
    if (request.method === 'GET' && response.ok) {
      try {
        const data = await response.clone().json();
        cache.set(cacheKey, data, options);
      } catch (error) {
        console.error('Failed to cache response:', error);
      }
    }

    return response;
  };
}
