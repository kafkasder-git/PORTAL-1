'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()} size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Geri
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-gray-600 mt-2">{description}</p>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {icon || <Construction className="h-5 w-5" />}
            Geliştirme Aşamasında
          </CardTitle>
          <CardDescription>
            Bu sayfa şu anda geliştirilme aşamasındadır
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Construction className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-6">
              {title} sayfası yakında kullanıma açılacaktır.
            </p>
            <div className="text-sm text-gray-500">
              <p>Backend entegrasyonu tamamlandıktan sonra bu sayfa aktif olacaktır.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
