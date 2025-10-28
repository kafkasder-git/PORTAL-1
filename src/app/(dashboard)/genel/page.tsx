'use client';

import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Heart, TrendingUp, DollarSign, ClipboardList, Calendar, Building2, Plane, DollarSign as Dollar, Euro, PoundSterling, TrendingUp as Gold, Mail, MessageSquare, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => api.dashboard.getMetrics(),
  });

  // Add pending tasks count query
  const { data: pendingTasksResponse, isLoading: isPendingTasksLoading } = useQuery({
    queryKey: ['pending-tasks-count'],
    queryFn: () => api.tasks.getTasks({ filters: { status: 'pending' } }),
  });

  const pendingTasksCount = pendingTasksResponse?.data || 0;

  // Add messages statistics query - temporarily disabled
  // const { data: messagesStatsResponse, isLoading: isMessagesStatsLoading } = useQuery({
  //   queryKey: ['messages-statistics'],
  //   queryFn: () => api.messages.getMessagesStatistics(),
  // });

  // const messagesStats = messagesStatsResponse?.data || {
  //   totalSms: 0,
  //   totalEmails: 0,
  //   failedMessages: 0,
  //   draftMessages: 0
  // };

  const messagesStats = {
    totalSms: 0,
    totalEmails: 0,
    failedMessages: 0,
    draftMessages: 0
  };

  // Add upcoming meetings count query
  const { data: upcomingMeetingsResponse, isLoading: isUpcomingMeetingsLoading } = useQuery({
    queryKey: ['upcoming-meetings-count'],
    queryFn: () => api.meetings.getMeetings({ filters: { status: 'upcoming' } }),
  });

  const upcomingMeetingsCount = upcomingMeetingsResponse?.data || 0;

  // Add meetings by tab queries
  const { data: invitedMeetingsResponse } = useQuery({
    queryKey: ['meetings-invited', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve({ data: [], error: null });
      return api.meetings.getMeetings({ filters: { user_id: user.id, status: 'invited' } });
    },
    enabled: !!user?.id,
  });

  const { data: attendedMeetingsResponse } = useQuery({
    queryKey: ['meetings-attended', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve({ data: [], error: null });
      return api.meetings.getMeetings({ filters: { user_id: user.id, status: 'attended' } });
    },
    enabled: !!user?.id,
  });

  const { data: informedMeetingsResponse } = useQuery({
    queryKey: ['meetings-informed', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve({ data: [], error: null });
      return api.meetings.getMeetings({ filters: { user_id: user.id, status: 'informed' } });
    },
    enabled: !!user?.id,
  });

  const { data: openMeetingsResponse } = useQuery({
    queryKey: ['meetings-open', user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve({ data: [], error: null });
      return api.meetings.getMeetings({ filters: { user_id: user.id, status: 'open' } });
    },
    enabled: !!user?.id,
  });

  const invitedMeetings = invitedMeetingsResponse?.data || [];
  const attendedMeetings = attendedMeetingsResponse?.data || [];
  const informedMeetings = informedMeetingsResponse?.data || [];
  const openMeetings = openMeetingsResponse?.data || [];

  const stats = [
    {
      title: 'Toplam İhtiyaç Sahibi',
      value: metrics?.data?.totalBeneficiaries || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Toplam Bağış',
      value: metrics?.data?.totalDonations || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Bağış Tutarı',
      value: `${metrics?.data?.totalDonationAmount?.toLocaleString('tr-TR') || 0} ₺`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Aktif Kullanıcı',
      value: metrics?.data?.activeUsers || 0,
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
          Hoş geldiniz, {user?.name}!
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
            <GlassCard key={stat.title} opacity={0.8}>
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
                  {isLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </GlassCard>
          );
        })}
      </div>

      {/* Quick Actions */}
      <GlassCard opacity={0.8}>
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
      </GlassCard>

      {/* Portal Plus Style Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - İş Yönetimi Widget'ları */}
        <div className="lg:col-span-2 space-y-6">
          {/* İş Akış Şeması */}
          <GlassCard opacity={0.6}>
            <CardHeader>
              <CardTitle>Akış Şeması</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>İş akış şeması gösterilecek</p>
              </div>
            </CardContent>
          </GlassCard>

          {/* Son İş Kayıtları */}
          <GlassCard opacity={0.6}>
            <CardHeader>
              <CardTitle>Son İş Kayıtları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>Okunmamış iş kaydı bulunmamaktadır</p>
              </div>
            </CardContent>
          </GlassCard>

          {/* Döviz Kurları */}
          <GlassCard opacity={0.6}>
            <CardHeader>
              <CardTitle>Döviz Kurları</CardTitle>
              <CardDescription>Güncel kur bilgileri</CardDescription>
            </CardHeader>
            <CardContent>
              <CurrencyRates />
            </CardContent>
          </GlassCard>
        </div>

        {/* Sağ Kolon - Quick Stats */}
        <div className="space-y-6">
          {/* İş Durumu Kartları */}
          <DashboardStatCard
            icon={<ClipboardList />}
            label="Bekleyen"
            value={isPendingTasksLoading ? '...' : pendingTasksCount.toString()}
            sublabel="İş Kayıtları"
            color="blue"
            onClick={() => router.push('/is/gorevler?status=pending')}
          />

          <DashboardStatCard
            icon={<ClipboardList />}
            label="Takibinizdeki"
            value="0"
            sublabel="İş Kayıtları"
            color="green"
          />

          <DashboardStatCard
            icon={<Calendar />}
            label="İşlemdeki"
            value="0"
            sublabel="Takvim"
            color="orange"
          />

          <DashboardStatCard
            icon={<Calendar />}
            label="Planlanmış"
            value={isUpcomingMeetingsLoading ? '...' : upcomingMeetingsCount.toString()}
            sublabel="Toplantılar"
            color="purple"
            onClick={() => router.push('/is/toplantilar')}
          />

          <DashboardStatCard
            icon={<Building2 />}
            label="Üyesi Olduğunuz"
            value="0"
            sublabel="Kurul ve Komisyonlar"
            color="indigo"
          />

          <DashboardStatCard
            icon={<Plane />}
            label="Yolculuklarınız"
            value="0"
            sublabel="Seyahatler"
            color="pink"
          />
        </div>
      </div>

      {/* Toplantılar Tabs */}
      <GlassCard opacity={0.8}>
        <CardContent className="pt-6">
          <Tabs defaultValue="invited" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="invited">Davet</TabsTrigger>
              <TabsTrigger value="attending">Katılım</TabsTrigger>
              <TabsTrigger value="informed">Bilgi Verilenler</TabsTrigger>
              <TabsTrigger value="open">Açık Durumdakiler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="invited" className="py-4">
              {invitedMeetings.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Henüz davet edildiğiniz bir toplantı bulunmamaktadır</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invitedMeetings.map((meeting) => (
                    <Card
                      key={meeting.$id}
                      className="cursor-pointer transition-all hover:shadow-md hover:bg-blue-50"
                      onClick={() => router.push('/is/toplantilar')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {format(new Date(meeting.meeting_date), 'dd MMM yyyy HH:mm', { locale: tr })}
                              </span>
                              <h4 className="font-semibold">{meeting.title}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {meeting.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-[200px]">{meeting.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{meeting.participants.length} katılımcı</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => router.push('/is/toplantilar')}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Tümünü Gör →
                    </button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="attending" className="py-4">
              {attendedMeetings.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Katılım sağladığınız toplantı bulunmamaktadır</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attendedMeetings.map((meeting) => (
                    <Card
                      key={meeting.$id}
                      className="cursor-pointer transition-all hover:shadow-md hover:bg-blue-50"
                      onClick={() => router.push('/is/toplantilar')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {format(new Date(meeting.meeting_date), 'dd MMM yyyy HH:mm', { locale: tr })}
                              </span>
                              <h4 className="font-semibold">{meeting.title}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {meeting.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-[200px]">{meeting.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{meeting.participants.length} katılımcı</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => router.push('/is/toplantilar')}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Tümünü Gör →
                    </button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="informed" className="py-4">
              {informedMeetings.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Bilgi verildiğiniz toplantı bulunmamaktadır</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {informedMeetings.map((meeting) => (
                    <Card
                      key={meeting.$id}
                      className="cursor-pointer transition-all hover:shadow-md hover:bg-blue-50"
                      onClick={() => router.push('/is/toplantilar')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {format(new Date(meeting.meeting_date), 'dd MMM yyyy HH:mm', { locale: tr })}
                              </span>
                              <h4 className="font-semibold">{meeting.title}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {meeting.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-[200px]">{meeting.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{meeting.participants.length} katılımcı</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => router.push('/is/toplantilar')}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Tümünü Gör →
                    </button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="open" className="py-4">
              {openMeetings.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Açık durumda toplantı bulunmamaktadır</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {openMeetings.map((meeting) => (
                    <Card
                      key={meeting.$id}
                      className="cursor-pointer transition-all hover:shadow-md hover:bg-blue-50"
                      onClick={() => router.push('/is/toplantilar')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {format(new Date(meeting.meeting_date), 'dd MMM yyyy HH:mm', { locale: tr })}
                              </span>
                              <h4 className="font-semibold">{meeting.title}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {meeting.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate max-w-[200px]">{meeting.location}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{meeting.participants.length} katılımcı</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <div className="text-center pt-2">
                    <button
                      onClick={() => router.push('/is/toplantilar')}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Tümünü Gör →
                    </button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </GlassCard>

      {/* SMS & E-posta İstatistikleri */}
      <GlassCard opacity={0.8}>
        <CardHeader>
          <CardTitle>Gönderilen SMS & e-Postalar</CardTitle>
          <CardDescription>Tüm Zamanlar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/mesaj/toplu?type=sms')}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">SMS</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {false ? '...' : messagesStats.totalSms}
              </p>
            </div>

            <div 
              className="p-4 bg-green-50 rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/mesaj/toplu?type=email')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">e-Posta</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {false ? '...' : messagesStats.totalEmails}
              </p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}

// Dashboard Stat Card Component (Portal Plus Style)
function DashboardStatCard({ icon, label, value, sublabel, color, onClick }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  color: string;
  onClick?: () => void;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50',
    purple: 'border-purple-200 bg-purple-50',
    indigo: 'border-indigo-200 bg-indigo-50',
    pink: 'border-pink-200 bg-pink-50',
  };

  return (
    <Card 
      className={`${colorClasses[color] || colorClasses.blue} border-2 ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="text-gray-600">{icon}</div>
          <div className="flex-1">
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            <p className="text-sm text-gray-600 mt-1">{sublabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Currency Rates Component (Portal Plus Style)
function CurrencyRates() {
  const [rates, setRates] = useState({
    usd: { buy: 41.8134, sell: 41.9809 },
    eur: { buy: 48.5603, sell: 48.7549 },
    gbp: { buy: 55.5961, sell: 56.009 },
    gold: { buy: 5760, sell: 5760 },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CurrencyCard
        symbol="$"
        name="ABD Doları"
        buy={rates.usd.buy}
        sell={rates.usd.sell}
        color="green"
      />
      <CurrencyCard
        symbol="€"
        name="Euro"
        buy={rates.eur.buy}
        sell={rates.eur.sell}
        color="blue"
      />
      <CurrencyCard
        symbol="£"
        name="İngiliz Sterlini"
        buy={rates.gbp.buy}
        sell={rates.gbp.sell}
        color="red"
      />
      <CurrencyCard
        symbol="XAU"
        name="Altın"
        buy={rates.gold.buy}
        sell={rates.gold.sell}
        color="yellow"
      />
    </div>
  );
}

function CurrencyCard({ symbol, name, buy, sell, color }: {
  symbol: string;
  name: string;
  buy: number;
  sell: number;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    green: 'border-l-green-500 bg-green-50',
    blue: 'border-l-blue-500 bg-blue-50',
    red: 'border-l-red-500 bg-red-50',
    yellow: 'border-l-yellow-500 bg-yellow-50',
  };

  return (
    <div className={`border-l-4 p-4 rounded ${colorClasses[color] || colorClasses.green}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl font-bold">{symbol}</span>
        <span className="text-sm text-gray-600">{name}</span>
      </div>
      <Separator className="my-2" />
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Alış</p>
          <p className="font-semibold">{buy.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
        </div>
        <div>
          <p className="text-gray-500">Satış</p>
          <p className="font-semibold">{sell.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</p>
        </div>
      </div>
    </div>
  );
}
