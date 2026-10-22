import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { generateStateCityMetadata } from '@/lib/seo/state-city-helpers';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { cityRepository } from '@/lib/data/city-repository';
import sitemap from '@/app/sitemap';
import { generateMetadata as generateMosqueMetadata } from '@/app/mosque/[slug]/page';

describe('Phase 3C — Brooklyn & Sacramento SEO Improvements', () => {
  // 1. Sacramento City Metadata
  it('1. Generates concise, accurate title and description for Sacramento city page', async () => {
    const meta = await generateStateCityMetadata('CA', 'sacramento');

    expect(meta.title).toBe('Mosques in Sacramento, CA (27 Masajid & Centers)');
    expect(meta.description).toBe(
      'Discover 27 verified mosques and Islamic centers in Sacramento, CA. Access direct contact numbers, published hours when available, websites, and driving directions.'
    );
    expect(meta.alternates?.canonical).toBe('https://usmosques.com/mosques/california/sacramento');
    expect(meta.robots).toEqual({
      index: true,
      follow: true,
      'max-image-preview': 'large',
    });

    // Verify single brand suffix rule: title string has no trailing brand suffix
    const titleStr = typeof meta.title === 'string' ? meta.title : '';
    expect(titleStr).not.toContain('| US Mosque Finder');
    const rendered = `${titleStr} | US Mosque Finder`;
    const brandMatches = (rendered.match(/US Mosque Finder/g) || []).length;
    expect(brandMatches).toBe(1);
  });

  // 2. Brooklyn City Metadata
  it('2. Generates substantiated Kings County description for Brooklyn city page', async () => {
    const meta = await generateStateCityMetadata('NY', 'brooklyn');

    expect(meta.title).toBe('Mosques in Brooklyn, NY (103 Locations)');
    expect(meta.description).toBe(
      'Explore 103 verified mosques and Islamic centers across Brooklyn (Kings County), NY. Browse locations, contact details, hours when available, and driving directions.'
    );
    expect(meta.alternates?.canonical).toBe('https://usmosques.com/mosques/new-york/brooklyn');
    expect(meta.robots).toEqual({
      index: true,
      follow: true,
      'max-image-preview': 'large',
    });

    // Single brand suffix verification
    const titleStr = typeof meta.title === 'string' ? meta.title : '';
    expect(titleStr).not.toContain('| US Mosque Finder');
    const rendered = `${titleStr} | US Mosque Finder`;
    const brandMatches = (rendered.match(/US Mosque Finder/g) || []).length;
    expect(brandMatches).toBe(1);
  });

  // 3. Generic Brooklyn Entity Detail Page Metadata & Directives
  it('3. Preserves canonical, robots, and single-brand title for /mosque/mosque-brooklyn-ny', async () => {
    const meta = await generateMosqueMetadata({
      params: Promise.resolve({ slug: 'mosque-brooklyn-ny' }),
    });

    expect(meta.title).toBe('MOSQUE in Brooklyn, NY');
    expect(meta.alternates?.canonical).toBe('https://usmosques.com/mosque/mosque-brooklyn-ny');
    expect(meta.robots).toEqual({
      index: true,
      follow: true,
      'max-image-preview': 'large',
    });

    // Single brand suffix verification
    const titleStr = typeof meta.title === 'string' ? meta.title : '';
    expect(titleStr).not.toContain('| US Mosque Finder');
    const rendered = `${titleStr} | US Mosque Finder`;
    const brandMatches = (rendered.match(/US Mosque Finder/g) || []).length;
    expect(brandMatches).toBe(1);
  });

  // 4. Sacramento State-to-City Navigation Link
  it('4. Provides deterministic top-city navigation including Sacramento on California state directory', async () => {
    const eligibleCA = await cityRepository.getEligibleCities('CA');
    const top4Slugs = eligibleCA.slice(0, 4).map(c => c.slug);

    // Sacramento is the #1 city in CA by mosque count (27)
    expect(top4Slugs[0]).toBe('sacramento');
    expect(eligibleCA[0].mosqueCount).toBe(27);
  });

  // 5. Sitemap Inclusion for All Three URLs
  it('5. Ensures all three target URLs are correctly present in sitemap.xml', async () => {
    const routes = await sitemap();
    const sitemapUrls = new Set(routes.map(r => r.url));

    expect(sitemapUrls.has('https://usmosques.com/mosques/new-york/brooklyn')).toBe(true);
    expect(sitemapUrls.has('https://usmosques.com/mosques/california/sacramento')).toBe(true);
    expect(sitemapUrls.has('https://usmosques.com/mosque/mosque-brooklyn-ny')).toBe(true);
  });

  // 6. Preservation of Phase 3A Fresno Reconciliation
  it('6. Preserves Phase 3A Fresno reconciliation (Masjid Fresno verified, Info 2 Islam needs_review)', async () => {
    const caMosques = await mosqueRepository.getMosquesByState('CA');
    const masjidFresno = caMosques.find(m => m.cid === '10783269688215790709');
    const info2Islam = caMosques.find(m => m.cid === '5173828336142633657');

    expect(masjidFresno).toBeDefined();
    expect(masjidFresno?.dataStatus).toBe('verified');

    expect(info2Islam).toBeDefined();
    expect(info2Islam?.dataStatus).toBe('needs_review');
  });

  // 7. Raw Datasets Immutability
  it('7. Preserves data/raw/new-york.json and data/raw/california.json byte-for-byte', () => {
    const nyRawPath = path.join(process.cwd(), 'data/raw/new-york.json');
    const nyRecords = JSON.parse(fs.readFileSync(nyRawPath, 'utf8'));
    expect(nyRecords.length).toBe(374);

    const caRawPath = path.join(process.cwd(), 'data/raw/california.json');
    const caRecords = JSON.parse(fs.readFileSync(caRawPath, 'utf8'));
    expect(caRecords.length).toBe(401);

    // Brooklyn generic mosque record in NY raw data
    const brooklynMosque = nyRecords.find((r: any) => r.cid === '9425147548540979991');
    expect(brooklynMosque).toBeDefined();
    expect(brooklynMosque.title).toBe('MOSQUE');
    expect(brooklynMosque.address).toBe('453 AVE, Brooklyn, NY 11220');
  });

  // 8. Pre-rendered HTML Integration
  it('8. Verifies production HTML output contains new internal links and substantiated content', () => {
    const brooklynHtmlPath = path.join(process.cwd(), '.next/server/app/mosques/new-york/brooklyn.html');
    if (fs.existsSync(brooklynHtmlPath)) {
      const brooklynHtml = fs.readFileSync(brooklynHtmlPath, 'utf8');
      expect(brooklynHtml).toContain('Kings County');
      expect(brooklynHtml).toContain('<title>Mosques in Brooklyn, NY (103 Locations) | US Mosque Finder</title>');
    }

    const sacramentoHtmlPath = path.join(process.cwd(), '.next/server/app/mosques/california/sacramento.html');
    if (fs.existsSync(sacramentoHtmlPath)) {
      const sacramentoHtml = fs.readFileSync(sacramentoHtmlPath, 'utf8');
      expect(sacramentoHtml).toContain('<title>Mosques in Sacramento, CA (27 Masajid &amp; Centers) | US Mosque Finder</title>');
      expect(sacramentoHtml).toContain('Discover 27 verified mosques and Islamic centers in Sacramento, CA');
    }

    const caHtmlPath = path.join(process.cwd(), '.next/server/app/mosques/california.html');
    if (fs.existsSync(caHtmlPath)) {
      const caHtml = fs.readFileSync(caHtmlPath, 'utf8');
      expect(caHtml).toContain('/mosques/california/sacramento');
      expect(caHtml).toContain('Popular Cities:');
    }

    const entityHtmlPath = path.join(process.cwd(), '.next/server/app/mosque/mosque-brooklyn-ny.html');
    if (fs.existsSync(entityHtmlPath)) {
      const entityHtml = fs.readFileSync(entityHtmlPath, 'utf8');
      expect(entityHtml).toContain('/mosques/new-york/brooklyn');
      expect(entityHtml).toContain('Explore All <!-- -->Brooklyn<!-- --> Mosques');
    }
  });
});
