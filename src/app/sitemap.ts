import { MetadataRoute } from 'next';
import { californiaProvider } from '@/lib/data/california-provider';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://usmosquefinder.com';
  const lastModified = new Date();

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
      url: `${baseUrl}/mosques/california`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const mosques = await californiaProvider.getAll();
    const verifiedMosques = mosques.filter(m => m.dataStatus === 'verified');

    const mosqueRoutes: MetadataRoute.Sitemap = verifiedMosques.map(m => ({
      url: `${baseUrl}/mosque/${m.slug}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...mosqueRoutes];
  } catch (e) {
    console.error('Failed generating dynamic sitemap routes:', e);
    return staticRoutes;
  }
}
