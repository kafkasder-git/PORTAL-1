import { PlaceholderPage } from '@/components/PlaceholderPage';
import { FileBarChart } from 'lucide-react';

export default function DonationReportsPage() {
  return (
    <PlaceholderPage
      title="Bağış Raporları"
      description="Bağış raporlarını görüntüleyin ve dışa aktarın"
      icon={FileBarChart}
      estimatedDate="Şubat 2025"
      features={[
        'Dönemsel bağış raporları',
        'Bağışçı bazlı analizler',
        'Excel ve PDF dışa aktarma',
        'Grafiksel gösterimler',
        'Karşılaştırmalı raporlar',
      ]}
    />
  );
}
