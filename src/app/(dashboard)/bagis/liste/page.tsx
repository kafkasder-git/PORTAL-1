'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, DollarSign, Eye, FileText } from 'lucide-react';
import { PageLayout } from '@/components/layouts/PageLayout';
import { DonationForm } from '@/components/forms/DonationForm';

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

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <>
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogTrigger asChild>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2 bg-slate-700 hover:bg-slate-600">
            <Plus className="h-4 w-4" />
            Yeni Bağış
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
            <Button variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50">
              <FileText className="h-4 w-4" />
              Rapor
            </Button>
          </>
        }
      >
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Bağış</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalAmount.toLocaleString('tr-TR')} ₺
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bu Sayfadaki Tutar</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString('tr-TR')} ₺
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Arama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Bağışçı adı veya fiş numarası ile ara..."
                className="pl-10 border-slate-200 focus:border-slate-400"
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
        <Card className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle>Bağış Listesi</CardTitle>
            <CardDescription>Toplam {total} bağış kaydı</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : donations.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Henüz bağış kaydı bulunmuyor</p>
                <Button onClick={() => setShowCreateForm(true)} className="mt-4 bg-slate-700 hover:bg-slate-600">
                  İlk bağışı ekle
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation.$id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:border-slate-400 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-slate-700">
                            Bağış
                          </Badge>
                          <span className="text-sm text-slate-500">#{donation.receipt_number}</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{donation.donor_name}</h3>
                        <p className="text-slate-600 mb-2">{donation.description || 'Açıklama yok'}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {donation.amount.toLocaleString('tr-TR')} ₺
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {donation.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold mb-1">
                          {donation.amount.toLocaleString('tr-TR')} ₺
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(donation.created_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-slate-500">
                  Sayfa {page} / {totalPages} (Toplam {total} kayıt)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Önceki
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PageLayout>
    </>
  );
}
