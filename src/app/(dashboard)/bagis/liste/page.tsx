'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { ExecutiveCard } from '@/shared/components/ui/executive-card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { DataTable, Column } from '@/shared/components/ui/data-table';
import { Search, Plus, DollarSign, Eye, FileText, Edit, Trash2 } from 'lucide-react';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { DonationForm } from '@/features/donations';

export default function DonationsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['donations', page, search],
    queryFn: () => api.donations.getDonations({ page, limit, search }),
  });

  const donations = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const totalAmount = donations.reduce((sum: number, d: any) => sum + d.amount, 0);

  const columns: Column<any>[] = [
    {
      key: 'actions',
      label: '',
      render: (item) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" title="Görüntüle">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Düzenle">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Sil" className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-24',
    },
    {
      key: 'receipt_number',
      label: 'Fiş No',
      render: (item) => (
        <Badge variant="outline" className="font-mono">
          #{item.receipt_number}
        </Badge>
      ),
    },
    {
      key: 'donor_name',
      label: 'Bağışçı',
      render: (item) => (
        <span className="font-medium">{item.donor_name}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Tutar',
      render: (item) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-bold text-green-600">
            {item.amount.toLocaleString('tr-TR')} ₺
          </span>
        </div>
      ),
    },
    {
      key: 'donation_type',
      label: 'Tür',
      render: (item) => (
        <Badge variant="secondary">{item.donation_type}</Badge>
      ),
    },
    {
      key: '$createdAt',
      label: 'Tarih',
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {new Date(item.$createdAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      ),
    },
  ];

  return (
    <>
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogTrigger asChild>
        <Button size="lg" onClick={() => setShowCreateForm(true)} className="gap-2">
        <Plus className="h-5 w-5" />
        Yeni Bağış Ekle
        </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Bağış Ekle</DialogTitle>
            <DialogDescription>
              Bağış bilgilerini girerek yeni kayıt oluşturun. Zorunlu alanlar işaretlenmiştir (*).
            </DialogDescription>
          </DialogHeader>
          <DonationForm
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      <PageLayout
        title="Bağış Yönetimi"
        description="Bağış kayıtlarını görüntüleyin ve yönetin"
        icon="DollarSign"
        actions={
        <>
        <Button variant="outline" className="gap-2">
        <FileText className="h-4 w-4" />
        Rapor Oluştur
        </Button>
        </>
        }
      >
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ExecutiveCard
        title="Toplam Bağış"
        value={total}
        subtitle="Kayıtlı Bağış Sayısı"
        icon={DollarSign}
        variant="elevated"
        status="info"
        trend={{
        value: "+12%",
        direction: "up",
        label: "geçen aya göre"
        }}
        />

        <ExecutiveCard
        title="Toplam Tutar"
        value={`${totalAmount.toLocaleString('tr-TR')} ₺`}
        subtitle="Toplam Bağış Miktarı"
        icon={DollarSign}
        variant="elevated"
        status="success"
        trend={{
        value: "+8%",
        direction: "up",
        label: "geçen aya göre"
        }}
        />

        <ExecutiveCard
        title="Bu Sayfa"
        value={`${donations.reduce((sum: number, d: any) => sum + d.amount, 0).toLocaleString('tr-TR')} ₺`}
        subtitle="Mevcut Sayfa Tutarı"
        icon={DollarSign}
        variant="elevated"
        status="info"
        />
        </div>

        {/* Search */}
        <Card variant="outline" size="sm">
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
        <Search className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        Gelişmiş Arama
        </CardTitle>
        <CardDescription>
        Bağışçı adı, fiş numarası veya tutar ile arama yapın
        </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
        <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
        placeholder="Bağışçı adı veya fiş numarası ile ara..."
        className="pl-10 h-10 text-sm sm:h-12 sm:text-base sm:pl-12"
        value={search}
        onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
        }}
        />
        </div>
        </CardContent>
        </Card>

        {/* List */}
        <Card variant="elevated" size="lg">
        <CardHeader>
        <div className="flex items-center justify-between">
        <div>
        <CardTitle className="text-2xl flex items-center gap-3">
        <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
        Bağış Listesi
        </CardTitle>
        <CardDescription className="text-base mt-2">
        Sistemde kayıtlı toplam {total} bağış kaydı bulunmaktadır
        </CardDescription>
        </div>
        <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
        {total} Kayıt
        </Badge>
        </div>
        </CardHeader>
          <CardContent>
            <DataTable
              data={donations}
              columns={columns}
              isLoading={isLoading}
              error={null}
              searchable={false}
              searchValue={search}
              onSearchChange={setSearch}
              pagination={{
                page,
                totalPages,
                total,
                onPageChange: setPage,
              }}
              emptyMessage="Henüz bağış kaydı bulunmuyor"
              emptyDescription="İlk bağış kaydını eklemek için yukarıdaki butona tıklayın"
            />
          </CardContent>
        </Card>
      </PageLayout>
    </>
  );
}
