'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Download } from 'lucide-react';
import Link from 'next/link';
import { BeneficiaryQuickAddModal } from '@/components/forms/BeneficiaryQuickAddModal';
import { appwriteApi } from '@/lib/api/appwrite-api';
import type { BeneficiaryDocument } from '@/types/collections';

export default function BeneficiariesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['beneficiaries', page, search],
    queryFn: () => appwriteApi.beneficiaries.getBeneficiaries({ page, limit, search }),
  });

  const beneficiaries = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Modal kapandığında listeyi yenile
  const handleModalClose = () => {
    setShowQuickAddModal(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İhtiyaç Sahipleri</h1>
          <p className="text-gray-600 mt-2">
            Kayıtlı ihtiyaç sahiplerini görüntüleyin ve yönetin
          </p>
        </div>
      </div>

      {/* Hızlı Ekleme Modal */}
      <BeneficiaryQuickAddModal
        open={showQuickAddModal}
        onOpenChange={handleModalClose}
      />

      {/* Portal Plus Style Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[120px]">
              <Input
                placeholder="ID ↵"
                className="h-9"
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <Input
                placeholder="Kişi / Kurum Ünvanı"
                className="h-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <Input
                placeholder="Kimlik No"
                className="h-9"
              />
            </div>
            <div className="flex-1 min-w-[120px]">
              <Input
                placeholder="Dosya No"
                className="h-9"
              />
            </div>
            <select className="h-9 px-3 border rounded-md text-sm">
              <option>=</option>
              <option>{'>'}</option>
              <option>{'<'}</option>
              <option>~</option>
            </select>
            <Button variant="default" size="sm" className="h-9 gap-1 bg-green-600 hover:bg-green-700">
              <Search className="h-4 w-4" />
              Ara
            </Button>
            <Button variant="default" size="sm" className="h-9 gap-1 bg-gray-600 hover:bg-gray-700">
              Filtre
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="h-9 gap-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowQuickAddModal(true)}
            >
              <Plus className="h-4 w-4" />
              Ekle
            </Button>
            <Button variant="default" size="sm" className="h-9 gap-1 bg-cyan-600 hover:bg-cyan-700">
              <Download className="h-4 w-4" />
              İndir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List - Portal Plus Style */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">{total} Kayıt</span>
            <div className="flex items-center gap-2 text-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 px-2"
              >
                ←
              </Button>
              <Input 
                type="number" 
                value={page} 
                onChange={(e) => setPage(Number(e.target.value))}
                className="h-7 w-12 text-center p-0"
              />
              <span>/ {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 px-2"
              >
                →
              </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              Veriler yüklenirken hata oluştu
            </div>
          ) : beneficiaries.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="text-lg font-medium">Kayıt bulunamadı</p>
              <p className="text-sm mt-2">
                {search ? 'Arama kriterlerinize uygun kayıt yok' : 'Henüz kayıt eklenmemiş'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="p-3 text-left text-sm font-medium text-gray-700 w-8"></th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Tür</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">İsim</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Kategori</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Yaş</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Uyruk</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Kimlik No</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Cep Telefonu</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Ülke</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Şehir</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Yerleşim</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Adres</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Kişi</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Yetim</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Başvuru</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Yardım</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Dosya No</th>
                    <th className="p-3 text-left text-sm font-medium text-gray-700">Son Atama</th>
                  </tr>
                </thead>
                <tbody>
                  {beneficiaries.map((beneficiary: BeneficiaryDocument, index: number) => (
                    <tr 
                      key={beneficiary.$id}
                      className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="p-3">
                        <Link href={`/yardim/ihtiyac-sahipleri/${beneficiary.$id}`}>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Search className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                      <td className="p-3 text-sm">İhtiyaç Sahibi Kişi</td>
                      <td className="p-3 text-sm font-medium">{beneficiary.name}</td>
                      <td className="p-3 text-sm">-</td>
                      <td className="p-3 text-sm">
                        {beneficiary.birth_date 
                          ? Math.floor((new Date().getTime() - new Date(beneficiary.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                          : '-'
                        }
                      </td>
                      <td className="p-3 text-sm">{beneficiary.nationality || '-'}</td>
                      <td className="p-3 text-sm">{beneficiary.tc_no || '-'}</td>
                      <td className="p-3 text-sm">{beneficiary.phone || '-'}</td>
                      <td className="p-3 text-sm">-</td>
                      <td className="p-3 text-sm">{beneficiary.city || '-'}</td>
                      <td className="p-3 text-sm">{beneficiary.district || '-'}</td>
                      <td className="p-3 text-sm max-w-xs truncate">{beneficiary.address || '-'}</td>
                      <td className="p-3 text-sm">{beneficiary.family_size || '-'}</td>
                      <td className="p-3 text-sm">-</td>
                      <td className="p-3 text-sm">-</td>
                      <td className="p-3 text-sm">-</td>
                      <td className="p-3 text-sm text-blue-600">-</td>
                      <td className="p-3 text-sm">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
