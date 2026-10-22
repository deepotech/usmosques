import { MetadataRoute } from 'next';
import { getEnabledStates } from '@/lib/config/state-registry';
import { cityRepository } from '@/lib/data/city-repository';
import { mosqueRepository } from '@/lib/data/mosque-repository';

import { getMosqueCanonicalUrl } from '@/lib/seo/mosque-url';

/**
 * Deterministic build-time date used as lastModified for all sitemap entries.
 *
 * Rationale: We do not track per-record modification timestamps, so using
 * new Date() at build time would falsely mark every URL as "just modified" on
 * every deployment. A stable ISO date string keeps the lastModified signal
 * meaningful and prevents crawlers from wasting budget on unchanged pages.
 *
 * Update this constant when a dataset-wide refresh or significant content
 * change has been published, so crawlers re-prioritise affected URLs.
 */
const BUILD_DATE = new Date('2026-09-28');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://usmosques.com';
  const enabledStates = getEnabledStates();

  // NOTE: /mosque-near-me is intentionally excluded from the sitemap.
  // It is an interactive finder/utility page (noindex,follow) and does not
  // represent a canonical SEO landing page. Its exclusion prevents crawl
  // budget waste and avoids sending conflicting indexation signals.
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: BUILD_DATE,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: BUILD_DATE,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: BUILD_DATE,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: BUILD_DATE,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: BUILD_DATE,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // Dynamic state hub routes for enabled states only (e.g. /mosques/california)
  const stateRoutes: MetadataRoute.Sitemap = enabledStates.map(s => ({
    url: `${baseUrl}/mosques/${s.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  try {
    const cityRoutes: MetadataRoute.Sitemap = [];
    const mosqueRoutes: MetadataRoute.Sitemap = [];

    for (const state of enabledStates) {
      // Only eligible city pages (≥5 publishable mosques) are in the sitemap.
      const eligibleCities = await cityRepository.getEligibleCities(state.code);
      cityRoutes.push(
        ...eligibleCities.map(c => ({
          url: `${baseUrl}/mosques/${state.slug}/${c.slug}`,
          lastModified: BUILD_DATE,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
      );

      const mosques = await mosqueRepository.getMosquesByState(state.code);
      // Only verified mosques in sitemap — needs_review and excluded are never included.
      const verifiedMosques = mosques.filter(m => m.dataStatus === 'verified');
      mosqueRoutes.push(
        ...verifiedMosques.map(m => ({
          url: getMosqueCanonicalUrl(m),
          lastModified: BUILD_DATE,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
      );
    }

    const allRoutes = [...staticRoutes, ...stateRoutes, ...cityRoutes, ...mosqueRoutes];
    const seenUrls = new Set<string>();
    return allRoutes.filter(r => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });
  } catch (e) {
    console.error('Failed generating dynamic sitemap routes:', e);
    return [...staticRoutes, ...stateRoutes];
  }
}
