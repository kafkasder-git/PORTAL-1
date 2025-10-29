'use client';

import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Receipt } from 'lucide-react';

export default function IncomeExpensePage() {
  return (
    <PlaceholderPage
      title="Gelir Gider"
      description="Gelir ve gider kayıtlarını yönetin"
      icon={Receipt}
      estimatedDate="Mart 2025"
      features={[
        'Gelir kayıt sistemi',
        'Gider takibi',
        'Kategori bazlı raporlama',
        'Bütçe planlaması',
        'Nakit akış analizi',
      ]}
    />
  );
}
