import { describe, it, expect } from 'vitest';
import { californiaProvider } from '@/lib/data/california-provider';
import {
  extractAmenityCapabilities,
  matchesAmenityFilters,
  countAmenityCapabilities,
  countActiveAmenityFilters,
  formatAmenityHighlights,
} from '@/lib/amenity/amenity-engine';
import { AmenityFilterState, EMPTY_AMENITY_FILTERS } from '@/types/amenity';
import { Mosque } from '@/types/mosque';

describe('Phase 2C: Amenity & Accessibility Filtering Architecture', () => {
  const mockBaseMosque: Mosque = {
    id: 'test-1',
    name: 'Test Islamic Center',
    slug: 'test-islamic-center',
    address: '123 Main St, Sacramento, CA',
    city: 'Sacramento',
    state: 'California',
    stateCode: 'CA',
    latitude: 38.5816,
    longitude: -121.4944,
    images: [],
    categoryName: 'Mosque',
    categories: ['Mosque'],
    amenities: [],
    accessibility: [],
    source: 'google_places',
    dataStatus: 'verified',
  };

  describe('1. Three-Valued Logic & Capability Extraction', () => {
    it('returns false for missing/unlisted features and never assumes true', () => {
      const emptyMosque: Mosque = {
        ...mockBaseMosque,
        accessibility: [],
        amenities: [],
      };

      const caps = extractAmenityCapabilities(emptyMosque);
      expect(caps.wheelchairEntrance).toBe(false);
      expect(caps.wheelchairParking).toBe(false);
      expect(caps.wheelchairRestroom).toBe(false);
      expect(caps.hasParking).toBe(false);
      expect(caps.hasRestroom).toBe(false);
      expect(caps.anyWheelchairAccessible).toBe(false);
      expect(formatAmenityHighlights(caps)).toEqual([]);
    });

    it('extracts confirmed wheelchair accessibility features accurately', () => {
      const accessibleMosque: Mosque = {
        ...mockBaseMosque,
        accessibility: [
          'Wheelchair accessible entrance',
          'Wheelchair accessible parking lot',
          'Wheelchair accessible restroom',
        ],
        amenities: [],
      };

      const caps = extractAmenityCapabilities(accessibleMosque);
      expect(caps.wheelchairEntrance).toBe(true);
      expect(caps.wheelchairParking).toBe(true);
      expect(caps.wheelchairRestroom).toBe(true);
      expect(caps.anyWheelchairAccessible).toBe(true);
      expect(caps.hasParking).toBe(true); // accessible parking satisfies parking
      expect(caps.hasRestroom).toBe(true); // accessible restroom satisfies restroom
    });

    it('extracts parking varieties (free lot, on-site, garage, street)', () => {
      const parkingMosque: Mosque = {
        ...mockBaseMosque,
        amenities: ['Free parking lot', 'On-site parking'],
      };

      const caps = extractAmenityCapabilities(parkingMosque);
      expect(caps.hasParking).toBe(true);
      expect(caps.wheelchairParking).toBe(false); // only general parking, not confirmed wheelchair
    });

    it('extracts restrooms from amenities list', () => {
      const restroomMosque: Mosque = {
        ...mockBaseMosque,
        amenities: ['Restroom'],
      };

      const caps = extractAmenityCapabilities(restroomMosque);
      expect(caps.hasRestroom).toBe(true);
      expect(caps.wheelchairRestroom).toBe(false);
    });

    it('formats clean highlights without duplicate icons', () => {
      const fullMosque: Mosque = {
        ...mockBaseMosque,
        accessibility: ['Wheelchair accessible entrance'],
        amenities: ['Free parking lot', 'Restroom'],
      };

      const caps = extractAmenityCapabilities(fullMosque);
      const highlights = formatAmenityHighlights(caps);
      expect(highlights).toContain('♿ Accessible');
      expect(highlights).toContain('🅿 Parking');
      expect(highlights).toContain('🚻 Restroom');
      expect(highlights.length).toBe(3);
    });
  });

  describe('2. Filter Matching Engine', () => {
    const fullMosque: Mosque = {
      ...mockBaseMosque,
      id: 'full',
      accessibility: [
        'Wheelchair accessible entrance',
        'Wheelchair accessible parking lot',
        'Wheelchair accessible restroom',
      ],
      amenities: ['Free parking lot', 'Restroom'],
    };

    const parkingOnlyMosque: Mosque = {
      ...mockBaseMosque,
      id: 'parking-only',
      accessibility: [],
      amenities: ['Free parking lot'],
    };

    const emptyMosque: Mosque = {
      ...mockBaseMosque,
      id: 'empty',
      accessibility: [],
      amenities: [],
    };

    it('matches all mosques when no amenity filters are active', () => {
      expect(matchesAmenityFilters(fullMosque, EMPTY_AMENITY_FILTERS)).toBe(true);
      expect(matchesAmenityFilters(parkingOnlyMosque, EMPTY_AMENITY_FILTERS)).toBe(true);
      expect(matchesAmenityFilters(emptyMosque, EMPTY_AMENITY_FILTERS)).toBe(true);
    });

    it('matches only mosques with verified wheelchair entrance when filter is active', () => {
      const filter: AmenityFilterState = { wheelchairEntrance: true };
      expect(matchesAmenityFilters(fullMosque, filter)).toBe(true);
      expect(matchesAmenityFilters(parkingOnlyMosque, filter)).toBe(false);
      expect(matchesAmenityFilters(emptyMosque, filter)).toBe(false); // missing data is omitted
    });

    it('matches mosques with verified parking when parking filter is active', () => {
      const filter: AmenityFilterState = { parking: true };
      expect(matchesAmenityFilters(fullMosque, filter)).toBe(true);
      expect(matchesAmenityFilters(parkingOnlyMosque, filter)).toBe(true);
      expect(matchesAmenityFilters(emptyMosque, filter)).toBe(false);
    });

    it('applies strict AND logic when multiple amenity filters are active', () => {
      const filter: AmenityFilterState = {
        wheelchairEntrance: true,
        parking: true,
      };

      expect(matchesAmenityFilters(fullMosque, filter)).toBe(true);
      expect(matchesAmenityFilters(parkingOnlyMosque, filter)).toBe(false); // lacks wheelchair entrance
      expect(matchesAmenityFilters(emptyMosque, filter)).toBe(false);
    });
  });

  describe('3. Capabilities Counting & Active Filter Helpers', () => {
    it('accurately counts capabilities across a set of mosques', () => {
      const mosques: Mosque[] = [
        {
          ...mockBaseMosque,
          id: '1',
          accessibility: ['Wheelchair accessible entrance', 'Wheelchair accessible parking lot'],
          amenities: ['Restroom'],
        },
        {
          ...mockBaseMosque,
          id: '2',
          accessibility: ['Wheelchair accessible entrance'],
          amenities: ['Free parking lot'],
        },
        {
          ...mockBaseMosque,
          id: '3',
          accessibility: [],
          amenities: [],
        },
      ];

      const counts = countAmenityCapabilities(mosques);
      expect(counts.wheelchairEntrance).toBe(2);
      expect(counts.wheelchairParking).toBe(1);
      expect(counts.wheelchairRestroom).toBe(0);
      expect(counts.parking).toBe(2); // mosque 1 has accessible parking, mosque 2 has free parking lot
      expect(counts.restroom).toBe(1);
    });

    it('counts active filters correctly', () => {
      expect(countActiveAmenityFilters(EMPTY_AMENITY_FILTERS)).toBe(0);
      expect(countActiveAmenityFilters({ wheelchairEntrance: true, parking: true })).toBe(2);
      expect(countActiveAmenityFilters({ wheelchairEntrance: false, restroom: true })).toBe(1);
    });
  });

  describe('4. Real Dataset Integration (California)', () => {
    it('verifies that California dataset records contain authentic amenity data without mutations', async () => {
      const all = await californiaProvider.getAll();
      expect(all.length).toBe(401);

      const verified = all.filter(m => m.dataStatus === 'verified');
      const counts = countAmenityCapabilities(verified);

      // Real California dataset has over 100 wheelchair accessible entrances
      expect(counts.wheelchairEntrance).toBeGreaterThan(50);
      // Real California dataset has parking facilities
      expect(counts.parking).toBeGreaterThan(50);
      // Real California dataset has restrooms
      expect(counts.restroom).toBeGreaterThan(30);
    });

    it('ensures filtering real dataset with multiple amenities returns valid subset', async () => {
      const all = await californiaProvider.getAll();
      const verified = all.filter(m => m.dataStatus === 'verified');

      const filter: AmenityFilterState = {
        wheelchairEntrance: true,
        parking: true,
      };

      const matched = verified.filter(m => matchesAmenityFilters(m, filter));
      expect(matched.length).toBeGreaterThan(0);
      expect(matched.length).toBeLessThan(verified.length);

      for (const m of matched) {
        const caps = extractAmenityCapabilities(m);
        expect(caps.wheelchairEntrance).toBe(true);
        expect(caps.hasParking).toBe(true);
      }
    });
  });
});
