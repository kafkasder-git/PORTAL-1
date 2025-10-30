'use client';

import { useAuthStore } from '@/shared/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { StatCard } from '@/shared/components/ui/stat-card';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import {
  Users,
  Heart,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Zap,
  Target,
  Home,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import { StatCardSkeleton, CardSkeleton } from '@/shared/components/ui/skeleton';


export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Show loading if still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Kimlik Doğrulama Hatası</h2>
          <p className="text-gray-600 mt-2">Lütfen tekrar giriş yapın.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Toplam İhtiyaç Sahibi',
      value: '0',
      icon: Users,
      variant: 'default' as const,
    },
    {
      title: 'Toplam Bağış',
      value: '0',
      icon: Heart,
      variant: 'default' as const,
    },
    {
      title: 'Bağış Tutarı',
      value: '0 ₺',
      icon: DollarSign,
      variant: 'default' as const,
    },
    {
      title: 'Aktif Kullanıcı',
      value: '1',
      icon: TrendingUp,
      variant: 'default' as const,
    },
  ];

  const quickActions = [
    {
      title: 'İhtiyaç Sahipleri',
      description: 'Kayıtlı ihtiyaç sahiplerini görüntüle ve yönet',
      icon: Users,
      href: '/yardim/ihtiyac-sahipleri',
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-700 dark:text-slate-300',
    },
    {
      title: 'Bağışlar',
      description: 'Bağış kayıtlarını görüntüle ve yönet',
      icon: Heart,
      href: '/bagis/liste',
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-700 dark:text-slate-300',
    },
    {
      title: 'Raporlar',
      description: 'Detaylı raporları ve istatistikleri incele',
      icon: BarChart3,
      href: '/bagis/raporlar',
      iconBg: 'bg-slate-500/10',
      iconColor: 'text-slate-700 dark:text-slate-300',
    },
  ];

  const recentActivities = [
    {
      type: 'success',
      title: 'Yeni bağış kaydedildi',
      description: '500 ₺ bağış kaydı oluşturuldu',
      time: '2 dakika önce',
      icon: CheckCircle2,
    },
    {
      type: 'info',
      title: 'İhtiyaç sahibi güncellendi',
      description: 'Ahmet Yılmaz bilgileri güncellendi',
      time: '15 dakika önce',
      icon: AlertCircle,
    },
    {
      type: 'success',
      title: 'Yeni kullanıcı eklendi',
      description: 'Yeni yetkili kullanıcı oluşturuldu',
      time: '1 saat önce',
      icon: Users,
    },
  ];



  return (
    <PageLayout
      title={`Hoş geldiniz, ${user?.name || 'Kullanıcı'}!`}
      description="Sistemin genel durumunu buradan takip edebilirsiniz"
      icon="Home"
      badge={{ text: 'Sistem Aktif', variant: 'default' }}
    >
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
      {/* Quick Actions */}
      <div className="lg:col-span-2">
          <Card variant="elevated" className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Hızlı Erişim</CardTitle>
                  <CardDescription className="mt-1">
                    Sık kullanılan işlemlere hızlıca erişin
                  </CardDescription>
                </div>
                <Zap className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                  <Link key={action.title} href={action.href}>
                  <div
                  className={cn(
                    "group relative p-5 rounded-xl border transition-all duration-300",
                    "hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer",
                  "bg-white dark:bg-slate-900"
                  )}
                  >
                        <div className={cn(
                        "inline-flex p-3 rounded-xl mb-3 transition-colors duration-300",
                        action.iconBg
                        )}>
                          <Icon className={cn("h-5 w-5", action.iconColor)} />
                        </div>
                        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                        <ArrowUpRight className="h-4 w-4 absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        </Link>
                        );
                        })}
                        </div>
                        </CardContent>
                        </Card>
                        </div>

        {/* Recent Activities */}
        <div>
          <Card variant="elevated" className="border-2 h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Son Aktiviteler</CardTitle>
                  <CardDescription className="mt-1">
                    Sistemdeki son işlemler
                  </CardDescription>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                  <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                      <div className={cn(
                        "p-2 rounded-lg bg-slate-500/10"
                      )}>
                        <Icon className={cn(
                          "h-4 w-4 text-slate-700 dark:text-slate-300"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                        </p>
                        </div>
                        </div>
                        );
                        })}
                        </div>
                        </CardContent>
                        </Card>
                        </div>
      </div>

      {/* Quick Stats */}
      <Card variant="elevated" className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Hızlı İstatistikler</CardTitle>
              <CardDescription className="mt-1">
                Önemli metriklerin özet görünümü
              </CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Aktif Kullanıcı</p>
                <p className="text-lg font-bold">1</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Toplam Bağış</p>
                <p className="text-lg font-bold">0</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Toplam Tutar</p>
                <p className="text-lg font-bold">₺0</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Bu Ay</p>
                <p className="text-lg font-bold">+0</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Actions */}
      <Card variant="elevated" className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Son İşlemler</CardTitle>
              <CardDescription className="mt-1">
                Sistemdeki son aktiviteler ve işlemler
              </CardDescription>
            </div>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Yeni kullanıcı kaydı</p>
                <p className="text-xs text-muted-foreground">Admin kullanıcısı oluşturuldu</p>
              </div>
              <Badge variant="secondary" className="text-xs">Şimdi</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Heart className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Bağış sistemi hazır</p>
                <p className="text-xs text-muted-foreground">Bağış modülü aktif edildi</p>
              </div>
              <Badge variant="secondary" className="text-xs">Bugün</Badge>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Settings className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sistem ayarları güncellendi</p>
                <p className="text-xs text-muted-foreground">Kurumsal tasarım uygulandı</p>
              </div>
              <Badge variant="secondary" className="text-xs">Dün</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div>
        <Card variant="elevated" className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">Sistem Durumu</CardTitle>
                <CardDescription className="mt-1">
                  Sistemin mevcut durumu ve performans metrikleri
                </CardDescription>
              </div>
              <Target className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-500/10 border border-slate-300 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-500/20">
                    <CheckCircle2 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Veritabanı</p>
                    <p className="text-xs text-muted-foreground">Bağlantı aktif</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-slate-700">
                  Aktif
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-500/10 border border-slate-300 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-500/20">
                    <CheckCircle2 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Kimlik Doğrulama</p>
                    <p className="text-xs text-muted-foreground">Servis aktif</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-slate-700">
                  Aktif
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-500/10 border border-slate-300 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-500/20">
                    <CheckCircle2 className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">API Servisleri</p>
                    <p className="text-xs text-muted-foreground">Tüm servisler aktif</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-slate-700">
                  Aktif
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
