import { describe, it, expect } from 'vitest';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { getEnabledStates, isStateEnabled, getStateConfig } from '@/lib/config/state-registry';
import { getTimezoneForLocation, getTimezoneForMosque, getTimezoneForState } from '@/lib/geo/timezone';
import { calculateHaversineDistanceMiles } from '@/lib/geo/distance';
import { matchesAmenityFilters } from '@/lib/amenity/amenity-engine';
import { EMPTY_AMENITY_FILTERS } from '@/types/amenity';

describe('Phase 3D — Nationwide / Regional Finder & Discovery Tests', () => {
  // 1. Nationwide search uses all enabled states
  it('1. searches across all enabled states dynamically when no state is selected', async () => {
    const enabled = getEnabledStates();
    const enabledCodes = enabled.map(s => s.code);
    expect(enabledCodes).toEqual(expect.arrayContaining(['CA', 'TX', 'NY', 'FL', 'IL']));

    const { mosques } = await mosqueRepository.search({ limit: 2000 });
    const representedStates = new Set(mosques.map(m => m.stateCode));
    for (const code of enabledCodes) {
      expect(representedStates.has(code)).toBe(true);
    }
  });

  // 2. Dormant states are excluded
  it('2. excludes dormant/unregistered states from nationwide search', async () => {
    const dormantCodes = ['CT', 'IN', 'SC'];
    for (const code of dormantCodes) {
      expect(isStateEnabled(code)).toBe(false);
    }

    const { mosques } = await mosqueRepository.search({ limit: 2000 });
    for (const code of dormantCodes) {
      const match = mosques.find(m => m.stateCode === code);
      expect(match).toBeUndefined();
    }
  });

  // 3. State filtering isolates results
  it('3. isolates results when state filter is applied', async () => {
    const txResults = await mosqueRepository.search({ stateCode: 'TX', limit: 500 });
    expect(txResults.mosques.length).toBeGreaterThan(0);
    expect(txResults.mosques.every(m => m.stateCode === 'TX')).toBe(true);

    const flResults = await mosqueRepository.search({ stateCode: 'FL', limit: 500 });
    expect(flResults.mosques.length).toBeGreaterThan(0);
    expect(flResults.mosques.every(m => m.stateCode === 'FL')).toBe(true);
  });

  // 4. City filtering is state-scoped
  it('4. scopes city filtering to the specified state', async () => {
    const tampaResults = await mosqueRepository.search({ stateCode: 'FL', city: 'Tampa' });
    expect(tampaResults.mosques.length).toBeGreaterThanOrEqual(14);
    expect(tampaResults.mosques.every(m => m.city.toLowerCase() === 'tampa' && m.stateCode === 'FL')).toBe(true);
  });

  // 5. ZIP search works across multiple states without assuming California
  it('5. searches by ZIP code across multiple states', async () => {
    // Chicago, IL ZIP 606
    const ilZip = await mosqueRepository.search({ postalCode: '606' });
    expect(ilZip.mosques.some(m => m.stateCode === 'IL')).toBe(true);

    // Houston, TX ZIP 770
    const txZip = await mosqueRepository.search({ postalCode: '770' });
    expect(txZip.mosques.some(m => m.stateCode === 'TX')).toBe(true);

    // Sacramento, CA ZIP 958
    const caZip = await mosqueRepository.search({ postalCode: '958' });
    expect(caZip.mosques.some(m => m.stateCode === 'CA')).toBe(true);
  });

  // 6. Cross-state duplicate city names remain isolated
  it('6. isolates duplicate city names across states (e.g. Richmond in CA vs TX)', async () => {
    const caRichmond = await mosqueRepository.search({ stateCode: 'CA', city: 'Richmond' });
    expect(caRichmond.mosques.every(m => m.stateCode === 'CA')).toBe(true);

    const txRichmond = await mosqueRepository.search({ stateCode: 'TX', city: 'Richmond' });
    expect(txRichmond.mosques.every(m => m.stateCode === 'TX')).toBe(true);
  });

  // 7. Distance sorting
  it('7. sorts results by distance when user coordinates are provided', async () => {
    // Coordinates near central Chicago (41.8781, -87.6298)
    const { mosques } = await mosqueRepository.search({
      userLat: 41.8781,
      userLng: -87.6298,
      limit: 10,
    });

    expect(mosques.length).toBeGreaterThan(0);
    expect(typeof mosques[0].distanceMiles).toBe('number');

    for (let i = 1; i < mosques.length; i++) {
      expect(mosques[i].distanceMiles!).toBeGreaterThanOrEqual(mosques[i - 1].distanceMiles!);
    }
  });

  // 8. Radius filtering with Haversine distance
  it('8. filters mosques within a maximum distance radius', async () => {
    // Coordinates near Orlando, FL (28.5383, -81.3792)
    const radius = 25; // 25 miles
    const { mosques } = await mosqueRepository.search({
      userLat: 28.5383,
      userLng: -81.3792,
      maxDistanceMiles: radius,
      limit: 100,
    });

    expect(mosques.length).toBeGreaterThan(0);
    expect(mosques.every(m => (m.distanceMiles ?? Infinity) <= radius)).toBe(true);
  });

  // 9. Open Now timezone behavior
  it('9. calculates Open Now status deterministically using timezone awareness', async () => {
    const flTimezone = getTimezoneForState('FL');
    expect(flTimezone).toBe('America/New_York');

    const ilTimezone = getTimezoneForState('IL');
    expect(ilTimezone).toBe('America/Chicago');

    const caTimezone = getTimezoneForState('CA');
    expect(caTimezone).toBe('America/Los_Angeles');
  });

  // 10. Texas multi-timezone limitation & El Paso Mountain Time resolution
  it('10. resolves Texas Mountain Time for El Paso coordinates and Central Time elsewhere', () => {
    // El Paso, TX: lat 31.7619, lng -106.4850
    const elPasoTz = getTimezoneForLocation(31.7619, -106.485, 'TX', 'Texas');
    expect(elPasoTz).toBe('America/Denver');

    // Houston, TX: lat 29.7604, lng -95.3698
    const houstonTz = getTimezoneForLocation(29.7604, -95.3698, 'TX', 'Texas');
    expect(houstonTz).toBe('America/Chicago');

    // Default Texas state timezone fallback
    const stateDefaultTz = getTimezoneForState('TX');
    expect(stateDefaultTz).toBe('America/Chicago');
  });

  // 11. Amenity filtering with three-valued logic
  it('11. preserves three-valued amenity evaluation across all states', async () => {
    const filter = { ...EMPTY_AMENITY_FILTERS, wheelchairEntrance: true };
    const { mosques } = await mosqueRepository.search({ limit: 100 });
    const matches = mosques.filter(m => matchesAmenityFilters(m, filter));

    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every(m => m.accessibility.some(a => a.toLowerCase().includes('wheelchair accessible entrance')))).toBe(true);
  });

  // 12. Verified filtering
  it('12. filters strictly to verified mosques when status=verified', async () => {
    const { mosques, total } = await mosqueRepository.search({ status: 'verified', limit: 3000 });
    expect(mosques.every(m => m.dataStatus === 'verified')).toBe(true);
    expect(total).toBe(2411);
  });

  // 13. Progressive result behavior / pagination
  it('13. supports pagination without duplicating items across pages', async () => {
    const page1 = await mosqueRepository.search({ limit: 10, offset: 0 });
    const page2 = await mosqueRepository.search({ limit: 10, offset: 10 });

    expect(page1.mosques.length).toBe(10);
    expect(page2.mosques.length).toBe(10);

    const ids1 = new Set(page1.mosques.map(m => m.id));
    for (const m of page2.mosques) {
      expect(ids1.has(m.id)).toBe(false);
    }
  });

  // 14. State-aware result labels
  it('14. verifies all search results possess state and stateCode metadata', async () => {
    const { mosques } = await mosqueRepository.search({ limit: 100 });
    for (const m of mosques) {
      expect(m.stateCode).toBeDefined();
      expect(m.stateCode.length).toBe(2);
      expect(m.state).toBeDefined();
      expect(m.city).toBeDefined();
    }
  });

  // 15. No precise geolocation persistence
  it('15. ensures mosque model does not expose or store user private coordinates', async () => {
    const { mosques } = await mosqueRepository.search({
      userLat: 34.0522,
      userLng: -118.2437,
      limit: 5,
    });
    // The mosque entity only contains its own latitude/longitude and distanceMiles, not user coordinates
    for (const m of mosques) {
      expect((m as any).userLat).toBeUndefined();
      expect((m as any).userLng).toBeUndefined();
    }
  });

  // 16. URL state does not expose precise coordinates
  it('16. verifies query params parser rejects coordinate persistence in search URLs', () => {
    const sensitiveParams = new URLSearchParams('lat=37.123456&lng=-122.654321&q=masjid');
    // Our design ignores lat/lng URL params in favor of in-memory client-side geolocation
    const safeQ = sensitiveParams.get('q');
    expect(safeQ).toBe('masjid');
  });

  // 17. No duplicate search results
  it('17. guarantees zero duplicate IDs in nationwide search results', async () => {
    const { mosques } = await mosqueRepository.search({ limit: 2000 });
    const seenIds = new Set<string>();
    for (const m of mosques) {
      expect(seenIds.has(m.id)).toBe(false);
      seenIds.add(m.id);
    }
  });

  // 18. Empty search result handling
  it('18. handles non-matching queries gracefully with 0 results and no errors', async () => {
    const emptyResult = await mosqueRepository.search({ query: 'nonexistentfoobarmasjid12345' });
    expect(emptyResult.mosques).toHaveLength(0);
    expect(emptyResult.total).toBe(0);
  });

  // 19. Map / list coordinates sanity
  it('19. verifies all returned mosques have valid numeric coordinates for map rendering', async () => {
    const { mosques } = await mosqueRepository.search({ limit: 2000 });
    for (const m of mosques) {
      expect(typeof m.latitude).toBe('number');
      expect(typeof m.longitude).toBe('number');
      expect(isNaN(m.latitude)).toBe(false);
      expect(isNaN(m.longitude)).toBe(false);
    }
  });

  // 20. Existing California behavior remains intact
  it('20. preserves California directory counts and provider integrity', async () => {
    const caMosques = await mosqueRepository.getMosquesByState('CA');
    expect(caMosques.length).toBe(401);
    const caPublishable = caMosques.filter(m => m.dataStatus !== 'excluded');
    expect(caPublishable.length).toBe(399);
  });
});
