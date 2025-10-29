import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Heart } from 'lucide-react';

export default function OrphansPage() {
  return (
    <PlaceholderPage
      title="Yetim Öğrenciler"
      description="Yetim öğrencileri görüntüleyin ve destek sağlayın"
      icon={Heart}
      estimatedDate="Mart 2025"
      features={[
        'Yetim öğrenci kayıtları',
        'Sponsor eşleştirme',
        'Düzenli destek takibi',
        'Özel ihtiyaçlar yönetimi',
        'Durum raporları',
      ]}
    />
  );
}
