'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

/**
 * Error component for Next.js App Router
 * Catches errors in route segments
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Route Error:', error);
    }

    // TODO: Send error to monitoring service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { tags: { digest: error.digest } });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Bir Hata Oluştu
          </h1>
          <p className="text-gray-600">
            Üzgünüz, sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 rounded-md bg-gray-100 p-4 text-sm">
            <summary className="cursor-pointer font-semibold text-gray-700">
              Hata Detayları (Sadece Development)
            </summary>
            <div className="mt-2 space-y-2">
              <div>
                <strong>Error:</strong>
                <pre className="mt-1 overflow-auto text-xs text-red-600">
                  {error.message}
                </pre>
              </div>
              {error.digest && (
                <div>
                  <strong>Digest:</strong>
                  <pre className="mt-1 overflow-auto text-xs text-gray-600">
                    {error.digest}
                  </pre>
                </div>
              )}
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 overflow-auto text-xs text-gray-600">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={reset}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tekrar Dene
          </Button>
          <Button
            onClick={() => (window.location.href = '/genel')}
            className="w-full"
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        </div>

        {error.digest && (
          <p className="text-center text-xs text-gray-500">
            Hata Kodu: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
