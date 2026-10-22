import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { generateMosqueSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { constructMetadata } from '@/lib/seo/metadata';
import { getStateConfig } from '@/lib/config/state-registry';
import { slugify } from '@/lib/data/normalization';
import { getMosquePath } from '@/lib/seo/mosque-url';
import { getLegacyRedirect } from '@/lib/seo/mosque-redirects';
import { isIndexableCity } from '@/lib/seo/eligibility';
import { MosqueStatusBadge } from '@/components/mosque/MosqueStatusBadge';
import { RatingSummary } from '@/components/mosque/RatingSummary';
import { ActionButtons } from '@/components/mosque/ActionButtons';
import { MosqueCard } from '@/components/mosque/MosqueCard';
import {
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  Navigation,
  Accessibility,
  Sparkles,
  Info,
} from 'lucide-react';

interface MosqueDetailPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generates static parameters for all public mosque entities using their canonical unique slugs.
 */
export async function generateStaticParams() {
  const { mosques } = await mosqueRepository.search({ status: 'all', limit: 3000 });
  const publicMosques = mosques.filter(m => m.dataStatus !== 'excluded');
  return publicMosques.map(m => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: MosqueDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Safe legacy redirect check
  const redirectTarget = getLegacyRedirect(slug);
  if (redirectTarget) {
    return constructMetadata({
      title: 'Redirecting...',
      description: 'Redirecting to canonical mosque URL',
      canonical: redirectTarget,
      noIndex: true,
    });
  }

  const mosque = await mosqueRepository.findBySlug(slug);

  if (!mosque) {
    return {
      title: 'Mosque Not Found',
    };
  }

  // needs_review listings are publicly visible but must not be indexed.
  // They have not been fully validated and indexing them risks quality signals.
  // noindex,follow allows crawlers to still discover canonical pages via links.
  const noIndex = mosque.dataStatus !== 'verified';

  return constructMetadata({
    title: `${mosque.name} in ${mosque.city}, ${mosque.stateCode}`,
    description: `Official information for ${mosque.name} located at ${mosque.address}. View directions, contact phone number, website, opening hours, and prayer amenities.`,
    canonical: getMosquePath(mosque),
    ogImage: mosque.imageUrl,
    noIndex,
  });
}


export default async function MosqueDetailPage({ params }: MosqueDetailPageProps) {
  const { slug } = await params;

  // Safe legacy redirect check (301)
  const redirectTarget = getLegacyRedirect(slug);
  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const mosque = await mosqueRepository.findBySlug(slug);

  if (!mosque) {
    notFound();
  }

  // Find nearby mosques within 30 miles
  const nearbyMosques = (
    await mosqueRepository.findNearby(mosque.latitude, mosque.longitude, 4, 30)
  ).filter(m => m.id !== mosque.id);

  // Resolve canonical state and city slugs for the SEO breadcrumb hierarchy.
  // We use getStateConfig (same source as routes) and slugify (same function
  // as CityRepository) so breadcrumb URLs always match existing canonical pages.
  const stateConfig = getStateConfig(mosque.stateCode);
  const stateSlug = stateConfig?.slug ?? mosque.stateCode.toLowerCase();
  const citySlug = slugify(mosque.city);

  // Schemas
  const mosqueSchema = generateMosqueSchema(mosque);

  // Check if city qualifies for an indexable city page to guarantee valid breadcrumb URLs
  const hasIndexableCity = await isIndexableCity(mosque.stateCode, mosque.city);

  // Canonical geographic hierarchy
  const breadcrumbItems: { name: string; url: string }[] = [
    { name: 'Home', url: '/' },
    { name: stateConfig?.name ?? mosque.stateCode, url: `/mosques/${stateSlug}` },
  ];
  if (hasIndexableCity) {
    breadcrumbItems.push({ name: mosque.city, url: `/mosques/${stateSlug}/${citySlug}` });
  }
  breadcrumbItems.push({ name: mosque.name, url: getMosquePath(mosque) });

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mosqueSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href={`/mosques/${stateSlug}`} className="hover:text-slate-900 transition-colors">
          {stateConfig?.name ?? mosque.stateCode}
        </Link>
        <span>/</span>
        {hasIndexableCity ? (
          <>
            <Link
              href={`/mosques/${stateSlug}/${citySlug}`}
              className="hover:text-slate-900 transition-colors"
            >
              {mosque.city}
            </Link>
            <span>/</span>
          </>
        ) : (
          <>
            <span className="text-slate-500">{mosque.city}</span>
            <span>/</span>
          </>
        )}
        <span className="text-slate-900 font-medium truncate max-w-xs">{mosque.name}</span>
      </nav>

      {/* Header Profile Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Photo */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {mosque.imageUrl ? (
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                <Image
                  src={mosque.imageUrl}
                  alt={`Exterior view of ${mosque.name}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 320px"
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            ) : (
              <div className="aspect-[4/3] w-full flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400">
                <Building2 className="h-16 w-16 text-slate-300" />
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <MosqueStatusBadge
                openingHours={mosque.openingHours}
                latitude={mosque.latitude}
                longitude={mosque.longitude}
                stateCode={mosque.stateCode}
                state={mosque.state}
              />
              {mosque.dataStatus === 'verified' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-700" />
                  Verified Facility
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {mosque.name}
            </h1>

            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 text-brand-700 flex-shrink-0 mt-0.5" />
              <span>{mosque.address}</span>
            </div>

            <RatingSummary rating={mosque.rating} reviewCount={mosque.reviewCount} />

            {/* Quick Actions */}
            <div className="pt-2">
              <ActionButtons
                address={mosque.address}
                latitude={mosque.latitude}
                longitude={mosque.longitude}
                phone={mosque.phone}
                website={mosque.website}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Hours & Amenities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Hours & About */}
        <div className="lg:col-span-2 space-y-8">
          {/* Opening Hours Schedule */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
              <Clock className="h-5 w-5 text-brand-700" />
              <h2 className="text-lg font-bold text-slate-900">Opening Hours</h2>
            </div>

            {mosque.openingHours && mosque.openingHours.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {mosque.openingHours.map(oh => (
                  <div key={oh.day} className="py-2.5 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-800">{oh.day}</span>
                    <span className="text-slate-600 font-mono text-xs sm:text-sm">{oh.hours}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600 flex items-start gap-2.5">
                <Info className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Hours Not Listed</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official regular hours have not been published for this facility. Please call ahead to confirm prayer times and visitor hours.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Amenities & Accessibility */}
          {(mosque.accessibility.length > 0 || mosque.amenities.length > 0) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100">
                <Sparkles className="h-5 w-5 text-brand-700" />
                <h2 className="text-lg font-bold text-slate-900">Facilities & Accessibility</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {mosque.accessibility.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Accessibility className="h-4 w-4 text-brand-700" /> Accessibility
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {mosque.accessibility.map(acc => (
                        <li key={acc} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                          {acc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {mosque.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-brand-700" /> Amenities
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      {mosque.amenities.map(amenity => (
                        <li key={amenity} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description if present */}
          {mosque.description && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">About {mosque.name}</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{mosque.description}</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Location & Map Affordance */}
        <div className="space-y-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-3">Location & Directions</h2>
            <p className="text-xs text-slate-500 mb-4">{mosque.address}</p>

            <div className="rounded-xl bg-slate-100 p-6 text-center border border-slate-200">
              <Navigation className="h-8 w-8 text-brand-700 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">
                Coordinates: {mosque.latitude.toFixed(4)}, {mosque.longitude.toFixed(4)}
              </p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  mosque.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors w-full"
              >
                Open Driving Directions
              </a>
            </div>
          </div>

          {/* City Directory Navigation Prompt */}
          {hasIndexableCity && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-brand-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {mosque.city} Mosque Directory
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Looking for more prayer locations or congregation details? Browse the full directory of verified mosques across {mosque.city}.
              </p>
              <Link
                href={`/mosques/${stateSlug}/${citySlug}`}
                className="inline-flex items-center justify-center rounded-lg bg-white border border-brand-300 px-4 py-2 text-xs font-semibold text-brand-800 shadow-sm hover:bg-brand-100 hover:border-brand-400 transition-colors w-full"
              >
                Explore All {mosque.city} Mosques &rarr;
              </Link>
            </div>
          )}

          {/* Data Transparency & Source */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-brand-700" />
              Listing Data Transparency
            </div>
            <p>
              This listing is compiled from verified public records. Status: <strong className="capitalize">{mosque.dataStatus.replace('_', ' ')}</strong>.
            </p>
            {mosque.statusReason && <p className="italic text-slate-500">{mosque.statusReason}</p>}
          </div>
        </div>
      </div>

      {/* Nearby Mosques */}
      {nearbyMosques.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Nearby Mosques in {mosque.state}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Other masajid located near {mosque.name}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nearbyMosques.map(near => (
              <MosqueCard key={near.id} mosque={near} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
