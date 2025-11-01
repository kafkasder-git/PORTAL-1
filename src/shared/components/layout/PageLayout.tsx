'use client';

import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  DollarSign,
  GraduationCap,
  Users,
  Heart,
  Briefcase,
  Calendar,
  Mail,
  Settings,
  BarChart3,
  ClipboardList,
  Wallet,
  PiggyBank,
  Home,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { useRouter } from 'next/navigation';

const iconMap = {
  FileText,
  DollarSign,
  GraduationCap,
  Users,
  Heart,
  Briefcase,
  Calendar,
  Mail,
  Settings,
  BarChart3,
  ClipboardList,
  Wallet,
  PiggyBank,
  Home,
} as const;

type IconName = keyof typeof iconMap;

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  icon?: IconName;
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
  const IconComponent = iconName ? iconMap[iconName] : undefined;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-row items-center justify-between gap-4"
      >
        <div className="flex items-start gap-4 min-w-0">
          {showBackButton && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0 mt-1"
              aria-label="Geri"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {IconComponent && (
                <div className="p-3 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 border border-primary/20 shrink-0">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex items-center gap-3 min-w-0">
                <h1 className="text-4xl font-bold font-heading tracking-tight text-foreground break-words">
                  {title}
                </h1>
                {badge && (
                  <Badge variant={badge.variant || 'default'} className="font-semibold text-sm">
                    {badge.text}
                  </Badge>
                )}
              </div>
            </div>
            {description && (
              <p className="text-muted-foreground text-base leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 justify-end shrink-0">
            {actions}
          </div>
        )}
      </motion.div>

      {/* Page Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
