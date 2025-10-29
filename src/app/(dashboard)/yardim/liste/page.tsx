import { PlaceholderPage } from '@/components/PlaceholderPage';

export default function AidListPage() {
  return (
    <PlaceholderPage
      title="Yardım Listesi"
      description="Yapılan yardımları görüntüleyin ve takip edin"
      icon="ClipboardList"
      estimatedDate="Şubat 2025"
      features={[
        'Yardım kayıt sistemi',
        'Detaylı yardım takibi',
        'Kategori bazlı listeleme',
        'Dağıtım raporları',
        'İstatistiksel analizler',
      ]}
    />
  );
}
