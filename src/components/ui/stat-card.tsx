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
  variant?: 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'cyan';
  className?: string;
}

const variantStyles = {
  blue: {
    gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-500/20',
  },
  red: {
    gradient: 'from-red-500/20 via-red-500/10 to-transparent',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-600 dark:text-red-400',
    borderColor: 'border-red-500/20',
  },
  green: {
    gradient: 'from-green-500/20 via-green-500/10 to-transparent',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-600 dark:text-green-400',
    borderColor: 'border-green-500/20',
  },
  purple: {
    gradient: 'from-purple-500/20 via-purple-500/10 to-transparent',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-purple-500/20',
  },
  orange: {
    gradient: 'from-orange-500/20 via-orange-500/10 to-transparent',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-600 dark:text-orange-400',
    borderColor: 'border-orange-500/20',
  },
  cyan: {
    gradient: 'from-cyan-500/20 via-cyan-500/10 to-transparent',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-500/20',
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  variant = 'blue',
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
