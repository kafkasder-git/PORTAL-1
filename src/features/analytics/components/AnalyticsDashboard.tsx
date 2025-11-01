/**
 * Advanced Analytics Dashboard Component
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Calendar, Download, TrendingUp, Users, Gift, Heart, FileText } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { tr } from 'date-fns/locale';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import {
  getComprehensiveReport,
  exportToCsv,
  type DateRange,
  type ReportData
} from '@/shared/lib/services/reporting.service';
import { cn } from '@/shared/lib/utils';

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#0088fe',
  '#00c49f',
  '#ffbb28',
  '#ff8042'
];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [activeTab, setActiveTab] = useState('overview');

  const { data: reportData, isLoading, refetch } = useQuery<ReportData>({
    queryKey: ['analytics-report', dateRange],
    queryFn: () => getComprehensiveReport(dateRange),
  });

  const handleExportCsv = () => {
    if (!reportData) return;

    const csv = exportToCsv(reportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapor-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Raporlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Rapor verisi alınamadı</p>
        <Button onClick={() => refetch()} className="mt-4">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analitik & Raporlar</h1>
          <p className="text-gray-500">Detaylı istatistikler ve trend analizleri</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="h-4 w-4 mr-2" />
            CSV İndir
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tarih Aralığı
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <DatePicker
                value={dateRange.from}
                onChange={(date) => date && setDateRange({ ...dateRange, from: date })}
                placeholder="Başlangıç tarihi"
              />
            </div>
            <span className="text-gray-500">-</span>
            <div className="flex-1">
              <DatePicker
                value={dateRange.to}
                onChange={(date) => date && setDateRange({ ...dateRange, to: date })}
                placeholder="Bitiş tarihi"
              />
            </div>
            <Select
              value="custom"
              onValueChange={(value) => {
                if (value === '7days') {
                  setDateRange({ from: subDays(new Date(), 7), to: new Date() });
                } else if (value === '30days') {
                  setDateRange({ from: subDays(new Date(), 30), to: new Date() });
                } else if (value === '90days') {
                  setDateRange({ from: subDays(new Date(), 90), to: new Date() });
                }
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Hızlı seçim" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Son 7 Gün</SelectItem>
                <SelectItem value="30days">Son 30 Gün</SelectItem>
                <SelectItem value="90days">Son 90 Gün</SelectItem>
                <SelectItem value="custom">Özel Aralık</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => refetch()}>Uygula</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Toplam İhtiyaç Sahibi"
          value={reportData.summary.totalBeneficiaries}
          icon={<Users className="h-5 w-5" />}
          color="bg-blue-500"
        />
        <SummaryCard
          title="Toplam Bağış"
          value={`${reportData.summary.totalDonationsAmount.toLocaleString('tr-TR')} ₺`}
          icon={<Gift className="h-5 w-5" />}
          color="bg-green-500"
        />
        <SummaryCard
          title="Yardım Başvuruları"
          value={reportData.summary.totalAidApplications}
          icon={<Heart className="h-5 w-5" />}
          color="bg-red-500"
        />
        <SummaryCard
          title="Tamamlanan Görevler"
          value={`${reportData.summary.completedTasks}/${reportData.summary.totalTasks}`}
          icon={<FileText className="h-5 w-5" />}
          color="bg-purple-500"
        />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="donations">Bağış Analizi</TabsTrigger>
          <TabsTrigger value="beneficiaries">İhtiyaç Sahipleri</TabsTrigger>
          <TabsTrigger value="aid">Yardım Dağılımı</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Aylık İstatistikler</CardTitle>
                <CardDescription>Bu yılın aylık performansı</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beneficiaries" fill="#8884d8" name="İhtiyaç Sahipleri" />
                    <Bar dataKey="donations" fill="#82ca9d" name="Bağışlar" />
                    <Bar dataKey="aidApplications" fill="#ffc658" name="Yardım Başvuruları" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Görev Durumu</CardTitle>
                <CardDescription>Tamamlanan ve bekleyen görevler</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Tamamlanan', value: reportData.summary.completedTasks },
                        { name: 'Bekleyen', value: reportData.summary.pendingTasks }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#82ca9d" />
                      <Cell fill="#ffc658" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bağış Trendleri</CardTitle>
              <CardDescription>Zaman içinde bağış miktarı ve adedi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={reportData.donationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    stroke="#8884d8"
                    name="Tutar (₺)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    stroke="#82ca9d"
                    name="Adet"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beneficiaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>İhtiyaç Sahibi Kategorileri</CardTitle>
              <CardDescription>Türlerine göre dağılım</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={reportData.beneficiaryCategories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData.beneficiaryCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yardım Türlerine Göre Dağılım</CardTitle>
              <CardDescription>Aid türlerinin miktar ve adet analizi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData.aidDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" name="Miktar" />
                  <Bar dataKey="count" fill="#82ca9d" name="Adet" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  color
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
          <div className={cn('p-3 rounded-full text-white', color)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
