import { Metadata } from 'next';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { MosqueFinderClient } from '@/components/search/MosqueFinderClient';
import { constructMetadata } from '@/lib/seo/metadata';

import { getEnabledStates } from '@/lib/config/state-registry';
import { SortOption } from '@/components/search/FinderFilters';

export const metadata: Metadata = constructMetadata({
  title: 'Mosques Near Me | Find Nearest Islamic Centers & Mosques',
  description:
    'Find mosques near you right now. Use your GPS location or search by city, state, and ZIP code to locate nearest masajid, get driving directions, see opening hours, and contact details.',
  canonical: '/mosque-near-me',
  // This is an interactive finder/utility page — not a canonical SEO landing page.
  // noindex,follow prevents it from being indexed while allowing crawlers to
  // follow outbound links to canonical State/City/Mosque pages.
  noIndex: true,
});

interface MosqueNearMePageProps {
  searchParams: Promise<{
    q?: string;
    state?: string;
    city?: string;
    zip?: string;
    sort?: string;
    radius?: string;
    openNow?: string;
    status?: string;
    nearMe?: string;
  }>;
}

export default async function MosqueNearMePage({ searchParams }: MosqueNearMePageProps) {
  const params = await searchParams;
  const initialQuery = params.q || params.zip || '';
  const initialState = params.state ? params.state.toUpperCase() : '';
  const initialCity = params.city || '';
  const initialSort = (params.sort === 'nearest' || params.sort === 'rating' || params.sort === 'name') ? params.sort as SortOption : 'rating';
  const initialRadius = params.radius ? Number(params.radius) : null;
  const initialOpenNow = params.openNow === 'true' || params.openNow === '1';
  const initialStatus = params.status === 'all' ? 'all' : 'verified';
  const autoNearMe = params.nearMe === 'true' || params.nearMe === '1';

  // Fetch all active mosques across enabled states without truncation (limit: 2500)
  const { mosques } = await mosqueRepository.search({
    status: 'all', // Pass all so user can toggle between verified or all in client
    limit: 2500,
  });

  const publishableTotal = mosques.filter(m => m.dataStatus !== 'excluded').length;
  const verifiedTotal = mosques.filter(m => m.dataStatus === 'verified').length;

  const enabledStates = getEnabledStates().map(s => ({
    code: s.code,
    name: s.name,
    slug: s.slug,
  }));

  // Build high-density nationwide top cities with state associations
  const cityMap = new Map<string, { city: string; count: number; stateCode: string }>();
  for (const m of mosques) {
    if (m.dataStatus === 'excluded') continue;
    const key = `${m.stateCode}:${m.city}`;
    const existing = cityMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      cityMap.set(key, { city: m.city, count: 1, stateCode: m.stateCode });
    }
  }
  const topCities = Array.from(cityMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);

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
          Search {publishableTotal.toLocaleString()} mosque listings ({verifiedTotal.toLocaleString()} verified) across active U.S. states — by distance, city, ZIP code, or facility name.
        </p>
      </div>

      {/* Main Interactive Finder */}
      <MosqueFinderClient
        initialMosques={mosques}
        topCities={topCities}
        enabledStates={enabledStates}
        defaultQuery={initialQuery}
        defaultState={initialState}
        defaultCity={initialCity}
        defaultSort={initialSort}
        defaultRadius={initialRadius}
        defaultOpenNow={initialOpenNow}
        defaultStatus={initialStatus}
        autoNearMe={autoNearMe}
      />
    </div>
  );
}
