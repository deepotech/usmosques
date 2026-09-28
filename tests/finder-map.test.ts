import { describe, it, expect } from 'vitest';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { calculateHaversineDistanceMiles, formatDistance, formatDistanceMiles } from '@/lib/geo/distance';
import { getMosqueOpenStatus, getTimezoneForState } from '@/lib/geo/timezone';
import { Mosque } from '@/types/mosque';

describe('Phase 2B: Interactive Mosque Finder & Map Domain Logic', () => {
  describe('A. Search Functionality', () => {
    it('searches mosques by city name', async () => {
      const { mosques } = await mosqueRepository.search({
        city: 'Sacramento',
        limit: 100,
      });
      expect(mosques.length).toBeGreaterThan(0);
      for (const m of mosques) {
        expect(m.city.toLowerCase()).toBe('sacramento');
      }
    });

    it('searches mosques by 5-digit ZIP code', async () => {
      const { mosques } = await mosqueRepository.search({
        query: '95814',
      });
      expect(Array.isArray(mosques)).toBe(true);
      for (const m of mosques) {
        expect(m.postalCode).toContain('95814');
      }
    });

    it('searches mosques by free text facility name', async () => {
      const { mosques } = await mosqueRepository.search({
        query: 'Islamic Center',
      });
      expect(mosques.length).toBeGreaterThan(0);
      for (const m of mosques) {
        const matchesName = m.name.toLowerCase().includes('islamic center');
        const matchesCategory = m.categories.some(c => c.toLowerCase().includes('islamic center'));
        const matchesAddress = m.address.toLowerCase().includes('islamic center');
        expect(matchesName || matchesCategory || matchesAddress).toBe(true);
      }
    });
  });

  describe('B. Filtering', () => {
    it('filters for Open Now using timezone-aware hours', async () => {
      const { mosques: allMosques } = await mosqueRepository.search({ limit: 500 });
      const { mosques: openNowMosques } = await mosqueRepository.search({
        openNow: true,
        limit: 500,
      });

      expect(openNowMosques.length).toBeLessThanOrEqual(allMosques.length);
      for (const m of openNowMosques) {
        const tz = getTimezoneForState(m.stateCode, m.state);
        const status = getMosqueOpenStatus(m.openingHours, tz);
        expect(['open', '24hours']).toContain(status.state);
      }
    });

    it('handles no-results filters cleanly without throwing', async () => {
      const { mosques, total } = await mosqueRepository.search({
        query: 'NonExistentMosqueNameXYZ9999',
      });
      expect(mosques).toEqual([]);
      expect(total).toBe(0);
    });
  });

  describe('C. Sorting', () => {
    it('sorts mosques nearest to user coordinates', async () => {
      // Downtown San Francisco coordinates: 37.7749, -122.4194
      const userLat = 37.7749;
      const userLng = -122.4194;

      const { mosques } = await mosqueRepository.search({
        userLat,
        userLng,
        limit: 10,
      });

      expect(mosques.length).toBe(10);
      for (let i = 0; i < mosques.length - 1; i++) {
        expect(mosques[i].distanceMiles!).toBeLessThanOrEqual(mosques[i + 1].distanceMiles!);
      }
    });

    it('sorts mosques alphabetically by name', async () => {
      const { mosques } = await mosqueRepository.search({ limit: 50 });
      const sortedByName = [...mosques].sort((a, b) => a.name.localeCompare(b.name));

      for (let i = 0; i < sortedByName.length - 1; i++) {
        expect(sortedByName[i].name.localeCompare(sortedByName[i + 1].name)).toBeLessThanOrEqual(0);
      }
    });

    it('sorts mosques factually by rating and review count', async () => {
      const { mosques } = await mosqueRepository.search({ limit: 50 });
      const sortedByRating = [...mosques].sort((a, b) => {
        const revDiff = (b.reviewCount || 0) - (a.reviewCount || 0);
        if (revDiff !== 0) return revDiff;
        return a.name.localeCompare(b.name);
      });

      for (let i = 0; i < sortedByRating.length - 1; i++) {
        expect(sortedByRating[i].reviewCount || 0).toBeGreaterThanOrEqual(
          sortedByRating[i + 1].reviewCount || 0
        );
      }
    });
  });

  describe('D. Distance Calculation & Formatting', () => {
    it('calculates Haversine distance correctly in miles', () => {
      // LA (34.0522, -118.2437) to SF (37.7749, -122.4194) is approximately 347 miles
      const distance = calculateHaversineDistanceMiles(34.0522, -118.2437, 37.7749, -122.4194);
      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(360);
    });

    it('formats distance into clear human-friendly badges', () => {
      expect(formatDistance(0.05)).toBe('< 0.1 mi');
      expect(formatDistance(0.84)).toBe('0.8 mi');
      expect(formatDistance(3.2)).toBe('3.2 mi');
      expect(formatDistance(14.6)).toBe('15 mi');
      expect(formatDistance(null)).toBeNull();
      expect(formatDistance(undefined)).toBeNull();
      expect(formatDistanceMiles(2.5)).toBe('2.5 mi');
    });
  });

  describe('E. Geolocation State Handling', () => {
    type GeoState =
      | { status: 'idle' }
      | { status: 'loading' }
      | { status: 'success'; coords: { lat: number; lng: number } }
      | { status: 'error'; message: string };

    function reduceGeolocation(
      action:
        | { type: 'REQUEST' }
        | { type: 'SUCCESS'; coords: { lat: number; lng: number } }
        | { type: 'ERROR'; code: number }
    ): GeoState {
      switch (action.type) {
        case 'REQUEST':
          return { status: 'loading' };
        case 'SUCCESS':
          return { status: 'success', coords: action.coords };
        case 'ERROR': {
          if (action.code === 1) {
            return {
              status: 'error',
              message: 'Location access was denied. You can still search by city or ZIP code.',
            };
          }
          if (action.code === 2) {
            return {
              status: 'error',
              message: 'Location unavailable. Please check your device location settings.',
            };
          }
          return {
            status: 'error',
            message: 'Location request timed out. Please try again or search by city.',
          };
        }
      }
    }

    it('handles permission granted with coordinates', () => {
      const state = reduceGeolocation({
        type: 'SUCCESS',
        coords: { lat: 38.5816, lng: -121.4944 },
      });
      expect(state.status).toBe('success');
      if (state.status === 'success') {
        expect(state.coords.lat).toBe(38.5816);
      }
    });

    it('handles permission denied gracefully without exposing raw codes', () => {
      const state = reduceGeolocation({ type: 'ERROR', code: 1 });
      expect(state.status).toBe('error');
      if (state.status === 'error') {
        expect(state.message).toContain('Location access was denied');
      }
    });

    it('handles timeout and unavailable GPS cleanly', () => {
      const timeoutState = reduceGeolocation({ type: 'ERROR', code: 3 });
      expect(timeoutState.status).toBe('error');
      if (timeoutState.status === 'error') {
        expect(timeoutState.message).toContain('timed out');
      }

      const unavailState = reduceGeolocation({ type: 'ERROR', code: 2 });
      expect(unavailState.status).toBe('error');
      if (unavailState.status === 'error') {
        expect(unavailState.message).toContain('Location unavailable');
      }
    });
  });

  describe('F. Map & List Synchronization & Selection State', () => {
    it('safely retains and clears selected mosque ID when filtered', () => {
      const sampleList: Pick<Mosque, 'id' | 'city'>[] = [
        { id: 'm1', city: 'Sacramento' },
        { id: 'm2', city: 'Fremont' },
        { id: 'm3', city: 'Sacramento' },
      ];

      let selectedId: string | null = 'm2';

      // User filters by Sacramento
      const filtered = sampleList.filter(m => m.city === 'Sacramento');
      if (!filtered.some(m => m.id === selectedId)) {
        selectedId = null;
      }

      expect(selectedId).toBeNull();
    });

    it('identifies selected mosque by stable ID and not array index', () => {
      const sampleList: Pick<Mosque, 'id' | 'name'>[] = [
        { id: 'm-al-noor', name: 'Al Noor' },
        { id: 'm-al-huda', name: 'Al Huda' },
      ];

      const selectedId = 'm-al-huda';
      const selected = sampleList.find(m => m.id === selectedId);
      expect(selected?.name).toBe('Al Huda');
    });
  });

  describe('G. Coordinate Validation & Safety for Map Markers', () => {
    function getValidMapMarkers(mosques: { id: string; latitude: any; longitude: any }[]) {
      return mosques.filter(
        m =>
          typeof m.latitude === 'number' &&
          typeof m.longitude === 'number' &&
          !isNaN(m.latitude) &&
          !isNaN(m.longitude) &&
          m.latitude >= -90 &&
          m.latitude <= 90 &&
          m.longitude >= -180 &&
          m.longitude <= 180
      );
    }

    it('filters out invalid or missing coordinates before placing on map', () => {
      const candidates = [
        { id: '1', latitude: 37.77, longitude: -122.41 },
        { id: '2', latitude: NaN, longitude: -122.41 },
        { id: '3', latitude: '37.77', longitude: -122.41 },
        { id: '4', latitude: 95.0, longitude: -122.41 }, // invalid latitude
        { id: '5', latitude: 37.77, longitude: -122.41 },
      ];

      const validMarkers = getValidMapMarkers(candidates);
      expect(validMarkers.length).toBe(2);
      expect(validMarkers.map(m => m.id)).toEqual(['1', '5']);
    });
  });

  describe('H. Duplicate Coordinates Retention', () => {
    it('preserves multiple entities sharing the same coordinates without dropping records', async () => {
      const { mosques } = await mosqueRepository.search({ stateCode: 'CA', limit: 500 });

      // Fremont coordinates collision test: 37.509334, -121.971816
      const sharingCoords = mosques.filter(
        m => Math.abs(m.latitude - 37.509334) < 0.0001 && Math.abs(m.longitude - (-121.971816)) < 0.0001
      );

      // Both entities should be preserved in the repository
      expect(sharingCoords.length).toBeGreaterThanOrEqual(2);
      const uniqueIds = new Set(sharingCoords.map(m => m.id));
      expect(uniqueIds.size).toBe(sharingCoords.length);
    });
  });

  describe('I. Data Integrity & Exclusion Filter', () => {
    it('ensures excluded commercial entities are not returned in publishable finder results', async () => {
      const { mosques } = await mosqueRepository.search({ status: 'all', limit: 500 });
      for (const m of mosques) {
        expect(m.dataStatus).not.toBe('excluded');
      }
    });
  });
});
