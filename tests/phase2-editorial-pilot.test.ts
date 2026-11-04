import { describe, it, expect } from 'vitest';
import {
  MOSQUE_EDITORIAL_REGISTRY,
  CITY_EDITORIAL_REGISTRY,
  getMosqueEditorial,
  getCityEditorial,
} from '@/lib/data/editorial-content';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { cityRepository } from '@/lib/data/city-repository';

describe('Phase 2 — Content Quality Pilot Test Suite', () => {
  it('contains exactly 9 active controlled pilot mosque entries (Daly City enrichment removed following audit)', () => {
    const keys = Object.keys(MOSQUE_EDITORIAL_REGISTRY);
    expect(keys.length).toBe(9);
  });

  it('contains the controlled Phase 2 pilot city entries', () => {
    const keys = Object.keys(CITY_EDITORIAL_REGISTRY);
    expect(keys.length).toBeGreaterThanOrEqual(3);
    expect(keys).toContain('TX|houston');
    expect(keys).toContain('MI|dearborn');
    expect(keys).toContain('PA|mechanicsburg');
  });

  it('validates completeness and provenance of all 9 mosque editorial entries', async () => {
    const keys = Object.keys(MOSQUE_EDITORIAL_REGISTRY);
    for (const key of keys) {
      const entry = MOSQUE_EDITORIAL_REGISTRY[key];
      expect(entry.slug).toBe(key);
      expect(entry.facilityName.length).toBeGreaterThan(3);
      expect(entry.headline.length).toBeGreaterThan(10);
      expect(entry.summary.length).toBeGreaterThan(100);
      expect(entry.locationContext.length).toBeGreaterThan(20);
      if (entry.slug === 'harrisburg-mosque') {
        expect(entry.confirmedServices).toEqual([]);
      } else {
        expect(entry.confirmedServices.length).toBeGreaterThanOrEqual(2);
      }
      expect(entry.verification.status).toBe('verified');
      expect(entry.verification.verifiedDate).toBe('2026-10-31');
      expect(entry.verification.sourceName.length).toBeGreaterThan(5);

      // Verify that this mosque exists in mosqueRepository and is verified
      const mosque = await mosqueRepository.findBySlug(entry.slug);
      expect(mosque).toBeDefined();
      expect(mosque?.dataStatus).toBe('verified');
    }
  });

  it('validates completeness and provenance of all 3 Phase 2 city editorial entries', async () => {
    const keys = ['TX|houston', 'MI|dearborn', 'PA|mechanicsburg'];
    for (const key of keys) {
      const entry = CITY_EDITORIAL_REGISTRY[key];
      expect(entry.stateCode.length).toBe(2);
      expect(entry.citySlug.length).toBeGreaterThan(2);
      expect(entry.headline.length).toBeGreaterThan(10);
      expect(entry.overview.length).toBeGreaterThan(50);
      expect(entry.communityContext.length).toBeGreaterThan(50);
      expect(entry.geographicDistribution.length).toBeGreaterThan(50);
      expect(entry.dataNotice.length).toBeGreaterThan(30);
      expect(entry.verification.verifiedDate).toBe('2026-10-31');

      // Verify that the city exists in cityRepository and meets >= 5 threshold
      const city = await cityRepository.getCityBySlug(entry.citySlug, true, entry.stateCode);
      expect(city).toBeDefined();
      expect(city?.mosqueCount).toBeGreaterThanOrEqual(5);
    }
  });

  it('returns undefined for non-pilot mosques and non-editorial cities (zero side effects on remaining inventory)', () => {
    expect(getMosqueEditorial('daly-city-musalla')).toBeUndefined();
    expect(getMosqueEditorial('non-pilot-mosque-slug')).toBeUndefined();
    expect(getCityEditorial('CA', 'san-francisco')).toBeUndefined();
    expect(getCityEditorial('CA', 'san-jose')).toBeUndefined();
    // Authorized subsequent Phase 4A Batch 2 city is now present
    expect(getCityEditorial('CA', 'los-angeles')).toBeDefined();
  });
});
