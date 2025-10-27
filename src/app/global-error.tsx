'use client';

import { useEffect } from 'react';

/**
 * Global Error component for Next.js App Router
 * Catches errors in root layout (most critical errors)
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log critical error
    console.error('CRITICAL ERROR:', error);

    // TODO: Send to monitoring service with high priority
    // Example: Sentry.captureException(error, { level: 'fatal', tags: { digest: error.digest } });
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '1rem',
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                padding: '0.75rem',
                backgroundColor: '#fee2e2',
                borderRadius: '9999px',
                marginBottom: '1rem',
              }}>
                <svg
                  style={{ width: '2rem', height: '2rem', color: '#dc2626' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '0.5rem',
              }}>
                Kritik Bir Hata Oluştu
              </h1>
              <p style={{
                color: '#6b7280',
                marginBottom: '1.5rem',
              }}>
                Uygulama beklenmedik bir hatayla karşılaştı. Lütfen sayfayı yenileyin.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details style={{
                backgroundColor: '#f3f4f6',
                padding: '1rem',
                borderRadius: '0.375rem',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  Hata Detayları (Development)
                </summary>
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Error:</strong>
                  <pre style={{
                    marginTop: '0.25rem',
                    overflow: 'auto',
                    fontSize: '0.75rem',
                    color: '#dc2626',
                  }}>
                    {error.message}
                  </pre>
                  {error.digest && (
                    <>
                      <strong>Digest:</strong>
                      <pre style={{
                        marginTop: '0.25rem',
                        fontSize: '0.75rem',
                        color: '#6b7280',
                      }}>
                        {error.digest}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={reset}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                Tekrar Dene
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                Ana Sayfaya Dön
              </button>
            </div>

            <p style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#9ca3af',
              marginTop: '1.5rem',
            }}>
              Sorun devam ederse lütfen sistem yöneticisi ile iletişime geçin.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
