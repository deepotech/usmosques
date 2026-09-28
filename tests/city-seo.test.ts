import { describe, it, expect } from 'vitest';
import { cityRepository } from '@/lib/data/city-repository';
import { isCityEligibleForSeo, DEFAULT_CITY_SEO_CONFIG } from '@/lib/config/city-seo';
import { generateCityCollectionSchema } from '@/lib/seo/schema';

describe('City Aggregation and SEO Landing Pages', () => {
  it('aggregates all California cities accurately', async () => {
    const allCities = await cityRepository.getAllCities();
    expect(allCities.length).toBeGreaterThan(100);

    // Sacramento, Los Angeles, San Diego, Fremont should be among top cities
    const topCityNames = allCities.slice(0, 10).map(c => c.city);
    expect(topCityNames).toContain('Sacramento');
    expect(topCityNames).toContain('Los Angeles');
    expect(topCityNames).toContain('San Diego');
    expect(topCityNames).toContain('Fremont');
  });

  it('correctly filters excluded entities from mosque count', async () => {
    const allCities = await cityRepository.getAllCities();
    for (const city of allCities) {
      expect(city.mosqueCount).toBe(city.mosques.length);
      for (const m of city.mosques) {
        expect(m.dataStatus).not.toBe('excluded');
      }
    }
  });

  it('correctly classifies city tiers and SEO eligibility', async () => {
    const allCities = await cityRepository.getAllCities();
    for (const city of allCities) {
      if (city.mosqueCount >= 5) {
        expect(city.tier).toBe('tier_a');
        expect(city.isEligible).toBe(true);
      } else if (city.mosqueCount >= 2) {
        expect(city.tier).toBe('tier_b');
        expect(city.isEligible).toBe(false); // default config allowTierB is false
      } else {
        expect(city.tier).toBe('tier_c');
        expect(city.isEligible).toBe(false);
      }
    }
  });

  it('supports configurable SEO thresholds', () => {
    expect(isCityEligibleForSeo(5, DEFAULT_CITY_SEO_CONFIG)).toBe(true);
    expect(isCityEligibleForSeo(4, DEFAULT_CITY_SEO_CONFIG)).toBe(false);
    expect(isCityEligibleForSeo(1, DEFAULT_CITY_SEO_CONFIG)).toBe(false);

    // With Tier B enabled
    const tierBConfig = { minMosqueCount: 5, allowTierB: true };
    expect(isCityEligibleForSeo(3, tierBConfig)).toBe(true);
    expect(isCityEligibleForSeo(1, tierBConfig)).toBe(false);
  });

  it('computes city center coordinates centroid', async () => {
    const eligibleCities = await cityRepository.getEligibleCities();
    for (const city of eligibleCities) {
      expect(city.centerCoordinates).toBeDefined();
      expect(city.centerCoordinates?.latitude).toBeGreaterThan(32);
      expect(city.centerCoordinates?.latitude).toBeLessThan(42);
      expect(city.centerCoordinates?.longitude).toBeLessThan(-114);
      expect(city.centerCoordinates?.longitude).toBeGreaterThan(-125);
    }
  });

  it('retrieves eligible city by slug and rejects non-eligible', async () => {
    const sacramento = await cityRepository.getCityBySlug('sacramento');
    expect(sacramento).not.toBeNull();
    expect(sacramento?.city).toBe('Sacramento');
    expect(sacramento?.mosqueCount).toBeGreaterThanOrEqual(5);

    // Random non-existent slug
    const nonExistent = await cityRepository.getCityBySlug('atlantis-city');
    expect(nonExistent).toBeNull();
  });

  it('generates valid CollectionPage / ItemList schema for an eligible city', async () => {
    const fremont = await cityRepository.getCityBySlug('fremont');
    expect(fremont).not.toBeNull();

    if (fremont) {
      const schema = generateCityCollectionSchema(fremont);
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('CollectionPage');
      expect(schema.name).toContain('Fremont');
      expect(schema.mainEntity['@type']).toBe('ItemList');
      expect(schema.mainEntity.numberOfItems).toBe(fremont.mosqueCount);
      expect(schema.mainEntity.itemListElement.length).toBe(fremont.mosqueCount);
      expect(schema.mainEntity.itemListElement[0].url).toContain('/mosque/');
    }
  });

  it('provides related eligible cities for cross-linking without self-referencing', async () => {
    const related = await cityRepository.getRelatedEligibleCities('sacramento', 4);
    expect(related.length).toBe(4);
    expect(related.some(c => c.slug === 'sacramento')).toBe(false);
  });
});
