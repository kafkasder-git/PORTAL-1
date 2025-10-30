import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutiveCardProps {
  title: string;
value: string | number;
subtitle?: string;
icon?: LucideIcon;
trend?: {
  value: string;
direction: 'up' | 'down' | 'neutral';
label?: string;
};
status?: 'success' | 'warning' | 'error' | 'info';
variant?: 'default' | 'elevated';
className?: string;
children?: React.ReactNode;
}

export const ExecutiveCard = React.forwardRef<
  HTMLDivElement,
ExecutiveCardProps
>(({
  title,
value,
subtitle,
icon: Icon,
trend,
status,
variant = 'default',
className,
children,
...props
}, ref) => {
  const getStatusStyles = () => {
  switch (status) {
  case 'success':
  return 'border-green-200 dark:border-green-700';
case 'warning':
  return 'border-amber-200 dark:border-amber-700';
case 'error':
  return 'border-red-200 dark:border-red-700';
case 'info':
  return 'border-blue-200 dark:border-blue-700';
default:
  return '';
}
};

  const getTrendIcon = () => {
  if (!trend) return null;
return trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→';
};

  return (
  <Card
  ref={ref}
variant={variant}
size="lg"
className={cn(
  'border transition-all duration-300',
  getStatusStyles(),
  className
)}
  {...props}
>
<CardHeader className="pb-4">
<div className="flex items-start justify-between">
  <div className="space-y-1">
  <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
    {title}
  </CardTitle>
  {subtitle && (
    <p className="text-xs text-muted-foreground">{subtitle}</p>
    )}
    </div>

  {Icon && (
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
      <Icon className="h-5 w-5" />
  </div>
)}
</div>
</CardHeader>

<CardContent className="space-y-4">
{/* Main Value */}
<div className="flex items-baseline justify-between">
<div className="space-y-1">
            <div className="text-3xl font-bold tracking-tight">
  {value}
</div>

{/* Trend Indicator */}
{trend && (
    <div className="flex items-center gap-2">
        <Badge
                  variant={
            trend.direction === 'up'
            ? 'default'
            : trend.direction === 'down'
          ? 'destructive'
        : 'secondary'
  }
    className="gap-1 text-xs font-medium px-2 py-1"
                >
    <span className="text-lg leading-none">{getTrendIcon()}</span>
    {trend.value}
</Badge>
{trend.label && (
<span className="text-xs text-muted-foreground">
{trend.label}
</span>
)}
</div>
)}
</div>

{/* Status Indicator */}
{status && (
<div className={cn(
'w-3 h-3 rounded-full',
status === 'success' && 'bg-green-500',
status === 'warning' && 'bg-amber-500',
status === 'error' && 'bg-red-500',
status === 'info' && 'bg-blue-500'
)} />
)}
</div>

        {/* Additional Content */}
{children && (
<div className="pt-4 border-t border-border">
{children}
</div>
)}
</CardContent>
</Card>
);
});

ExecutiveCard.displayName = 'ExecutiveCard';
