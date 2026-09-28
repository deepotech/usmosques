import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { cityRepository } from '@/lib/data/city-repository';
import { constructMetadata } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema, generateCityCollectionSchema } from '@/lib/seo/schema';
import { MosqueCard } from '@/components/mosque/MosqueCard';
import {
  Building2,
  Clock,
  Phone,
  Globe,
  Navigation,
  MapPin,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export const revalidate = 3600; // 1 hour ISR

/**
 * Pre-renders all eligible California city pages at build time
 */
export async function generateStaticParams() {
  const eligibleCities = await cityRepository.getEligibleCities();
  return eligibleCities.map(c => ({
    city: c.slug,
  }));
}

/**
 * Generates unique SEO metadata for eligible city pages
 */
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = await cityRepository.getCityBySlug(citySlug);

  if (!city) {
    return {
      title: 'City Not Found',
    };
  }

  return constructMetadata({
    title: `Mosques in ${city.city}, ${city.stateCode} (${city.mosqueCount} Locations)`,
    description: `Find ${city.mosqueCount} verified mosques and Islamic centers in ${city.city}, ${city.state}. Browse locations, contact details, hours when available, websites, and driving directions.`,
    canonical: `/mosques/california/${city.slug}`,
  });
}

export default async function CaliforniaCityPage({ params }: CityPageProps) {
  const { city: citySlug } = await params;
  const city = await cityRepository.getCityBySlug(citySlug);

  // Return clean 404 for unknown or non-eligible cities (thin-content protection)
  if (!city) {
    notFound();
  }

  const relatedCities = await cityRepository.getRelatedEligibleCities(city.slug, 6);

  // Structured Data Schemas
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'California', url: '/mosques/california' },
    { name: `Mosques in ${city.city}`, url: `/mosques/california/${city.slug}` },
  ]);
  const collectionSchema = generateCityCollectionSchema(city);

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

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/mosques/california" className="hover:text-slate-900 transition-colors">
          California
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{city.city}</span>
      </nav>

      {/* Hero / Header Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-800 mb-3">
          <MapPin className="h-3.5 w-3.5" />
          California City Directory
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Mosques in {city.city}, California
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Find mosques and Islamic centers in {city.city}, California. Browse locations, contact details, hours when available, websites, and driving directions.
        </p>

        {/* Factual City Statistics Banner */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Building2 className="h-4 w-4 text-brand-700" />
              <span>Locations</span>
            </div>
            <p className="mt-1 text-xl font-bold text-slate-900">{city.mosqueCount}</p>
            <p className="text-[11px] text-slate-500">Listed facilities</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock className="h-4 w-4 text-brand-700" />
              <span>Hours</span>
            </div>
            <p className="mt-1 text-xl font-bold text-slate-900">{city.withHoursCount}</p>
            <p className="text-[11px] text-slate-500">With published hours</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Phone className="h-4 w-4 text-brand-700" />
              <span>Phone</span>
            </div>
            <p className="mt-1 text-xl font-bold text-slate-900">{city.withPhoneCount}</p>
            <p className="text-[11px] text-slate-500">Direct phone numbers</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Globe className="h-4 w-4 text-brand-700" />
              <span>Websites</span>
            </div>
            <p className="mt-1 text-xl font-bold text-slate-900">{city.withWebsiteCount}</p>
            <p className="text-[11px] text-slate-500">Official website links</p>
          </div>
        </div>
      </div>

      {/* Mosque Cards List */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              All Listed Mosques in {city.city}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {city.mosques.length} verified and recognized facilities
            </p>
          </div>

          <Link
            href={`/mosque-near-me?city=${encodeURIComponent(city.city)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            <Compass className="h-3.5 w-3.5" />
            Sort by current distance in {city.city} &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {city.mosques.map((mosque, idx) => (
            <MosqueCard key={mosque.id} mosque={mosque} priority={idx < 3} />
          ))}
        </div>
      </section>

      {/* Find Nearby CTA Section */}
      <section className="rounded-2xl border border-slate-200 bg-brand-50/60 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold text-brand-950">
            Looking for a mosque near your current location?
          </h3>
          <p className="text-xs sm:text-sm text-brand-800">
            Use your GPS location to calculate exact driving distance and live opening status.
          </p>
        </div>

        <Link
          href="/mosque-near-me"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors flex-shrink-0"
        >
          <Navigation className="h-4 w-4" />
          Find Mosques Near Me
        </Link>
      </section>

      {/* Internal Linking: Other Eligible California Cities */}
      {relatedCities.length > 0 && (
        <section className="pt-8 border-t border-slate-200 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Other California Cities with Listed Mosques
          </h2>
          <p className="text-xs text-slate-500 -mt-2">
            Explore verified mosque directories in other prominent California community hubs.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
            {relatedCities.map(rc => (
              <Link
                key={rc.slug}
                href={`/mosques/california/${rc.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-brand-600 hover:shadow-sm transition-all"
              >
                <span className="text-xs font-semibold text-slate-800 group-hover:text-brand-800 truncate">
                  {rc.city}
                </span>
                <span className="mt-1 text-[11px] text-slate-500">
                  {rc.mosqueCount} {rc.mosqueCount === 1 ? 'mosque' : 'mosques'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Transparency Note */}
      <div className="flex items-center gap-2 text-xs text-slate-500 pt-4">
        <ShieldCheck className="h-4 w-4 text-brand-700 flex-shrink-0" />
        <span>
          Information compiled from verified public listings. Hours and prayer times may vary during Ramadan and public holidays.
        </span>
      </div>
    </div>
  );
}
