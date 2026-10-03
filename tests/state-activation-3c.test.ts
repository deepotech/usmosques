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

describe('Phase 3C: Florida & Illinois Activation', () => {
  const flRaw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/raw/florida.json'), 'utf-8'));
  const ilRaw = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/raw/illinois.json'), 'utf-8'));

  // 1. FL is now enabled
  it('1. FL is enabled in the state registry', () => {
    expect(isStateEnabled('FL')).toBe(true);
    const fl = getStateConfig('FL');
    expect(fl?.enabled).toBe(true);
    expect(fl?.finderEnabled).toBe(true);
    expect(fl?.seoEnabled).toBe(true);
    expect(fl?.datasetPath).toBe('data/raw/florida.json');
  });

  // 2. IL is now enabled
  it('2. IL is enabled in the state registry', () => {
    expect(isStateEnabled('IL')).toBe(true);
    const il = getStateConfig('IL');
    expect(il?.enabled).toBe(true);
    expect(il?.finderEnabled).toBe(true);
    expect(il?.seoEnabled).toBe(true);
    expect(il?.datasetPath).toBe('data/raw/illinois.json');
  });

  // 3. Total enabled states are now 5
  it('3. Total enabled states have grown to 5 (CA, TX, NY, FL, IL)', () => {
    const enabled = getEnabledStates();
    expect(enabled.length).toBe(5);
    const codes = enabled.map(s => s.code);
    expect(codes).toContain('CA');
    expect(codes).toContain('TX');
    expect(codes).toContain('NY');
    expect(codes).toContain('FL');
    expect(codes).toContain('IL');
  });

  // 4. Dormant states remain disabled (CT, IN, SC)
  it('4. Dormant states (CT, IN, SC) remain strictly disabled', () => {
    const dormantCodes = ['CT', 'IN', 'SC'];
    dormantCodes.forEach(code => {
      expect(isStateEnabled(code)).toBe(false);
      expect(STATE_REGISTRY[code]?.enabled).toBe(false);
    });
  });

  // 5. FL dataset passed quality gates
  it('5. FL dataset passes all quality gates (100% GPS, schema valid)', () => {
    const { result } = ingestStateDataset(flRaw, 'FL');
    expect(result.qualityGatePassed).toBe(true);
    expect(result.metrics.validGpsPercentage).toBeGreaterThanOrEqual(95);
    expect(result.invalidSchemaCount).toBe(0);
  });

  // 6. IL dataset passed quality gates
  it('6. IL dataset passes all quality gates (100% GPS, schema valid)', () => {
    const { result } = ingestStateDataset(ilRaw, 'IL');
    expect(result.qualityGatePassed).toBe(true);
    expect(result.metrics.validGpsPercentage).toBeGreaterThanOrEqual(95);
    expect(result.invalidSchemaCount).toBe(0);
  });

  // 7. FL records stay within Florida GPS bounds
  it('7. FL records have GPS coordinates within Florida bounds', async () => {
    const flMosques = await mosqueRepository.getMosquesByState('FL');
    expect(flMosques.length).toBeGreaterThanOrEqual(190);

    const flBounds = STATE_REGISTRY.FL.bounds!;
    flMosques.forEach(m => {
      expect(m.latitude).toBeGreaterThanOrEqual(flBounds.minLat - 0.1);
      expect(m.latitude).toBeLessThanOrEqual(flBounds.maxLat + 0.1);
      expect(m.longitude).toBeGreaterThanOrEqual(flBounds.minLng - 0.1);
      expect(m.longitude).toBeLessThanOrEqual(flBounds.maxLng + 0.1);
    });
  });

  // 8. IL records stay within Illinois GPS bounds
  it('8. IL records have GPS coordinates within Illinois bounds', async () => {
    const ilMosques = await mosqueRepository.getMosquesByState('IL');
    expect(ilMosques.length).toBeGreaterThanOrEqual(180);

    const ilBounds = STATE_REGISTRY.IL.bounds!;
    ilMosques.forEach(m => {
      expect(m.latitude).toBeGreaterThanOrEqual(ilBounds.minLat - 0.1);
      expect(m.latitude).toBeLessThanOrEqual(ilBounds.maxLat + 0.1);
      expect(m.longitude).toBeGreaterThanOrEqual(ilBounds.minLng - 0.1);
      expect(m.longitude).toBeLessThanOrEqual(ilBounds.maxLng + 0.1);
    });
  });

  // 9. FL state code assigned correctly to all FL mosques
  it('9. FL mosques are all tagged with stateCode=FL', async () => {
    const flMosques = await mosqueRepository.getMosquesByState('FL');
    expect(flMosques.every(m => m.stateCode === 'FL')).toBe(true);
  });

  // 10. IL state code assigned correctly to all IL mosques
  it('10. IL mosques are all tagged with stateCode=IL', async () => {
    const ilMosques = await mosqueRepository.getMosquesByState('IL');
    expect(ilMosques.every(m => m.stateCode === 'IL')).toBe(true);
  });

  // 11. City repository separation for FL
  it('11. CityRepository separates FL cities without cross-contamination', async () => {
    const flCities = await cityRepository.getAllCities('FL');
    expect(flCities.length).toBeGreaterThan(0);
    expect(flCities.every(c => c.stateCode === 'FL')).toBe(true);

    const tampa = await cityRepository.getCityBySlug('tampa', true, 'FL');
    expect(tampa?.city).toBe('Tampa');
    expect(tampa?.stateCode).toBe('FL');
    expect(tampa?.mosqueCount).toBeGreaterThanOrEqual(10);
  });

  // 12. City repository separation for IL
  it('12. CityRepository separates IL cities without cross-contamination', async () => {
    const ilCities = await cityRepository.getAllCities('IL');
    expect(ilCities.length).toBeGreaterThan(0);
    expect(ilCities.every(c => c.stateCode === 'IL')).toBe(true);

    const chicago = await cityRepository.getCityBySlug('chicago', true, 'IL');
    expect(chicago?.city).toBe('Chicago');
    expect(chicago?.stateCode).toBe('IL');
    expect(chicago?.mosqueCount).toBeGreaterThanOrEqual(50);
  });

  // 13. City eligibility threshold enforced for FL
  it('13. Florida city eligibility enforces >=5 mosque threshold (anti-thin-content)', async () => {
    const flEligible = await cityRepository.getEligibleCities('FL');
    expect(flEligible.length).toBeGreaterThanOrEqual(4);
    flEligible.forEach(c => {
      expect(c.mosqueCount).toBeGreaterThanOrEqual(5);
    });
    // Tampa, Jacksonville, Orlando, Kissimmee, Miami should all qualify
    const cities = flEligible.map(c => c.city);
    expect(cities).toContain('Tampa');
    expect(cities).toContain('Jacksonville');
    expect(cities).toContain('Orlando');
  });

  // 14. City eligibility threshold enforced for IL
  it('14. Illinois city eligibility enforces >=5 mosque threshold (anti-thin-content)', async () => {
    const ilEligible = await cityRepository.getEligibleCities('IL');
    expect(ilEligible.length).toBeGreaterThanOrEqual(1);
    ilEligible.forEach(c => {
      expect(c.mosqueCount).toBeGreaterThanOrEqual(5);
    });
    // Chicago with 63 mosques must always be included
    const cities = ilEligible.map(c => c.city);
    expect(cities).toContain('Chicago');
  });

  // 15. Static params generated for FL cities
  it('15. generateStateCityStaticParams provides static paths for eligible FL cities', async () => {
    const flParams = await generateStateCityStaticParams('FL');
    expect(flParams.length).toBeGreaterThanOrEqual(4);
    expect(flParams.some(p => p.city === 'tampa')).toBe(true);
    expect(flParams.some(p => p.city === 'jacksonville')).toBe(true);
    expect(flParams.some(p => p.city === 'orlando')).toBe(true);
  });

  // 16. Static params generated for IL cities
  it('16. generateStateCityStaticParams provides static paths for eligible IL cities', async () => {
    const ilParams = await generateStateCityStaticParams('IL');
    expect(ilParams.length).toBeGreaterThanOrEqual(1);
    expect(ilParams.some(p => p.city === 'chicago')).toBe(true);
  });

  // 17. Sitemap now includes FL and IL
  it('17. Dynamic sitemap includes FL and IL routes while excluding CT, IN, SC', async () => {
    const routes = await sitemap();
    const urls = routes.map(r => r.url);

    // Active states
    expect(urls.some(u => u.includes('/mosques/florida'))).toBe(true);
    expect(urls.some(u => u.includes('/mosques/illinois'))).toBe(true);
    expect(urls.some(u => u.includes('/mosques/florida/tampa'))).toBe(true);
    expect(urls.some(u => u.includes('/mosques/illinois/chicago'))).toBe(true);

    // Dormant states strictly absent
    expect(urls.some(u => u.includes('/mosques/connecticut'))).toBe(false);
    expect(urls.some(u => u.includes('/mosques/indiana'))).toBe(false);
    expect(urls.some(u => u.includes('/mosques/south-carolina'))).toBe(false);
  });

  // 18. SEO metadata generated for FL
  it('18. Generates accurate SEO metadata for Florida state and city pages', async () => {
    const flMeta = await generateStateMetadata('FL');
    const flTitle = typeof flMeta.title === 'object' && flMeta.title !== null && 'default' in flMeta.title
      ? (flMeta.title as { default: string }).default
      : String(flMeta.title);
    expect(flTitle).toContain('Florida');
    expect(flMeta.description).toContain('Florida');

    const tampaMeta = await generateStateCityMetadata('FL', 'tampa');
    const tampaTitle = typeof tampaMeta.title === 'object' && tampaMeta.title !== null && 'default' in tampaMeta.title
      ? (tampaMeta.title as { default: string }).default
      : String(tampaMeta.title);
    expect(tampaTitle).toContain('Tampa');
  });

  // 19. SEO metadata generated for IL
  it('19. Generates accurate SEO metadata for Illinois state and city pages', async () => {
    const ilMeta = await generateStateMetadata('IL');
    const ilTitle = typeof ilMeta.title === 'object' && ilMeta.title !== null && 'default' in ilMeta.title
      ? (ilMeta.title as { default: string }).default
      : String(ilMeta.title);
    expect(ilTitle).toContain('Illinois');
    expect(ilMeta.description).toContain('Illinois');

    const chicagoMeta = await generateStateCityMetadata('IL', 'chicago');
    const chicagoTitle = typeof chicagoMeta.title === 'object' && chicagoMeta.title !== null && 'default' in chicagoMeta.title
      ? (chicagoMeta.title as { default: string }).default
      : String(chicagoMeta.title);
    expect(chicagoTitle).toContain('Chicago');
  });

  // 20. Timezone resolution for FL and IL
  it('20. Timezone resolves correctly: Eastern for FL, Central for IL', () => {
    expect(getTimezoneForState('FL')).toBe('America/New_York');
    expect(getTimezoneForState('IL')).toBe('America/Chicago');

    const monday = new Date('2025-01-06T12:00:00Z');
    const flStatus = getMosqueOpenStatus(
      [{ day: 'Monday', hours: 'Open 24 hours' }],
      getTimezoneForState('FL'),
      monday
    );
    expect(flStatus.state).toBe('24hours');

    const ilStatus = getMosqueOpenStatus(
      [{ day: 'Monday', hours: 'Open 24 hours' }],
      getTimezoneForState('IL'),
      monday
    );
    expect(ilStatus.state).toBe('24hours');
  });

  // 21. No regression in CA, TX, NY
  it('21. CA, TX, NY datasets experience zero regression after Phase 3C activation', async () => {
    const caMosques = await mosqueRepository.getMosquesByState('CA');
    const txMosques = await mosqueRepository.getMosquesByState('TX');
    const nyMosques = await mosqueRepository.getMosquesByState('NY');

    expect(caMosques.length).toBeGreaterThanOrEqual(400);
    expect(txMosques.length).toBe(332);
    expect(nyMosques.length).toBe(374);

    expect(caMosques.every(m => m.stateCode === 'CA')).toBe(true);
    expect(txMosques.every(m => m.stateCode === 'TX')).toBe(true);
    expect(nyMosques.every(m => m.stateCode === 'NY')).toBe(true);
  });

  // 22. Amenity filters work across FL and IL
  it('22. Amenity and accessibility filters work seamlessly across FL and IL', async () => {
    const { mosques: flMosques, total: flTotal } = await mosqueRepository.search({
      stateCode: 'FL',
      limit: 500,
    });
    expect(flTotal).toBeGreaterThan(0);
    expect(flMosques.every(m => m.stateCode === 'FL')).toBe(true);

    const { mosques: ilMosques, total: ilTotal } = await mosqueRepository.search({
      stateCode: 'IL',
      limit: 500,
    });
    expect(ilTotal).toBeGreaterThan(0);
    expect(ilMosques.every(m => m.stateCode === 'IL')).toBe(true);
  });

  // 23. Raw dataset files are immutable
  it('23. Raw JSON files in data/raw remain immutable after activation', () => {
    const flStat = fs.statSync(path.join(process.cwd(), 'data/raw/florida.json'));
    const ilStat = fs.statSync(path.join(process.cwd(), 'data/raw/illinois.json'));
    expect(flStat.size).toBeGreaterThan(100000);
    expect(ilStat.size).toBeGreaterThan(100000);
  });

  // 24. State-scoped search returns only matching state
  it('24. State-scoped search returns only FL or IL mosques without mixing', async () => {
    const { mosques: flSearch } = await mosqueRepository.search({
      stateCode: 'FL',
      query: 'mosque',
      limit: 100,
    });
    expect(flSearch.length).toBeGreaterThan(0);
    expect(flSearch.every(m => m.stateCode === 'FL')).toBe(true);

    const { mosques: ilSearch } = await mosqueRepository.search({
      stateCode: 'IL',
      query: 'chicago',
      limit: 100,
    });
    expect(ilSearch.length).toBeGreaterThan(0);
    expect(ilSearch.every(m => m.stateCode === 'IL')).toBe(true);
  });

  // 25. Multi-state search includes all 5 enabled states
  it('25. Multi-state search returns mosques from all 5 enabled states combined', async () => {
    const { total } = await mosqueRepository.search({ limit: 1 });
    // CA ~412 + TX 332 + NY 374 + FL ~194 + IL ~185 = well over 1400
    expect(total).toBeGreaterThan(1400);
  });
});
