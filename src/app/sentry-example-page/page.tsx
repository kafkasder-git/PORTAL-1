'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SentryExamplePage() {
  const [message, setMessage] = useState<string>('');

  const captureMessage = () => {
    if (message.trim()) {
      // This will be captured by Sentry
      console.log('Captured message:', message);
      setMessage('');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sentry Example Page</CardTitle>
          <CardDescription>
            This page demonstrates Sentry message capture functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter a message to capture"
              className="w-full p-2 border rounded-md"
            />
            <Button onClick={captureMessage} disabled={!message.trim()}>
              Capture Message
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
