import Link from 'next/link';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { cityRepository } from '@/lib/data/city-repository';
import { getEnabledStates } from '@/lib/config/state-registry';
import { HomeHeroSearch } from '@/components/home/HomeHeroSearch';
import { MosqueCard } from '@/components/mosque/MosqueCard';
import { generateWebSiteSchema } from '@/lib/seo/schema';
import { MapPin, ShieldCheck, CheckCircle2, Navigation, Clock, Building } from 'lucide-react';

export const revalidate = 3600; // 1 hour ISR

export default async function HomePage() {
  const enabledStates = getEnabledStates();
  const websiteSchema = generateWebSiteSchema();

  const stateSummaries = await Promise.all(
    enabledStates.map(async s => {
      const mosques = await mosqueRepository.getMosquesByState(s.code);
      const publishable = mosques.filter(m => m.dataStatus !== 'excluded');
      const verified = mosques.filter(m => m.dataStatus === 'verified');
      const cities = await cityRepository.getAllCities(s.code);
      return {
        state: s,
        mosqueCount: publishable.length,
        verifiedCount: verified.length,
        cityCount: cities.length,
      };
    })
  );

  const totalListingsCount = stateSummaries.reduce((sum, item) => sum + item.mosqueCount, 0);
  const totalVerifiedCount = stateSummaries.reduce((sum, item) => sum + item.verifiedCount, 0);

  // Top cities from across enabled states for quick discovery
  const allEligibleCities = (
    await Promise.all(enabledStates.map(s => cityRepository.getEligibleCities(s.code)))
  ).flat();
  allEligibleCities.sort((a, b) => b.mosqueCount - a.mosqueCount);
  const topCities = allEligibleCities.slice(0, 12);

  const { mosques: featuredMosques } = await mosqueRepository.search({
    status: 'verified',
    limit: 6,
  });

  return (
    <div className="space-y-16 pb-20">
      {/* JSON-LD WebSite Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100/80 px-3.5 py-1 text-xs font-semibold text-brand-900 mb-6 ring-1 ring-inset ring-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-700" />
            Verified U.S. Mosque Directory • {enabledStates.map(s => s.name).join(', ')}
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Find a Mosque Near You
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600">
            Discover nearby mosques, directions, opening hours, and verified contact details in one place.
          </p>

          <div className="mt-8">
            <HomeHeroSearch />
          </div>

          <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-brand-600" /> {totalListingsCount.toLocaleString()} Mosque Locations ({totalVerifiedCount.toLocaleString()} Verified)
            </span>
            <span className="flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-brand-600" /> Instant GPS Distance &amp; Directions
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-600" /> Timezone-Aware Opening Status
            </span>
          </div>
        </div>
      </section>

      {/* Explore by State */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            State Directories
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Explore Mosques by State
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Browse verified masajid, community centers, and local prayer spaces across active states.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stateSummaries.map(({ state, mosqueCount, cityCount }) => (
            <Link
              key={state.code}
              href={`/mosques/${state.slug}`}
              className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-brand-600 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 group-hover:bg-brand-700 group-hover:text-white transition-colors">
                  <Building className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 group-hover:bg-brand-100 group-hover:text-brand-900 transition-colors">
                  {mosqueCount} Locations
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-800 transition-colors">
                {state.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {cityCount} cities represented with verified listings, hours, and directions.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-brand-700 group-hover:text-brand-800">
                <span>Explore {state.name} Directory</span>
                <span className="ml-1 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works / Value Proposition */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            A Practical Directory for Muslims &amp; Visitors
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            USMosques.com helps people discover mosques, Islamic centers, and prayer facilities across the United States through searchable local listings and practical location information.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 mb-4">
              <Navigation className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Locate Nearest Masajid</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Use your browser location or search by city and ZIP code to sort mosques by exact driving distance.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Verified Opening Hours</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Hours calculated using state-specific local timezones. When hours are not listed, we never guess or mislead.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Curated &amp; Normalized Data</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Every listing is validated against real public records to filter out commercial shops and verify prayer facilities.
            </p>
          </div>
        </div>
      </section>

      {/* Popular City Hubs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                Browse By City
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                Popular City Hubs
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Browse verified mosques in major metropolitan communities across active states.
              </p>
            </div>
            <Link
              href="/mosque-near-me"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors self-start sm:self-auto"
            >
              <MapPin className="h-4 w-4" />
              Explore All Cities
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {topCities.map(c => {
              const stateSlug = enabledStates.find(s => s.code === c.stateCode)?.slug ?? c.stateCode.toLowerCase();
              return (
                <Link
                  key={`${c.stateCode}-${c.slug}`}
                  href={`/mosques/${stateSlug}/${c.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-3 hover:border-brand-600 hover:bg-slate-800 transition-all"
                >
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                    {c.city}, {c.stateCode}
                  </span>
                  <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-300 group-hover:bg-brand-900 group-hover:text-brand-300">
                    {c.mosqueCount}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Verified Mosques */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-700">
              Verified Listings
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
              Sample Verified Mosques
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Real Islamic centers with validated addresses, hours, and community information.
            </p>
          </div>
          <Link
            href="/mosque-near-me"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            Search all {totalListingsCount.toLocaleString()} mosques &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMosques.map(mosque => (
            <MosqueCard key={mosque.id} mosque={mosque} />
          ))}
        </div>
      </section>

      {/* Trust & Methodology Footer Notice */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-8 border-t border-slate-200">
          <ShieldCheck className="h-4 w-4 text-brand-700 flex-shrink-0" />
          <span>
            Directory figures reflect authentic public listings across {enabledStates.map(s => s.name).join(', ')}. Excluded non-mosque businesses are filtered from all counts.
          </span>
        </div>
      </div>
    </div>
  );
}
