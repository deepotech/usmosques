import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { validateDataset, RawMosqueRecordSchema } from '@/lib/data/validation';
import {
  normalizeMosqueRecord,
  normalizeMosqueDataset,
  slugify,
  normalizePhone,
  normalizeWebsite,
  parseAddressFallback,
  determineDataStatus,
} from '@/lib/data/normalization';
import { calculateHaversineDistanceMiles, formatDistanceMiles } from '@/lib/geo/distance';
import { getMosqueOpenStatus } from '@/lib/geo/timezone';
import { MosqueRepository } from '@/lib/data/mosque-repository';

// Read raw California dataset
const rawPath = path.join(process.cwd(), 'data', 'raw', 'california.json');
const rawRecords = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));

describe('Phase 1: California Dataset Validation & Quality Tests', () => {
  it('validates all 401 California records against Zod schema', () => {
    expect(Array.isArray(rawRecords)).toBe(true);
    expect(rawRecords.length).toBe(401);

    const report = validateDataset(rawRecords);
    expect(report.totalRecords).toBe(401);
    expect(report.validSchemaCount).toBe(401);
    expect(report.invalidSchemaCount).toBe(0);
    expect(report.issues.filter(i => i.severity === 'error').length).toBe(0);
  });

  it('detects duplicate coordinates and duplicate addresses', () => {
    const report = validateDataset(rawRecords);
    // Duplicate coordinates
    expect(report.duplicateCoordinates.length).toBeGreaterThan(0);
    const albraeDup = report.duplicateCoordinates.find(
      c => c.coords.startsWith('37.509334')
    );
    expect(albraeDup).toBeDefined();
    expect(albraeDup?.records.length).toBe(2);

    // Duplicate addresses (e.g. shared building facilities)
    expect(report.duplicateAddresses.length).toBeGreaterThan(0);
  });

  it('detects missing fields in raw data and parses fallback', () => {
    const report = validateDataset(rawRecords);
    // Exactly 2 records in raw data had missing city and state
    expect(report.missingCityCount).toBe(2);
    expect(report.missingStateCount).toBe(2);

    // Test fallback parser
    const fallbackSample = parseAddressFallback('3852 Akers Rd, Bakersfield, CA 93309');
    expect(fallbackSample.city).toBe('Bakersfield');
    expect(fallbackSample.stateCode).toBe('CA');
    expect(fallbackSample.postalCode).toBe('93309');
  });

  it('detects and cleans malformed URLs', () => {
    expect(normalizeWebsite('not-a-url')).toBeUndefined();
    expect(normalizeWebsite('javascript:alert(1)')).toBeUndefined();
    expect(normalizeWebsite('https://islamiccenter.org')).toBe('https://islamiccenter.org/');
  });

  it('normalizes phone numbers to standard format', () => {
    expect(normalizePhone('5551234567')).toBe('(555) 123-4567');
    expect(normalizePhone('15551234567')).toBe('(555) 123-4567');
    expect(normalizePhone('')).toBeUndefined();
    expect(normalizePhone(null)).toBeUndefined();
  });

  it('accurately classifies data status for commercial shops vs mosques', () => {
    const freshKabab = rawRecords.find((r: any) => r.title.includes('Fresh Kabab'));
    expect(freshKabab).toBeDefined();
    const kababStatus = determineDataStatus(freshKabab);
    expect(kababStatus.status).toBe('excluded');

    const regularMosque = rawRecords.find((r: any) => r.title.includes('Islamic Center of Davis'));
    expect(regularMosque).toBeDefined();
    const regularStatus = determineDataStatus(regularMosque);
    expect(regularStatus.status).toBe('verified');
  });

  it('MUST NOT mutate the raw records during normalization', () => {
    const sampleRaw = JSON.parse(JSON.stringify(rawRecords[0]));
    const sampleRawSnapshot = JSON.stringify(sampleRaw);

    const normalized = normalizeMosqueRecord(sampleRaw, 0);

    expect(JSON.stringify(sampleRaw)).toBe(sampleRawSnapshot);
    expect(normalized.name).toBe(sampleRaw.title);
  });

  it('normalizes the complete California dataset successfully with unique slugs', () => {
    const normalized = normalizeMosqueDataset(rawRecords);
    expect(normalized.length).toBe(401);

    const slugs = new Set<string>();
    normalized.forEach(m => {
      expect(slugs.has(m.slug)).toBe(false);
      slugs.add(m.slug);
      expect(m.name).toBeTruthy();
      expect(m.address).toBeTruthy();
      expect(m.city).toBeTruthy();
      expect(m.state).toBeTruthy();
      expect(typeof m.latitude).toBe('number');
      expect(typeof m.longitude).toBe('number');
    });
  });
});

describe('Phase 1: Geolocation & Distance Calculation', () => {
  it('calculates Haversine distance correctly in miles', () => {
    // Distance between Sacramento (38.5816, -121.4944) and Davis (38.5449, -121.7405) is ~13-14 miles
    const dist = calculateHaversineDistanceMiles(38.5816, -121.4944, 38.5449, -121.7405);
    expect(dist).toBeGreaterThan(12);
    expect(dist).toBeLessThan(16);

    // Same coordinates distance is 0
    expect(calculateHaversineDistanceMiles(38.5, -121.5, 38.5, -121.5)).toBe(0);

    // Invalid coordinates return Infinity
    expect(calculateHaversineDistanceMiles(999, 0, 0, 0)).toBe(Infinity);
  });

  it('formats distance into human-friendly badge string', () => {
    expect(formatDistanceMiles(0.05)).toBe('< 0.1 mi');
    expect(formatDistanceMiles(1.23)).toBe('1.2 mi');
    expect(formatDistanceMiles(14.8)).toBe('15 mi');
    expect(formatDistanceMiles(undefined)).toBeNull();
    expect(formatDistanceMiles(Infinity)).toBeNull();
  });
});

describe('Phase 1: Timezone & Opening Status', () => {
  it('handles missing opening hours by returning "Hours not listed" and never "Closed"', () => {
    const statusEmpty = getMosqueOpenStatus([]);
    expect(statusEmpty.state).toBe('unknown');
    expect(statusEmpty.label).toBe('Hours not listed');

    const statusNull = getMosqueOpenStatus(null);
    expect(statusNull.state).toBe('unknown');
    expect(statusNull.label).toBe('Hours not listed');
  });

  it('correctly handles Open 24 hours', () => {
    const hours = [{ day: 'Monday', hours: 'Open 24 hours' }];
    // Create a date that is Monday in Pacific timezone: e.g. 2026-09-28 12:00:00 UTC (Monday 5 AM PDT)
    const testDate = new Date('2026-09-28T12:00:00Z');
    const status = getMosqueOpenStatus(hours, 'America/Los_Angeles', testDate);
    expect(status.state).toBe('24hours');
    expect(status.label).toBe('Open 24 Hours');
  });

  it('correctly evaluates standard opening hours slots', () => {
    const hours = [
      { day: 'Monday', hours: '9 AM to 5 PM' },
      { day: 'Tuesday', hours: 'Closed' },
    ];
    // Monday at 2 PM PDT (21:00 UTC) -> Open
    const monday2pm = new Date('2026-09-28T21:00:00Z');
    const statusOpen = getMosqueOpenStatus(hours, 'America/Los_Angeles', monday2pm);
    expect(statusOpen.state).toBe('open');

    // Monday at 8 PM PDT (Tuesday 03:00 UTC) -> Closed
    const monday8pm = new Date('2026-09-29T03:00:00Z');
    const statusClosed = getMosqueOpenStatus(hours, 'America/Los_Angeles', monday8pm);
    expect(statusClosed.state).toBe('closed');
  });
});

describe('Phase 1: Mosque Repository & Search Functionality', () => {
  const repo = new MosqueRepository();

  it('searches mosques by city', async () => {
    const { mosques, total } = await repo.search({ city: 'Sacramento' });
    expect(total).toBeGreaterThan(0);
    mosques.forEach(m => {
      expect(m.city.toLowerCase()).toBe('sacramento');
    });
  });

  it('searches mosques by ZIP code', async () => {
    const { mosques } = await repo.search({ postalCode: '95828' });
    expect(mosques.length).toBeGreaterThan(0);
    mosques.forEach(m => {
      expect(m.postalCode?.startsWith('95828')).toBe(true);
    });
  });

  it('searches mosques by free text query', async () => {
    const { mosques } = await repo.search({ query: 'Davis' });
    expect(mosques.length).toBeGreaterThan(0);
    const found = mosques.some(m => m.name.includes('Davis') || m.city.includes('Davis'));
    expect(found).toBe(true);
  });

  it('sorts mosques nearest to given user coordinates', async () => {
    // User in Sacramento (38.5816, -121.4944)
    const { mosques } = await repo.search({
      userLat: 38.5816,
      userLng: -121.4944,
      limit: 10,
    });

    expect(mosques.length).toBeGreaterThan(0);
    expect(mosques[0].distanceMiles).toBeDefined();

    for (let i = 0; i < mosques.length - 1; i++) {
      expect(mosques[i].distanceMiles!).toBeLessThanOrEqual(mosques[i + 1].distanceMiles!);
    }
  });

  it('retrieves mosque by slug', async () => {
    const { mosques } = await repo.search({ limit: 1 });
    const target = mosques[0];
    const found = await repo.findBySlug(target.slug);
    expect(found).toBeDefined();
    expect(found?.id).toBe(target.id);
  });
});
