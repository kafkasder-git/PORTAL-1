/**
 * Mobile Responsiveness Utilities
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile devices
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Initial check
    checkDevice();

    // Listen for resize
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect touch devices
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  return isTouch;
}

/**
 * Hook to get viewport dimensions
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return viewport;
}

/**
 * Breakpoint constants
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Utility functions for responsive design
 */
export const responsive = {
  /**
   * Check if current screen is mobile
   */
  isMobile: (width: number = 0) => width < BREAKPOINTS.md,

  /**
   * Check if current screen is tablet or larger
   */
  isTablet: (width: number = 0) => width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,

  /**
   * Check if current screen is desktop
   */
  isDesktop: (width: number = 0) => width >= BREAKPOINTS.lg,

  /**
   * Get responsive value based on breakpoint
   */
  getValue: <T>(values: Partial<Record<keyof typeof BREAKPOINTS, T>>, width: number): T | undefined => {
    if (width < BREAKPOINTS.sm) return values.sm;
    if (width < BREAKPOINTS.md) return values.md;
    if (width < BREAKPOINTS.lg) return values.lg;
    if (width < BREAKPOINTS.xl) return values.xl;
    return values['2xl'];
  },
};

/**
 * CSS class generators for responsive design
 */
export const responsiveClasses = {
  /**
   * Generate responsive padding classes
   */
  padding: (p: Record<keyof typeof BREAKPOINTS, string>) =>
    `p-sm:${p.sm} p-md:${p.md} p-lg:${p.lg} p-xl:${p.xl}`,

  /**
   * Generate responsive margin classes
   */
  margin: (m: Record<keyof typeof BREAKPOINTS, string>) =>
    `m-sm:${m.sm} m-md:${m.md} m-lg:${m.lg} m-xl:${m.xl}`,

  /**
   * Generate responsive grid classes
   */
  grid: (cols: Record<keyof typeof BREAKPOINTS, number>) =>
    `grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} xl:grid-cols-${cols.xl}`,
};

/**
 * Touch-friendly tap target sizes (44px minimum)
 */
export const TAP_TARGETS = {
  small: 'min-h-[44px] min-w-[44px]',
  medium: 'min-h-[48px] min-w-[48px]',
  large: 'min-h-[56px] min-w-[56px]',
} as const;

/**
 * Safe area insets for devices with notches
 */
export const getSafeAreaInsets = () => {
  if (typeof document === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
  };
};

/**
 * Mobile-specific scroll handling
 */
export const preventOverscroll = () => {
  if (typeof document === 'undefined') return;

  // Prevent pull-to-refresh on mobile
  document.body.style overscrollBehavior = 'none';

  // Prevent elastic scrolling on iOS
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
};

/**
 * Restore scroll behavior
 */
export const restoreScroll = () => {
  if (typeof document === 'undefined') return;

  document.body.style overscrollBehavior = '';
  document.body.style.position = '';
  document.body.style.width = '';
};

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Detect iOS device
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Detect Android device
 */
export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;

  return /Android/.test(navigator.userAgent);
}

/**
 * Get device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const width = window.innerWidth;

  if (width < BREAKPOINTS.md) return 'mobile';
  if (width < BREAKPOINTS.lg) return 'tablet';
  return 'desktop';
}
