'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SentryTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testErrorCapture = () => {
    try {
      throw new Error('Test error for Sentry capture');
    } catch (error) {
      addResult('Error captured successfully');
      throw error; // Re-throw to let Sentry catch it
    }
  };

  const testMessageCapture = () => {
    addResult('Test message sent to Sentry');
    console.log('Test message for Sentry');
  };

  const testPerformance = () => {
    const start = performance.now();
    // Simulate some work
    setTimeout(() => {
      const duration = performance.now() - start;
      addResult(`Performance test completed in ${duration.toFixed(2)}ms`);
    }, 100);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sentry Test Page</CardTitle>
          <CardDescription>
            Comprehensive testing page for Sentry functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={testErrorCapture} variant="destructive">
              Test Error Capture
            </Button>
            <Button onClick={testMessageCapture} variant="outline">
              Test Message Capture
            </Button>
            <Button onClick={testPerformance} variant="secondary">
              Test Performance
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <Button onClick={clearResults} variant="ghost" size="sm">
                Clear
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No test results yet</p>
              ) : (
                <ul className="space-y-1">
                  {testResults.map((result, index) => (
                    <li key={index} className="text-sm font-mono">
                      {result}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>This page is only for testing purposes and should not be accessible in production.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
