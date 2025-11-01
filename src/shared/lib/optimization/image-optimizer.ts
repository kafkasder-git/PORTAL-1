/**
 * Image Optimization Utilities
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  placeholder?: 'blur' | 'empty';
}

export interface OptimizedImage {
  src: string;
  width: number;
  height: number;
  placeholder?: string;
  blurDataURL?: string;
}

/**
 * Generate responsive image sources
 */
export function generateResponsiveSources(
  baseSrc: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536],
  options: ImageOptimizationOptions = {}
): OptimizedImage[] {
  const { format = 'auto', quality = 75 } = options;

  return widths.map((width) => {
    const src = `${baseSrc}?w=${width}&q=${quality}&fmt=${format}`;
    return {
      src,
      width,
      height: Math.round((width * 9) / 16), // Assuming 16:9 aspect ratio
    };
  });
}

/**
 * Generate blur placeholder
 */
export function generateBlurPlaceholder(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    // In production, use a service like Cloudinary or Imgix
    // For now, return a simple data URL
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 20;
    canvas.height = 20;

    if (ctx) {
      ctx.fillStyle = '#e5e7eb';
      ctx.fillRect(0, 0, 20, 20);
      resolve(canvas.toDataURL());
    } else {
      resolve('');
    }
  });
}

/**
 * Lazy loading with Intersection Observer
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Map<HTMLImageElement, string> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = this.images.get(img);
              if (src) {
                img.src = src;
                this.images.delete(img);
                this.observer?.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: '50px',
        }
      );
    }
  }

  observe(img: HTMLImageElement, src: string): void {
    if (!this.observer) return;

    img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3C/svg%3E';
    this.images.set(img, src);
    this.observer.observe(img);
  }

  disconnect(): void {
    this.observer?.disconnect();
  }
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, as: string = 'image'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = as;

    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload ${src}`));

    document.head.appendChild(link);
  });
}

/**
 * Optimized image component props
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  className?: string;
  sizes?: string;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
}

/**
 * Image with lazy loading and optimization
 */
export function OptimizedImage(props: OptimizedImageProps) {
  const {
    src,
    alt,
    width,
    height,
    priority = false,
    placeholder = 'blur',
    className = '',
    sizes = '100vw',
    quality = 75,
    format = 'auto',
  } = props;

  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [blurDataURL, setBlurDataURL] = React.useState<string>('');

  React.useEffect(() => {
    if (placeholder === 'blur' && !priority) {
      generateBlurPlaceholder(src).then(setBlurDataURL);
    }
  }, [src, placeholder, priority]);

  const sizesAttr = sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {blurDataURL && !imageLoaded && (
        <img
          src={blurDataURL}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        sizes={sizesAttr}
        className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
}

// React import
import React from 'react';
