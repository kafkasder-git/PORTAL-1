/**
 * Bundle Analyzer and Optimizer
 * Analyzes and helps optimize JavaScript bundles
 */

interface BundleInfo {
  name: string;
  size: number;
  gzipSize?: number;
  chunks: string[];
  isDynamic: boolean;
  dependencies: string[];
}

interface BundleAnalysis {
  totalSize: number;
  totalGzipSize?: number;
  chunks: BundleInfo[];
  recommendations: string[];
  largestChunks: BundleInfo[];
  duplicateChunks: string[];
  unusedChunks: string[];
}

export class BundleAnalyzer {
  private bundles: Map<string, BundleInfo> = new Map();

  /**
   * Register a bundle
   */
  registerBundle(info: BundleInfo): void {
    this.bundles.set(info.name, info);
  }

  /**
   * Get bundle analysis
   */
  analyze(): BundleAnalysis {
    const chunks = Array.from(this.bundles.values());
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalGzipSize = chunks.reduce((sum, chunk) => sum + (chunk.gzipSize || 0), 0);

    // Find largest chunks
    const largestChunks = chunks
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    // Find duplicates (dependencies that appear in multiple chunks)
    const dependencyCounts = new Map<string, number>();
    chunks.forEach(chunk => {
      chunk.dependencies.forEach(dep => {
        dependencyCounts.set(dep, (dependencyCounts.get(dep) || 0) + 1);
      });
    });

    const duplicateChunks = Array.from(dependencyCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([dep, _]) => dep);

    // Generate recommendations
    const recommendations: string[] = [];

    // Check for large chunks
    largestChunks.forEach(chunk => {
      if (chunk.size > 500 * 1024) { // > 500KB
        recommendations.push(
          `Consider splitting large chunk "${chunk.name}" (${this.formatSize(chunk.size)})`
        );
      }
    });

    // Check for duplicates
    if (duplicateChunks.length > 0) {
      recommendations.push(
        `Found ${duplicateChunks.length} duplicate dependencies. Consider using Webpack's optimization.splitChunks`
      );
    }

    // Check for dynamic imports
    const dynamicChunks = chunks.filter(chunk => chunk.isDynamic);
    if (dynamicChunks.length === 0) {
      recommendations.push(
        'Consider using dynamic imports (import()) for code splitting'
      );
    }

    // Check for unused chunks (heuristic - chunks with no dependencies in main app)
    const mainChunks = chunks.filter(chunk => chunk.name.includes('main') || chunk.name.includes('app'));
    const unusedChunks = chunks.filter(chunk =>
      !mainChunks.includes(chunk) &&
      chunk.dependencies.length === 0
    );

    return {
      totalSize,
      totalGzipSize,
      chunks,
      recommendations,
      largestChunks,
      duplicateChunks,
      unusedChunks,
    };
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(): {
    codeSplitting: string[];
    treeShaking: string[];
    lazyLoading: string[];
    compression: string[];
  } {
    const suggestions = {
      codeSplitting: [
        'Use dynamic imports for route-based code splitting',
        'Split vendor libraries from application code',
        'Split large dependencies into separate chunks',
        'Use Webpack\'s optimization.splitChunks configuration',
      ],
      treeShaking: [
        'Enable "sideEffects": false in package.json',
        'Import only specific functions from libraries (import { func } from "lib")',
        'Use barrel files carefully to avoid importing everything',
        'Mark pure functions with /*#__PURE__*/ annotation',
      ],
      lazyLoading: [
        'Implement lazy loading for images',
        'Load components only when needed (React.lazy)',
        'Defer non-critical JavaScript',
        'Use intersection observer for below-fold content',
      ],
      compression: [
        'Enable gzip/brotli compression on server',
        'Compress images (use WebP format when possible)',
        'Minify JavaScript and CSS in production',
        'Remove console.log statements in production build',
      ],
    };

    return suggestions;
  }

  /**
   * Calculate bundle size savings
   */
  calculateSavings(currentSize: number, optimizedSize: number): {
    saved: number;
    savedPercent: number;
    formatted: {
      current: string;
      optimized: string;
      saved: string;
    };
  } {
    const saved = currentSize - optimizedSize;
    const savedPercent = (saved / currentSize) * 100;

    return {
      saved,
      savedPercent,
      formatted: {
        current: this.formatSize(currentSize),
        optimized: this.formatSize(optimizedSize),
        saved: this.formatSize(saved),
      },
    };
  }

  /**
   * Format size in human-readable format
   */
  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Export analysis as JSON
   */
  exportAnalysis(): string {
    const analysis = this.analyze();
    return JSON.stringify(analysis, null, 2);
  }

  /**
   * Get performance budget warnings
   */
  getBudgetWarnings(): Array<{ type: 'warning' | 'error'; message: string }> {
    const warnings: Array<{ type: 'warning' | 'error'; message: string }> = [];
    const analysis = this.analyze();

    // Define budget thresholds (in bytes)
    const BUDGETS = {
      total: 1024 * 1024, // 1MB
      chunk: 300 * 1024, // 300KB
      gzip: 0.6, // 60% compression ratio
    };

    // Check total size
    if (analysis.totalSize > BUDGETS.total) {
      warnings.push({
        type: 'error',
        message: `Total bundle size (${this.formatSize(analysis.totalSize)}) exceeds budget (${this.formatSize(BUDGETS.total)})`,
      });
    }

    // Check chunk sizes
    analysis.largestChunks.forEach(chunk => {
      if (chunk.size > BUDGETS.chunk) {
        warnings.push({
          type: 'warning',
          message: `Chunk "${chunk.name}" (${this.formatSize(chunk.size)}) exceeds chunk budget (${this.formatSize(BUDGETS.chunk)})`,
        });
      }
    });

    // Check compression ratio
    if (analysis.totalGzipSize && analysis.totalGzipSize / analysis.totalSize > BUDGETS.gzip) {
      warnings.push({
        type: 'warning',
        message: `Compression ratio (${((analysis.totalGzipSize / analysis.totalSize) * 100).toFixed(1)}%) is below target (${(BUDGETS.gzip * 100).toFixed(1)}%)`,
      });
    }

    return warnings;
  }
}

// Next.js specific optimizations
export class NextJSOptimizer {
  /**
   * Generate next.config.js optimizations
   */
  generateNextConfig(): string {
    return `
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Webpack custom configuration
  webpack: (config, { dev, isServer }) => {
    // Analyze bundle in development
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      };
    }

    // Optimize production bundle
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\\\/]node_modules[\\\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
`;
  }

  /**
   * Generate middleware for caching
   */
  generateMiddleware(): string {
    return `
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Cache static assets
  if (request.nextUrl.pathname.match(/\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
`;
  }
}

export const bundleAnalyzer = new BundleAnalyzer();
export const nextOptimizer = new NextJSOptimizer();
