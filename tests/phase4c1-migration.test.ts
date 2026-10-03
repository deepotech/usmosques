import { describe, it, expect } from 'vitest';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { getEnabledStates } from '@/lib/config/state-registry';
import {
  getMosquePath,
  getMosqueCanonicalUrl,
  resolveCanonicalMosqueSlugs,
  applyCanonicalSlugs,
  buildDisambiguatedSlug,
} from '@/lib/seo/mosque-url';
import {
  AMBIGUOUS_LEGACY_SLUGS,
  SAFE_LEGACY_REDIRECTS,
  getLegacyRedirect,
  isAmbiguousLegacySlug,
} from '@/lib/seo/mosque-redirects';
import {
  generateStaticParams,
  generateMetadata as generateMosqueMetadata,
} from '@/app/mosque/[slug]/page';
import sitemap from '@/app/sitemap';
import { generateMosqueSchema, generateBreadcrumbSchema } from '@/lib/seo/schema';
import { Mosque } from '@/types/mosque';

describe('PHASE 4C.1 — Entity URL Architecture Fix & Safe Slug Migration', () => {
  // A. Global slug uniqueness
  it('A. Global slug uniqueness across all enabled states', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();

    const slugs = allMosques.map(m => m.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(allMosques.length);
  });

  // B. Duplicate collision groups resolved
  it('B. All 30 known collision groups are resolved to distinct canonical slugs', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();

    for (const legacySlug of AMBIGUOUS_LEGACY_SLUGS) {
      // Find all records that originally had this base slug
      const matching = allMosques.filter(m => {
        const expectedPrefix = `${legacySlug}-`;
        return m.slug.startsWith(expectedPrefix);
      });

      expect(matching.length).toBeGreaterThanOrEqual(2);
      const uniqueNewSlugs = new Set(matching.map(m => m.slug));
      expect(uniqueNewSlugs.size).toBe(matching.length);
    }
  });

  // C. Unique existing slugs preserved
  it('C. Unique existing slugs remain unchanged', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();

    // islamic-center-of-davis was unique historically and must remain unchanged
    const davis = allMosques.find(m => m.name.toLowerCase().includes('islamic center of davis'));
    expect(davis).toBeDefined();
    expect(davis?.slug).toBe('islamic-center-of-davis');
  });

  // D. Every public entity receives exactly one URL
  it('D. Every public entity receives exactly one canonical URL', async () => {
    const { mosques } = await mosqueRepository.search({ status: 'all', limit: 3000 });
    const publicMosques = mosques.filter(m => m.dataStatus !== 'excluded');

    for (const m of publicMosques) {
      const path = getMosquePath(m);
      expect(path).toBe(`/mosque/${m.slug}`);
      expect(path).not.toContain('undefined');
      expect(path).not.toContain('null');
      expect(path).not.toContain(' ');
    }
  });

  // E. No two public entities share a URL
  it('E. No two public entities share the same canonical URL', async () => {
    const { mosques } = await mosqueRepository.search({ status: 'all', limit: 3000 });
    const publicMosques = mosques.filter(m => m.dataStatus !== 'excluded');

    const paths = publicMosques.map(m => getMosquePath(m));
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(publicMosques.length);
  });

  // F. Route lookup resolves one entity
  it('F. Route lookup by slug returns exactly one intended entity and never masks others', async () => {
    // Test the 4 Al-Ansar mosques across CA, NY, FL, IL
    const caAnsar = await mosqueRepository.findBySlug('al-ansar-mosque-san-diego-ca');
    const nyAnsar = await mosqueRepository.findBySlug('al-ansar-mosque-brooklyn-ny');
    const flAnsar = await mosqueRepository.findBySlug('al-ansar-mosque-miami-fl');
    const ilAnsar = await mosqueRepository.findBySlug('al-ansar-mosque-chicago-il');

    expect(caAnsar?.stateCode).toBe('CA');
    expect(caAnsar?.city).toBe('San Diego');

    expect(nyAnsar?.stateCode).toBe('NY');
    expect(nyAnsar?.city).toBe('Brooklyn');

    expect(flAnsar?.stateCode).toBe('FL');
    expect(flAnsar?.city).toBe('Miami');

    expect(ilAnsar?.stateCode).toBe('IL');
    expect(ilAnsar?.city).toBe('Chicago');

    // Ambiguous legacy slug resolves to null (404)
    const ambiguous = await mosqueRepository.findBySlug('al-ansar-mosque');
    expect(ambiguous).toBeNull();
  });

  // G. generateStaticParams contains unique params
  it('G. generateStaticParams returns unique parameters for all public entities', async () => {
    const params = await generateStaticParams();
    const { mosques } = await mosqueRepository.search({ status: 'all', limit: 3000 });
    const publicMosques = mosques.filter(m => m.dataStatus !== 'excluded');

    expect(params.length).toBe(publicMosques.length);
    const paramSlugs = params.map(p => p.slug);
    const uniqueParamSlugs = new Set(paramSlugs);
    expect(uniqueParamSlugs.size).toBe(params.length);
  });

  // H. Sitemap contains unique mosque URLs
  it('H. Sitemap contains unique mosque URLs matching verified count', async () => {
    const routes = await sitemap();
    const mosqueUrls = routes.filter(r => r.url.includes('/mosque/')).map(r => r.url);
    const uniqueMosqueUrls = new Set(mosqueUrls);

    // No duplicates in sitemap
    expect(uniqueMosqueUrls.size).toBe(mosqueUrls.length);

    // Must match total verified mosques across all states
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();
    const verifiedCount = allMosques.filter(m => m.dataStatus === 'verified').length;
    expect(mosqueUrls.length).toBe(verifiedCount);
  });

  // I. Sitemap URL resolves to intended entity
  it('I. Every sitemap mosque URL resolves to the exact intended entity', async () => {
    const routes = await sitemap();
    const sampleUrls = routes
      .filter(r => r.url.includes('/mosque/'))
      .slice(0, 20);

    for (const route of sampleUrls) {
      const slug = route.url.replace(/^.*\/mosque\//, '');
      const mosque = await mosqueRepository.findBySlug(slug);
      expect(mosque).toBeDefined();
      expect(mosque?.dataStatus).toBe('verified');
      expect(mosque?.slug).toBe(slug);
    }
  });

  // J. Canonical URL uniqueness
  it('J. Canonical URLs are completely unique for all verified entities', async () => {
    const { mosques } = await mosqueRepository.search({ status: 'verified', limit: 3000 });
    const canonicals = mosques.map(m => getMosqueCanonicalUrl(m));
    const uniqueCanonicals = new Set(canonicals);
    expect(uniqueCanonicals.size).toBe(mosques.length);
  });

  // K. Canonical equals centralized entity path
  it('K. Mosque detail canonical URL strictly equals getMosquePath', async () => {
    const { mosques } = await mosqueRepository.search({ limit: 10 });
    for (const m of mosques) {
      const meta = await generateMosqueMetadata({
        params: Promise.resolve({ slug: m.slug }),
      });
      const canonical = meta.alternates?.canonical;
      expect(canonical).toBe(getMosqueCanonicalUrl(m));
      expect(canonical).toContain(getMosquePath(m));
    }
  });

  // L. Breadcrumb Mosque URL is canonical
  it('L. Breadcrumb Mosque URL uses the canonical entity path', () => {
    const sampleMosque = {
      id: 'test-1',
      name: 'Al-Ansar Mosque',
      slug: 'al-ansar-mosque-chicago-il',
      address: '2447 W Division St, Chicago, IL 60622',
      city: 'Chicago',
      state: 'Illinois',
      stateCode: 'IL',
      latitude: 41.903,
      longitude: -87.689,
      dataStatus: 'verified',
    } as Mosque;

    const breadcrumbs = generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Illinois', url: '/mosques/illinois' },
      { name: 'Chicago', url: '/mosques/illinois/chicago' },
      { name: sampleMosque.name, url: getMosquePath(sampleMosque) },
    ]);

    expect(breadcrumbs.itemListElement[3].item).toContain('/mosque/al-ansar-mosque-chicago-il');
  });

  // M. Structured-data URL equals canonical
  it('M. Structured-data URL matches getMosqueCanonicalUrl', () => {
    const sampleMosque = {
      id: 'test-2',
      name: 'Masjid Abu Bakr',
      slug: 'masjid-abu-bakr-houston-tx',
      address: '8830 Old Galveston Rd, Houston, TX 77034',
      city: 'Houston',
      state: 'Texas',
      stateCode: 'TX',
      latitude: 29.623,
      longitude: -95.228,
      dataStatus: 'verified',
    } as Mosque;

    const schema = generateMosqueSchema(sampleMosque);
    expect(schema.url).toBe(getMosqueCanonicalUrl(sampleMosque));
  });

  // N. Structured-data @id is entity-consistent
  it('N. Structured-data @id uses the canonical entity URL #place', () => {
    const sampleMosque = {
      id: 'test-3',
      name: 'Masjid',
      slug: 'masjid-arcata-ca',
      address: '1175 G St, Arcata, CA 95521',
      city: 'Arcata',
      state: 'California',
      stateCode: 'CA',
      latitude: 40.869,
      longitude: -124.086,
      dataStatus: 'verified',
    } as Mosque;

    const schema = generateMosqueSchema(sampleMosque);
    expect(schema['@id']).toBe(`${getMosqueCanonicalUrl(sampleMosque)}#place`);
  });

  // O. Internal mosque links use canonical paths
  it('O. Internal mosque links use canonical paths', () => {
    const sampleMosque = {
      id: 'test-4',
      name: 'Masjid Ibrahim',
      slug: 'masjid-ibrahim-austin-tx',
      address: 'Austin, TX',
      city: 'Austin',
      state: 'Texas',
      stateCode: 'TX',
      latitude: 30.267,
      longitude: -97.743,
      dataStatus: 'verified',
    } as Mosque;

    const path = getMosquePath(sampleMosque);
    expect(path).toBe('/mosque/masjid-ibrahim-austin-tx');
  });

  // P. needs_review remains noindex
  it('P. needs_review mosque detail pages receive robots: noindex, follow', async () => {
    const { mosques } = await mosqueRepository.search({ status: 'needs_review', limit: 5 });
    for (const nr of mosques) {
      const meta = await generateMosqueMetadata({
        params: Promise.resolve({ slug: nr.slug }),
      });
      const robots = meta.robots as { index?: boolean; follow?: boolean };
      expect(robots.index).toBe(false);
      expect(robots.follow).toBe(true);
    }
  });

  // Q. needs_review remains excluded from sitemap
  it('Q. needs_review mosques are strictly excluded from sitemap', async () => {
    const { mosques } = await mosqueRepository.search({ status: 'needs_review', limit: 2500 });
    const nrSlugs = new Set(mosques.map(m => m.slug));

    const routes = await sitemap();
    for (const r of routes) {
      const slug = r.url.replace(/^.*\/mosque\//, '');
      expect(nrSlugs.has(slug)).toBe(false);
    }
  });

  // R. excluded records remain non-public
  it('R. Excluded records are excluded from sitemap and generateStaticParams', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();
    const excluded = allMosques.filter(m => m.dataStatus === 'excluded');
    expect(excluded.length).toBeGreaterThan(0);

    const sitemapRoutes = await sitemap();
    const sitemapUrls = new Set(sitemapRoutes.map(r => r.url));
    const staticParams = await generateStaticParams();
    const paramSlugs = new Set(staticParams.map(p => p.slug));

    for (const exc of excluded) {
      expect(sitemapUrls.has(`https://usmosques.com/mosque/${exc.slug}`)).toBe(false);
      expect(paramSlugs.has(exc.slug)).toBe(false);
    }
  });

  // S. Ambiguous legacy slugs do NOT receive arbitrary redirects
  it('S. Ambiguous legacy collision slugs return null from getLegacyRedirect (no arbitrary redirect)', () => {
    expect(AMBIGUOUS_LEGACY_SLUGS.size).toBe(30);

    for (const slug of AMBIGUOUS_LEGACY_SLUGS) {
      expect(isAmbiguousLegacySlug(slug)).toBe(true);
      expect(getLegacyRedirect(slug)).toBeNull();
    }
  });

  // T. Safe legacy redirects resolve correctly
  it('T. Safe legacy redirects return destination only when unambiguous', () => {
    // Currently no unambiguous historical redirects exist
    expect(SAFE_LEGACY_REDIRECTS.size).toBe(0);
    // Non-existent slug returns null
    expect(getLegacyRedirect('completely-non-existent-slug')).toBeNull();
  });

  // U. Deterministic slug generation
  it('U. Slug resolution algorithm is strictly deterministic across runs', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();

    const run1 = resolveCanonicalMosqueSlugs(allMosques);
    const run2 = resolveCanonicalMosqueSlugs(allMosques);

    for (const [id, slug1] of run1) {
      expect(run2.get(id)).toBe(slug1);
    }
  });

  // V. Same dataset -> same canonical URLs
  it('V. Same repository produces identical canonical URLs', async () => {
    const { mosques: list1 } = await mosqueRepository.search({ limit: 100 });
    const { mosques: list2 } = await mosqueRepository.search({ limit: 100 });

    for (let i = 0; i < list1.length; i++) {
      expect(list1[i].slug).toBe(list2[i].slug);
    }
  });

  // W. State/city/name duplicates test with synthetic fixtures
  it('W. Multi-tier disambiguation resolves synthetic collisions with identical name, city, and state', () => {
    const fixtures = [
      {
        id: 'dup-1-place123',
        placeId: 'place123',
        name: 'Community Mosque',
        slug: 'community-mosque',
        address: '100 Main St',
        city: 'Houston',
        state: 'Texas',
        stateCode: 'TX',
        latitude: 29.7,
        longitude: -95.3,
        dataStatus: 'verified',
      },
      {
        id: 'dup-2-place456',
        placeId: 'place456',
        name: 'Community Mosque',
        slug: 'community-mosque',
        address: '200 Elm St',
        city: 'Houston',
        state: 'Texas',
        stateCode: 'TX',
        latitude: 29.8,
        longitude: -95.4,
        dataStatus: 'verified',
      },
    ] as Mosque[];

    const resolved = resolveCanonicalMosqueSlugs(fixtures);
    const slug1 = resolved.get('dup-1-place123');
    const slug2 = resolved.get('dup-2-place456');

    expect(slug1).toBeDefined();
    expect(slug2).toBeDefined();
    expect(slug1).not.toBe(slug2);
    expect(slug1).toContain('community-mosque-houston-tx');
    expect(slug2).toContain('community-mosque-houston-tx');
  });

  // X. Cross-state duplicate names
  it('X. Cross-state duplicate names produce distinct, valid state-tagged slugs', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();

    const hamza = allMosques.filter(m => m.slug.startsWith('masjid-hamza-'));
    expect(hamza.length).toBe(2);
    expect(hamza.some(m => m.slug === 'masjid-hamza-stockton-ca')).toBe(true);
    expect(hamza.some(m => m.slug === 'masjid-hamza-largo-fl')).toBe(true);
  });

  // Y. Same-name different-city cases
  it('Y. Same-name different-city cases produce distinct city-tagged slugs', async () => {
    const states = getEnabledStates();
    const allMosques = (
      await Promise.all(states.map(s => mosqueRepository.getMosquesByState(s.code)))
    ).flat();

    const targetSlugs = [
      'masjid-abu-bakr-oakland-ca',
      'masjid-abu-bakr-houston-tx',
      'masjid-abu-bakr-tampa-fl',
    ];
    const abuBakr = allMosques.filter(m => targetSlugs.includes(m.slug));
    expect(abuBakr.length).toBe(3);
    expect(abuBakr.some(m => m.slug === 'masjid-abu-bakr-oakland-ca' && m.city === 'Oakland' && m.stateCode === 'CA')).toBe(true);
    expect(abuBakr.some(m => m.slug === 'masjid-abu-bakr-houston-tx' && m.city === 'Houston' && m.stateCode === 'TX')).toBe(true);
    expect(abuBakr.some(m => m.slug === 'masjid-abu-bakr-tampa-fl' && m.city === 'Tampa' && m.stateCode === 'FL')).toBe(true);
  });

  // Z. Generic names tested specifically
  it('Z. Generic facility names resolve to unambiguous unique slugs', async () => {
    // 1. "Masjid"
    const masjidCA = await mosqueRepository.findBySlug('masjid-arcata-ca');
    const masjidTX = await mosqueRepository.findBySlug('masjid-marble-falls-tx');
    const masjidNY = await mosqueRepository.findBySlug('masjid-queens-ny');
    const masjidIL = await mosqueRepository.findBySlug('masjid-mt-prospect-il');

    expect(masjidCA?.city).toBe('Arcata');
    expect(masjidTX?.city).toBe('Marble Falls');
    expect(masjidNY?.city).toBe('Queens');
    expect(masjidIL?.city).toBe('Mt Prospect');

    // 2. "Masjid Ibrahim"
    const ibrahimTX = await mosqueRepository.findBySlug('masjid-ibrahim-austin-tx');
    const ibrahimFL = await mosqueRepository.findBySlug('masjid-ibrahim-lutz-fl');
    expect(ibrahimTX?.city).toBe('Austin');
    expect(ibrahimFL?.city).toBe('Lutz');

    // 3. "Islamic Center"
    const centerCA = await mosqueRepository.findBySlug('islamic-center-fresno-ca');
    const centerNY = await mosqueRepository.findBySlug('islamic-center-bronx-ny');
    expect(centerCA?.city).toBe('Fresno');
    expect(centerNY?.city).toBe('Bronx');

    // 4. "Makki Masjid"
    const makkiCA = await mosqueRepository.findBySlug('makki-masjid-san-bernardino-ca');
    const makkiTX = await mosqueRepository.findBySlug('makki-masjid-houston-tx');
    const makkiIL = await mosqueRepository.findBySlug('makki-masjid-chicago-il');
    expect(makkiCA?.city).toBe('San Bernardino');
    expect(makkiTX?.city).toBe('Houston');
    expect(makkiIL?.city).toBe('Chicago');
  });
});
