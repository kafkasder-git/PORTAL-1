/**
 * Performance Monitor Dashboard Component
 */

'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, Zap, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { performanceService, type PerformanceMetrics } from '@/shared/lib/services/performance.service';
import { cache } from '@/shared/lib/services/cache.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [cacheStats, setCacheStats] = useState(cache.getStats());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();

    // Update data every 5 seconds
    const interval = setInterval(() => {
      loadPerformanceData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = () => {
    const data = performanceService.getMetrics();
    setMetrics(data);
    setCacheStats(cache.getStats());
    setIsLoading(false);
  };

  // Process metrics for charts
  const responseTimeData = metrics
    .filter(m => m.name === 'api-call')
    .slice(-20)
    .map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString(),
      duration: m.value,
    }));

  const pageLoadData = metrics
    .filter(m => m.name === 'page-load')
    .slice(-10)
    .map(m => ({
      time: new Date(m.timestamp).toLocaleTimeString(),
      duration: m.value,
    }));

  // Calculate averages
  const avgResponseTime = metrics
    .filter(m => m.name === 'api-call')
    .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);

  const avgPageLoad = metrics
    .filter(m => m.name === 'page-load')
    .reduce((sum, m, _, arr) => sum + m.value / arr.length, 0);

  const errorRate = metrics.length > 0
    ? (metrics.filter(m => m.tags?.status === 'error').length / metrics.length) * 100
    : 0;

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Performance Monitoring</h1>
        </div>
        <Badge variant="outline">
          Last Updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(avgResponseTime, { good: 200, warning: 500 })}`}>
              {formatTime(avgResponseTime)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {avgResponseTime < 200 ? 'Excellent' : avgResponseTime < 500 ? 'Good' : 'Needs Improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Page Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(avgPageLoad, { good: 2000, warning: 4000 })}`}>
              {formatTime(avgPageLoad)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {avgPageLoad < 2000 ? 'Excellent' : avgPageLoad < 4000 ? 'Good' : 'Needs Improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${errorRate < 1 ? 'text-green-600' : errorRate < 5 ? 'text-yellow-600' : 'text-red-600'}`}>
              {errorRate.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.filter(m => m.tags?.status === 'error').length} errors total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cache Hit Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cacheStats.hitRate > 80 ? 'text-green-600' : cacheStats.hitRate > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {cacheStats.hitRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {cacheStats.hits} hits / {cacheStats.misses} misses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              API Response Time
            </CardTitle>
            <CardDescription>Last 20 requests</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value.toFixed(2)}ms`, 'Response Time']} />
                <Line type="monotone" dataKey="duration" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Page Load Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Page Load Time
            </CardTitle>
            <CardDescription>Last 10 page loads</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pageLoadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${(value as number / 1000).toFixed(2)}s`, 'Load Time']} />
                <Bar dataKey="duration" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Cache Statistics
          </CardTitle>
          <CardDescription>Cache performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Cache Size</p>
              <p className="text-lg font-semibold">{cacheStats.size} / {cacheStats.maxSize}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${cacheStats.utilization}%` }}
                ></div>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Size</p>
              <p className="text-lg font-semibold">{(cacheStats.totalSize / 1024).toFixed(2)} KB</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Average Hits</p>
              <p className="text-lg font-semibold">{cacheStats.avgHits.toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Evictions</p>
              <p className="text-lg font-semibold">{cacheStats.evictions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics.slice(-10).reverse().map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${metric.tags?.status === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <div>
                    <p className="font-medium">{metric.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                      {metric.tags && Object.entries(metric.tags).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="ml-2 text-xs">
                          {key}: {value}
                        </Badge>
                      ))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatTime(metric.value)}</p>
                  <p className="text-xs text-gray-500">{metric.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
