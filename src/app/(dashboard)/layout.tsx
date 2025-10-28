'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BackgroundPattern } from '@/components/ui/background-pattern';
import { AnimatedGradient } from '@/components/ui/animated-gradient';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user, logout, initializeAuth } = useAuthStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const stored = window.localStorage.getItem('sidebar-collapsed');
    return stored === 'true';
  });
  const [isScrolled, setIsScrolled] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  // Sync sidebar collapsed state across tabs
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = () => {
      const stored = window.localStorage.getItem('sidebar-collapsed');
      setIsSidebarCollapsed(stored === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Detect scroll for header shadow effect
  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrolled = window.scrollY > 20;
        setIsScrolled((prev) => prev !== scrolled ? scrolled : prev);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const handleLogout = () => {
    logout(() => {
      toast.success('Başarıyla çıkış yaptınız');
      router.push('/login');
    });
  };

  if (!isInitialized || !isAuthenticated) {
    return <LoadingOverlay variant="pulse" fullscreen={true} text="Yükleniyor..." />;
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Layers */}
      <BackgroundPattern
        variant="dots"
        opacity={0.3}
        className="text-muted-foreground"
      />
      <AnimatedGradient
        variant="subtle"
        speed="slow"
        className="opacity-30 dark:opacity-20"
      />

      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-50 relative',
          'border-b border-white/10 dark:border-white/5',
          'bg-background/80 backdrop-blur-xl backdrop-saturate-150',
          'shadow-glass transition-shadow duration-300',
          'before:absolute before:inset-0',
          'before:bg-gradient-to-r before:from-[oklch(from_var(--brand-primary)_l_c_h_/_5%)] before:to-transparent',
          'before:pointer-events-none',
          isScrolled && 'shadow-lg'
        )}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden rounded-md p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-heading font-bold text-foreground">
              Dernek Yönetim Sistemi
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-body">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.name}</span>
              <span className="text-muted-foreground">({user?.role})</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline font-body">Çıkış</span>
            </Button>
          </div>
        </motion.div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={() => setIsMobileSidebarOpen(false)}
        />

        {/* Spacer for fixed sidebar on desktop */}
        <div
          className={cn(
            'hidden lg:block transition-all duration-300',
            isSidebarCollapsed ? 'w-20' : 'w-64'
          )}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full relative transition-all duration-300">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
