import { Mosque } from '@/types/mosque';
import { CitySummary } from '@/types/city';
import { getStateConfig, StateConfig } from '@/lib/config/state-registry';
import { getMosqueCanonicalUrl } from './mosque-url';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://usmosques.com';

/**
 * Generates WebSite JSON-LD
 *
 * Excludes SearchAction because the finder is an interactive, client-side
 * filtered utility (noindex) rather than a crawlable search endpoint.
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'US Mosque Finder',
    url: SITE_URL,
    description:
      'Find verified mosques, Islamic centers, directions, prayer facilities, and contact details across the United States.',
  };
}

/**
 * Generates CollectionPage schema for an enabled State Directory Page
 */
export function generateStateCollectionSchema(
  stateConfig: StateConfig,
  totalMosques: number,
  featuredMosques: Mosque[] = []
) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Mosques in ${stateConfig.name}`,
    url: `${SITE_URL}/mosques/${stateConfig.slug}`,
    description: `Comprehensive directory of verified mosques, Islamic centers, and prayer facilities across ${stateConfig.name}.`,
  };

  if (featuredMosques.length > 0) {
    schema.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: totalMosques,
      itemListElement: featuredMosques.map((m, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: getMosqueCanonicalUrl(m),
        name: m.name,
      })),
    };
  }

  return schema;
}


/**
 * Generates BreadcrumbList JSON-LD
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generates PlaceOfWorship / Mosque schema.org JSON-LD
 * Only includes fields that actually exist in the source data.
 */
export function generateMosqueSchema(mosque: Mosque) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': ['Mosque', 'PlaceOfWorship'],
    '@id': `${getMosqueCanonicalUrl(mosque)}#place`,
    name: mosque.name,
    url: getMosqueCanonicalUrl(mosque),
    address: {
      '@type': 'PostalAddress',
      streetAddress: mosque.street || mosque.address,
      addressLocality: mosque.city,
      addressRegion: mosque.stateCode,
      postalCode: mosque.postalCode,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: mosque.latitude,
      longitude: mosque.longitude,
    },
  };

  if (mosque.phone) {
    schema.telephone = mosque.phone;
  }

  if (mosque.website) {
    schema.sameAs = [mosque.website];
  }

  if (mosque.imageUrl) {
    schema.image = mosque.imageUrl;
  }

  if (mosque.openingHours && mosque.openingHours.length > 0) {
    schema.openingHoursSpecification = mosque.openingHours.map(oh => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${oh.day}`,
      description: oh.hours,
    }));
  }

  // Only include aggregate rating if real stars and reviewCount exist
  if (mosque.rating && mosque.reviewCount) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: mosque.rating,
      reviewCount: mosque.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * Generates CollectionPage / ItemList schema for an eligible City Page
 */
export function generateCityCollectionSchema(city: CitySummary) {
  const stateSlug = getStateConfig(city.stateCode)?.slug ?? city.stateCode.toLowerCase();
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Mosques in ${city.city}, ${city.stateCode}`,
    url: `${SITE_URL}/mosques/${stateSlug}/${city.slug}`,
    description: `Directory of verified mosques and Islamic centers in ${city.city}, ${city.state}.`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: city.mosqueCount,
      itemListElement: city.mosques.map((m, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: getMosqueCanonicalUrl(m),
        name: m.name,
      })),
    },
  };
}
