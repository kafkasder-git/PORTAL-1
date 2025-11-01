import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface PremiumDashboardProps {
  children: React.ReactNode;
  className?: string;
  background?: 'default' | 'gradient' | 'mesh' | 'aurora';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const PremiumDashboard = React.forwardRef<
  HTMLDivElement,
  PremiumDashboardProps
>(({
  children,
  className,
  background = 'default',
  padding = 'lg',
  ...props
}, ref) => {
  const getBackgroundClass = () => {
    switch (background) {
      case 'gradient':
        return 'bg-gradient-executive';
      case 'mesh':
        return 'bg-gradient-mesh';
      case 'aurora':
        return 'bg-gradient-aurora';
      default:
        return 'bg-background';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none':
        return 'p-0';
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      case 'xl':
        return 'p-12';
      default:
        return 'p-8';
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'min-h-screen relative overflow-hidden',
        getBackgroundClass(),
        getPaddingClass(),
        className
      )}
      {...props}
    >
      {/* Premium Background Effects */}
      {background !== 'default' && (
        <>
          <div className="absolute inset-0 bg-linear-to-br from-background/80 via-transparent to-background/60" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,119,198,0.05),transparent_50%)]" />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
});

PremiumDashboard.displayName = 'PremiumDashboard';

// Premium Grid Layout Component
interface PremiumGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  className?: string;
}

export const PremiumGrid = React.forwardRef<
  HTMLDivElement,
  PremiumGridProps
>(({
  children,
  columns = 1,
  gap = 'lg',
  responsive = true,
  className,
  ...props
}, ref) => {
  const getColumnsClass = () => {
    const baseColumns = `grid-cols-${columns}`;
    if (!responsive) return baseColumns;

    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      default:
        return 'grid-cols-1';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 'sm':
        return 'gap-4';
      case 'md':
        return 'gap-6';
      case 'lg':
        return 'gap-8';
      case 'xl':
        return 'gap-12';
      default:
        return 'gap-8';
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        'grid',
        getColumnsClass(),
        getGapClass(),
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});

PremiumGrid.displayName = 'PremiumGrid';

// Premium Section Component
interface PremiumSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'glass' | 'premium' | 'elevated';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PremiumSection = React.forwardRef<
  HTMLDivElement,
  PremiumSectionProps
>(({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  padding = 'lg',
  className,
  ...props
}, ref) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'glass':
        return 'bg-glass backdrop-blur-xl shadow-glass border border-white/20';
      case 'premium':
        return 'bg-gradient-executive-card shadow-executive-premium border border-border/40';
      case 'elevated':
        return 'bg-card shadow-card-premium border border-border';
      default:
        return 'bg-transparent';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'sm':
        return 'p-4';
      case 'md':
        return 'p-6';
      case 'lg':
        return 'p-8';
      case 'xl':
        return 'p-12';
      default:
        return 'p-8';
    }
  };

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn(
        'rounded-2xl',
        getVariantClass(),
        getPaddingClass(),
        className
      )}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-8 space-y-2">
          {title && (
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                  {icon}
                </div>
              )}
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            </div>
          )}
          {subtitle && (
            <p className="text-muted-foreground text-lg leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </motion.section>
  );
});

PremiumSection.displayName = 'PremiumSection';
