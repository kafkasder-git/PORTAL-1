'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Heart,
  HelpingHand,
  GraduationCap,
  Wallet,
  MessageSquare,
  Calendar,
  Users,
  Building2,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';

interface SubPage {
  name: string;
  href: string;
}

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  subPages: SubPage[];
  badge?: number;
}

const modules: Module[] = [
  {
    id: 'genel',
    name: 'Dashboard',
    icon: <Home className="w-5 h-5" />,
    subPages: [{ name: 'Ana Sayfa', href: '/genel' }],
  },
  {
    id: 'bagis',
    name: 'Bağışlar',
    icon: <Heart className="w-5 h-5" />,
    subPages: [
      { name: 'Bağış Listesi', href: '/bagis/liste' },
      { name: 'Bağış Raporları', href: '/bagis/raporlar' },
      { name: 'Kumbara', href: '/bagis/kumbara' },
    ],
  },
  {
    id: 'yardim',
    name: 'Yardım',
    icon: <HelpingHand className="w-5 h-5" />,
    subPages: [
      { name: 'İhtiyaç Sahipleri', href: '/yardim/ihtiyac-sahipleri' },
      { name: 'Başvurular', href: '/yardim/basvurular' },
      { name: 'Yardım Listesi', href: '/yardim/liste' },
      { name: 'Nakit Vezne', href: '/yardim/nakdi-vezne' },
    ],
  },
  {
    id: 'burs',
    name: 'Burs Programı',
    icon: <GraduationCap className="w-5 h-5" />,
    subPages: [
      { name: 'Öğrenciler', href: '/burs/ogrenciler' },
      { name: 'Başvurular', href: '/burs/basvurular' },
      { name: 'Yetimler', href: '/burs/yetim' },
    ],
  },
  {
    id: 'fon',
    name: 'Finans',
    icon: <Wallet className="w-5 h-5" />,
    subPages: [
      { name: 'Gelir Gider', href: '/fon/gelir-gider' },
      { name: 'Raporlar', href: '/fon/raporlar' },
    ],
  },
  {
    id: 'mesaj',
    name: 'Mesajlar',
    icon: <MessageSquare className="w-5 h-5" />,
    subPages: [
      { name: 'Kurum İçi', href: '/mesaj/kurum-ici' },
      { name: 'Toplu Mesaj', href: '/mesaj/toplu' },
    ],
  },
  {
    id: 'is',
    name: 'İş Yönetimi',
    icon: <Calendar className="w-5 h-5" />,
    subPages: [
      { name: 'Görevler', href: '/is/gorevler' },
      { name: 'Toplantılar', href: '/is/toplantilar' },
    ],
  },
  {
    id: 'partner',
    name: 'Ortaklar',
    icon: <Building2 className="w-5 h-5" />,
    subPages: [{ name: 'Ortak Listesi', href: '/partner/liste' }],
  },
  {
    id: 'kullanici',
    name: 'Kullanıcılar',
    icon: <Users className="w-5 h-5" />,
    subPages: [{ name: 'Kullanıcı Yönetimi', href: '/kullanici' }],
  },
];

interface SidebarProps {
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const [expandedModules, setExpandedModules] = useState<string[]>(['genel']);
  const [isCollapsed, setIsCollapsed] = useState(() => {
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      onCollapsedChange?.(isCollapsed);
    }
  }, [onCollapsedChange, isCollapsed]);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    onCollapsedChange?.(newState);
    window.dispatchEvent(new Event('storage'));
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isActive = (href: string) => pathname === href;

  return (
    <TooltipProvider delayDuration={200}>
      <aside
      className={cn(
      'fixed left-0 top-0 h-screen z-40 overflow-hidden transition-all duration-300 ease-in-out',
      'bg-sidebar border-r border-sidebar-border shadow-xl',
      isCollapsed ? 'w-20' : 'w-80'
      )}
      aria-label="Navigation sidebar"
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="h-20 flex items-center justify-between border-b border-sidebar-border px-4 shrink-0 bg-linear-to-br from-sidebar to-sidebar/95">
            {!isCollapsed ? (
              <Link href="/genel" className="flex items-center gap-3 group">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-sidebar-primary to-accent shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-sm leading-tight">KAFKASDER</span>
                  <span className="text-sidebar-foreground/70 text-xs">Yönetim</span>
                </div>
              </Link>
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="p-2.5 rounded-xl bg-linear-to-br from-sidebar-primary to-accent shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className={cn('px-3 py-3 border-b border-sidebar-border', isCollapsed && 'px-1.5')}>
            {!isCollapsed ? (
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent h-9 justify-start text-xs"
                    >
                      <Search className="w-4 h-4 mr-2 shrink-0" />
                      Ara
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Hızlı Arama</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="relative text-sidebar-foreground hover:bg-sidebar-accent h-9 w-9"
                    >
                      <Bell className="w-4 h-4" />
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold"
                      >
                        3
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Bildirimler</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="flex flex-col gap-1 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-sidebar-foreground hover:bg-sidebar-accent h-9 w-9"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Ara</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="relative text-sidebar-foreground hover:bg-sidebar-accent h-9 w-9"
                    >
                      <Bell className="w-4 h-4" />
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px]"
                      >
                        3
                      </Badge>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Bildirimler</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="px-2 py-3 space-y-1 flex-1 overflow-y-auto">
            {modules.map((module) => {
              const isExpanded = expandedModules.includes(module.id);
              const hasActiveSubpage = module.subPages.some((sub) => isActive(sub.href));

              return (
                <div key={module.id}>
                  {!isCollapsed ? (
                    <>
                      <button
                        onClick={() => toggleModule(module.id)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          hasActiveSubpage
                            ? 'bg-sidebar-primary text-white shadow-md'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 w-5 h-5">
                            {module.icon}
                          </div>
                          <span className="truncate">{module.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {module.badge && (
                            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs font-bold">
                              {module.badge}
                            </Badge>
                          )}
                          <ChevronDown
                            className={cn(
                              'w-4 h-4 transition-transform duration-200',
                              isExpanded && 'rotate-180'
                            )}
                          />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="mt-1 ml-5 space-y-1 pl-3 border-l-2 border-sidebar-primary/30">
                          {module.subPages.map((subPage) => (
                            <Link
                              key={subPage.href}
                              href={subPage.href}
                              className={cn(
                                'block px-3 py-2 rounded-lg text-sm transition-all duration-200',
                                isActive(subPage.href)
                                  ? 'bg-sidebar-primary/20 text-sidebar-primary font-semibold'
                                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                              )}
                            >
                              {subPage.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (module.subPages.length === 1) {
                              window.location.href = module.subPages[0].href;
                            } else {
                              toggleModule(module.id);
                            }
                          }}
                          className={cn(
                            'w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200',
                            hasActiveSubpage
                              ? 'bg-sidebar-primary text-white shadow-md'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                          aria-label={module.name}
                        >
                          {module.icon}
                          {module.badge && (
                            <Badge
                              variant="destructive"
                              className="absolute top-1 right-1 h-4 min-w-4 px-0.5 text-[10px]"
                            >
                              {module.badge}
                            </Badge>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs">
                        <p className="font-semibold">{module.name}</p>
                        {module.subPages.length > 1 && (
                          <ul className="mt-1.5 space-y-1">
                            {module.subPages.map((sub) => (
                              <li key={sub.href} className="text-[11px]">
                                • {sub.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border bg-linear-to-t from-sidebar/50 to-transparent p-3 space-y-1.5 mt-auto">
            {!isCollapsed ? (
              <>
                <Link
                  href="/settings"
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive('/settings')
                      ? 'bg-sidebar-primary text-white shadow-md'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Settings className="w-5 h-5 shrink-0" />
                  <span>Ayarlar</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent h-9"
                >
                  <PanelLeftClose className="w-4 h-4 mr-3 shrink-0" />
                  <span className="text-sm">Daralt</span>
                </Button>
              </>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/settings"
                      className={cn(
                        'flex items-center justify-center p-2.5 rounded-lg transition-all duration-200',
                        isActive('/settings')
                          ? 'bg-sidebar-primary text-white shadow-md'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                      aria-label="Ayarlar"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Ayarlar</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={toggleSidebar}
                      className="w-full text-sidebar-foreground hover:bg-sidebar-accent h-10"
                    >
                      <PanelLeftOpen className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Genişlet</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
