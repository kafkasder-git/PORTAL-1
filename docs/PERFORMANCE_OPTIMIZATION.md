# Performance Optimization & Caching Guide

## Overview

This document outlines the comprehensive performance optimization strategies implemented in the Dernek Yönetim Sistemi, including caching, bundle optimization, performance monitoring, and offline support.

## Table of Contents

1. [Caching Strategy](#caching-strategy)
2. [Performance Monitoring](#performance-monitoring)
3. [Bundle Optimization](#bundle-optimization)
4. [Image Optimization](#image-optimization)
5. [Service Worker & Offline Support](#service-worker--offline-support)
6. [Best Practices](#best-practices)
7. [Performance Budgets](#performance-budgets)
8. [Monitoring & Alerting](#monitoring--alerting)

---

## Caching Strategy

### Overview

The application implements a multi-layer caching system to reduce latency and improve user experience.

### Cache Layers

#### 1. In-Memory Cache

**Location**: Client-side (React/JavaScript)

**Implementation**: `CacheService` class

**Use Cases**:
- API responses (GET requests)
- Computed data
- User preferences
- Small datasets

**Features**:
- TTL (Time-To-Live) support
- LRU (Least Recently Used) eviction
- Compression support
- Statistics tracking
- Pattern-based deletion

**Example Usage**:
```typescript
import { cache } from '@/shared/lib/services/cache.service';

// Set cache
cache.set('user-data', userData, { ttl: 300 }); // 5 minutes

// Get cache
const data = cache.get('user-data');

// Use decorator
@Cacheable({ ttl: 300 })
async function fetchData() {
  return await api.getData();
}
```

**Cache Statistics**:
```typescript
const stats = cache.getStats();
console.log({
  hits: stats.hits,
  misses: stats.misses,
  hitRate: stats.hitRate,
  size: stats.size,
  utilization: stats.utilization,
});
```

#### 2. Browser Cache

**Location**: Browser HTTP cache

**Implementation**: HTTP headers via Next.js middleware

**Strategy**:
- Static assets: Cache for 1 year (immutable)
- API responses: Cache based on data sensitivity
- HTML: Short cache with revalidation

**Configuration**:
```typescript
// Cache static assets
if (request.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
  response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
}

// Cache API responses
if (request.nextUrl.pathname.startsWith('/api/public/')) {
  response.headers.set('Cache-Control', 'public, max-age=300');
}
```

#### 3. CDN Cache (Production)

**Location**: Edge CDN (Cloudflare, CloudFront, etc.)

**Configuration**:
- Static assets: 1 year cache
- Images: Optimized formats (WebP, AVIF)
- API cache: 5 minutes for public endpoints
- Dynamic content: Bypass cache

### Cache Invalidation

#### Strategies

1. **Time-based**: TTL expiration
2. **Event-based**: Data mutation triggers
3. **Pattern-based**: Delete matching keys
4. **Manual**: Explicit invalidation

#### Implementation

```typescript
// Invalidate on data update
async function updateUser(id: string, data: any) {
  await api.updateUser(id, data);

  // Invalidate related caches
  cache.delete(`user-${id}`);
  cache.deletePattern('users:*');
  cache.deletePattern(`user-${id}:*`);
}
```

---

## Performance Monitoring

### Overview

Comprehensive performance monitoring system tracks various metrics to identify bottlenecks and optimization opportunities.

### Metrics Tracked

#### 1. Response Times
- API endpoint response times
- Database query times
- Third-party service latency

#### 2. Page Load Metrics
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

#### 3. Application Metrics
- Bundle sizes
- Cache hit rates
- Error rates
- User interactions

#### 4. Business Metrics
- Page views
- Session duration
- Conversion rates
- Feature usage

### Implementation

#### Recording Metrics

```typescript
import { performanceService } from '@/shared/lib/services/performance.service';

// Direct measurement
performanceService.record('api-call', 150, 'ms');

// Function measurement
await performanceService.measure('complex-operation', async () => {
  // Your code here
  return result;
});

// Decorator usage
class DataService {
  @MonitorPerformance('fetch-users')
  async fetchUsers() {
    return await api.getUsers();
  }
}
```

#### Viewing Metrics

Navigate to `/performance` to view:
- Real-time performance dashboard
- Historical trend charts
- Cache statistics
- Error rates
- Web Vitals

### Performance Dashboard Features

1. **Summary Cards**:
   - Average response time
   - Average page load time
   - Error rate
   - Cache hit rate

2. **Charts**:
   - Response time trends
   - Page load time distribution
   - Error rate over time
   - Cache utilization

3. **Recent Activity**:
   - Latest performance events
   - Error logs
   - Cache operations

---

## Bundle Optimization

### Overview

Advanced bundle analysis and optimization to reduce JavaScript bundle sizes and improve load times.

### Optimization Techniques

#### 1. Code Splitting

**Route-based splitting**:
```typescript
// Lazy load pages
const Dashboard = lazy(() => import('@/app/(dashboard)/page'));
const Analytics = lazy(() => import('@/app/(dashboard)/analytics/page'));
```

**Component-based splitting**:
```typescript
const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));
```

**Dynamic imports**:
```typescript
// Load on demand
const module = await import('./heavy-module.js');
```

#### 2. Tree Shaking

Configuration:
```json
{
  "sideEffects": false
}
```

Import statements:
```typescript
// Bad - imports entire library
import _ from 'lodash';

// Good - imports only needed functions
import { debounce, throttle } from 'lodash-es';
import debounce from 'lodash/debounce';
```

#### 3. Dynamic Imports for Large Libraries

```typescript
// Load chart library only when needed
const useChart = async () => {
  const { LineChart } = await import('recharts');
  return LineChart;
};
```

#### 4. Vendor Chunk Splitting

Webpack configuration:
```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
        },
      },
    },
  },
};
```

### Bundle Analysis

```typescript
import { bundleAnalyzer } from '@/shared/lib/optimization/bundle-analyzer';

// Register chunks
bundleAnalyzer.registerChunk({
  name: 'vendor',
  size: 500000,
  gzipSize: 150000,
  chunks: ['vendors'],
  isDynamic: false,
  dependencies: ['react', 'lodash'],
});

// Analyze bundle
const analysis = bundleAnalyzer.analyze();

console.log({
  totalSize: analysis.totalSize,
  recommendations: analysis.recommendations,
  largestChunks: analysis.largestChunks,
});

// Export analysis
const report = bundleAnalyzer.exportAnalysis();
```

### Performance Budgets

| Metric | Budget | Status |
|--------|--------|--------|
| Total Bundle Size | < 1 MB | ✓ |
| Initial Bundle | < 250 KB | ✓ |
| Vendor Bundle | < 300 KB | ✓ |
| Per Route | < 200 KB | ✓ |
| Images | < 500 KB | ✓ |

---

## Image Optimization

### Overview

Comprehensive image optimization including responsive images, lazy loading, and modern formats.

### Features

#### 1. Responsive Images

Generate multiple sizes:
```typescript
import { generateResponsiveSources } from '@/shared/lib/optimization/image-optimizer';

const sources = generateResponsiveSources('/api/images/photo', {
  format: 'auto',
  quality: 75,
});
// Returns: [{ src: '...&w=320', width: 320 }, ...]
```

#### 2. Lazy Loading

Automatic lazy loading with Intersection Observer:
```typescript
import { LazyImageLoader } from '@/shared/lib/optimization/image-optimizer';

const loader = new LazyImageLoader();

// Observe image
loader.observe(imageElement, actualSrc);
```

#### 3. Modern Formats

Support for:
- WebP (best compression)
- AVIF (newest, best quality)
- JPEG (fallback)
- PNG (for graphics)

#### 4. Optimized Component

```typescript
import { OptimizedImage } from '@/shared/lib/optimization/image-optimizer';

<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero Image"
  width={1200}
  height={600}
  priority={false}
  placeholder="blur"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  quality={85}
  format="auto"
/>
```

#### 5. Blur Placeholders

```typescript
const blurDataURL = await generateBlurPlaceholder(imageSrc);
// Returns a base64-encoded blur image
```

#### 6. Preloading

```typescript
import { preloadImage } from '@/shared/lib/optimization/image-optimizer';

await preloadImage('/images/hero.jpg');
```

### Image Optimization Pipeline

1. **Upload** → Server-side optimization
2. **Storage** → CDN with multiple formats
3. **Delivery** → Responsive images via query params
4. **Client** → Lazy loading + blur placeholders

---

## Service Worker & Offline Support

### Overview

Service Worker implementation for offline support, background sync, and push notifications.

### Features

#### 1. Offline Caching

**Precache Strategy**:
- Cache core resources on install
- Serve offline page when network unavailable

**Runtime Caching**:
- Cache API responses
- Cache static assets
- Network-first with cache fallback

#### 2. Background Sync

Sync offline actions when back online:
```typescript
// Register background sync
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then((registration) => {
    return registration.sync.register('sync-offline-actions');
  });
}
```

#### 3. Push Notifications

```typescript
// Subscribe to notifications
const registration = await navigator.serviceWorker.register('/sw.js');
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlB64ToUint8Array(publicVapidKey),
});
```

#### 4. Cache Management

```typescript
// Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Service Worker File Structure

```
public/
├── sw.js              # Service worker
├── manifest.json      # PWA manifest
├── offline.html       # Offline fallback page
└── icons/             # App icons
    ├── icon-72x72.png
    ├── icon-192x192.png
    └── icon-512x512.png
```

### Offline Features

1. **Browse Cached Pages**: View previously visited pages offline
2. **Offline Forms**: Submit forms that sync when online
3. **Push Notifications**: Receive updates even when app is closed
4. **Background Sync**: Automatically sync data when connection restored

---

## Best Practices

### For Developers

#### 1. Use Caching Appropriately

✅ **DO**:
- Cache GET request responses
- Cache computed data
- Set appropriate TTL values
- Use cache decorators for functions

❌ **DON'T**:
- Cache POST/PUT/DELETE responses
- Cache sensitive user data
- Set TTL too high for frequently changing data
- Cache without invalidation strategy

#### 2. Optimize Images

✅ **DO**:
- Use OptimizedImage component
- Provide multiple sizes
- Use modern formats (WebP, AVIF)
- Add blur placeholders

❌ **DON'T**:
- Use large uncompressed images
- Load all images at once
- Use same image for all screen sizes
- Forget alt text

#### 3. Monitor Performance

✅ **DO**:
- Use performance monitoring decorator
- Track custom metrics
- Review performance dashboard regularly
- Set performance budgets

❌ **DON'T**:
- Ignore slow queries
- Skip bundle analysis
- Forget to measure impact of changes
- Leave console.log in production

#### 4. Code Splitting

✅ **DO**:
- Split routes into separate chunks
- Lazy load heavy components
- Use dynamic imports for large libraries

❌ **DON'T**:
- Put everything in one bundle
- Import entire libraries for one function
- Ignore bundle size warnings

### Performance Checklist

Before deploying, ensure:

- [ ] Bundle size < performance budget
- [ ] All images optimized
- [ ] Lazy loading implemented
- [ ] Caching configured
- [ ] Performance monitoring active
- [ ] Service worker registered
- [ ] Error tracking enabled
- [ ] CDN configured
- [ ] Gzip/Brotli compression enabled
- [ ] Tree shaking configured

---

## Performance Budgets

### Budget Configuration

```typescript
const PERFORMANCE_BUDGETS = {
  // Bundle sizes
  TOTAL_BUNDLE: 1024 * 1024, // 1MB
  INITIAL_BUNDLE: 250 * 1024, // 250KB
  VENDOR_BUNDLE: 300 * 1024, // 300KB
  PER_ROUTE: 200 * 1024, // 200KB

  // Runtime metrics
  API_RESPONSE_TIME: 200, // 200ms
  PAGE_LOAD_TIME: 2000, // 2s
  FCP: 1000, // 1s
  LCP: 2500, // 2.5s
  FID: 100, // 100ms
  CLS: 0.1, // 0.1

  // Caching
  CACHE_HIT_RATE: 80, // 80%
  ERROR_RATE: 1, // 1%
};
```

### Monitoring Budgets

```typescript
import { bundleAnalyzer } from '@/shared/lib/optimization/bundle-analyzer';

const warnings = bundleAnalyzer.getBudgetWarnings();

warnings.forEach((warning) => {
  if (warning.type === 'error') {
    console.error(`[PERFORMANCE BUDGET] ${warning.message}`);
  } else {
    console.warn(`[PERFORMANCE BUDGET] ${warning.message}`);
  }
});
```

---

## Monitoring & Alerting

### Key Metrics to Monitor

1. **Core Web Vitals**:
   - FCP (First Contentful Paint)
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

2. **Custom Metrics**:
   - API response times
   - Cache hit rates
   - Error rates
   - User session duration

3. **Business Metrics**:
   - Page views
   - Conversion rates
   - Feature adoption
   - User retention

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| LCP | > 2.5s | > 4s |
| FID | > 100ms | > 300ms |
| CLS | > 0.1 | > 0.25 |
| API Response | > 500ms | > 1000ms |
| Error Rate | > 5% | > 10% |
| Cache Hit Rate | < 60% | < 40% |

### Alert Channels

- Email notifications
- In-app notifications
- Slack/Teams integration
- PagerDuty for critical alerts
- Dashboard warnings

---

## Tools & Utilities

### Bundle Analysis

```bash
# Install webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer

# Build with analysis
npm run build
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

### Lighthouse CI

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "url": ["http://localhost:3000"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

### WebPageTest

Online tool for comprehensive performance testing:
- https://www.webpagetest.org/

### Chrome DevTools

Built-in performance analysis:
- Performance tab
- Network tab
- Lighthouse audit

---

## Performance Optimization Roadmap

### Phase 1: Completed ✅
- [x] In-memory caching system
- [x] Performance monitoring
- [x] Bundle analysis tools
- [x] Image optimization
- [x] Service worker implementation

### Phase 2: In Progress
- [ ] CDN integration
- [ ] Edge caching
- [ ] Database query optimization
- [ ] Real User Monitoring (RUM)
- [ ] Advanced compression

### Phase 3: Planned
- [ ] GraphQL with dataLoader
- [ ] HTTP/3 support
- [ ] Edge functions
- [ ] Predictive prefetching
- [ ] ML-based performance optimization

---

## Resources

### Documentation
- [Next.js Performance](https://nextjs.org/docs)
- [Web Vitals](https://web.dev/vitals/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Performance](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [WebPageTest](https://www.webpagetest.org/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

### Articles
- [Core Web Vitals](https://web.dev/vitals/)
- [Performance Budgets](https://addyosmani.com/fundamentals/performance-budgets/)
- [Caching Strategies](https://web.dev/cache-api-quick-guide/)

---

*Last Updated: November 2025*
*Version: 1.0*
