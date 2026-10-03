import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://usmosques.com';
const SITE_NAME = 'US Mosque Finder';

export function constructMetadata({
  title,
  description,
  canonical,
  noIndex = false,
  // noFollow is independent of noIndex.
  // Utility/finder pages use noindex,follow so crawlers can still
  // discover canonical content through their outbound links.
  noFollow = false,
  ogImage = '/og-default.jpg',
}: {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  ogImage?: string;
}): Metadata {
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return {
    title: {
      default: `${title} | ${SITE_NAME}`,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? { index: false, follow: !noFollow }
      : { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`],
    },
  };
}
