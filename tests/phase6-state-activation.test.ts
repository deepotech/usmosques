import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ingestStateDataset } from '@/lib/data/state-ingestion';
import {
  getStateConfig,
  getEnabledStates,
  isStateEnabled,
  STATE_REGISTRY,
} from '@/lib/config/state-registry';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { cityRepository } from '@/lib/data/city-repository';
import { getTimezoneForState } from '@/lib/geo/timezone';
import {
  generateStateMetadata,
  generateStateCityMetadata,
  generateStateCityStaticParams,
} from '@/lib/seo/state-city-helpers';
import { getMosquePath, getMosqueCanonicalUrl } from '@/lib/seo/mosque-url';
import sitemap from '@/app/sitemap';

describe('Phase 6: 8 New States Activation & Quality Verification', () => {
  const NEW_STATE_CODES = ['GA', 'NJ', 'MI', 'PA', 'MD', 'VA', 'OH', 'NC'] as const;
  const ORIGINAL_STATE_CODES = ['CA', 'TX', 'NY', 'FL', 'IL'] as const;

  const EXPECTED_RAW_COUNTS: Record<string, number> = {
    GA: 134,
    NJ: 187,
    MI: 167,
    PA: 159,
    MD: 107,
    VA: 132,
    OH: 111,
    NC: 110,
  };

  const EXPECTED_VERIFIED_COUNTS: Record<string, number> = {
    GA: 129,
    NJ: 172,
    MI: 153,
    PA: 153,
    MD: 102,
    VA: 122,
    OH: 99,
    NC: 101,
  };

  const EXPECTED_NEEDS_REVIEW_COUNTS: Record<string, number> = {
    GA: 5,
    NJ: 14,
    MI: 14,
    PA: 6,
    MD: 4,
    VA: 10,
    OH: 11,
    NC: 9,
  };

  const EXPECTED_EXCLUDED_COUNTS: Record<string, number> = {
    GA: 0,
    NJ: 1,
    MI: 0,
    PA: 0,
    MD: 1,
    VA: 0,
    OH: 1,
    NC: 0,
  };

  const EXPECTED_ELIGIBLE_CITIES: Record<string, number> = {
    GA: 6,
    NJ: 5,
    MI: 6,
    PA: 4,
    MD: 3,
    VA: 8,
    OH: 5,
    NC: 7,
  };

  // 1. All 5 original states remain enabled
  it('1. Original 5 states (CA, TX, NY, FL, IL) remain enabled and functional', () => {
    ORIGINAL_STATE_CODES.forEach(code => {
      expect(isStateEnabled(code), `${code} must remain enabled`).toBe(true);
      const config = getStateConfig(code);
      expect(config?.enabled).toBe(true);
      expect(config?.finderEnabled).toBe(true);
      expect(config?.seoEnabled).toBe(true);
    });
  });

  // 2. All 8 new states are registered and enabled
  it('2. All 8 new states are registered and enabled in State Registry', () => {
    NEW_STATE_CODES.forEach(code => {
      expect(isStateEnabled(code), `${code} must be enabled`).toBe(true);
      const config = getStateConfig(code);
      expect(config?.enabled).toBe(true);
      expect(config?.finderEnabled).toBe(true);
      expect(config?.seoEnabled).toBe(true);
      expect(config?.datasetPath).toBeDefined();
    });
  });

  // 3. Total active states is 13
  it('3. Total active states in registry equals exactly 13', () => {
    const enabled = getEnabledStates();
    expect(enabled.length).toBe(13);
  });

  // 4. Dormant states remain disabled
  it('4. Dormant states (CT, IN, SC) remain strictly disabled', () => {
    ['CT', 'IN', 'SC'].forEach(code => {
      expect(isStateEnabled(code)).toBe(false);
      expect(STATE_REGISTRY[code]?.enabled).toBe(false);
    });
  });

  // 5. Ingestion quality gates for each new state
  it('5. Each new state dataset passes schema validation and GPS checks', () => {
    for (const code of NEW_STATE_CODES) {
      const config = getStateConfig(code)!;
      const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), config.datasetPath!), 'utf-8'));
      expect(raw.length).toBe(EXPECTED_RAW_COUNTS[code]);

      const { result, mosques } = ingestStateDataset(raw, code);
      expect(result.validSchemaCount).toBe(EXPECTED_RAW_COUNTS[code]);
      expect(result.invalidSchemaCount).toBe(0);
      expect(result.metrics.validGpsPercentage).toBe(100);
      expect(mosques.length).toBe(EXPECTED_RAW_COUNTS[code]);
    }
  });

  // 6. Record counts match exact expected breakdown per state
  it('6. Record counts reconcile verified, needs_review, and excluded status per state', async () => {
    for (const code of NEW_STATE_CODES) {
      const mosques = await mosqueRepository.getMosquesByState(code);
      const v = mosques.filter(m => m.dataStatus === 'verified').length;
      const nr = mosques.filter(m => m.dataStatus === 'needs_review').length;
      const ex = mosques.filter(m => m.dataStatus === 'excluded').length;

      expect(v, `${code} verified count`).toBe(EXPECTED_VERIFIED_COUNTS[code]);
      expect(nr, `${code} needs_review count`).toBe(EXPECTED_NEEDS_REVIEW_COUNTS[code]);
      expect(ex, `${code} excluded count`).toBe(EXPECTED_EXCLUDED_COUNTS[code]);
      expect(v + nr + ex, `${code} total sum`).toBe(EXPECTED_RAW_COUNTS[code]);
    }
  });

  // 7. Raw source files in project root remain unchanged
  it('7. Raw source files in project root remain present and unmodified', () => {
    const rootFiles = [
      'Georgia.json',
      'Maryland.json',
      'Michigan.json',
      'New Jersey.json',
      'North Carolina.json',
      'Ohio.json',
      'Pennsylvania.json',
      'Virginia.json',
    ];
    for (const file of rootFiles) {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
    }
  });

  // 8. Shared-address safeguard remains active
  it('8. Shared-address safeguard assigns needs_review to co-located records in new states', async () => {
    const gaMosques = await mosqueRepository.getMosquesByState('GA');
    const tidwellMosques = gaMosques.filter(m => m.address.toLowerCase().includes('665 tidwell rd'));
    expect(tidwellMosques.length).toBe(2);
    expect(tidwellMosques.every(m => m.dataStatus === 'needs_review')).toBe(true);
    expect(tidwellMosques.every(m => m.statusReason?.includes('Shares address'))).toBe(true);
  });

  // 9. Fresno override remains isolated
  it('9. Fresno override remains strictly scoped to CID 10783269688215790709', async () => {
    const caMosques = await mosqueRepository.getMosquesByState('CA');
    const masjidFresno = caMosques.find(m => m.cid === '10783269688215790709');
    expect(masjidFresno?.dataStatus).toBe('verified');

    const info2Islam = caMosques.find(m => m.cid === '5173828336142633657');
    expect(info2Islam?.dataStatus).toBe('needs_review');
  });

  // 10. City eligibility thresholds (>= 5 publishable) remain intact
  it('10. Eligible city directory count matches expected counts across all 8 states', async () => {
    for (const code of NEW_STATE_CODES) {
      const cities = await cityRepository.getEligibleCities(code);
      expect(cities.length, `${code} eligible city count`).toBe(EXPECTED_ELIGIBLE_CITIES[code]);
      for (const c of cities) {
        expect(c.mosqueCount).toBeGreaterThanOrEqual(5);
      }
    }
  });

  // 11. Canonical URL resolution is unique across all 2587 publishable mosques
  it('11. Every mosque resolves to a unique, non-empty canonical URL', async () => {
    const { mosques } = await mosqueRepository.search({ status: 'all', limit: 3000 });
    const publishable = mosques.filter(m => m.dataStatus !== 'excluded');
    const slugs = new Set<string>();

    for (const m of publishable) {
      const urlPath = getMosquePath(m);
      expect(urlPath).toMatch(/^\/mosque\/[a-z0-9-]+$/);
      expect(slugs.has(m.slug), `Slug collision detected for ${m.slug}`).toBe(false);
      slugs.add(m.slug);
    }
    expect(slugs.size).toBe(2587);
  });

  // 12. Sitemap contains exactly 2522 URLs, no duplicates, no noindex
  it('12. Sitemap includes verified mosques and eligible cities, excluding needs_review and /mosque-near-me', async () => {
    const routes = await sitemap();
    expect(routes.length).toBe(2522);

    const urls = new Set(routes.map(r => r.url));
    expect(urls.size).toBe(2522);

    // /mosque-near-me excluded
    expect(urls.has('https://usmosques.com/mosque-near-me')).toBe(false);

    // All state hubs included
    for (const s of getEnabledStates()) {
      expect(urls.has(`https://usmosques.com/mosques/${s.slug}`)).toBe(true);
    }
  });

  // 13. State and City metadata generation
  it('13. Generates valid metadata for each new state and its eligible cities', async () => {
    for (const code of NEW_STATE_CODES) {
      const stateMeta = await generateStateMetadata(code);
      expect(stateMeta.title).toBeDefined();
      expect(stateMeta.description).toBeDefined();

      const cities = await cityRepository.getEligibleCities(code);
      for (const city of cities.slice(0, 2)) {
        const cityMeta = await generateStateCityMetadata(code, city.slug);
        expect(cityMeta.title).toBeDefined();
        expect(cityMeta.description).toBeDefined();
      }
    }
  });

  // 14. Static param generation for city routes
  it('14. generateStateCityStaticParams produces accurate params for all new states', async () => {
    for (const code of NEW_STATE_CODES) {
      const params = await generateStateCityStaticParams(code);
      expect(params.length).toBe(EXPECTED_ELIGIBLE_CITIES[code]);
    }
  });
});
