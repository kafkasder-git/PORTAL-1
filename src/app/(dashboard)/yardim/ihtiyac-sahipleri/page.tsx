'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { DataTable, Column } from '@/shared/components/ui/data-table';
import { PageLayout } from '@/shared/components/layout/PageLayout';
import { Badge } from '@/shared/components/ui/badge';
import { Users, Plus, Download, Eye } from 'lucide-react';
import Link from 'next/link';
import api from '@/shared/lib/api';
import { exportBeneficiaries } from '@/shared/lib/api/mock-api';
import type { BeneficiaryDocument } from '@/entities/collections';
import { toast } from 'sonner';

export default function BeneficiariesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['beneficiaries', page, search],
    queryFn: () => api.beneficiaries.getBeneficiaries({ page, limit, search }),
  });

  const beneficiaries = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleModalClose = () => {
    setShowQuickAddModal(false);
    refetch();
  };

  const handleExport = async () => {
    const result = await exportBeneficiaries({ search });
    if (result.success && result.data) {
      const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ihtiyac_sahipleri_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Veri başarıyla dışa aktarıldı');
    } else {
      toast.error('Dışa aktarma sırasında hata oluştu');
    }
  };

  const columns: Column<BeneficiaryDocument>[] = [
    {
      key: 'actions',
      label: '',
      render: (item) => (
        <Link href={`/yardim/ihtiyac-sahipleri/${item.$id}`}>
          <Button variant="ghost" size="icon-sm" className="h-8 w-8 hover:bg-slate-100">
            <Eye className="h-4 w-4 text-slate-600" />
          </Button>
        </Link>
      ),
      className: 'w-12',
    },
    {
      key: 'type',
      label: 'Tür',
      render: () => (
        <Badge variant="default" className="bg-slate-700 font-medium">
          İhtiyaç Sahibi
        </Badge>
      ),
    },
    {
      key: 'name',
      label: 'İsim',
      render: (item) => (
        <span className="font-medium text-foreground">{item.name || '-'}</span>
      ),
    },
    {
      key: 'nationality',
      label: 'Uyruk',
    },
    {
      key: 'tc_no',
      label: 'Kimlik No',
    },
    {
      key: 'phone',
      label: 'Telefon',
    },
    {
      key: 'city',
      label: 'Şehir',
    },
    {
      key: 'district',
      label: 'İlçe',
    },
    {
      key: 'address',
      label: 'Adres',
      render: (item) => (
        <span className="max-w-xs truncate block" title={item.address || '-'}>
          {item.address || '-'}
        </span>
      ),
    },
    {
      key: 'family_size',
      label: 'Aile Büyüklüğü',
      render: (item) => (
        <Badge variant="outline" className="border-slate-300 text-slate-700">{item.family_size ?? '-'}</Badge>
      ),
    },
  ];

  return (
    <>
      <PageLayout
        title="İhtiyaç Sahipleri"
        description="Kayıtlı ihtiyaç sahiplerini görüntüleyin ve yönetin"
        icon="Users"
        actions={
          <>
            <Button variant="outline" onClick={handleExport} className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              Dışa Aktar
            </Button>
            <Button onClick={() => setShowQuickAddModal(true)} className="gap-2 bg-slate-700 hover:bg-slate-600">
              <Plus className="h-4 w-4" />
              Yeni Ekle
            </Button>
          </>
        }
      >
        <DataTable
          data={beneficiaries}
          columns={columns}
          isLoading={isLoading}
          error={error as Error}
          emptyMessage="İhtiyaç sahibi bulunamadı"
          emptyDescription="Henüz kayıt eklenmemiş"
          searchable={true}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          searchPlaceholder="İsim, TC No veya telefon ile ara..."
          pagination={{
            page,
            totalPages,
            total,
            onPageChange: setPage,
          }}
          onRowClick={(item) => router.push(`/yardim/ihtiyac-sahipleri/${item.$id}`)}
        />
      </PageLayout>
    </>
  );
}
