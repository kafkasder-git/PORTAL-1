'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

export default function SentryBrowserTestPage() {
  const [error, setError] = useState<string | null>(null);

  const throwError = () => {
    try {
      throw new Error('Test error from Sentry browser test page');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err; // This will be caught by Sentry
    }
  };

  const throwAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Test async error from Sentry browser test page'));
        }, 100);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown async error');
      throw err; // This will be caught by Sentry
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sentry Browser Test Page</CardTitle>
          <CardDescription>
            This page is used to test Sentry error reporting in the browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={throwError} variant="destructive">
              Throw Synchronous Error
            </Button>
            <Button onClick={throwAsyncError} variant="destructive">
              Throw Asynchronous Error
            </Button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p>This page is only for testing purposes and should not be accessible in production.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
