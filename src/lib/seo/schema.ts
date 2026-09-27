import { Mosque } from '@/types/mosque';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://usmosquefinder.com';

/**
 * Generates WebSite JSON-LD with Sitelinks Searchbox
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'US Mosque Finder',
    url: SITE_URL,
    description: 'Find verified mosques, Islamic centers, directions, prayer facilities, and contact details across the United States.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/mosque-near-me?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
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
    name: mosque.name,
    url: `${SITE_URL}/mosque/${mosque.slug}`,
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
