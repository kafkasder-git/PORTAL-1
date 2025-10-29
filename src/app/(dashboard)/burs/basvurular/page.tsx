'use client';

import { PlaceholderPage } from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

export default function ScholarshipApplicationsPage() {
  return (
    <PlaceholderPage
      title="Burs Başvuruları"
      description="Burs başvurularını inceleyin ve değerlendirin"
      icon={FileText}
      estimatedDate="Şubat 2025"
      features={[
        'Başvuru formu sistemi',
        'Başvuru değerlendirme',
        'Belge yükleme',
        'Onay süreci yönetimi',
        'Başvuru durumu takibi',
      ]}
    />
  );
}
