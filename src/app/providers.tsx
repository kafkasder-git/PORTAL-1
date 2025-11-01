'use client';

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/shared/stores/authStore';
import { useState } from 'react';

// Debug utilities (development only)
import { HydrationLogger } from '@/shared/lib/debug/hydration-logger';
import { StoreDebugger } from '@/shared/lib/debug/store-debugger';
import { NetworkMonitor } from '@/shared/lib/debug/network-monitor';
import { SuspenseBoundary } from '@/shared/components/ui/suspense-boundary';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
      defaultOptions: {
      queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - better for management system
      gcTime: 10 * 60 * 1000, // 10 minutes cache time
        refetchOnWindowFocus: false,
          retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && 'status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  const [mounted, setMounted] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const initializeAuth = useAuthStore((state) => state?.initializeAuth);

  // Initialize debug utilities (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debug mode enabled');

      HydrationLogger.init();
      StoreDebugger.init(useAuthStore, 'authStore');
      NetworkMonitor.init();

      // Expose to window for manual debugging
      if (typeof window !== 'undefined') {
        (window as any).__AUTH_STORE__ = useAuthStore;
        (window as any).__QUERY_CLIENT__ = queryClient;
      }
    }
  }, [queryClient]);

  // Manual rehydration for skipHydration: true
  useEffect(() => {
    let mounted = true;
    
    const rehydrate = async () => {
      try {
        await useAuthStore.persist.rehydrate();
        if (mounted) {
          setIsHydrating(false);
        }
      } catch (error) {
        console.error('Rehydration error:', error);
        if (mounted) {
          setIsHydrating(false);
        }
      }
    };

    // Set a timeout to prevent infinite loading (max 5 seconds)
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ Hydration timeout - rendering anyway');
        setIsHydrating(false);
      }
    }, 5000);

    rehydrate().then(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update isHydrating when hasHydrated changes
  useEffect(() => {
    if (hasHydrated) {
      setIsHydrating(false);
    }
  }, [hasHydrated]);

  // Wait for both mounted and hydration complete before initializing auth
  useEffect(() => {
    if (mounted && hasHydrated && initializeAuth) {
      // Log store state before initialization
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Auth Store State:', useAuthStore.getState());
        console.log('💾 LocalStorage auth-session:', localStorage.getItem('auth-session'));
        console.log('🔄 Store hydrated:', useAuthStore.persist?.hasHydrated?.());
      }

      initializeAuth();
    }
  }, [mounted, hasHydrated, initializeAuth]);

  // Show loading screen instead of null to prevent white screen
  if (isHydrating || !hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600 text-sm">Uygulama yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SuspenseBoundary
        loadingVariant="pulse"
        fullscreen={true}
        loadingText="Uygulama yükleniyor..."
        onSuspend={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('⏸️ [App] Suspended');
          }
        }}
        onResume={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('▶️ [App] Resumed');
          }
        }}
      >
        {children}
      </SuspenseBoundary>
      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
