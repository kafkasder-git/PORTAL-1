'use client';

import { motion } from 'framer-motion';
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
    gradient: 'from-slate-500/15 via-slate-500/8 to-transparent',
    iconBg: 'bg-slate-500/12',
    iconColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-500/15 hover:border-slate-500/30',
  },
  blue: {
    gradient: 'from-blue-500/15 via-blue-500/8 to-transparent',
    iconBg: 'bg-blue-500/12',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/15 hover:border-blue-500/30',
  },
  red: {
    gradient: 'from-red-500/15 via-red-500/8 to-transparent',
    iconBg: 'bg-red-500/12',
    iconColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500/15 hover:border-red-500/30',
  },
  green: {
    gradient: 'from-emerald-500/15 via-emerald-500/8 to-transparent',
    iconBg: 'bg-emerald-500/12',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-500/15 hover:border-emerald-500/30',
  },
  purple: {
    gradient: 'from-violet-500/15 via-violet-500/8 to-transparent',
    iconBg: 'bg-violet-500/12',
    iconColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-500/15 hover:border-violet-500/30',
  },
  orange: {
    gradient: 'from-amber-500/15 via-amber-500/8 to-transparent',
    iconBg: 'bg-amber-500/12',
    iconColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-500/15 hover:border-amber-500/30',
  },
  cyan: {
    gradient: 'from-cyan-500/15 via-cyan-500/8 to-transparent',
    iconBg: 'bg-cyan-500/12',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-500/15 hover:border-cyan-500/30',
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="elevated"
        className={cn(
          'relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl',
          styles.borderColor,
          className
        )}
      >
        {/* Gradient Background */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-50',
            styles.gradient
          )}
        />

        {/* Content */}
        <div className="relative">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div
              className={cn(
                'p-2.5 rounded-xl transition-transform duration-300 hover:scale-110',
                styles.iconBg
              )}
            >
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
        </div>
      </Card>
    </motion.div>
  );
}
