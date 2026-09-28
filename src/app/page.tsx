import Link from 'next/link';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { cityRepository } from '@/lib/data/city-repository';
import { HomeHeroSearch } from '@/components/home/HomeHeroSearch';
import { MosqueCard } from '@/components/mosque/MosqueCard';
import { MapPin, ShieldCheck, CheckCircle2, Navigation, Clock } from 'lucide-react';

export const revalidate = 3600; // 1 hour ISR

export default async function HomePage() {
  const eligibleCities = await cityRepository.getEligibleCities();
  const topCities = eligibleCities.slice(0, 12);
  const { mosques: featuredMosques } = await mosqueRepository.search({
    status: 'verified',
    limit: 6,
  });

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-100/80 px-3.5 py-1 text-xs font-semibold text-brand-900 mb-6 ring-1 ring-inset ring-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-700" />
            California Mosque Directory Live • Expanding Nationwide
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
              <CheckCircle2 className="h-4 w-4 text-brand-600" /> Over 400 Real California Mosques
            </span>
            <span className="flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-brand-600" /> Instant GPS Distance & Directions
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-brand-600" /> Timezone-Aware Opening Status
            </span>
          </div>
        </div>
      </section>

      {/* How It Works / Value Proposition */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            A Serious Local Utility for Muslims & Visitors
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            We focus on clean, verified local information without clutter or advertisements.
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
              Hours calculated using local Pacific timezone. When hours are not listed, we never guess or mislead.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Curated & Normalized Data</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Every listing is validated against real public records to filter out commercial shops and verify prayer facilities.
            </p>
          </div>
        </div>
      </section>

      {/* Popular California Hubs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                Browse By City
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                Popular California Cities
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Browse verified mosques in the largest Muslim community centers across California.
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
            {topCities.map(c => (
              <Link
                key={c.slug}
                href={`/mosques/california/${c.slug}`}
                className="group flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-3 hover:border-brand-600 hover:bg-slate-800 transition-all"
              >
                <span className="text-sm font-medium text-slate-200 group-hover:text-white truncate">
                  {c.city}
                </span>
                <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs font-semibold text-slate-300 group-hover:bg-brand-900 group-hover:text-brand-300">
                  {c.mosqueCount}
                </span>
              </Link>
            ))}
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
              Sample California Mosques
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Real Islamic centers with validated addresses, hours, and community information.
            </p>
          </div>
          <Link
            href="/mosque-near-me"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            View all 400+ California mosques &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMosques.map((mosque, idx) => (
            <MosqueCard key={mosque.id} mosque={mosque} priority={idx < 3} />
          ))}
        </div>
      </section>

      {/* Trust & Data Transparency Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Our Commitment to Data Integrity
              </h3>
              <p className="text-xs text-slate-500">
                Authentic records without synthetic filler or fake reviews
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 leading-relaxed mt-4 pt-4 border-t border-slate-100">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Strict Validation Standards</h4>
              <p>
                We do not publish unverified listings or commercial enterprises masquerading as places of worship. Every record passes through our validation engine, flagging shared addresses and commercial classifications for review.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Transparent Missing Data</h4>
              <p>
                If a mosque does not publish official opening hours or a website, we state &ldquo;Hours not listed&rdquo; rather than making assumptions. We never generate synthetic reviews or artificial ratings.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
