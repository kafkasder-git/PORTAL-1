import { PlaceholderPage } from '@/components/PlaceholderPage';
import { Wallet } from 'lucide-react';

export default function CashVaultPage() {
  return (
    <PlaceholderPage
      title="Nakdi Vezne"
      description="Nakdi yardım kasasını yönetin"
      icon={Wallet}
      estimatedDate="Mart 2025"
      features={[
        'Kasa giriş-çıkış takibi',
        'Nakit yardım dağıtımı',
        'Günlük kasa raporu',
        'Bütçe kontrolü',
        'Harcama analizi',
      ]}
    />
  );
}
