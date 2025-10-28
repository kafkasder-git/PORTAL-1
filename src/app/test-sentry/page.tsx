'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestSentryPage() {
  const [isLoading, setIsLoading] = useState(false);

  const testAsyncError = async () => {
    setIsLoading(true);
    try {
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Async test error for Sentry'));
        }, 1000);
      });
    } catch (error) {
      setIsLoading(false);
      throw error; // Let Sentry catch this
    }
  };

  const testNetworkError = async () => {
    setIsLoading(true);
    try {
      // This will likely fail and be caught by Sentry
      await fetch('/api/non-existent-endpoint');
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Sentry Page</CardTitle>
          <CardDescription>
            Additional testing page for Sentry error reporting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={testAsyncError} 
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Async Error'}
            </Button>
            <Button 
              onClick={testNetworkError} 
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? 'Testing...' : 'Test Network Error'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>This page is only for testing purposes and should not be accessible in production.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
