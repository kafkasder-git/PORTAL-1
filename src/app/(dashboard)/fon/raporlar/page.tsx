import { PlaceholderPage } from '@/components/PlaceholderPage';
import { TrendingUp } from 'lucide-react';

export default function FundReportsPage() {
  return (
    <PlaceholderPage
      title="Finans Raporları"
      description="Mali raporları görüntüleyin ve analiz edin"
      icon={TrendingUp}
      estimatedDate="Nisan 2025"
      features={[
        'Aylık mali raporlar',
        'Yıllık finansal özet',
        'Gelir-gider karşılaştırması',
        'Grafik ve tablolar',
        'PDF rapor çıktısı',
      ]}
    />
  );
}
