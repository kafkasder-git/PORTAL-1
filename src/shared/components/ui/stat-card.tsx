'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  description?: string;
  variant?: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'cyan' | 'default';
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-200 dark:border-slate-700',
  },
  blue: {
    iconBg: 'bg-blue-50 dark:bg-blue-950/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-700',
  },
  red: {
    iconBg: 'bg-red-50 dark:bg-red-950/20',
    iconColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-700',
  },
  green: {
    iconBg: 'bg-green-50 dark:bg-green-950/20',
    iconColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-700',
  },
  purple: {
    iconBg: 'bg-purple-50 dark:bg-purple-950/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-700',
  },
  orange: {
    iconBg: 'bg-orange-50 dark:bg-orange-950/20',
    iconColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-200 dark:border-orange-700',
  },
  cyan: {
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-700',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  variant = 'default',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      variant="elevated"
      className={cn(
        'transition-all duration-300 hover:shadow-lg',
        styles.borderColor,
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', styles.iconBg)}>
          <Icon className={cn('h-5 w-5', styles.iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trend && (
            <Badge
              variant={
                trend.direction === 'up'
                  ? 'default'
                  : trend.direction === 'down'
                  ? 'destructive'
                  : 'secondary'
              }
              className="gap-1 text-xs"
            >
              {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
