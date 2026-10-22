import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStateConfig, isStateEnabled } from '@/lib/config/state-registry';
import { cityRepository } from '@/lib/data/city-repository';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { MosqueCard } from '@/components/mosque/MosqueCard';
import { generateBreadcrumbSchema, generateStateCollectionSchema } from '@/lib/seo/schema';
import { getMosquePath } from '@/lib/seo/mosque-url';
import { Building, MapPin, Compass, Search, ShieldCheck } from 'lucide-react';

interface StateDirectoryViewProps {
  stateCode: string;
}

export async function StateDirectoryView({ stateCode }: StateDirectoryViewProps) {
  const config = getStateConfig(stateCode);
  if (!config || !isStateEnabled(stateCode)) {
    notFound();
  }

  const eligibleCities = await cityRepository.getEligibleCities(stateCode);
  const allCities = await cityRepository.getAllCities(stateCode);
  const nonEligibleCities = allCities.filter(c => !c.isEligible);
  const { mosques: featuredMosques } = await mosqueRepository.search({
    stateCode: config.code,
    status: 'verified',
    limit: 12,
  });

  const totalPublishableMosques = allCities.reduce((sum, c) => sum + c.mosqueCount, 0);
  const totalVerifiedMosques = allCities.reduce((sum, c) => sum + c.verifiedCount, 0);

  // Structured Data Schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: config.name, url: `/mosques/${config.slug}` },
  ]);
  const collectionSchema = generateStateCollectionSchema(
    config,
    totalPublishableMosques,
    featuredMosques
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{config.name}</span>
      </nav>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-800 mb-3">
          <Building className="h-3.5 w-3.5" />
          State Directory
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl tracking-tight">
          Mosques in {config.name}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Comprehensive directory of verified masajid, Islamic centers, and prayer facilities across {config.name}. Browse primary city hubs or search by your exact location.
        </p>

        {/* Factual State Overview Stats */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-brand-600" />
            <span><strong className="text-slate-900">{totalPublishableMosques}</strong> Mosque Locations ({totalVerifiedMosques} Verified)</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-brand-600" />
            <span><strong className="text-slate-900">{allCities.length}</strong> Cities Served</span>
          </div>
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 rounded-full bg-brand-600" />
            <span><strong className="text-slate-900">{eligibleCities.length}</strong> Major City Directories</span>
          </div>
        </div>

        {/* Top City Hubs Quick Navigation */}
        {eligibleCities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Popular Cities:</span>
            {eligibleCities.slice(0, 4).map(c => (
              <Link
                key={c.slug}
                href={`/mosques/${config.slug}/${c.slug}`}
                className="rounded-full bg-slate-100 hover:bg-brand-100 px-3 py-1 font-medium text-slate-700 hover:text-brand-900 transition-colors"
              >
                {c.city} ({c.mosqueCount})
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Major City Hubs (Eligible Cities) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brand-700" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {config.name} City Directories
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Major cities with 5 or more verified mosque facilities. Select a city to explore local masajid, hours, and directions.
          </p>
        </div>

        {eligibleCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {eligibleCities.map(c => (
              <Link
                key={c.slug}
                href={`/mosques/${config.slug}/${c.slug}`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-brand-600 hover:bg-brand-50/30 transition-all shadow-sm"
              >
                <div>
                  <span className="text-sm font-bold text-slate-900 group-hover:text-brand-800 transition-colors">
                    {c.city}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {c.withHoursCount} with hours
                  </p>
                </div>
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 group-hover:bg-brand-100 group-hover:text-brand-900 transition-colors">
                  {c.mosqueCount} {c.mosqueCount === 1 ? 'mosque' : 'mosques'}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No major city hubs meeting the directory threshold at this time.</p>
        )}
      </section>

      {/* Additional Towns & Communities Directory */}
      {nonEligibleCities.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-brand-700" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Additional Towns &amp; Communities in {config.name}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Verified local prayer spaces and Islamic centers serving smaller communities across {config.name}.
              </p>
            </div>

            <Link
              href="/mosque-near-me"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors flex-shrink-0 self-start sm:self-auto"
            >
              <Search className="h-4 w-4" />
              Search All by Location
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {nonEligibleCities.map(c => (
              <div
                key={c.slug}
                className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">{c.city}</span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {c.mosqueCount} {c.mosqueCount === 1 ? 'mosque' : 'mosques'}
                  </span>
                </div>
                <div className="space-y-1">
                  {c.mosques.slice(0, 3).map(m => (
                    <Link
                      key={m.id}
                      href={getMosquePath(m)}
                      className="block text-xs text-brand-700 hover:text-brand-900 hover:underline truncate"
                      title={m.name}
                    >
                      {m.name}
                    </Link>
                  ))}
                  {c.mosqueCount > 3 && (
                    <span className="text-[10px] text-slate-400">+{c.mosqueCount - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Mosques in State */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Sample {config.name} Mosques
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified Islamic centers with validated locations and community services.
            </p>
          </div>

          <Link
            href="/mosque-near-me"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            <Compass className="h-3.5 w-3.5" />
            Search by GPS distance &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMosques.map(mosque => (
            <MosqueCard key={mosque.id} mosque={mosque} />
          ))}
        </div>
      </section>

      {/* Data Integrity Note */}
      <div className="flex items-center gap-2 text-xs text-slate-500 pt-4 border-t border-slate-200">
        <ShieldCheck className="h-4 w-4 text-brand-700 flex-shrink-0" />
        <span>
          Directory figures reflect authentic public listings. Excluded non-mosque entities are filtered from counts.
        </span>
      </div>
    </div>
  );
}
