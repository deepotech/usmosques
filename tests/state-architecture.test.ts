import { describe, it, expect } from 'vitest';
import {
  getStateConfig,
  getEnabledStates,
  isStateEnabled,
  getDefaultState,
  normalizeStateCode,
} from '@/lib/config/state-registry';
import { validateStateBoundary, ingestStateDataset } from '@/lib/data/state-ingestion';
import { GenericStateProvider } from '@/lib/data/state-provider';
import { MosqueRepository } from '@/lib/data/mosque-repository';
import { CityRepository } from '@/lib/data/city-repository';
import { getTimezoneForState } from '@/lib/geo/timezone';
import sitemap from '@/app/sitemap';

describe('Phase 3A: State Registry & Configuration', () => {
  it('correctly normalizes state codes regardless of casing or whitespace', () => {
    expect(normalizeStateCode('ca')).toBe('CA');
    expect(normalizeStateCode('  Tx  ')).toBe('TX');
    expect(normalizeStateCode('ny')).toBe('NY');
    expect(normalizeStateCode('')).toBe('');
  });

  it('retrieves valid state configurations for supported states', () => {
    const ca = getStateConfig('CA');
    expect(ca).toBeDefined();
    expect(ca?.name).toBe('California');
    expect(ca?.code).toBe('CA');
    expect(ca?.enabled).toBe(true);

    const tx = getStateConfig('tx');
    expect(tx).toBeDefined();
    expect(tx?.name).toBe('Texas');
    expect(tx?.code).toBe('TX');
    expect(tx?.enabled).toBe(false); // Dormant in Phase 3A

    const ny = getStateConfig('NY');
    expect(ny).toBeDefined();
    expect(ny?.name).toBe('New York');
    expect(ny?.enabled).toBe(false); // Dormant in Phase 3A
  });

  it('enforces that only California is currently enabled', () => {
    const enabled = getEnabledStates();
    expect(enabled.length).toBe(1);
    expect(enabled[0].code).toBe('CA');

    expect(isStateEnabled('CA')).toBe(true);
    expect(isStateEnabled('TX')).toBe(false);
    expect(isStateEnabled('NY')).toBe(false);
    expect(isStateEnabled('FL')).toBe(false);
  });

  it('falls back to default state (California) for unknown inputs', () => {
    const def = getDefaultState();
    expect(def.code).toBe('CA');

    const unknown = getStateConfig('ZZ');
    expect(unknown).toBeUndefined();
  });
});

describe('Phase 3A: State Boundary Validation', () => {
  it('validates coordinates located inside state bounding box', () => {
    // Los Angeles, CA
    expect(validateStateBoundary(34.0522, -118.2437, 'CA')).toBe(true);
    // Houston, TX
    expect(validateStateBoundary(29.7604, -95.3698, 'TX')).toBe(true);
    // NYC, NY
    expect(validateStateBoundary(40.7128, -74.006, 'NY')).toBe(true);
  });

  it('detects boundary mismatches when coordinates are outside the state', () => {
    // New York coordinates checked against California
    expect(validateStateBoundary(40.7128, -74.006, 'CA')).toBe(false);
    // California coordinates checked against Texas
    expect(validateStateBoundary(34.0522, -118.2437, 'TX')).toBe(false);
  });

  it('safely handles invalid or missing coordinate numbers', () => {
    expect(validateStateBoundary(NaN, -118.2437, 'CA')).toBe(false);
    expect(validateStateBoundary(34.0522, NaN, 'CA')).toBe(false);
    expect(validateStateBoundary(34.0522, -118.2437, 'UNKNOWN_STATE')).toBe(false);
  });
});

describe('Phase 3A: Pure Ingestion & Quality Gate', () => {
  const sampleTxRaw = [
    {
      title: 'Houston Grand Mosque',
      address: '123 Main St, Houston, TX 77002',
      location: { lat: 29.7604, lng: -95.3698 },
      phone: '+1 713-555-0100',
      website: 'https://houstongrandmosque.org',
      categoryName: 'Mosque',
      reviewsCount: 45,
      totalScore: 4.8,
      openingHours: [{ day: 'Monday', hours: 'Open 24 hours' }],
      imageUrls: ['https://example.com/tx1.jpg'],
    },
    {
      title: 'Dallas Islamic Center',
      address: '456 Elm St, Dallas, TX 75201',
      location: { lat: 32.7767, lng: -96.797 },
      phone: '+1 214-555-0101',
      categoryName: 'Islamic religious organization',
      reviewsCount: 12,
      totalScore: 4.5,
    },
    {
      title: 'Austin Halal Grocery & Meat',
      address: '789 Market St, Austin, TX 78701',
      location: { lat: 30.2672, lng: -97.7431 },
      categoryName: 'Halal Grocery Store',
      description: 'Halal meat and groceries',
    },
  ];

  it('ingests raw dataset without mutating the original input array or objects', () => {
    const rawCopy = JSON.parse(JSON.stringify(sampleTxRaw));
    const { result, mosques } = ingestStateDataset(sampleTxRaw, 'TX');

    expect(sampleTxRaw).toEqual(rawCopy); // Input remained pristine
    expect(result.stateCode).toBe('TX');
    expect(result.stateName).toBe('Texas');
    expect(result.totalRaw).toBe(3);
    expect(result.validSchemaCount).toBe(3);
    expect(mosques.length).toBe(3);

    // Verify non-mosque commercial entity excluded
    const grocery = mosques.find(m => m.name.includes('Grocery'));
    expect(grocery?.dataStatus).toBe('excluded');

    // Verify mosque verified
    const mosque = mosques.find(m => m.name.includes('Grand Mosque'));
    expect(mosque?.dataStatus).toBe('verified');
    expect(mosque?.stateCode).toBe('TX');
    expect(mosque?.state).toBe('Texas');
  });

  it('accurately computes data quality metrics and passes quality gate', () => {
    const { result } = ingestStateDataset(sampleTxRaw, 'TX');

    expect(result.metrics.validGpsPercentage).toBe(100);
    expect(result.metrics.phoneCoveragePercentage).toBe(67);
    expect(result.metrics.websiteCoveragePercentage).toBe(33);
    expect(result.qualityGatePassed).toBe(true);
    expect(result.boundaryMismatches.length).toBe(0);
  });

  it('fails quality gate if GPS coordinates fail threshold (<95%)', () => {
    const badGpsDataset = [
      {
        title: 'Mosque A',
        address: '123 St, Houston, TX 77002',
        // location missing entirely — will fail schema and be counted as invalid
      },
      {
        title: 'Mosque B',
        address: '456 St, Dallas, TX 75201',
        location: { lat: 32.7767, lng: -96.797 },
      },
    ];

    const { result } = ingestStateDataset(badGpsDataset, 'TX');
    // 1 out of 2 passed schema => 50% GPS (based on total raw records)
    expect(result.metrics.validGpsPercentage).toBeLessThan(95);
    expect(result.qualityGatePassed).toBe(false);
    // Either GPS coverage or schema errors should be reported
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('records boundary mismatches when records have out-of-state GPS', () => {
    const outOfBoundsRecord = [
      {
        title: 'Displaced Mosque',
        address: '123 Street, Houston, TX 77002',
        location: { lat: 40.7128, lng: -74.006 }, // NYC coordinates, not in TX bounds
      },
    ];

    const { result } = ingestStateDataset(outOfBoundsRecord, 'TX');
    expect(result.boundaryMismatches.length).toBe(1);
    expect(result.boundaryMismatches[0].title).toBe('Displaced Mosque');
  });
});

describe('Phase 3A: GenericStateProvider & MosqueRepository Isolation', () => {
  it('GenericStateProvider normalizes and manages state data independently', async () => {
    const txProvider = new GenericStateProvider('TX');
    const sample = [
      {
        title: 'Fort Worth Masjid',
        address: '100 Main St, Fort Worth, TX 76102',
        location: { lat: 32.7555, lng: -97.3308 },
      },
    ];
    txProvider.setRawRecords(sample);

    const mosques = await txProvider.getAll();
    expect(mosques.length).toBe(1);
    expect(mosques[0].name).toBe('Fort Worth Masjid');
    expect(mosques[0].stateCode).toBe('TX');
    expect(mosques[0].city).toBe('Fort Worth');

    const bySlug = await txProvider.getBySlug(mosques[0].slug);
    expect(bySlug).toBeDefined();
    expect(bySlug?.id).toBe(mosques[0].id);
  });

  it('MosqueRepository supports multi-provider registry while keeping data strictly isolated', async () => {
    const repo = new MosqueRepository(); // CA by default

    // Create synthetic TX provider
    const txProvider = new GenericStateProvider('TX');
    txProvider.setRawRecords([
      {
        title: 'San Antonio Mosque',
        address: '200 Alamo St, San Antonio, TX 78205',
        location: { lat: 29.4241, lng: -98.4936 },
      },
    ]);

    repo.registerProvider(txProvider);

    // TX mosques are queryable explicitly by state code
    const txMosques = await repo.getMosquesByState('TX');
    expect(txMosques.length).toBe(1);
    expect(txMosques[0].name).toBe('San Antonio Mosque');

    // CA mosques do not leak into TX
    const caMosques = await repo.getMosquesByState('CA');
    expect(caMosques.length).toBeGreaterThan(300);
    expect(caMosques.every(m => m.stateCode === 'CA')).toBe(true);

    // Default search (no stateCode) queries only ENABLED states (which is only CA)
    const defaultSearch = await repo.search({});
    expect(defaultSearch.mosques.every(m => m.stateCode === 'CA')).toBe(true);

    // Search explicitly scoped to TX returns TX results
    const txSearch = await repo.search({ stateCode: 'TX' });
    expect(txSearch.total).toBe(1);
    expect(txSearch.mosques[0].name).toBe('San Antonio Mosque');
  });
});

describe('Phase 3A: Dynamic Timezone Resolution', () => {
  it('correctly resolves timezones for configured states', () => {
    expect(getTimezoneForState('CA')).toBe('America/Los_Angeles');
    expect(getTimezoneForState('TX')).toBe('America/Chicago');
    expect(getTimezoneForState('NY')).toBe('America/New_York');
    expect(getTimezoneForState('FL')).toBe('America/New_York');
    expect(getTimezoneForState('IL')).toBe('America/Chicago');
    expect(getTimezoneForState('CT')).toBe('America/New_York');
    expect(getTimezoneForState('IN')).toBe('America/Indiana/Indianapolis');
    expect(getTimezoneForState('SC')).toBe('America/New_York');
  });

  it('falls back to default timezone (America/Los_Angeles) for invalid state code', () => {
    expect(getTimezoneForState('UNKNOWN')).toBe('America/Los_Angeles');
    expect(getTimezoneForState(undefined, 'Invalid State')).toBe('America/Los_Angeles');
  });
});

describe('Phase 3A: CityRepository Multi-State & Backward Compatibility', () => {
  it('defaults to California and retains existing behavior', async () => {
    const cityRepo = new CityRepository();
    const caCities = await cityRepo.getAllCities();
    expect(caCities.length).toBeGreaterThan(50);
    expect(caCities[0].stateCode).toBe('CA');

    const sacramento = await cityRepo.getCityBySlug('sacramento');
    expect(sacramento).toBeDefined();
    expect(sacramento?.city).toBe('Sacramento');
    expect(sacramento?.stateCode).toBe('CA');
  });

  it('supports aggregating cities for another state with a custom provider', async () => {
    const txProvider = new GenericStateProvider('TX');
    txProvider.setRawRecords([
      {
        title: 'Masjid Al-Noor',
        address: '100 Main St, Dallas, TX 75201',
        location: { lat: 32.7767, lng: -96.797 },
      },
      {
        title: 'Dallas Community Mosque',
        address: '200 Elm St, Dallas, TX 75201',
        location: { lat: 32.78, lng: -96.8 },
      },
    ]);

    const txCityRepo = new CityRepository(txProvider);
    const txCities = await txCityRepo.getAllCities('TX');
    expect(txCities.length).toBe(1);
    expect(txCities[0].city).toBe('Dallas');
    expect(txCities[0].stateCode).toBe('TX');
    expect(txCities[0].mosqueCount).toBe(2);
  });
});

describe('Phase 3A: Sitemap Safety (Zero Inactive State Leakage)', () => {
  it('generates sitemap containing only enabled states and zero dormant states', async () => {
    const routes = await sitemap();
    const urls = routes.map(r => r.url);

    // Must include California routes
    expect(urls.some(u => u.includes('/mosques/california'))).toBe(true);

    // Must NEVER include dormant states (Texas, New York, etc.)
    expect(urls.some(u => u.includes('/mosques/texas'))).toBe(false);
    expect(urls.some(u => u.includes('/mosques/new-york'))).toBe(false);
    expect(urls.some(u => u.includes('/mosques/florida'))).toBe(false);
  });
});
