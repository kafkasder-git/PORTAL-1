'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction?: 'up' | 'down' | 'neutral';
  };
  description?: string;
  variant?: 'primary' | 'success' | 'warning' | 'accent' | 'info' | 'default';
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    accentColor: 'from-primary/20',
  },
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    accentColor: 'from-primary/20',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    accentColor: 'from-success/20',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    accentColor: 'from-warning/20',
  },
  accent: {
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    accentColor: 'from-accent/20',
  },
  info: {
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    accentColor: 'from-info/20',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  variant = 'primary',
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card
      variant="elevated"
      className={cn(
        'group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20',
        'bg-linear-to-br from-card via-card to-card/95',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <div className={cn('p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110', styles.iconBg)}>
          <Icon className={cn('h-5 w-5 transition-transform', styles.iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold tracking-tight text-foreground break-words">
              {value}
            </div>
            {trend && (
              <Badge
                variant={
                  trend.direction === 'up'
                    ? 'success'
                    : trend.direction === 'down'
                    ? 'destructive'
                    : 'secondary'
                }
                className="gap-1.5 text-xs font-semibold ml-2 flex-shrink-0"
              >
                {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
                <span>{trend.value}</span>
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground font-medium">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
