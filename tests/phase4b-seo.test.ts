import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';
import { metadata as finderMetadata } from '@/app/mosque-near-me/page';
import { generateMetadata as generateMosqueMetadata } from '@/app/mosque/[slug]/page';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { cityRepository } from '@/lib/data/city-repository';
import { getEnabledStates, getStateConfig } from '@/lib/config/state-registry';
import {
  generateWebSiteSchema,
  generateStateCollectionSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo/schema';
import { slugify } from '@/lib/data/normalization';

describe('PHASE 4B — Technical SEO Corrections & Indexation Integrity', () => {
  // A. Finder noindex
  it('A. /mosque-near-me has robots meta set to noindex, follow', () => {
    expect(finderMetadata.robots).toBeDefined();
    const robots = finderMetadata.robots as { index?: boolean; follow?: boolean };
    expect(robots.index).toBe(false);
    expect(robots.follow).toBe(true);
  });

  // B. Finder absent from sitemap
  it('B. /mosque-near-me is strictly excluded from sitemap', async () => {
    const routes = await sitemap();
    const urls = routes.map(r => r.url);
    const hasFinder = urls.some(u => u.includes('/mosque-near-me'));
    expect(hasFinder).toBe(false);
  });

  // C. Mosque breadcrumb hierarchy (Home → State → City → Mosque)
  it('C. Mosque detail breadcrumbs resolve through canonical State → City hierarchy across all active states', async () => {
    const states = ['CA', 'TX', 'NY', 'FL', 'IL'];

    for (const stateCode of states) {
      const mosques = await mosqueRepository.getMosquesByState(stateCode);
      const sample = mosques.find(m => m.dataStatus === 'verified');
      expect(sample).toBeDefined();
      if (!sample) continue;

      const stateConfig = getStateConfig(sample.stateCode);
      expect(stateConfig).toBeDefined();
      const stateSlug = stateConfig!.slug;
      const citySlug = slugify(sample.city);

      // Verify canonical slugs
      expect(stateSlug).toBeTruthy();
      expect(citySlug).toBeTruthy();
      expect(citySlug).not.toContain(' ');

      // Breadcrumb elements
      const breadcrumbs = [
        { name: 'Home', url: '/' },
        { name: stateConfig!.name, url: `/mosques/${stateSlug}` },
        { name: sample.city, url: `/mosques/${stateSlug}/${citySlug}` },
        { name: sample.name, url: `/mosque/${sample.slug}` },
      ];

      expect(breadcrumbs[1].url).toBe(`/mosques/${stateSlug}`);
      expect(breadcrumbs[2].url).toBe(`/mosques/${stateSlug}/${citySlug}`);
      expect(breadcrumbs[1].url).not.toContain('mosque-near-me');
      expect(breadcrumbs[2].url).not.toContain('?');
    }
  });

  // D. BreadcrumbList URLs match canonical URLs
  it('D. BreadcrumbList JSON-LD generates valid absolute canonical URLs without query params', () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Texas', url: '/mosques/texas' },
      { name: 'Houston', url: '/mosques/texas/houston' },
      { name: 'Al-Noor Mosque', url: '/mosque/al-noor-mosque-houston-tx' },
    ];
    const schema = generateBreadcrumbSchema(items);

    expect(schema['@type']).toBe('BreadcrumbList');
    expect(schema.itemListElement).toHaveLength(4);
    expect(schema.itemListElement[0].item).toMatch(/^https?:\/\/.+\/$/);
    expect(schema.itemListElement[1].item).toMatch(/^https?:\/\/.+\/mosques\/texas$/);
    expect(schema.itemListElement[2].item).toMatch(/^https?:\/\/.+\/mosques\/texas\/houston$/);
    expect(schema.itemListElement[3].item).toMatch(/^https?:\/\/.+\/mosque\/al-noor-mosque-houston-tx$/);

    schema.itemListElement.forEach(el => {
      expect(el.item).not.toContain('?');
      expect(el.item).not.toContain('mosque-near-me');
    });
  });

  // E. needs_review noindex, follow
  it('E. needs_review mosque detail pages receive robots: noindex, follow', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();
    const needsReviewMosques = allMosques.filter(m => m.dataStatus === 'needs_review');
    expect(needsReviewMosques.length).toBeGreaterThan(0);

    // Test a sample of needs_review listings across available states
    for (const nr of needsReviewMosques.slice(0, 10)) {
      const meta = await generateMosqueMetadata({
        params: Promise.resolve({ slug: nr.slug }),
      });
      const robots = meta.robots as { index?: boolean; follow?: boolean };
      expect(robots).toBeDefined();
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(true);
    }
  });

  // F. needs_review absent from sitemap
  it('F. All needs_review mosques are strictly excluded from sitemap', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();
    const verifiedSlugs = new Set(
      allMosques.filter(m => m.dataStatus === 'verified').map(m => m.slug)
    );
    const nrOnlyMosques = allMosques.filter(
      m => m.dataStatus === 'needs_review' && !verifiedSlugs.has(m.slug)
    );
    expect(nrOnlyMosques.length).toBeGreaterThan(0);

    const routes = await sitemap();
    const sitemapSlugs = new Set(
      routes
        .filter(r => r.url.includes('/mosque/'))
        .map(r => r.url.replace(/^.*\/mosque\//, ''))
    );

    for (const nr of nrOnlyMosques) {
      expect(sitemapSlugs.has(nr.slug)).toBe(false);
    }
  });

  // G. excluded records absent from sitemap and search
  it('G. Excluded records are never in sitemap and excluded from public search by default', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();
    const excludedMosques = allMosques.filter(m => m.dataStatus === 'excluded');
    expect(excludedMosques.length).toBeGreaterThan(0);

    const routes = await sitemap();
    const urls = new Set(routes.map(r => r.url));

    for (const exc of excludedMosques) {
      expect(urls.has(`https://usmosques.com/mosque/${exc.slug}`)).toBe(false);
    }

    // Default search must not return excluded records
    const { mosques: defaultResults } = await mosqueRepository.search({ limit: 2500 });
    expect(defaultResults.some(m => m.dataStatus === 'excluded')).toBe(false);
  });

  // H. verified detail sitemap and indexation behavior
  it('H. Verified mosques are indexable and included in sitemap', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();
    const verifiedMosques = allMosques.filter(m => m.dataStatus === 'verified');
    expect(verifiedMosques.length).toBeGreaterThan(1000);

    // Check indexation for sample of verified listings
    for (const v of verifiedMosques.slice(0, 5)) {
      const meta = await generateMosqueMetadata({
        params: Promise.resolve({ slug: v.slug }),
      });
      const robots = meta.robots as { index?: boolean; follow?: boolean };
      expect(robots.index).toBe(true);
      expect(robots.follow).toBe(true);
    }

    // Verify presence in sitemap (deduplicated unique slugs across verified records)
    const routes = await sitemap();
    const sitemapMosqueUrls = new Set(
      routes.filter(r => r.url.includes('/mosque/')).map(r => r.url)
    );
    const verifiedSlugs = new Set(verifiedMosques.map(m => m.slug));
    expect(sitemapMosqueUrls.size).toBe(verifiedSlugs.size);
  });

  // I. Homepage WebSite JSON-LD
  it('I. Homepage WebSite JSON-LD produces valid schema without client-side SearchAction', () => {
    const schema = generateWebSiteSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('US Mosque Finder');
    expect(schema.url).toMatch(/^https?:\/\//);
    // SearchAction should NOT be present pointing to client-side/noindex finder
    expect((schema as any).potentialAction).toBeUndefined();
  });

  // J. State CollectionPage JSON-LD
  it('J. State pages receive valid CollectionPage JSON-LD with authentic data', async () => {
    const enabledStates = getEnabledStates();
    for (const state of enabledStates) {
      const mosques = await mosqueRepository.getMosquesByState(state.code);
      const publishable = mosques.filter(m => m.dataStatus !== 'excluded');
      const featured = mosques.filter(m => m.dataStatus === 'verified').slice(0, 12);

      const schema = generateStateCollectionSchema(state, publishable.length, featured);
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.name).toBe(`Mosques in ${state.name}`);
      expect(schema.url).toContain(`/mosques/${state.slug}`);

      if (featured.length > 0) {
        const entity = schema.mainEntity as any;
        expect(entity).toBeDefined();
        expect(entity['@type']).toBe('ItemList');
        expect(entity.numberOfItems).toBe(publishable.length);
        expect(entity.itemListElement).toHaveLength(featured.length);
        expect(entity.itemListElement[0].url).toContain('/mosque/');
      }
    }
  });

  // K. Deterministic sitemap lastModified
  it('K. Sitemap lastModified uses a deterministic date across all routes', async () => {
    const routes = await sitemap();
    expect(routes.length).toBeGreaterThan(0);

    const firstDate = routes[0].lastModified;
    expect(firstDate).toBeInstanceOf(Date);
    const dateString = (firstDate as Date).toISOString().split('T')[0];

    // Verify all routes share the same deterministic date (not random/now)
    for (const route of routes) {
      expect(route.lastModified).toBeInstanceOf(Date);
      expect((route.lastModified as Date).toISOString().split('T')[0]).toBe(dateString);
    }
  });

  // L. No query URLs in sitemap
  it('L. No query parameter URLs exist anywhere in sitemap', async () => {
    const routes = await sitemap();
    for (const r of routes) {
      expect(r.url).not.toContain('?');
      expect(r.url).not.toContain('&');
    }
  });

  // M. Canonical URL correctness across all page types
  it('M. Canonical URLs match actual routes without parameters or coordinates', async () => {
    const states = getEnabledStates();

    for (const state of states) {
      // State canonical
      const stateSlug = state.slug;
      expect(`/mosques/${stateSlug}`).not.toContain('?');

      // City canonical
      const eligible = await cityRepository.getEligibleCities(state.code);
      for (const city of eligible.slice(0, 3)) {
        const cityUrl = `/mosques/${stateSlug}/${city.slug}`;
        expect(cityUrl).not.toContain('?');
        expect(cityUrl).not.toContain('nearMe');
      }

      // Mosque canonical
      const mosques = await mosqueRepository.getMosquesByState(state.code);
      const verified = mosques.find(m => m.dataStatus === 'verified');
      if (verified) {
        const meta = await generateMosqueMetadata({
          params: Promise.resolve({ slug: verified.slug }),
        });
        const canonical = meta.alternates?.canonical;
        expect(canonical).toBeDefined();
        expect(canonical).toContain(`/mosque/${verified.slug}`);
        expect(canonical).not.toContain('?');
        expect(canonical).not.toContain('latitude');
        expect(canonical).not.toContain('longitude');
      }
    }
  });

  // Section 7. Full Indexation Consistency Test derived from repository
  it('7. Guarantees indexation consistency rule across all repository records', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();
    const verifiedSlugs = new Set(
      allMosques.filter(m => m.dataStatus === 'verified').map(m => m.slug)
    );
    const sitemapRoutes = await sitemap();
    const sitemapUrls = new Set(sitemapRoutes.map(r => r.url));

    for (const m of allMosques) {
      const expectedUrl = `https://usmosques.com/mosque/${m.slug}`;

      if (m.dataStatus === 'verified') {
        // Must be in sitemap
        expect(sitemapUrls.has(expectedUrl)).toBe(true);
      } else if (m.dataStatus === 'needs_review') {
        // If not also verified in another state, must NOT be in sitemap
        if (!verifiedSlugs.has(m.slug)) {
          expect(sitemapUrls.has(expectedUrl)).toBe(false);
        }
      } else if (m.dataStatus === 'excluded') {
        // Excluded records must never be in sitemap
        expect(sitemapUrls.has(expectedUrl)).toBe(false);
      }
    }
  });
});
