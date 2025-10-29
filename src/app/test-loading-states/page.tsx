'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useAuthStore } from '@/stores/authStore';

export default function TestLoadingStatesPage() {
  // Development guard
  if (process.env.NODE_ENV !== 'development') {
    return <div>Not available in production</div>;
  }

  const { _hasHydrated } = useAuthStore();

  // State for controls
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [text, setText] = useState('Yükleniyor...');
  const [fullscreen, setFullscreen] = useState(false);
  const [blur, setBlur] = useState(true);
  const [duration, setDuration] = useState(3);
  const [delay, setDelay] = useState(0);

  // Auth simulation
  const [authLoading, setAuthLoading] = useState(false);
  const [authResult, setAuthResult] = useState<string | null>(null);

  // Hydration simulation
  const [hydrationSimulating, setHydrationSimulating] = useState(false);
  const [hydrationStart, setHydrationStart] = useState<number | null>(null);

  // Performance metrics
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const [cpuUsage, setCpuUsage] = useState<number | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);

  const renderStartRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Measure render time
  useEffect(() => {
    renderStartRef.current = performance.now();
    return () => {
      const renderEnd = performance.now();
      setRenderTime(renderEnd - renderStartRef.current);
    };
  }, [isLoading, size, text, fullscreen, blur]);

  // Measure FPS
  useEffect(() => {
    let animationId: number;
    const measureFPS = (currentTime: number) => {
      frameCountRef.current++;
      if (currentTime - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      animationId = requestAnimationFrame(measureFPS);
    };
    animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Measure memory and CPU (if available)
  useEffect(() => {
    const interval = setInterval(() => {
      if ('memory' in performance) {
        const mem = (performance as any).memory;
        setMemoryUsage(mem.usedJSHeapSize / 1024 / 1024); // MB
      }
      // CPU usage is harder to measure directly
      setCpuUsage(null); // Placeholder
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-hide loading
  useEffect(() => {
    if (isLoading && duration > 0) {
      const timer = setTimeout(() => setIsLoading(false), duration * 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, duration]);

  // Delayed show
  useEffect(() => {
    if (isLoading && delay > 0) {
      setIsLoading(false);
      const timer = setTimeout(() => setIsLoading(true), delay * 1000);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const simulateAuth = () => {
    setAuthLoading(true);
    setAuthResult(null);
    setTimeout(() => {
      setAuthLoading(false);
      setAuthResult(Math.random() > 0.5 ? 'success' : 'failure');
    }, 2000);
  };

  const simulateHydration = () => {
    setHydrationSimulating(true);
    setHydrationStart(performance.now());
    // Simulate hydration delay
    setTimeout(() => {
      setHydrationSimulating(false);
      setHydrationStart(null);
    }, 1500);
  };

  const variants = ['spinner', 'dots', 'pulse', 'bars', 'ripple'] as const;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Warning Banner */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">
              <strong>Development Only:</strong> This page is for testing LoadingOverlay component. Intentional loading states may cause performance issues.
            </p>
          </div>
        </div>
      </div>

      {/* Variant Showcase */}
      <section>
        <h2 className="text-2xl font-bold mb-4">LoadingOverlay Variants</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {variants.map((variant) => (
            <div key={variant} className="border rounded-lg p-4 text-center">
              <h3 className="font-semibold capitalize mb-2">{variant}</h3>
              <div className="relative h-32 flex items-center justify-center">
                <LoadingOverlay
                  variant={variant}
                  size={size}
                  text={text}
                  fullscreen={false}
                  blur={blur}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Controls */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as 'sm' | 'md' | 'lg')}
              className="w-full p-2 border rounded"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fullscreen</label>
            <input
              type="checkbox"
              checked={fullscreen}
              onChange={(e) => setFullscreen(e.target.checked)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Blur</label>
            <input
              type="checkbox"
              checked={blur}
              onChange={(e) => setBlur(e.target.checked)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (s): {duration}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Delay (s): {delay}</label>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={delay}
              onChange={(e) => setDelay(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="col-span-full">
            <button
              onClick={() => setIsLoading(!isLoading)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {isLoading ? 'Stop Loading' : 'Start Loading'}
            </button>
          </div>
        </div>
      </section>

      {/* Auth Loading Simulation */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Auth Loading Simulation</h2>
        <button
          onClick={simulateAuth}
          disabled={authLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Simulate Auth Initialization
        </button>
        {authResult && (
          <p className={`mt-2 ${authResult === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            Auth {authResult === 'success' ? 'successful' : 'failed'}
          </p>
        )}
        {authLoading && (
          <div className="mt-4 border rounded p-4">
            <LoadingOverlay variant="pulse" text="Yükleniyor..." />
          </div>
        )}
      </section>

      {/* Hydration Loading Simulation */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Hydration Loading Simulation</h2>
        <button
          onClick={simulateHydration}
          disabled={hydrationSimulating}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Simulate Hydration Wait
        </button>
        {hydrationStart && (
          <p className="mt-2">Hydration started at: {hydrationStart.toFixed(2)}ms</p>
        )}
        {hydrationSimulating && (
          <div className="mt-4 border rounded p-4">
            <LoadingOverlay variant="pulse" text="Hydrating..." />
          </div>
        )}
        {!hydrationSimulating && hydrationStart && (
          <p className="mt-2 text-green-600">
            Hydration completed in: {(performance.now() - hydrationStart).toFixed(2)}ms
          </p>
        )}
        <p className="mt-2">Current _hasHydrated: {_hasHydrated ? 'true' : 'false'}</p>
      </section>

      {/* Accessibility Testing */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Accessibility Testing</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Screen Reader Test</h3>
            <button
              onClick={() => alert('Screen reader should announce loading')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Trigger Announcement
            </button>
          </div>
          <div>
            <h3 className="font-semibold">Motion Reduce Test</h3>
            <p>Check if animations are disabled when prefers-reduced-motion is set.</p>
          </div>
          <div>
            <h3 className="font-semibold">Focus Trap Test (Fullscreen)</h3>
            <p>Enable fullscreen and try tabbing - focus should be trapped.</p>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded p-4">
            <h3 className="font-semibold">Render Time</h3>
            <p>{renderTime ? `${renderTime.toFixed(2)}ms` : 'N/A'}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-semibold">FPS</h3>
            <p>{fps ?? 'N/A'}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-semibold">Memory Usage</h3>
            <p>{memoryUsage ? `${memoryUsage.toFixed(2)} MB` : 'N/A'}</p>
          </div>
          <div className="border rounded p-4">
            <h3 className="font-semibold">CPU Usage</h3>
            <p>{cpuUsage ? `${cpuUsage.toFixed(2)}%` : 'N/A'}</p>
          </div>
        </div>
      </section>

      {/* Global Loading Overlay */}
      {isLoading && (
        <LoadingOverlay
          variant="pulse"
          size={size}
          text={text}
          fullscreen={fullscreen}
          blur={blur}
        />
      )}
    </div>
  );
}