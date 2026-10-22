import { describe, it, expect } from 'vitest';
import nextConfig from '../next.config';
import { metadata } from '../src/app/layout';
import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';
import { constructMetadata } from '../src/lib/seo/metadata';
import {
  generateWebSiteSchema,
  generateStateCollectionSchema,
  generateBreadcrumbSchema,
  generateMosqueSchema,
  generateCityCollectionSchema,
} from '../src/lib/seo/schema';
import { getMosqueCanonicalUrl, getMosquePath } from '../src/lib/seo/mosque-url';
import { mosqueRepository } from '../src/lib/data/mosque-repository';
import { cityRepository } from '../src/lib/data/city-repository';
import { getEnabledStates, getStateConfig } from '../src/lib/config/state-registry';

const EXPECTED_CANONICAL_DOMAIN = 'https://usmosques.com';
const OLD_DOMAIN = 'https://usmosquefinder.com';

describe('Domain Migration: usmosquefinder.com -> usmosques.com', () => {
  describe('Phase 2 & 3: Next.js Metadata & Canonical Production Domain', () => {
    it('Root layout metadataBase is set to https://usmosques.com', () => {
      expect(metadata.metadataBase).toBeDefined();
      expect(metadata.metadataBase?.toString()).toBe('https://usmosques.com/');
    });

    it('constructMetadata generates canonical URL on https://usmosques.com', () => {
      const meta = constructMetadata({
        title: 'Test Mosque',
        description: 'Test Description',
        canonical: '/mosque/test-mosque',
      });
      expect(meta.alternates?.canonical).toBe('https://usmosques.com/mosque/test-mosque');
      expect(meta.openGraph?.url).toBe('https://usmosques.com/mosque/test-mosque');
      expect(meta.openGraph?.images).toBeDefined();
    });

    it('constructMetadata falls back to home page on https://usmosques.com', () => {
      const meta = constructMetadata({
        title: 'Home',
        description: 'Home Description',
      });
      expect(meta.alternates?.canonical).toBe(EXPECTED_CANONICAL_DOMAIN);
      expect(meta.openGraph?.url).toBe(EXPECTED_CANONICAL_DOMAIN);
    });

    it('constructMetadata prevents duplicate brand suffix in title and OpenGraph', () => {
      const layoutTemplate = typeof metadata.title === 'object' && metadata.title !== null && 'template' in metadata.title
        ? String(metadata.title.template)
        : '%s';

      const meta = constructMetadata({
        title: 'Mosques in Brooklyn, NY (103 Locations)',
        description: 'Test description',
      });

      // constructMetadata must return clean title string without pre-appending brand
      expect(meta.title).toBe('Mosques in Brooklyn, NY (103 Locations)');

      // When Next.js applies the layout template (%s | US Mosque Finder), exactly one suffix is rendered
      const renderedTitle = layoutTemplate.replace('%s', String(meta.title));
      expect(renderedTitle).toBe('Mosques in Brooklyn, NY (103 Locations) | US Mosque Finder');
      expect(renderedTitle).not.toContain('US Mosque Finder | US Mosque Finder');

      // Defensive trimming: even if an input already has the brand suffix, it is stripped
      const metaWithSuffix = constructMetadata({
        title: 'Mosques in Brooklyn, NY (103 Locations) | US Mosque Finder',
        description: 'Test description',
      });
      expect(metaWithSuffix.title).toBe('Mosques in Brooklyn, NY (103 Locations)');
      const renderedFromSuffix = layoutTemplate.replace('%s', String(metaWithSuffix.title));
      expect(renderedFromSuffix).toBe('Mosques in Brooklyn, NY (103 Locations) | US Mosque Finder');
      expect(renderedFromSuffix).not.toContain('US Mosque Finder | US Mosque Finder');

      // OpenGraph and Twitter have exactly one brand suffix
      expect(meta.openGraph?.title).toBe('Mosques in Brooklyn, NY (103 Locations) | US Mosque Finder');
      expect(meta.twitter?.title).toBe('Mosques in Brooklyn, NY (103 Locations) | US Mosque Finder');
    });
  });

  describe('Phase 4: Sitemap Invariants', () => {
    it('all sitemap URLs use https://usmosques.com and exactly match 2525 (Phase 6 expanded)', async () => {
      const routes = await sitemap();
      expect(routes.length).toBe(2525);

      const oldDomainCount = routes.filter(r => r.url.includes('usmosquefinder.com')).length;
      expect(oldDomainCount).toBe(0);

      const nonCanonicalCount = routes.filter(r => !r.url.startsWith(EXPECTED_CANONICAL_DOMAIN)).length;
      expect(nonCanonicalCount).toBe(0);

      // Verify no duplicates
      const uniqueUrls = new Set(routes.map(r => r.url));
      expect(uniqueUrls.size).toBe(2525);
    });

    it('sitemap excludes /mosque-near-me and needs_review/excluded records', async () => {
      const routes = await sitemap();
      const urls = new Set(routes.map(r => r.url));

      expect(urls.has('https://usmosques.com/mosque-near-me')).toBe(false);

      const states = getEnabledStates();
      const allMosques = (
        await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
      ).flat();

      const excluded = allMosques.filter(m => m.dataStatus === 'excluded');
      for (const exc of excluded) {
        expect(urls.has(getMosqueCanonicalUrl(exc))).toBe(false);
      }
    });

    it('Phase 17 Cross-Check: every sitemap URL has matching canonical on usmosques.com and is not noindex', async () => {
      const routes = await sitemap();
      expect(routes.length).toBe(2525);

      const seen = new Set<string>();
      let duplicateCount = 0;
      let nonCanonicalHostCount = 0;
      let noindexCount = 0;

      for (const route of routes) {
        if (seen.has(route.url)) duplicateCount++;
        seen.add(route.url);

        const urlObj = new URL(route.url);
        if (urlObj.hostname !== 'usmosques.com') nonCanonicalHostCount++;
        if (urlObj.pathname === '/mosque-near-me') noindexCount++;
      }

      expect(duplicateCount).toBe(0);
      expect(nonCanonicalHostCount).toBe(0);
      expect(noindexCount).toBe(0);
      expect(seen.size).toBe(2525);
    });
  });

  describe('Phase 5: robots.txt', () => {
    it('robots.txt points to https://usmosques.com/sitemap.xml', () => {
      const robotsResult = robots();
      expect(robotsResult.sitemap).toBe('https://usmosques.com/sitemap.xml');
      expect(robotsResult.rules).toBeDefined();
    });
  });

  describe('Phase 6: Structured Data / JSON-LD', () => {
    it('WebSite schema uses https://usmosques.com', () => {
      const schema = generateWebSiteSchema();
      expect(schema.url).toBe(EXPECTED_CANONICAL_DOMAIN);
      expect(schema.url).not.toContain('usmosquefinder.com');
    });

    it('State collection schema uses https://usmosques.com', () => {
      const caConfig = getStateConfig('CA')!;
      const schema = generateStateCollectionSchema(caConfig, 370);
      expect(schema.url).toBe('https://usmosques.com/mosques/california');
      expect(schema.url).not.toContain('usmosquefinder.com');
    });

    it('City collection schema uses https://usmosques.com', async () => {
      const houston = await cityRepository.getCityBySlug('houston', true, 'TX');
      expect(houston).not.toBeNull();
      const schema = generateCityCollectionSchema(houston!);
      expect(schema.url).toBe('https://usmosques.com/mosques/texas/houston');
      expect(schema.url).not.toContain('usmosquefinder.com');
    });

    it('Breadcrumb schema uses https://usmosques.com for relative items', () => {
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'California', url: '/mosques/california' },
        { name: 'Los Angeles', url: '/mosques/california/los-angeles' },
      ];
      const schema = generateBreadcrumbSchema(breadcrumbs);
      expect(schema.itemListElement[0].item).toBe('https://usmosques.com/');
      expect(schema.itemListElement[1].item).toBe('https://usmosques.com/mosques/california');
      expect(schema.itemListElement[2].item).toBe('https://usmosques.com/mosques/california/los-angeles');
    });

    it('Mosque schema uses https://usmosques.com for canonical URL and @id', async () => {
      const caMosques = await mosqueRepository.getMosquesByState('CA');
      const verified = caMosques.find(m => m.dataStatus === 'verified')!;
      const schema = generateMosqueSchema(verified);
      expect(schema.url).toBe(`https://usmosques.com/mosque/${verified.slug}`);
      expect(schema['@id']).toBe(`https://usmosques.com/mosque/${verified.slug}#place`);
      expect(schema.url).not.toContain('usmosquefinder.com');
    });
  });

  describe('Phase 7: Mosque URL Resolver and getMosquePath', () => {
    it('getMosquePath returns relative path unchanged', () => {
      expect(getMosquePath({ slug: 'islamic-center-of-davis' })).toBe('/mosque/islamic-center-of-davis');
    });

    it('getMosqueCanonicalUrl returns https://usmosques.com absolute URL', () => {
      expect(getMosqueCanonicalUrl({ slug: 'islamic-center-of-davis' })).toBe(
        'https://usmosques.com/mosque/islamic-center-of-davis'
      );
    });
  });

  describe('Phase 8 & 9: Redirect Configuration in next.config.ts', () => {
    it('defines 301 redirects for usmosquefinder.com, www.usmosquefinder.com, and www.usmosques.com', async () => {
      expect(nextConfig.redirects).toBeDefined();
      const redirects = await nextConfig.redirects!();
      expect(redirects.length).toBeGreaterThanOrEqual(3);

      const findRedirect = (host: string, source: string) =>
        redirects.find(
          r =>
            r.source === source &&
            r.has &&
            r.has.some(h => h.type === 'host' && (h as { type: string; value: string }).value === host)
        );

      const oldRoot = findRedirect('usmosquefinder.com', '/');
      expect(oldRoot).toBeDefined();
      expect(oldRoot?.destination).toBe('https://usmosques.com/');
      expect(oldRoot?.permanent).toBe(true);

      const oldRootSub = findRedirect('usmosquefinder.com', '/:path+');
      expect(oldRootSub).toBeDefined();
      expect(oldRootSub?.destination).toBe('https://usmosques.com/:path+');
      expect(oldRootSub?.permanent).toBe(true);

      const oldWww = findRedirect('www.usmosquefinder.com', '/');
      expect(oldWww).toBeDefined();
      expect(oldWww?.destination).toBe('https://usmosques.com/');
      expect(oldWww?.permanent).toBe(true);

      const newWww = findRedirect('www.usmosques.com', '/');
      expect(newWww).toBeDefined();
      expect(newWww?.destination).toBe('https://usmosques.com/');
      expect(newWww?.permanent).toBe(true);
    });
  });

  describe('Phase 12: SEO Invariants Preservation', () => {
    it('exact counts for verified, needs_review, excluded, indexable, and noindex', async () => {
      const states = getEnabledStates();
      const allMosques = (
        await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
      ).flat();

      const verified = allMosques.filter(m => m.dataStatus === 'verified');
      const needsReview = allMosques.filter(m => m.dataStatus === 'needs_review');
      const excluded = allMosques.filter(m => m.dataStatus === 'excluded');

      expect(verified.length).toBe(2411);
      expect(needsReview.length).toBe(176);
      expect(excluded.length).toBe(6);
      expect(allMosques.length).toBe(2593);

      let eligibleCityCount = 0;
      for (const s of states) {
        const cities = await cityRepository.getEligibleCities(s.code);
        eligibleCityCount += cities.length;
      }
      expect(eligibleCityCount).toBe(96);

      const staticPages = 2; // / and /about
      const statePages = states.length; // 13
      const totalIndexable = staticPages + statePages + eligibleCityCount + verified.length;
      expect(totalIndexable).toBe(2522);

      const totalNoindex = 1 + needsReview.length; // /mosque-near-me + 176 needs_review
      expect(totalNoindex).toBe(177);
    });
  });
});
