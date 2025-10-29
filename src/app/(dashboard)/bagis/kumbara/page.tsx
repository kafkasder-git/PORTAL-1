import { PlaceholderPage } from '@/components/PlaceholderPage';
import { PiggyBank } from 'lucide-react';

export default function KumbaraPage() {
  return (
    <PlaceholderPage
      title="Kumbara Takibi"
      description="Kumbara bağışlarını takip edin ve yönetin"
      icon={PiggyBank}
      estimatedDate="Mart 2025"
      features={[
        'Kumbara kayıt sistemi',
        'Toplam tutar takibi',
        'Konum bazlı raporlama',
        'Kumbara dağıtım takibi',
        'Gelir analizi ve grafikler',
      ]}
    />
  );
}
