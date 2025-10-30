import type { Metadata } from 'next';
import { Inter, Poppins, Montserrat } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
});

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-heading-alt',
  display: 'swap',
  preload: false,
});

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-heading',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Dernek Yönetim Sistemi',
    template: '%s | Dernek Yönetim',
  },
  description: 'Modern, kapsamlı kar amacı gütmeyen dernekler için yönetim sistemi. Bağış takibi, ihtiyaç sahipleri yönetimi, mali raporlama ve daha fazlası.',
  keywords: ['dernek', 'yönetim sistemi', 'bağış', 'yardım', 'sivil toplum', 'hayır kurumu'],
  authors: [{ name: 'Dernek Yönetim Sistemi' }],
  creator: 'Dernek Yönetim',
  publisher: 'Dernek Yönetim',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: '/',
    title: 'Dernek Yönetim Sistemi',
    description: 'Modern, kapsamlı kar amacı gütmeyen dernekler için yönetim sistemi',
    siteName: 'Dernek Yönetim Sistemi',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dernek Yönetim Sistemi',
    description: 'Modern, kapsamlı kar amacı gütmeyen dernekler için yönetim sistemi',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={cn(inter.variable, poppins.variable, montserrat.variable, inter.className)}>
        <Providers>{children}</Providers>
        <Script
          id="web-vitals"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
                  onCLS(console.log);
                  onFID(console.log);
                  onFCP(console.log);
                  onLCP(console.log);
                  onTTFB(console.log);
                }).catch(() => {
                  // Web vitals not available
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
