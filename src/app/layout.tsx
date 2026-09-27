import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { generateWebSiteSchema } from '@/lib/seo/schema';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://usmosquefinder.com'),
  title: {
    default: 'US Mosque Finder | Find Mosques Near You, Hours & Directions',
    template: '%s | US Mosque Finder',
  },
  description:
    'Find verified mosques and Islamic centers near you in the United States. Search by city, ZIP code, or use your current location for distance, opening hours, directions, and contact information.',
  keywords: [
    'mosque near me',
    'masjid near me',
    'Islamic center near me',
    'mosque open now',
    'mosque directions',
    'California mosques',
  ],
  authors: [{ name: 'US Mosque Finder Team' }],
  creator: 'US Mosque Finder',
  publisher: 'US Mosque Finder',
  formatDetection: {
    telephone: true,
    address: true,
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 selection:bg-brand-100 selection:text-brand-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
