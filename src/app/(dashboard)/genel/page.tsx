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
  Settings,
  Calendar,
  MessageSquare,
  Receipt,
  HandHeart,
  Award,
  ChartLine,
  Wallet,
  Briefcase,
  Plus,
  Eye,
  FileText,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Kimlik Doğrulama Hatası</h2>
          <p className="text-muted-foreground mt-2">Lütfen tekrar giriş yapın.</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Toplam İhtiyaç Sahibi',
      value: '0',
      icon: Users,
      variant: 'primary' as const,
      trend: { value: '+0%', direction: 'neutral' as const },
      description: 'Kayıtlı toplam',
    },
    {
      title: 'Toplam Bağış',
      value: '0',
      icon: Heart,
      variant: 'success' as const,
      trend: { value: '+0', direction: 'neutral' as const },
      description: 'Bu ay',
    },
    {
      title: 'Bağış Tutarı',
      value: '₺0',
      icon: DollarSign,
      variant: 'accent' as const,
      trend: { value: '+0%', direction: 'neutral' as const },
      description: 'Toplam tutar',
    },
    {
      title: 'Aktif Kullanıcı',
      value: '1',
      icon: TrendingUp,
      variant: 'info' as const,
      trend: { value: '+0%', direction: 'neutral' as const },
      description: 'Sistem kullanıcıları',
    },
  ];

  const quickActions = [
    {
      title: 'İhtiyaç Sahipleri',
      description: 'Kayıtlı ihtiyaç sahiplerini görüntüle ve yönet',
      icon: Users,
      href: '/yardim/ihtiyac-sahipleri',
      color: 'from-primary/20 to-primary/5 border-primary/20',
    },
    {
      title: 'Bağışlar',
      description: 'Bağış kayıtlarını görüntüle ve yönet',
      icon: Heart,
      href: '/bagis/liste',
      color: 'from-success/20 to-success/5 border-success/20',
    },
    {
      title: 'Raporlar',
      description: 'Detaylı raporları ve istatistikleri incele',
      icon: BarChart3,
      href: '/bagis/raporlar',
      color: 'from-accent/20 to-accent/5 border-accent/20',
    },
    {
      title: 'Başvurular',
      description: 'Yardım başvurularını görüntüle ve işle',
      icon: FileText,
      href: '/yardim/basvurular',
      color: 'from-warning/20 to-warning/5 border-warning/20',
    },
    {
      title: 'Mesajlar',
      description: 'Kurum içi mesajlaşma ve bildirimler',
      icon: MessageSquare,
      href: '/mesaj/kurum-ici',
      color: 'from-info/20 to-info/5 border-info/20',
    },
    {
      title: 'Görevler',
      description: 'Görev yönetimi ve takip sistemi',
      icon: Briefcase,
      href: '/is/gorevler',
      color: 'from-primary/15 to-primary/5 border-primary/20',
    },
  ];

  const recentActivities = [
    {
      title: 'Yeni bağış kaydedildi',
      description: '500 ₺ bağış kaydı oluşturuldu',
      time: '2 dakika önce',
      icon: CheckCircle2,
      variant: 'success' as const,
    },
    {
      title: 'İhtiyaç sahibi güncellendi',
      description: 'Ahmet Yılmaz bilgileri güncellendi',
      time: '15 dakika önce',
      icon: AlertCircle,
      variant: 'info' as const,
    },
    {
      title: 'Yeni kullanıcı eklendi',
      description: 'Yeni yetkili kullanıcı oluşturuldu',
      time: '1 saat önce',
      icon: Users,
      variant: 'primary' as const,
    },
    {
      title: 'Sistem güncellemesi',
      description: 'Portal v2.0 kuruldu',
      time: '3 saat önce',
      icon: Settings,
      variant: 'warning' as const,
    },
  ];

  const systemStatus = [
    { label: 'Veritabanı', status: 'Aktif', icon: CheckCircle2 },
    { label: 'Kimlik Doğrulama', status: 'Aktif', icon: CheckCircle2 },
    { label: 'API Servisleri', status: 'Aktif', icon: CheckCircle2 },
  ];

  return (
    <PageLayout
      title={`Hoş geldiniz, ${user?.name || 'Kullanıcı'}`}
      description="Sistemin genel durumunu buradan takip edebilirsiniz"
      icon="Home"
      badge={{ text: 'Sistem Aktif', variant: 'default' }}
    >
      <div className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              variant={stat.variant}
              trend={stat.trend}
              description={stat.description}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Quick Actions - 2-3 columns on desktop */}
          <div className="lg:col-span-2 xl:col-span-3">
            <Card variant="elevated" size="desktop">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-primary" />
                      Hızlı Erişim
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Sık kullanılan işlemlere hızlıca erişin
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.title} href={action.href}>
                        <div
                          className={cn(
                            'group relative p-5 rounded-xl border-2 transition-all duration-300',
                            'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
                            'bg-linear-to-br',
                            action.color
                          )}
                        >
                          <div className="inline-flex p-2.5 rounded-lg mb-3 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 bg-linear-to-br from-primary/40 to-primary/30">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {action.description}
                          </p>
                          <ArrowRight className="h-4 w-4 absolute top-4 right-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
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
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Son Aktiviteler
                </CardTitle>
                <CardDescription className="mt-1">
                  Sistemdeki son işlemler
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors group"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Charts & Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donation Trend */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ChartLine className="h-5 w-5 text-primary" />
                    Bağış Trendi
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Son 6 ayın bağış grafiği
                  </CardDescription>
                </div>
                <Badge variant="secondary">Aylık</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center rounded-lg bg-linear-to-br from-primary/5 to-primary/2 border-2 border-dashed border-primary/20">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-primary/40 mb-2" />
                  <p className="text-sm text-muted-foreground">Grafik verisi yakında eklenecek</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Metrics */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Hızlı Metrikler
              </CardTitle>
              <CardDescription className="mt-1">
                Önemli istatistiklerin özet görünümü
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Bu Ay Bağış', value: '₺0', change: '+0%', icon: TrendingUp },
                  { label: 'Bekleyen Başvuru', value: '0', change: '+0', icon: AlertCircle },
                  { label: 'Aktif Görev', value: '0', change: '0', icon: CheckCircle2 },
                  { label: 'Okunmamış Mesaj', value: '0', change: '0', icon: MessageSquare },
                ].map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-lg border border-border/50 bg-linear-to-br from-card/50 to-card hover:shadow-md transition-all duration-300 hover:border-primary/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-4 w-4 text-primary/70" />
                        <Badge variant="secondary" className="text-xs">
                          {metric.change}
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {metric.label}
                      </p>
                      <p className="text-2xl font-bold">{metric.value}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status & Recent Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Sistem Durumu
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Sistemin mevcut durumu ve performans metrikleri
                  </CardDescription>
                </div>
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Tüm Sistemler Aktif
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemStatus.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success/10">
                          <Icon className="h-4 w-4 text-success" />
                        </div>
                        <p className="text-sm font-medium">{item.label}</p>
                      </div>
                      <Badge variant="success" className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Actions */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Son İşlemler
              </CardTitle>
              <CardDescription className="mt-1">
                Sistemdeki son aktiviteler ve işlemler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: 'Yeni kullanıcı kaydı',
                    description: 'Admin kullanıcısı oluşturuldu',
                    time: 'Şimdi',
                    icon: Users,
                  },
                  {
                    title: 'Bağış sistemi hazır',
                    description: 'Bağış modülü aktif edildi',
                    time: 'Bugün',
                    icon: Heart,
                  },
                  {
                    title: 'Sistem ayarları güncellendi',
                    description: 'Premium tasarım uygulandı',
                    time: 'Dün',
                    icon: Settings,
                  },
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors group"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {action.time}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
