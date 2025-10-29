import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, HelpCircle, AlertCircle } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-4">
                  <AlertCircle className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold">404</CardTitle>
              <CardDescription className="text-lg mt-2">
                Sayfa bulunamadı
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-600 dark:text-gray-400">
                Aradığınız sayfa mevcut değil, silinmiş veya taşınmış olabilir.
              </p>

              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/genel">
                    <Home className="mr-2 h-4 w-4" />
                    Ana Sayfaya Dön
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/settings">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Ayarlar
                  </Link>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-center text-gray-500 dark:text-gray-500">
                  Yardıma mı ihtiyacınız var?{' '}
                  <Link 
                    href="/settings" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Destek sayfasına gidin
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}

