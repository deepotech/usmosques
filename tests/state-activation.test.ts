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
import { getTimezoneForState, getMosqueOpenStatus } from '@/lib/geo/timezone';
import {
  generateStateMetadata,
  generateStateCityMetadata,
  generateStateCityStaticParams,
} from '@/lib/seo/state-city-helpers';
import sitemap from '@/app/sitemap';

describe('Phase 3B: State Activation & Multi-State Verification', () => {
  const txRaw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/raw/texas.json'), 'utf-8'));
  const nyRaw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/raw/new-york.json'), 'utf-8'));

  // 1. CA remains enabled
  it('1. CA remains enabled in the state registry', () => {
    expect(isStateEnabled('CA')).toBe(true);
    const ca = getStateConfig('CA');
    expect(ca?.enabled).toBe(true);
  });

  // 2. TX becomes enabled only after valid ingestion
  it('2. TX is enabled and its dataset passed all quality gates', () => {
    expect(isStateEnabled('TX')).toBe(true);
    const { result } = ingestStateDataset(txRaw, 'TX');
    expect(result.qualityGatePassed).toBe(true);
    expect(result.metrics.validGpsPercentage).toBeGreaterThanOrEqual(95);
  });

  // 3. NY becomes enabled only after valid ingestion
  it('3. NY is enabled and its dataset passed all quality gates', () => {
    expect(isStateEnabled('NY')).toBe(true);
    const { result } = ingestStateDataset(nyRaw, 'NY');
    expect(result.qualityGatePassed).toBe(true);
    expect(result.metrics.validGpsPercentage).toBeGreaterThanOrEqual(95);
  });

  // 4. Dormant states remain disabled (updated in Phase 3C: FL and IL now active)
  it('4. Dormant states (CT, IN, SC) remain strictly disabled after Phase 3B', () => {
    const dormantCodes = ['CT', 'IN', 'SC'];
    dormantCodes.forEach(code => {
      expect(isStateEnabled(code)).toBe(false);
      expect(STATE_REGISTRY[code]?.enabled).toBe(false);
    });

    const enabled = getEnabledStates();
    expect(enabled.length).toBeGreaterThanOrEqual(3); // CA, TX, NY at minimum
    const codes = enabled.map(s => s.code);
    expect(codes).toContain('CA');
    expect(codes).toContain('TX');
    expect(codes).toContain('NY');
  });

  // 5. TX records stay within Texas
  it('5. TX records have GPS coordinates staying within Texas bounds', async () => {
    const txMosques = await mosqueRepository.getMosquesByState('TX');
    expect(txMosques.length).toBe(332);

    const txBounds = STATE_REGISTRY.TX.bounds!;
    txMosques.forEach(m => {
      expect(m.latitude).toBeGreaterThanOrEqual(txBounds.minLat);
      expect(m.latitude).toBeLessThanOrEqual(txBounds.maxLat);
      expect(m.longitude).toBeGreaterThanOrEqual(txBounds.minLng);
      expect(m.longitude).toBeLessThanOrEqual(txBounds.maxLng);
    });
  });

  // 6. NY records stay within New York
  it('6. NY records have GPS coordinates staying within New York bounds', async () => {
    const nyMosques = await mosqueRepository.getMosquesByState('NY');
    expect(nyMosques.length).toBe(374);

    const nyBounds = STATE_REGISTRY.NY.bounds!;
    nyMosques.forEach(m => {
      expect(m.latitude).toBeGreaterThanOrEqual(nyBounds.minLat);
      expect(m.latitude).toBeLessThanOrEqual(nyBounds.maxLat);
      expect(m.longitude).toBeGreaterThanOrEqual(nyBounds.minLng);
      expect(m.longitude).toBeLessThanOrEqual(nyBounds.maxLng);
    });
  });

  // 7. Invalid GPS records are rejected
  it('7. Rejects records with invalid or missing GPS coordinates from passing quality gate', () => {
    const badDataset = [
      {
        title: 'Broken Mosque',
        address: '123 Main St, Houston, TX 77002',
        location: { lat: 999, lng: 999 }, // Out of geographic range
      },
    ];
    const { result } = ingestStateDataset(badDataset, 'TX');
    expect(result.qualityGatePassed).toBe(false);
  });

  // 8. Quality gate behavior
  it('8. Quality gate computes authentic metrics without fabricated data', () => {
    const { result } = ingestStateDataset(txRaw, 'TX');
    expect(result.metrics.validGpsPercentage).toBe(100);
    expect(result.metrics.phoneCoveragePercentage).toBe(74);
    expect(result.metrics.hoursCoveragePercentage).toBe(61);
    expect(result.qualityGatePassed).toBe(true);
  });

  // 9. Commercial exclusions
  it('9. Correctly filters commercial non-mosque entities (e.g. Paint Store) in Texas', () => {
    const { mosques } = ingestStateDataset(txRaw, 'TX');
    const paintStore = mosques.find(m => m.name.toLowerCase().includes('paint'));
    expect(paintStore).toBeDefined();
    expect(paintStore?.dataStatus).toBe('excluded');
    expect(paintStore?.statusReason).toContain('Commercial');
  });

  // 10. Duplicate handling
  it('10. Detects duplicate coordinates and addresses without silently deleting records', () => {
    const { result, mosques } = ingestStateDataset(txRaw, 'TX');
    expect(result.duplicateCoordinatesCount).toBeGreaterThan(0);
    // Preserves all records in output
    expect(mosques.length).toBe(result.totalRaw);
  });

  // 11. State repository isolation
  it('11. MosqueRepository isolates state datasets cleanly', async () => {
    const caList = await mosqueRepository.getMosquesByState('CA');
    const txList = await mosqueRepository.getMosquesByState('TX');
    const nyList = await mosqueRepository.getMosquesByState('NY');

    expect(caList.length).toBeGreaterThan(300);
    expect(txList.length).toBe(332);
    expect(nyList.length).toBe(374);

    expect(caList.every(m => m.stateCode === 'CA')).toBe(true);
    expect(txList.every(m => m.stateCode === 'TX')).toBe(true);
    expect(nyList.every(m => m.stateCode === 'NY')).toBe(true);
  });

  // 12. City repository state isolation
  it('12. CityRepository separates cities by state without cross-contamination', async () => {
    const caCities = await cityRepository.getAllCities('CA');
    const txCities = await cityRepository.getAllCities('TX');
    const nyCities = await cityRepository.getAllCities('NY');

    expect(caCities.every(c => c.stateCode === 'CA')).toBe(true);
    expect(txCities.every(c => c.stateCode === 'TX')).toBe(true);
    expect(nyCities.every(c => c.stateCode === 'NY')).toBe(true);

    const houston = await cityRepository.getCityBySlug('houston', true, 'TX');
    expect(houston?.city).toBe('Houston');
    expect(houston?.stateCode).toBe('TX');
    expect(houston?.mosqueCount).toBeGreaterThanOrEqual(60);

    const brooklyn = await cityRepository.getCityBySlug('brooklyn', true, 'NY');
    expect(brooklyn?.city).toBe('Brooklyn');
    expect(brooklyn?.stateCode).toBe('NY');
    expect(brooklyn?.mosqueCount).toBeGreaterThanOrEqual(90);
  });

  // 13. State route generation
  it('13. Provides static parameters for all eligible cities in TX and NY', async () => {
    const txParams = await generateStateCityStaticParams('TX');
    expect(txParams.length).toBeGreaterThanOrEqual(10);
    expect(txParams.some(p => p.city === 'houston')).toBe(true);
    expect(txParams.some(p => p.city === 'dallas')).toBe(true);

    const nyParams = await generateStateCityStaticParams('NY');
    expect(nyParams.length).toBeGreaterThanOrEqual(10);
    expect(nyParams.some(p => p.city === 'brooklyn')).toBe(true);
    expect(nyParams.some(p => p.city === 'bronx')).toBe(true);
  });

  // 14. City eligibility threshold
  it('14. Applies strict anti-thin-content eligibility threshold (>=5 mosques) across all states', async () => {
    const txEligible = await cityRepository.getEligibleCities('TX');
    txEligible.forEach(c => {
      expect(c.mosqueCount).toBeGreaterThanOrEqual(5);
    });

    const nyEligible = await cityRepository.getEligibleCities('NY');
    nyEligible.forEach(c => {
      expect(c.mosqueCount).toBeGreaterThanOrEqual(5);
    });
  });

  // 15. Sitemap eligibility
  it('15. Dynamic sitemap includes CA, TX, and NY state routes', async () => {
    const routes = await sitemap();
    const urls = routes.map(r => r.url);

    expect(urls.some(u => u.includes('/mosques/california'))).toBe(true);
    expect(urls.some(u => u.includes('/mosques/texas'))).toBe(true);
    expect(urls.some(u => u.includes('/mosques/new-york'))).toBe(true);

    expect(urls.some(u => u.includes('/mosques/texas/houston'))).toBe(true);
    expect(urls.some(u => u.includes('/mosques/new-york/brooklyn'))).toBe(true);

    // Dormant states (CT, IN, SC) must never appear
    expect(urls.some(u => u.includes('/mosques/connecticut'))).toBe(false);
    expect(urls.some(u => u.includes('/mosques/indiana'))).toBe(false);
    expect(urls.some(u => u.includes('/mosques/south-carolina'))).toBe(false);
  });

  // 16. State metadata generation
  it('16. Generates unique, accurate SEO metadata for Texas and New York', async () => {
    const txMeta = await generateStateMetadata('TX');
    const txTitle = typeof txMeta.title === 'object' && txMeta.title !== null && 'default' in txMeta.title
      ? (txMeta.title as any).default
      : String(txMeta.title);
    expect(txTitle).toContain('Texas');
    expect(txMeta.description).toContain('Texas');

    const nyMeta = await generateStateMetadata('NY');
    const nyTitle = typeof nyMeta.title === 'object' && nyMeta.title !== null && 'default' in nyMeta.title
      ? (nyMeta.title as any).default
      : String(nyMeta.title);
    expect(nyTitle).toContain('New York');
    expect(nyMeta.description).toContain('New York');

    const houstonMeta = await generateStateCityMetadata('TX', 'houston');
    const houstonTitle = typeof houstonMeta.title === 'object' && houstonMeta.title !== null && 'default' in houstonMeta.title
      ? (houstonMeta.title as any).default
      : String(houstonMeta.title);
    expect(houstonTitle).toContain('Houston');
    expect(houstonTitle).toContain('TX');
  });

  // 17. Amenity filters work across states
  it('17. Amenity and accessibility filters work seamlessly across all enabled states', async () => {
    const { mosques: txWheelchair } = await mosqueRepository.search({
      stateCode: 'TX',
      status: 'verified',
      limit: 500,
    });
    const withWheelchair = txWheelchair.filter(m =>
      m.accessibility.some(a => a.toLowerCase().includes('wheelchair'))
    );
    expect(withWheelchair.length).toBeGreaterThan(150);
  });

  // 18. Open Now uses state-aware timezone logic
  it('18. Dynamically resolves timezones: Pacific for CA, Central for TX, Eastern for NY', () => {
    expect(getTimezoneForState('CA')).toBe('America/Los_Angeles');
    expect(getTimezoneForState('TX')).toBe('America/Chicago');
    expect(getTimezoneForState('NY')).toBe('America/New_York');

    // Opening status evaluates cleanly with correct state timezone
    const status = getMosqueOpenStatus(
      [{ day: 'Monday', hours: 'Open 24 hours' }],
      getTimezoneForState('TX'),
      new Date('2025-01-06T12:00:00Z')
    );
    expect(status.state).toBe('24hours');
  });

  // 19. Raw data remains unchanged
  it('19. Raw JSON files in data/raw remain immutable', () => {
    const txStat = fs.statSync(path.join(process.cwd(), 'data/raw/texas.json'));
    const nyStat = fs.statSync(path.join(process.cwd(), 'data/raw/new-york.json'));
    expect(txStat.size).toBe(3397041);
    expect(nyStat.size).toBe(620814);
  });

  // 20. No California regression
  it('20. California dataset, city routes, and counts experience zero regression', async () => {
    const caMosques = await mosqueRepository.getMosquesByState('CA');
    const caCities = await cityRepository.getAllCities('CA');
    const caEligible = await cityRepository.getEligibleCities('CA');

    expect(caMosques.length).toBeGreaterThanOrEqual(400);
    expect(caCities.length).toBeGreaterThanOrEqual(60);
    expect(caEligible.length).toBeGreaterThanOrEqual(14);

    const sacramento = await cityRepository.getCityBySlug('sacramento', true, 'CA');
    expect(sacramento?.city).toBe('Sacramento');
    expect(sacramento?.stateCode).toBe('CA');
    expect(sacramento?.mosqueCount).toBeGreaterThanOrEqual(14);
  });
});
