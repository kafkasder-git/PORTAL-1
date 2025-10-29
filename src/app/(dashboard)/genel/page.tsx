'use client';

import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import { PageLayout } from '@/components/layouts/PageLayout';
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
  Home
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  } as const;

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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
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
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "group relative p-5 rounded-xl border transition-all duration-300",
                          "hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer",
                          "bg-white dark:bg-slate-900"
                        )}
                      >
                        <div className={cn(
                          "inline-flex p-3 rounded-xl mb-3 transition-transform duration-300 group-hover:scale-110",
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
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
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
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
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
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
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
      </motion.div>
    </PageLayout>
  );
}
