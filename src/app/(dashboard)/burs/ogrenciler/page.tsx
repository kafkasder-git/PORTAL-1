'use client';

import { PlaceholderPage } from '@/components/PlaceholderPage';
import { GraduationCap } from 'lucide-react';

export default function StudentsPage() {
  return (
    <PlaceholderPage
      title="Öğrenci Listesi"
      description="Burs alan öğrencileri görüntüleyin ve yönetin"
      icon={GraduationCap}
      estimatedDate="Şubat 2025"
      features={[
        'Öğrenci kayıt sistemi',
        'Burs ödemeleri takibi',
        'Akademik başarı izleme',
        'Belgeler ve evraklar',
        'Rapor kartları',
      ]}
    />
  );
}
