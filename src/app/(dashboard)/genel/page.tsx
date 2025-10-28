'use client';

import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, TrendingUp, DollarSign } from 'lucide-react';

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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Toplam Bağış',
      value: '0',
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Bağış Tutarı',
      value: '0 ₺',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Aktif Kullanıcı',
      value: '1',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Hoş geldiniz, {user?.name || 'Kullanıcı'}!
        </h2>
        <p className="text-gray-600 mt-2">
          Sistemin genel durumunu buradan takip edebilirsiniz.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı Erişim</CardTitle>
          <CardDescription>
            Sık kullanılan işlemlere hızlıca erişin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-semibold">İhtiyaç Sahipleri</h3>
              <p className="text-sm text-gray-600 mt-1">
                Kayıtlı ihtiyaç sahiplerini görüntüle
              </p>
            </button>

            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-semibold">Bağışlar</h3>
              <p className="text-sm text-gray-600 mt-1">
                Bağış kayıtlarını yönet
              </p>
            </button>

            <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h3 className="font-semibold">Raporlar</h3>
              <p className="text-sm text-gray-600 mt-1">
                Detaylı raporları incele
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sistem Durumu</CardTitle>
          <CardDescription>
            Sistemin mevcut durumu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Veritabanı Bağlantısı</span>
              <span className="text-sm text-green-600">✓ Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Kimlik Doğrulama</span>
              <span className="text-sm text-green-600">✓ Aktif</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Servisleri</span>
              <span className="text-sm text-green-600">✓ Aktif</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}