import { ExecutiveCard } from '@/shared/components/ui/executive-card';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { DollarSign, Users, TrendingUp, Star } from 'lucide-react';

export default function CorporateDesignStandardsPage() {
return (
<div className="min-h-screen bg-background p-8">
<div className="max-w-7xl mx-auto space-y-8">
<div className="text-center space-y-4">
<h1 className="text-4xl font-bold">
Kurumsal Tasarım Standartları
</h1>
<p className="text-xl text-muted-foreground">
Standartlaştırılmış tasarım bileşenleri testi
</p>
</div>

{/* Executive Cards Grid */}
<div className="grid gap-6 md:grid-cols-3">
<ExecutiveCard
title="Toplam Gelir"
value="₺2.4M"
subtitle="Yıllık tekrarlayan gelir"
icon={DollarSign}
variant="elevated"
status="success"
trend={{
value: "+12.5%",
direction: "up",
label: "geçen yıla göre"
}}
/>

<ExecutiveCard
title="Aktif Kullanıcılar"
value="45,231"
subtitle="Aylık aktif kullanıcı"
icon={Users}
variant="elevated"
status="info"
trend={{
value: "+8.2%",
direction: "up",
label: "geçen aya göre"
}}
/>

<ExecutiveCard
title="Büyüme Oranı"
value="23.1%"
subtitle="Çeyrek bazlı"
icon={TrendingUp}
variant="elevated"
status="success"
trend={{
value: "+2.1%",
direction: "up",
label: "geçen çeyreğe göre"
}}
/>
</div>

{/* Button Variants Test */}
<Card variant="elevated" className="p-8">
<CardHeader>
  <CardTitle>Standart Buton Varyantları</CardTitle>
</CardHeader>
<CardContent>
<div className="flex flex-wrap gap-4">
  <Button size="lg">
    <Star className="h-4 w-4 mr-2" />
  Ana Buton
  </Button>
  <Button variant="secondary" size="lg">
  İkincil Buton
  </Button>
  <Button variant="outline" size="lg">
  Çerçeveli Buton
  </Button>
    <Button variant="ghost" size="lg">
        Hayalet Buton
              </Button>
    </div>
  </CardContent>
</Card>

{/* Card Variants Test */}
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
<Card variant="default" className="p-6">
  <CardTitle className="text-lg mb-2">Standart Kart</CardTitle>
            <p className="text-muted-foreground">
    Temel kart tasarımı, temiz ve profesyonel görünüm.
</p>
</Card>

<Card variant="elevated" className="p-6">
  <CardTitle className="text-lg mb-2">Yükseltilmiş Kart</CardTitle>
            <p className="text-muted-foreground">
    Hafif gölge efekti ile öne çıkan kart tasarımı.
</p>
</Card>

<Card variant="outline" className="p-6">
  <CardTitle className="text-lg mb-2">Çerçeveli Kart</CardTitle>
    <p className="text-muted-foreground">
              Şeffaf arka plan ile çerçeveli kart tasarımı.
    </p>
  </Card>
</div>

{/* Design Standards */}
<Card variant="elevated" className="p-8">
<CardHeader>
  <CardTitle>Kurumsal Tasarım İlkeleri</CardTitle>
          </CardHeader>
<CardContent className="space-y-4">
<div className="grid gap-4 md:grid-cols-2">
  <div>
  <h4 className="font-semibold mb-2">✅ Do's (Yapılması Gerekenler)</h4>
    <ul className="text-sm text-muted-foreground space-y-1">
        <li>• Slate/Gray kurumsal renk paleti kullan</li>
                  <li>• Tutarlı kart düzenleri</li>
        <li>• Hiyerarşik typography</li>
      <li>• Temiz spacing ve hizalama</li>
      <li>• Dark mode uyumluluğu</li>
  </ul>
  </div>
    <div>
        <h4 className="font-semibold mb-2">❌ Don'ts (Yapılmaması Gerekenler)</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Renkli gradyanlar (minimal vurgular hariç)</li>
                <li>• Karmaşık tasarım sistemleri</li>
                  <li>• Gösterişli animasyonlar</li>
                  <li>• Tutarsız spacing</li>
                  <li>• Çok fazla efekt</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
