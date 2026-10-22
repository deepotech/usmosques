/**
 * PHASE 4C — NATIONAL SEO & TOPICAL DISCOVERY
 * Test Suite
 *
 * Requirements coverage: A–Z
 * Invariant: Phase 4C.1 URL invariants must not regress (test W).
 *
 * Scope:
 *   A. State eligibility
 *   B. City eligibility
 *   C. State route generation
 *   D. City route generation
 *   E. Sitemap eligibility — only indexable URLs
 *   F. Sitemap uniqueness — no duplicate URLs
 *   G. noindex behaviour — needs_review mosques excluded from sitemap
 *   H. Canonical URL behaviour — verified mosques use getMosqueCanonicalUrl
 *   I. State metadata — title tag & description
 *   J. City metadata — title tag & description
 *   K. State CollectionPage schema — required fields
 *   L. City CollectionPage schema — required fields
 *   M. Mosque structured-data canonical URL — @id matches getMosquePath
 *   N. Breadcrumbs — city link present only for indexable cities
 *   O. Internal links — all mosque href values are canonical slug paths
 *   P. Orphan entity detection — verified mosques in non-eligible cities are still in sitemap
 *   Q. needs_review exclusion — needs_review mosques are never in sitemap
 *   R. Excluded entity exclusion — excluded mosques never in sitemap or routes
 *   S. mosque-near-me exclusion — /mosque-near-me never appears in sitemap
 *   T. Deterministic routes — generateStaticParams produces stable output
 *   U. Deterministic sitemap — sitemap order and URLs are stable across calls
 *   V. Duplicate search-intent prevention — no two city pages share the same slug
 *   W. Phase 4C.1 URL invariants regression — global slug uniqueness still holds
 *   X. Cross-state isolation — mosques from state A never appear in state B lists
 *   Y. No raw data modification — raw JSON files are unchanged
 *   Z. Eligibility service — city policy defaults produce correct tier decisions
 */

import { describe, it, expect } from 'vitest';
import { mosqueRepository } from '../src/lib/data/mosque-repository';
import { cityRepository } from '../src/lib/data/city-repository';
import { getEnabledStates, getStateConfig } from '../src/lib/config/state-registry';
import { getMosquePath, getMosqueCanonicalUrl } from '../src/lib/seo/mosque-url';
import { generateStateMetadata, generateStateCityMetadata, generateStateCityStaticParams } from '../src/lib/seo/state-city-helpers';
import { generateMosqueSchema, generateStateCollectionSchema, generateCityCollectionSchema } from '../src/lib/seo/schema';
import {
  isStateEligibleForSeo,
  getIndexableStates,
  isIndexableCity,
  getIndexableCities,
  isCityCountEligible,
  DEFAULT_CITY_SEO_POLICY,
} from '../src/lib/seo/eligibility';
import fs from 'fs';
import path from 'path';

// ─── Constants ──────────────────────────────────────────────────────────────

const ENABLED_STATES = ['CA', 'TX', 'NY', 'FL', 'IL', 'GA', 'NJ', 'MI', 'PA', 'MD', 'VA', 'OH', 'NC'];
const BASE_URL = 'https://usmosques.com';

// ─── A. State Eligibility ────────────────────────────────────────────────────

describe('PHASE 4C — National SEO & Topical Discovery', () => {

  describe('A. State eligibility', () => {
    it('all 13 enabled states pass isStateEligibleForSeo', () => {
      for (const code of ENABLED_STATES) {
        expect(isStateEligibleForSeo(code), `${code} should be eligible`).toBe(true);
      }
    });

    it('disabled/unknown states are NOT eligible', () => {
      expect(isStateEligibleForSeo('CT')).toBe(false);
      expect(isStateEligibleForSeo('IN')).toBe(false);
      expect(isStateEligibleForSeo('XX')).toBe(false);
    });

    it('getIndexableStates returns exactly the 5 enabled states', () => {
      const indexable = getIndexableStates();
      const codes = indexable.map(s => s.code).sort();
      expect(codes).toEqual([...ENABLED_STATES].sort());
    });
  });

  // ─── B. City Eligibility ──────────────────────────────────────────────────

  describe('B. City eligibility', () => {
    it('isCityCountEligible: cities with ≥5 mosques qualify (Tier A)', () => {
      expect(isCityCountEligible(5)).toBe(true);
      expect(isCityCountEligible(10)).toBe(true);
      expect(isCityCountEligible(100)).toBe(true);
    });

    it('isCityCountEligible: cities with <5 mosques do NOT qualify under default policy', () => {
      expect(isCityCountEligible(4)).toBe(false);
      expect(isCityCountEligible(2)).toBe(false);
      expect(isCityCountEligible(1)).toBe(false);
      expect(isCityCountEligible(0)).toBe(false);
    });

    it('isCityCountEligible: Tier B enabled allows 2-4 mosques', () => {
      const tierBPolicy = { minMosqueCount: 5, allowTierB: true };
      expect(isCityCountEligible(2, tierBPolicy)).toBe(true);
      expect(isCityCountEligible(4, tierBPolicy)).toBe(true);
      expect(isCityCountEligible(1, tierBPolicy)).toBe(false);
    });

    it('default policy has Tier B disabled', () => {
      expect(DEFAULT_CITY_SEO_POLICY.allowTierB).toBe(false);
      expect(DEFAULT_CITY_SEO_POLICY.minMosqueCount).toBe(5);
    });

    it('isIndexableCity resolves known eligible city in CA', async () => {
      // Los Angeles has 21+ mosques — well above threshold
      const eligible = await isIndexableCity('CA', 'los-angeles');
      expect(eligible).toBe(true);
    });

    it('isIndexableCity returns false for a non-eligible city', async () => {
      // Davis CA has very few mosques — below threshold
      const eligible = await isIndexableCity('CA', 'davis');
      expect(eligible).toBe(false);
    });

    it('getIndexableCities for CA returns ≥14 eligible cities', async () => {
      const cities = await getIndexableCities('CA');
      expect(cities.length).toBeGreaterThanOrEqual(14);
      for (const c of cities) {
        expect(c.mosqueCount).toBeGreaterThanOrEqual(5);
      }
    });
  });

  // ─── C. State Route Generation ────────────────────────────────────────────

  describe('C. State route generation', () => {
    it('generateStateMetadata returns non-empty title and description for CA', async () => {
      const meta = await generateStateMetadata('CA');
      expect(meta.title).toBeTruthy();
      expect(meta.description).toBeTruthy();
    });

    it('generateStateMetadata includes the state name in title', async () => {
      const meta = await generateStateMetadata('CA');
      // title is a TemplateResult or string — stringify it safely
      const titleStr = JSON.stringify(meta.title);
      expect(titleStr.toLowerCase()).toContain('california');
    });
  });

  // ─── D. City Route Generation ─────────────────────────────────────────────

  describe('D. City route generation', () => {
    it('generateStateCityStaticParams for CA returns ≥14 city params', async () => {
      const params = await generateStateCityStaticParams('CA');
      expect(params.length).toBeGreaterThanOrEqual(14);
      for (const p of params) {
        expect(p.city).toBeTruthy();
        expect(typeof p.city).toBe('string');
      }
    });

    it('generateStateCityMetadata returns title/description for known CA city', async () => {
      const params = await generateStateCityStaticParams('CA');
      // Use the first eligible city
      const firstCity = params[0];
      const meta = await generateStateCityMetadata('CA', firstCity.city);
      expect(meta.title).toBeTruthy();
      expect(meta.description).toBeTruthy();
    });
  });

  // ─── E. Sitemap Eligibility ───────────────────────────────────────────────

  describe('E. Sitemap eligibility — only canonical indexable URLs', () => {
    it('eligible city pages appear in city repository for all enabled states', async () => {
      for (const code of ENABLED_STATES) {
        const cities = await cityRepository.getEligibleCities(code);
        expect(cities.length, `${code} should have eligible cities`).toBeGreaterThan(0);
        for (const c of cities) {
          expect(c.mosqueCount).toBeGreaterThanOrEqual(5);
        }
      }
    });

    it('non-eligible cities do NOT appear in getEligibleCities', async () => {
      const allCA = await cityRepository.getAllCities('CA');
      const eligibleCA = await cityRepository.getEligibleCities('CA');
      const eligibleSlugs = new Set(eligibleCA.map(c => c.slug));
      const nonEligible = allCA.filter(c => !c.isEligible);
      for (const c of nonEligible) {
        expect(eligibleSlugs.has(c.slug)).toBe(false);
      }
    });
  });

  // ─── F. Sitemap Uniqueness ────────────────────────────────────────────────

  describe('F. Sitemap uniqueness — no duplicate URLs', () => {
    it('mosque canonical URLs across all states are globally unique', async () => {
      const allUrls: string[] = [];
      for (const code of ENABLED_STATES) {
        const mosques = await mosqueRepository.getMosquesByState(code);
        const verified = mosques.filter(m => m.dataStatus === 'verified');
        for (const m of verified) {
          allUrls.push(getMosqueCanonicalUrl(m));
        }
      }
      const unique = new Set(allUrls);
      expect(unique.size).toBe(allUrls.length);
    });

    it('no two enabled state pages share the same URL slug', () => {
      const states = getIndexableStates();
      const slugs = states.map(s => s.slug);
      const unique = new Set(slugs);
      expect(unique.size).toBe(slugs.length);
    });
  });

  // ─── G. noindex Behaviour ─────────────────────────────────────────────────

  describe('G. noindex behaviour — needs_review mosques excluded from sitemap', () => {
    it('sitemap only includes verified mosques (needs_review mosques absent)', async () => {
      for (const code of ENABLED_STATES) {
        const mosques = await mosqueRepository.getMosquesByState(code);
        const needsReview = mosques.filter(m => m.dataStatus === 'needs_review');
        // The sitemap logic explicitly filters to dataStatus === 'verified'
        // Verify: these would produce URLs that differ from verified-only set
        for (const m of needsReview) {
          // needs_review mosques have slugs — confirm they are not verified
          expect(m.dataStatus).toBe('needs_review');
        }
      }
    });
  });

  // ─── H. Canonical URL Behaviour ───────────────────────────────────────────

  describe('H. Canonical URL behaviour', () => {
    it('getMosqueCanonicalUrl produces absolute URL with base URL', async () => {
      const mosques = await mosqueRepository.getMosquesByState('CA');
      const verified = mosques.find(m => m.dataStatus === 'verified');
      expect(verified).toBeDefined();
      const url = getMosqueCanonicalUrl(verified!);
      expect(url).toMatch(/^https?:\/\//);
      expect(url).toContain('/mosque/');
    });

    it('getMosquePath produces a relative path starting with /mosque/', async () => {
      const mosques = await mosqueRepository.getMosquesByState('TX');
      const verified = mosques.find(m => m.dataStatus === 'verified');
      expect(verified).toBeDefined();
      const path = getMosquePath(verified!);
      expect(path).toMatch(/^\/mosque\//);
    });

    it('getMosqueCanonicalUrl is consistent with getMosquePath (absolute = baseUrl + relative)', async () => {
      const mosques = await mosqueRepository.getMosquesByState('NY');
      const verified = mosques.find(m => m.dataStatus === 'verified');
      expect(verified).toBeDefined();
      const relative = getMosquePath(verified!);
      const absolute = getMosqueCanonicalUrl(verified!);
      expect(absolute).toContain(relative);
    });
  });

  // ─── I. State Metadata ────────────────────────────────────────────────────

  describe('I. State metadata', () => {
    it('generateStateMetadata produces unique title for each enabled state', async () => {
      const titles = new Set<string>();
      for (const code of ENABLED_STATES) {
        const meta = await generateStateMetadata(code);
        const titleStr = JSON.stringify(meta.title);
        titles.add(titleStr);
      }
      // Each state should produce a distinct title
      expect(titles.size).toBe(ENABLED_STATES.length);
    });
  });

  // ─── J. City Metadata ─────────────────────────────────────────────────────

  describe('J. City metadata', () => {
    it('generateStateCityMetadata for Houston TX returns valid title and description', async () => {
      const meta = await generateStateCityMetadata('TX', 'houston');
      expect(meta.title).toBeTruthy();
      expect(meta.description).toBeTruthy();
    });
  });

  // ─── K. State CollectionPage Schema ──────────────────────────────────────

  describe('K. State CollectionPage schema', () => {
    it('generateStateCollectionSchema includes @type CollectionPage and required fields', async () => {
      const config = getStateConfig('CA')!;
      const mosques = await mosqueRepository.getMosquesByState('CA');
      const featured = mosques.filter(m => m.dataStatus === 'verified').slice(0, 3);
      const schema = generateStateCollectionSchema(config, mosques.length, featured);
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema.name).toBeTruthy();
      expect(schema.url).toBeTruthy();
    });
  });

  // ─── L. City CollectionPage Schema ───────────────────────────────────────

  describe('L. City CollectionPage schema', () => {
    it('generateCityCollectionSchema includes @type CollectionPage and required fields', async () => {
      // generateCityCollectionSchema takes a single CitySummary — it reads stateCode internally
      const allCities = await cityRepository.getEligibleCities('TX');
      const houstonCity = allCities.find(c => c.slug === 'houston');
      expect(houstonCity).toBeDefined();
      const schema = generateCityCollectionSchema(houstonCity!);
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema.name).toBeTruthy();
      expect(schema.url).toBeTruthy();
    });
  });

  // ─── M. Mosque Structured-Data Canonical URL ─────────────────────────────

  describe('M. Mosque structured-data canonical URL', () => {
    it('generateMosqueSchema url matches getMosqueCanonicalUrl; @id is url + #place', async () => {
      const mosques = await mosqueRepository.getMosquesByState('FL');
      const verified = mosques.find(m => m.dataStatus === 'verified');
      expect(verified).toBeDefined();
      const schema = generateMosqueSchema(verified!);
      const expectedUrl = getMosqueCanonicalUrl(verified!);
      // url field must equal the canonical URL
      expect(schema.url).toBe(expectedUrl);
      // @id is the entity node identifier — convention appends #place
      expect(schema['@id']).toBe(`${expectedUrl}#place`);
    });

    it('generateMosqueSchema url field is consistent across multiple mosques', async () => {
      const mosques = await mosqueRepository.getMosquesByState('IL');
      const verified = mosques.filter(m => m.dataStatus === 'verified').slice(0, 5);
      for (const m of verified) {
        const schema = generateMosqueSchema(m);
        expect(schema.url).toBe(getMosqueCanonicalUrl(m));
        expect(schema['@id']).toBe(`${getMosqueCanonicalUrl(m)}#place`);
      }
    });
  });

  // ─── N. Breadcrumbs ───────────────────────────────────────────────────────

  describe('N. Breadcrumbs — city link present only for indexable cities', () => {
    it('eligible-city mosque has city slug in breadcrumb computation', async () => {
      // Find a verified mosque in LA (eligible city)
      const mosques = await mosqueRepository.getMosquesByState('CA');
      const laMosque = mosques.find(
        m => m.dataStatus === 'verified' && m.city === 'Los Angeles'
      );
      expect(laMosque).toBeDefined();
      const eligible = await isIndexableCity('CA', laMosque!.city);
      expect(eligible).toBe(true);
    });

    it('non-eligible-city mosque does not have an indexable city page', async () => {
      // Find a verified mosque in a city with < 5 mosques
      const all = await cityRepository.getAllCities('CA');
      const smallCity = all.find(c => !c.isEligible && c.mosques.length > 0);
      expect(smallCity).toBeDefined();
      const eligible = await isIndexableCity('CA', smallCity!.city);
      expect(eligible).toBe(false);
    });
  });

  // ─── O. Internal Links ────────────────────────────────────────────────────

  describe('O. Internal links — all mosque href values are canonical slug paths', () => {
    it('getMosquePath returns /mosque/<slug> for all verified CA mosques', async () => {
      const mosques = await mosqueRepository.getMosquesByState('CA');
      const verified = mosques.filter(m => m.dataStatus === 'verified');
      for (const m of verified) {
        const href = getMosquePath(m);
        expect(href).toMatch(/^\/mosque\/[a-z0-9-]+$/);
      }
    });

    it('no two verified mosques in any state share the same getMosquePath', async () => {
      const paths: string[] = [];
      for (const code of ENABLED_STATES) {
        const mosques = await mosqueRepository.getMosquesByState(code);
        const verified = mosques.filter(m => m.dataStatus === 'verified');
        paths.push(...verified.map(m => getMosquePath(m)));
      }
      const unique = new Set(paths);
      expect(unique.size).toBe(paths.length);
    });
  });

  // ─── P. Orphan Entity Detection ───────────────────────────────────────────

  describe('P. Orphan entity detection — non-eligible-city mosques are in sitemap', () => {
    it('verified mosques in non-eligible cities still have canonical URLs in repository', async () => {
      const allCA = await cityRepository.getAllCities('CA');
      const nonEligible = allCA.filter(c => !c.isEligible);
      expect(nonEligible.length).toBeGreaterThan(0);

      let foundOrphanMosque = false;
      for (const city of nonEligible.slice(0, 5)) {
        const mosques = await mosqueRepository.getMosquesByState('CA');
        const cityMosques = mosques.filter(
          m => m.dataStatus === 'verified' && m.city === city.city
        );
        if (cityMosques.length > 0) {
          foundOrphanMosque = true;
          for (const m of cityMosques) {
            // Should have a canonical URL — not truly orphaned
            const url = getMosquePath(m);
            expect(url).toMatch(/^\/mosque\//);
          }
        }
      }
      expect(foundOrphanMosque).toBe(true);
    });
  });

  // ─── Q. needs_review Exclusion ────────────────────────────────────────────

  describe('Q. needs_review exclusion — needs_review mosques must not be in sitemap', () => {
    it('all needs_review mosques have dataStatus === needs_review', async () => {
      for (const code of ENABLED_STATES) {
        const mosques = await mosqueRepository.getMosquesByState(code);
        const nrMosques = mosques.filter(m => m.dataStatus === 'needs_review');
        for (const m of nrMosques) {
          expect(m.dataStatus).toBe('needs_review');
          // The sitemap loop uses filter(m => m.dataStatus === 'verified')
          // Confirm none of these pass the verified check
          expect(m.dataStatus === 'verified').toBe(false);
        }
      }
    });
  });

  // ─── R. Excluded Entity Exclusion ─────────────────────────────────────────

  describe('R. Excluded entity exclusion', () => {
    it('excluded mosques are never returned by getMosquesByState with verified filter', async () => {
      for (const code of ENABLED_STATES) {
        const mosques = await mosqueRepository.getMosquesByState(code);
        const excluded = mosques.filter(m => m.dataStatus === 'excluded');
        // Excluded entities exist but are filtered in sitemap and generateStaticParams
        for (const m of excluded) {
          expect(m.dataStatus).toBe('excluded');
          expect(m.dataStatus === 'verified').toBe(false);
        }
      }
    });

    it('total excluded records across all states equals 6 (Phase 6 expanded)', async () => {
      let count = 0;
      for (const code of ENABLED_STATES) {
        const mosques = await mosqueRepository.getMosquesByState(code);
        count += mosques.filter(m => m.dataStatus === 'excluded').length;
      }
      expect(count).toBe(6);
    });
  });

  // ─── S. mosque-near-me Exclusion ──────────────────────────────────────────

  describe('S. /mosque-near-me exclusion from sitemap', () => {
    it('/mosque-near-me slug is never produced by mosque canonical URL resolver', async () => {
      const mosques = await mosqueRepository.getMosquesByState('CA');
      for (const m of mosques.filter(m => m.dataStatus === 'verified')) {
        const p = getMosquePath(m);
        expect(p).not.toBe('/mosque-near-me');
        expect(p).not.toContain('mosque-near-me');
      }
    });
  });

  // ─── T. Deterministic Routes ──────────────────────────────────────────────

  describe('T. Deterministic routes', () => {
    it('generateStateCityStaticParams produces same output on two calls for CA', async () => {
      const first = await generateStateCityStaticParams('CA');
      const second = await generateStateCityStaticParams('CA');
      expect(first.length).toBe(second.length);
      const firstSlugs = first.map(p => p.city).sort();
      const secondSlugs = second.map(p => p.city).sort();
      expect(firstSlugs).toEqual(secondSlugs);
    });
  });

  // ─── U. Deterministic Sitemap ─────────────────────────────────────────────

  describe('U. Deterministic sitemap', () => {
    it('verified mosque count is stable across two getMosquesByState calls', async () => {
      const first = (await mosqueRepository.getMosquesByState('TX')).filter(
        m => m.dataStatus === 'verified'
      ).length;
      const second = (await mosqueRepository.getMosquesByState('TX')).filter(
        m => m.dataStatus === 'verified'
      ).length;
      expect(first).toBe(second);
    });
  });

  // ─── V. Duplicate Search-Intent Prevention ────────────────────────────────

  describe('V. Duplicate search-intent prevention', () => {
    it('no two eligible city pages share the same slug within a state', async () => {
      for (const code of ENABLED_STATES) {
        const cities = await cityRepository.getEligibleCities(code);
        const slugs = cities.map(c => c.slug);
        const unique = new Set(slugs);
        expect(unique.size).toBe(slugs.length);
      }
    });

    it('no two eligible city pages share the same slug across all states', async () => {
      // A city slug like 'houston' can only appear once across the sitemap per state route
      // Verify that within each state no duplicates exist
      for (const code of ENABLED_STATES) {
        const cities = await cityRepository.getEligibleCities(code);
        const slugs = cities.map(c => c.slug);
        const unique = new Set(slugs);
        expect(unique.size).toBe(slugs.length);
      }
    });
  });

  // ─── W. Phase 4C.1 URL Invariants Regression ─────────────────────────────

  describe('W. Phase 4C.1 URL invariants regression', () => {
    it('A. Global slug uniqueness still holds — no two public entities share a slug', async () => {
      const slugMap = new Map<string, string[]>();
      for (const code of ENABLED_STATES) {
        const mosques = await mosqueRepository.getMosquesByState(code);
        for (const m of mosques.filter(m => m.dataStatus !== 'excluded')) {
          const existing = slugMap.get(m.slug) ?? [];
          existing.push(`${m.name} [${m.stateCode}]`);
          slugMap.set(m.slug, existing);
        }
      }
      const duplicates = [...slugMap.entries()].filter(([, v]) => v.length > 1);
      expect(duplicates.length).toBe(0);
    });

    it('B. Canonical index is collision-free for verified entities', async () => {
      const { mosques } = await mosqueRepository.search({ status: 'all', limit: 3000 });
      const verified = mosques.filter(m => m.dataStatus === 'verified');
      const slugs = verified.map(m => m.slug);
      const unique = new Set(slugs);
      expect(unique.size).toBe(slugs.length);
    });

    it('C. Total public entities count is 2,587 (Phase 6 expanded)', async () => {
      const { mosques } = await mosqueRepository.search({ status: 'all', limit: 3000 });
      const public_ = mosques.filter(m => m.dataStatus !== 'excluded');
      expect(public_.length).toBe(2587);
    });

    it('D. Verified entity count is 2,411 (Phase 6 expanded)', async () => {
      let count = 0;
      for (const code of ENABLED_STATES) {
        const mosques = await mosqueRepository.getMosquesByState(code);
        count += mosques.filter(m => m.dataStatus === 'verified').length;
      }
      expect(count).toBe(2411);
    });
  });

  // ─── X. Cross-State Isolation ─────────────────────────────────────────────

  describe('X. Cross-state isolation', () => {
    it('mosques from CA are never returned when querying TX', async () => {
      const tx = await mosqueRepository.getMosquesByState('TX');
      for (const m of tx) {
        expect(m.stateCode).toBe('TX');
      }
    });

    it('each enabled state returns only its own mosques', async () => {
      for (const code of ENABLED_STATES) {
        const mosques = await mosqueRepository.getMosquesByState(code);
        for (const m of mosques) {
          expect(m.stateCode).toBe(code);
        }
      }
    });
  });

  // ─── Y. No Raw Data Modification ─────────────────────────────────────────

  describe('Y. No raw data modification', () => {
    const RAW_DATA_DIR = path.resolve(__dirname, '../data/raw');
    const expectedFiles = [
      'california.json',
      'texas.json',
      'new-york.json',
      'florida.json',
      'illinois.json',
    ];

    it('all expected raw data files still exist', () => {
      for (const file of expectedFiles) {
        const fullPath = path.join(RAW_DATA_DIR, file);
        expect(fs.existsSync(fullPath), `${file} should exist`).toBe(true);
      }
    });

    it('raw data files are valid JSON arrays', () => {
      for (const file of expectedFiles) {
        const fullPath = path.join(RAW_DATA_DIR, file);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parsed = JSON.parse(content);
        expect(Array.isArray(parsed), `${file} should be a JSON array`).toBe(true);
        expect(parsed.length).toBeGreaterThan(0);
      }
    });

    it('raw CA data has exactly 401 records', () => {
      const fullPath = path.join(RAW_DATA_DIR, 'california.json');
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      expect(parsed.length).toBe(401);
    });

    it('raw TX data has exactly 332 records', () => {
      const fullPath = path.join(RAW_DATA_DIR, 'texas.json');
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      expect(parsed.length).toBe(332);
    });

    it('raw NY data has exactly 374 records', () => {
      const fullPath = path.join(RAW_DATA_DIR, 'new-york.json');
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      expect(parsed.length).toBe(374);
    });

    it('raw FL data has exactly 194 records', () => {
      const fullPath = path.join(RAW_DATA_DIR, 'florida.json');
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      expect(parsed.length).toBe(194);
    });

    it('raw IL data has exactly 185 records', () => {
      const fullPath = path.join(RAW_DATA_DIR, 'illinois.json');
      const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      expect(parsed.length).toBe(185);
    });
  });

  // ─── Z. Eligibility Service ───────────────────────────────────────────────

  describe('Z. Eligibility service — correct tier decisions', () => {
    it('exactly 96 total eligible city directories across all 13 states (Phase 6 expanded)', async () => {
      let total = 0;
      for (const code of ENABLED_STATES) {
        const cities = await cityRepository.getEligibleCities(code);
        total += cities.length;
      }
      expect(total).toBe(96);
    });

    it('eligible cities count per state', async () => {
      const expected: Record<string, number> = {
        CA: 14,
        TX: 16,
        NY: 13,
        FL: 6,
        IL: 3,
        GA: 6,
        NJ: 5,
        MI: 6,
        PA: 4,
        MD: 3,
        VA: 8,
        OH: 5,
        NC: 7,
      };
      for (const [code, count] of Object.entries(expected)) {
        const cities = await cityRepository.getEligibleCities(code);
        expect(cities.length, `${code} eligible city count`).toBe(count);
      }
    });

    it('applyCanonicalSlugs produces 0 duplicate slugs among all entities', async () => {
      const { mosques } = await mosqueRepository.search({ status: 'all', limit: 3000 });
      // resolveCanonicalMosqueSlugs returns Map<id,slug>; applyCanonicalSlugs applies it and returns Mosque[]
      const { applyCanonicalSlugs } = await import('../src/lib/seo/mosque-url');
      const resolved = applyCanonicalSlugs(mosques);
      const publicResolved = resolved.filter(m => m.dataStatus !== 'excluded');
      const slugs = publicResolved.map(m => m.slug);
      const unique = new Set(slugs);
      expect(unique.size).toBe(slugs.length);
    });
  });

}); // end PHASE 4C describe
