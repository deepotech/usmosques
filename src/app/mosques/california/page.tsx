import { Metadata } from 'next';
import Link from 'next/link';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { MosqueCard } from '@/components/mosque/MosqueCard';
import { constructMetadata } from '@/lib/seo/metadata';
import { Building } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Mosques in California | Complete Directory of Masajid & Islamic Centers',
  description:
    'Browse all verified mosques and Islamic centers in California. View locations, contact details, opening hours, and driving directions across California cities.',
  canonical: '/mosques/california',
});

export const revalidate = 3600;

export default async function CaliforniaDirectoryPage() {
  const topCities = await mosqueRepository.getTopCities(40);
  const { mosques } = await mosqueRepository.search({
    status: 'verified',
    limit: 24,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">California</span>
      </nav>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-800 mb-3">
          <Building className="h-3.5 w-3.5" />
          California State Directory
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
          Mosques in California
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Comprehensive directory of verified masajid, Islamic centers, and prayer facilities across the state of California.
        </p>
      </div>

      {/* Cities Hub */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-2">California Cities</h2>
        <p className="text-xs text-slate-500 mb-6">
          Select a city to view all local mosques and prayer spaces.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {topCities.map(({ city, count }) => (
            <Link
              key={city}
              href={`/mosque-near-me?city=${encodeURIComponent(city)}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 hover:border-brand-600 hover:bg-brand-50/40 transition-colors text-xs"
            >
              <span className="font-medium text-slate-800 truncate">{city}</span>
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Mosques in California */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Featured California Mosques
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified listings with complete contact and location data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mosques.map(mosque => (
            <MosqueCard key={mosque.id} mosque={mosque} />
          ))}
        </div>
      </section>
    </div>
  );
}
