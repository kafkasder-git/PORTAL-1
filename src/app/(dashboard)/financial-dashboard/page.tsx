import { PlaceholderPage } from '@/components/PlaceholderPage';
import { BarChart3 } from 'lucide-react';

export default function FinancialDashboardPage() {
  return (
    <PlaceholderPage
      title="Finansal Dashboard"
      description="Mali durumu görsel olarak takip edin"
      icon={BarChart3}
      estimatedDate="Nisan 2025"
      features={[
        'Gerçek zamanlı mali göstergeler',
        'Gelir-gider grafikleri',
        'Bütçe karşılaştırmaları',
        'Trend analizleri',
        'Özelleştirilebilir widget\'lar',
      ]}
    />
  );
}
