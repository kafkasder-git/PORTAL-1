'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  FileText: require('lucide-react').FileText,
  DollarSign: require('lucide-react').DollarSign,
  GraduationCap: require('lucide-react').GraduationCap,
  Users: require('lucide-react').Users,
  Heart: require('lucide-react').Heart,
  Briefcase: require('lucide-react').Briefcase,
  Calendar: require('lucide-react').Calendar,
  Mail: require('lucide-react').Mail,
  Settings: require('lucide-react').Settings,
  BarChart3: require('lucide-react').BarChart3,
  ClipboardList: require('lucide-react').ClipboardList,
  Wallet: require('lucide-react').Wallet,
  PiggyBank: require('lucide-react').PiggyBank,
};

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: string; // Changed from LucideIcon to string
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  actions?: React.ReactNode;
  showBackButton?: boolean;
  className?: string;
}

export function PageLayout({
  children,
  title,
  description,
  icon: iconName,
  badge,
  actions,
  showBackButton = false,
  className,
}: PageLayoutProps) {
  const router = useRouter();

  // Map icon name to LucideIcon component
  const IconComponent = iconName ? iconMap[iconName] : null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          {showBackButton && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
              aria-label="Geri"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              {IconComponent && (
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <IconComponent className="h-6 w-6" />
                </div>
              )}
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {badge && (
                <Badge variant={badge.variant || 'default'} className="font-semibold">
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </motion.div>

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
