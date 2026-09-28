import { MetadataRoute } from 'next';
import { getEnabledStates } from '@/lib/config/state-registry';
import { cityRepository } from '@/lib/data/city-repository';
import { mosqueRepository } from '@/lib/data/mosque-repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://usmosquefinder.com';
  const lastModified = new Date();
  const enabledStates = getEnabledStates();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/mosque-near-me`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Dynamic state hub routes for enabled states only (e.g. /mosques/california)
  const stateRoutes: MetadataRoute.Sitemap = enabledStates.map(s => ({
    url: `${baseUrl}/mosques/${s.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  try {
    const cityRoutes: MetadataRoute.Sitemap = [];
    const mosqueRoutes: MetadataRoute.Sitemap = [];

    for (const state of enabledStates) {
      const eligibleCities = await cityRepository.getEligibleCities(state.code);
      cityRoutes.push(
        ...eligibleCities.map(c => ({
          url: `${baseUrl}/mosques/${state.slug}/${c.slug}`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
      );

      const mosques = await mosqueRepository.getMosquesByState(state.code);
      const verifiedMosques = mosques.filter(m => m.dataStatus === 'verified');
      mosqueRoutes.push(
        ...verifiedMosques.map(m => ({
          url: `${baseUrl}/mosque/${m.slug}`,
          lastModified,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
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
