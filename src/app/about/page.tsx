import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ShieldCheck, Database, MapPin } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'About US Mosque Finder | Data Methodology & Verification',
  description:
    'Learn about our data verification standards, methodology, and commitment to authentic mosque and Islamic center listings across the United States.',
  canonical: '/about',
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-800 mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          Transparency & Methodology
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          About US Mosque Finder
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          US Mosque Finder was created to provide a fast, clean, and trustworthy directory of verified mosques and Islamic centers across America.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 text-sm text-slate-700 leading-relaxed shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="h-5 w-5 text-brand-700" />
          Our Data Principles
        </h2>

        <div className="space-y-4">
          <div className="border-l-4 border-brand-600 pl-4 py-1">
            <h3 className="font-semibold text-slate-900">1. Never Invent or Fabricate Information</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              We never fabricate ratings, generate artificial reviews, or assume opening hours. If an official website or phone number does not exist in verified public records, we leave it blank rather than misleading visitors.
            </p>
          </div>

          <div className="border-l-4 border-brand-600 pl-4 py-1">
            <h3 className="font-semibold text-slate-900">2. Normalization & Verification Pipeline</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Every listing is ingested through our automated normalization and validation layer. Entities classified primarily as commercial businesses (such as clothing stores or catering restaurants) are excluded from the main directory.
            </p>
          </div>

          <div className="border-l-4 border-brand-600 pl-4 py-1">
            <h3 className="font-semibold text-slate-900">3. Timezone-Aware Hours</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Opening hours are evaluated in the local timezone of each mosque. When hours are not published, we display &ldquo;Hours not listed&rdquo; rather than making unwarranted assumptions.
            </p>
          </div>

          <div className="border-l-4 border-brand-600 pl-4 py-1">
            <h3 className="font-semibold text-slate-900">4. Privacy-First Geolocation</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              We never track or store your coordinates. Your location is processed solely within your browser upon your explicit request to compute distance to nearby masajid.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-brand-50/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-brand-950">Ready to locate a mosque?</h3>
          <p className="text-xs text-brand-800 mt-1">
            Find verified masajid with driving directions and opening hours.
          </p>
        </div>
        <Link
          href="/mosque-near-me"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          Search Mosques
        </Link>
      </div>
    </div>
  );
}
