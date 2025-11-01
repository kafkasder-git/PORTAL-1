/**
 * Widget Renderer Component
 * Renders different widget types dynamically
 */

'use client';

import { useEffect, useState } from 'react';
import { WidgetConfig, widgetService } from '@/shared/lib/services/widget.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { MoreVertical, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WidgetRendererProps {
  widget: WidgetConfig;
  onEdit?: (widget: WidgetConfig) => void;
  onDelete?: (widgetId: string) => void;
  onRefresh?: (widgetId: string) => void;
}

const CHART_COLORS = {
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
  indigo: '#6366f1',
  pink: '#ec4899',
};

export function WidgetRenderer({ widget, onEdit, onDelete, onRefresh }: WidgetRendererProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [widget]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await widgetService.getWidgetData(widget);
      setData(result);
    } catch (error) {
      console.error('Failed to load widget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = () => {
    const value = data?.value || 0;
    const change = data?.change || 0;
    const trend = data?.trend || 'up';
    const prefix = widget.settings?.prefix || '';
    const suffix = widget.settings?.suffix || '';

    return (
      <div className="space-y-2">
        <div className="text-3xl font-bold">
          {prefix}{typeof value === 'number' ? value.toLocaleString('tr-TR') : value}{suffix}
        </div>
        {widget.settings?.showChange && (
          <div className={`text-sm flex items-center gap-1 ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{trend === 'up' ? '↑' : '↓'}</span>
            <span>{Math.abs(change)}</span>
            <span className="text-gray-500">vs önceki ay</span>
          </div>
        )}
      </div>
    );
  };

  const renderChart = (chartType: 'line' | 'bar' | 'pie') => {
    if (!data) return null;

    const colors = Object.values(CHART_COLORS);

    if (chartType === 'pie') {
      const pieData = data.labels.map((label: string, index: number) => ({
        name: label,
        value: data.datasets[0].data[index],
      }));

      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label
            >
              {pieData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            {widget.settings?.showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );
    }

    const ChartComponent = chartType === 'line' ? LineChart : BarChart;
    const DataComponent = chartType === 'line' ? Line : Bar;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={data.labels.map((label: string, index: number) => ({
          name: label,
          value: data.datasets[0].data[index],
        }))}>
          {widget.settings?.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {widget.settings?.showLegend && <Legend />}
          <DataComponent
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS[widget.settings?.colorScheme as keyof typeof CHART_COLORS] || CHART_COLORS.blue}
            fill={CHART_COLORS[widget.settings?.colorScheme as keyof typeof CHART_COLORS] || CHART_COLORS.blue}
          />
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  const renderList = () => {
    if (!data || !Array.isArray(data)) return null;

    return (
      <div className="space-y-2">
        {data.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              {widget.settings?.showTimestamp && item.timestamp && (
                <div className="text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString('tr-TR')}
                </div>
              )}
            </div>
            {item.status && (
              <span className={`px-2 py-1 rounded text-xs ${
                item.status === 'active' || item.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {item.status}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTable = () => {
    if (!data || !data.columns || !data.rows) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {data.columns.map((column: string, index: number) => (
                <th key={index} className="text-left p-2 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row: any[], index: number) => (
              <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                {row.map((cell: any, cellIndex: number) => (
                  <td key={cellIndex} className="p-2">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderProgress = () => {
    if (!data) return null;

    const current = data.current || 0;
    const total = data.total || 100;
    const percentage = Math.round((current / total) * 100);

    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - percentage / 100)}`}
              className="text-primary transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{percentage}%</span>
          </div>
        </div>
        {widget.settings?.showLabel && (
          <div className="text-center">
            <div className="text-lg font-semibold">{current} / {total}</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        )}
      </div>
    );
  };

  const renderWidget = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      );
    }

    switch (widget.type) {
      case 'stat':
        return renderStatCard();
      case 'chart':
        if (widget.settings?.chartType === 'bar') {
          return renderChart('bar');
        } else if (widget.settings?.chartType === 'pie') {
          return renderChart('pie');
        }
        return renderChart('line');
      case 'list':
        return renderList();
      case 'table':
        return renderTable();
      case 'progress':
        return renderProgress();
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const getSizeClasses = () => {
    const { size } = widget;
    switch (size) {
      case 'small':
        return 'col-span-12 md:col-span-6 lg:col-span-3';
      case 'medium':
        return 'col-span-12 md:col-span-6 lg:col-span-4';
      case 'large':
        return 'col-span-12 md:col-span-12 lg:col-span-8';
      case 'full':
        return 'col-span-12';
      default:
        return 'col-span-12 md:col-span-6 lg:col-span-4';
    }
  };

  return (
    <div className={getSizeClasses()}>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold">{widget.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRefresh?.(widget.id)}
              className="h-8 w-8"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          {renderWidget()}
        </CardContent>
      </Card>
    </div>
  );
}
