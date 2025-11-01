'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/shared/stores/authStore';
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { 
  LogOut, 
  ChevronDown, 
  Settings,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';
import { SuspenseBoundary } from '@/shared/components/ui/suspense-boundary';
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Separator } from '@/shared/components/ui/separator';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { UserRole } from '@/entities/auth';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized, user, logout, initializeAuth } = useAuthStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const stored = window.localStorage.getItem('sidebar-collapsed');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  // Stable callback for sidebar state changes
  const handleSidebarCollapsedChange = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    if (process.env.NODE_ENV === 'development') {
      console.log('📱 [Dashboard] Sidebar collapsed state updated:', collapsed);
    }
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Helper function to get initials from name
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper function to get role badge variant
  const getRoleBadgeVariant = (
    role: UserRole
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return 'destructive';
      case UserRole.MANAGER:
        return 'default';
      case UserRole.MEMBER:
      case UserRole.VOLUNTEER:
        return 'secondary';
      case UserRole.VIEWER:
        return 'outline';
      default:
        return 'default';
    }
  };

  // Initialize auth on mount
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 [Dashboard] Initializing auth...', { isInitialized, isAuthenticated });
    }

    initializeAuth();

    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 [Dashboard] Auth initialized:', { isInitialized, isAuthenticated, user });
    }
  }, [initializeAuth, isInitialized, isAuthenticated, user]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔀 [Dashboard] Redirecting to login...', { isInitialized, isAuthenticated });
      }
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
      const collapsed = stored === 'true';
      setIsSidebarCollapsed(collapsed);
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
    if (process.env.NODE_ENV === 'development') {
      console.log('⏳ [Dashboard] Loading...', { isInitialized, isAuthenticated });
    }
    return <LoadingOverlay variant="pulse" fullscreen={true} text="Yükleniyor..." />;
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header - Fixed Above Content */}
      <header
        className={cn(
        'fixed top-0 right-0 h-20 z-50 transition-all duration-300',
        'border-b border-border',
        'bg-card/95 backdrop-blur-xl',
        isScrolled
        ? 'shadow-xl'
        : 'shadow-md',
        isSidebarCollapsed ? 'left-20' : 'left-80'
        )}
      >
        <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex h-full items-center justify-between px-8"
        >
        {/* Left: Page Title/Breadcrumb */}
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">KAFKASDER Yönetim Sistemi</h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative text-foreground hover:bg-muted"
            >
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 flex items-center justify-center p-0 px-1 text-[10px]"
              >
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-background"
                  aria-label="Kullanıcı menüsü"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                    <AvatarFallback className="text-[10px] font-semibold bg-primary text-primary-foreground">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-foreground">
                      {user?.name || 'Kullanıcı'}
                    </p>
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isUserMenuOpen && "rotate-180"
                  )} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="end" sideOffset={8}>
                <div className="p-4 bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-border">
                      <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                      <AvatarFallback className="text-sm font-bold bg-primary text-primary-foreground">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {user?.name || 'Kullanıcı'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email || ''}
                      </p>
                      <Badge
                        variant={getRoleBadgeVariant(user?.role || UserRole.VIEWER)}
                        className="text-[10px] mt-1.5"
                      >
                        {user?.role || 'Viewer'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="p-2">
                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-md hover:bg-muted transition-colors text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Ayarlar</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs rounded-md hover:bg-destructive/10 transition-colors text-destructive text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>
      </header>

      {/* Sidebar - Below Header */}
      <SuspenseBoundary loadingVariant="spinner">
        <Sidebar
          onCollapsedChange={handleSidebarCollapsedChange}
        />
      </SuspenseBoundary>

      {/* Main Content */}
      <main className={cn(
      'p-8 xl:p-12 w-full relative transition-all duration-300 pt-24',
      isSidebarCollapsed ? 'pl-20' : 'pl-80'
      )}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SuspenseBoundary
              loadingVariant="pulse"
              loadingText="Sayfa yükleniyor..."
              onSuspend={() => console.log('📄 [Dashboard] Page suspended:', pathname)}
              onResume={() => console.log('✅ [Dashboard] Page resumed:', pathname)}
            >
              {children}
            </SuspenseBoundary>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
