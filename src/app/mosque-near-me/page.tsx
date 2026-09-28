import { Metadata } from 'next';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { MosqueFinderClient } from '@/components/search/MosqueFinderClient';
import { constructMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = constructMetadata({
  title: 'Mosques Near Me | Find Nearest Islamic Centers & Mosques',
  description:
    'Find mosques near you right now. Use your GPS location or search by city and ZIP code to locate nearest masajid, get driving directions, see opening hours, and contact details.',
  canonical: '/mosque-near-me',
});

interface MosqueNearMePageProps {
  searchParams: Promise<{
    q?: string;
    city?: string;
    zip?: string;
    lat?: string;
    lng?: string;
  }>;
}

export default async function MosqueNearMePage({ searchParams }: MosqueNearMePageProps) {
  const params = await searchParams;
  const initialQuery = params.q || '';
  const initialCity = params.city || '';

  // Fetch all active mosques from provider for client-side search & filtering
  const { mosques } = await mosqueRepository.search({
    status: 'all', // Pass all so user can toggle between verified or all
    limit: 500,
  });

  const topCities = await mosqueRepository.getTopCities(10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Home</span>
          <span>/</span>
          <span className="text-slate-900 font-medium">Mosque Near Me</span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Find Mosques Near Me
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">
          Search 399 verified California mosques and Islamic centers by distance, city, ZIP code, or facility name.
        </p>
      </div>

      {/* Main Interactive Finder */}
      <MosqueFinderClient
        initialMosques={mosques}
        topCities={topCities}
        defaultQuery={initialQuery}
        defaultCity={initialCity}
      />
    </div>
  );
}
