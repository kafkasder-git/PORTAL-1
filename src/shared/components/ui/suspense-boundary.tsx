'use client';

import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Suspense } from 'react';
import { LoadingOverlay } from './loading-overlay';
import { ErrorBoundary } from './error-boundary';

interface SuspenseBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingVariant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ripple';
  loadingText?: string;
  fullscreen?: boolean;
  onSuspend?: () => void;
  onResume?: () => void;
}

const FallbackWrapper: React.FC<{
  fallback?: ReactNode;
  loadingVariant?: 'spinner' | 'dots' | 'pulse' | 'bars' | 'ripple';
  loadingText?: string;
  fullscreen?: boolean;
  onSuspend?: () => void;
  onResume?: () => void;
}> = ({ fallback, loadingVariant, loadingText, fullscreen, onSuspend, onResume }) => {
  const suspendStartRef = useRef<number | null>(null);
  const focusedElementRef = useRef<Element | null>(null);

  useEffect(() => {
    // On suspend: save focus and start timing
    suspendStartRef.current = performance.now();
    focusedElementRef.current = document.activeElement;
    onSuspend?.();

    if (process.env.NODE_ENV === 'development') {
      console.log('📄 [SuspenseBoundary] Suspended');
    }

    return () => {
      // On resume: restore focus and log duration
      const duration = suspendStartRef.current ? performance.now() - suspendStartRef.current : 0;
      if (focusedElementRef.current && focusedElementRef.current instanceof HTMLElement) {
        focusedElementRef.current.focus();
      }
      onResume?.();

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ [SuspenseBoundary] Resumed after ${duration.toFixed(2)}ms`);
        if (duration > 5000) {
          console.warn('⚠️ [SuspenseBoundary] Suspension took longer than 5s');
        }
      }
    };
  }, [onSuspend, onResume]);

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <LoadingOverlay
      variant={loadingVariant}
      text={loadingText}
      fullscreen={fullscreen}
    />
  );
};

export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallback,
  loadingVariant = 'spinner',
  loadingText,
  fullscreen = false,
  onSuspend,
  onResume,
}) => {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <FallbackWrapper
            fallback={fallback}
            loadingVariant={loadingVariant}
            loadingText={loadingText}
            fullscreen={fullscreen}
            onSuspend={onSuspend}
            onResume={onResume}
          />
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// Convenience wrappers
export const SuspenseWithSpinner: React.FC<Omit<SuspenseBoundaryProps, 'loadingVariant'>> = (props) => (
  <SuspenseBoundary loadingVariant="spinner" {...props} />
);

export const SuspenseWithDots: React.FC<Omit<SuspenseBoundaryProps, 'loadingVariant'>> = (props) => (
  <SuspenseBoundary loadingVariant="dots" {...props} />
);

export const SuspenseFullscreen: React.FC<Omit<SuspenseBoundaryProps, 'fullscreen'>> = (props) => (
  <SuspenseBoundary fullscreen={true} {...props} />
);