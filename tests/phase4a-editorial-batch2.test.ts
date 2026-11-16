import { describe, it, expect } from 'vitest';
import {
  CITY_EDITORIAL_REGISTRY,
  MOSQUE_EDITORIAL_REGISTRY,
  getCityEditorial,
  getMosqueEditorial,
} from '@/lib/data/editorial-content';
import { cityRepository } from '@/lib/data/city-repository';
import { mosqueRepository } from '@/lib/data/mosque-repository';

describe('Phase 4A Batch 2 — Los Angeles & Tampa Editorial Guides Test Suite', () => {
  it('contains all 8 baseline city entries plus CA|fresno in CITY_EDITORIAL_REGISTRY', () => {
    const keys = Object.keys(CITY_EDITORIAL_REGISTRY);
    expect(keys.length).toBe(9);
    // Phase 2
    expect(keys).toContain('TX|houston');
    expect(keys).toContain('MI|dearborn');
    expect(keys).toContain('PA|mechanicsburg');
    // Phase 4A Batch 1
    expect(keys).toContain('CA|san-diego');
    expect(keys).toContain('NY|brooklyn');
    expect(keys).toContain('IL|chicago');
    // Phase 4A Batch 2
    expect(keys).toContain('CA|los-angeles');
    expect(keys).toContain('FL|tampa');
    // Phase 47
    expect(keys).toContain('CA|fresno');
  });

  it('preserves existing 9 Phase 2 mosque editorial entries untouched', () => {
    const mosqueKeys = Object.keys(MOSQUE_EDITORIAL_REGISTRY);
    expect(mosqueKeys.length).toBe(9);
    expect(getMosqueEditorial('east-plano-islamic-center')).toBeDefined();
    expect(getMosqueEditorial('al-farooq-mosque-atlanta-ga')).toBeDefined();
    expect(getMosqueEditorial('king-fahad-mosque-los-angeles')).toBeDefined();
    expect(getMosqueEditorial('mclean-islamic-center')).toBeDefined();
    expect(getMosqueEditorial('harrisburg-mosque')).toBeDefined();
  });

  it('validates Los Angeles editorial content, geographic scoping, and quarantine safeguards', async () => {
    const la = getCityEditorial('CA', 'los-angeles');
    expect(la).toBeDefined();
    if (!la) return;

    expect(la.stateCode).toBe('CA');
    expect(la.citySlug).toBe('los-angeles');
    expect(la.headline).toBe('Mosques and Islamic Centers in Los Angeles, California');
    expect(la.headline.toLowerCase()).not.toContain('verified');

    // Overview assertions
    expect(la.overview).toContain('twenty verified mosques and Islamic centers');
    expect(la.overview).toContain('Islamic Center of Southern California');
    expect(la.overview).toContain('1952');
    expect(la.overview).toContain('1976');
    expect(la.overview).toContain('fifteen have published opening hours listed in directory records');
    expect(la.overview).toContain('fifteen list direct telephone numbers');

    // Binding Decision 1: King Fahad Mosque must NOT appear in City of LA editorial
    expect(la.overview.toLowerCase()).not.toContain('king fahad');
    expect(la.communityContext.toLowerCase()).not.toContain('king fahad');
    expect(la.geographicDistribution.toLowerCase()).not.toContain('king fahad');
    expect(la.dataNotice.toLowerCase()).not.toContain('king fahad');

    // Binding Decision 2: IMAN Foundation must NOT appear in editorial profile or recommendations
    expect(la.overview.toLowerCase()).not.toContain('iman foundation');
    expect(la.overview.toLowerCase()).not.toContain('iman cultural center');
    expect(la.communityContext.toLowerCase()).not.toContain('iman foundation');
    expect(la.communityContext.toLowerCase()).not.toContain('iman cultural center');
    expect(la.geographicDistribution.toLowerCase()).not.toContain('iman foundation');
    expect(la.geographicDistribution.toLowerCase()).not.toContain('iman cultural center');

    // Community context checks: No unsupported demographic claims
    expect(la.communityContext.toLowerCase()).not.toContain('african american congregations along');
    expect(la.communityContext.toLowerCase()).not.toContain('civil rights and community heritage');
    expect(la.communityContext.toLowerCase()).not.toContain('arab, south asian');
    expect(la.communityContext).toContain('Vermont Avenue');
    expect(la.communityContext).toContain('1976');
    expect(la.communityContext).toContain('Masjid Bilal Islamic Center on Central Avenue');
    expect(la.communityContext).toContain('Masjid Omar Ibn Al-Khattab');
    expect(la.communityContext).toContain('El-Hajj Malik El-Shabazz');

    // Geographic distribution checks
    expect(la.geographicDistribution).toContain('Wilshire Center and Koreatown');
    expect(la.geographicDistribution).toContain('Metro B and D Line');
    expect(la.geographicDistribution).toContain('Central Avenue');
    expect(la.geographicDistribution).toContain('Crenshaw Boulevard');
    expect(la.geographicDistribution).toContain('Culver City'); // Notes Culver City as separate municipality

    // Binding Decision 3: Data notice disclosures
    expect(la.dataNotice).toContain('This directory includes 21 total records with Los Angeles postal addresses');
    expect(la.dataNotice).toContain('20 verified facilities and 1 facility classified as pending review');
    expect(la.dataNotice).toContain('15 display published opening hours in directory records, while 5 do not list hours');
    expect(la.dataNotice).toContain('Telephone contacts are listed for 15 verified facilities and website links for 11');
    expect(la.dataNotice).not.toContain('active official websites');

    // Verification metadata
    expect(la.verification.verifiedDate).toBe('2026-11-02');
    expect(la.verification.sourceName).toBe('Phase 4A Batch 2 Research, November 2026');

    // Repository confirmation of 21 total, 20 verified, 1 needs_review
    const repoCity = await cityRepository.getCityBySlug('los-angeles', true, 'CA');
    expect(repoCity).toBeDefined();
    expect(repoCity?.mosqueCount).toBe(21);
    const verifiedInCity = repoCity?.mosques.filter((m) => m.dataStatus === 'verified') || [];
    const needsReviewInCity = repoCity?.mosques.filter((m) => m.dataStatus === 'needs_review') || [];
    expect(verifiedInCity.length).toBe(20);
    expect(needsReviewInCity.length).toBe(1);

    // Safeguard SG-4: IMAN Foundation quarantined as needs_review
    expect(needsReviewInCity[0].slug).toBe('iman-foundation');
    expect(needsReviewInCity[0].dataStatus).toBe('needs_review');
  });

  it('validates Tampa editorial content, municipal vs unincorporated distinctions, and qualifications', async () => {
    const tb = getCityEditorial('FL', 'tampa');
    expect(tb).toBeDefined();
    if (!tb) return;

    expect(tb.stateCode).toBe('FL');
    expect(tb.citySlug).toBe('tampa');
    expect(tb.headline).toBe('Mosques and Islamic Centers in Tampa, Florida');

    // Overview assertions: Accurately qualifies postal scope
    expect(tb.overview).toContain('fourteen verified Islamic facilities carrying a Tampa postal address');
    expect(tb.overview).toContain('Islamic Society of Tampa Bay Area (ISTABA)');
    expect(tb.overview).toContain('incorporated as a non-profit organization in January 1979');
    expect(tb.overview).toContain('Six of the fourteen directory listings display published opening hours in directory records');

    // Binding Decision 1: School names MUST NOT appear
    expect(tb.overview.toLowerCase()).not.toContain('universal academy');
    expect(tb.overview.toLowerCase()).not.toContain('peace academy');
    expect(tb.overview.toLowerCase()).not.toContain('hifz academy');
    expect(tb.communityContext.toLowerCase()).not.toContain('universal academy');
    expect(tb.communityContext.toLowerCase()).not.toContain('peace academy');
    expect(tb.communityContext.toLowerCase()).not.toContain('hifz academy');
    expect(tb.geographicDistribution.toLowerCase()).not.toContain('universal academy');
    expect(tb.geographicDistribution.toLowerCase()).not.toContain('peace academy');
    expect(tb.geographicDistribution.toLowerCase()).not.toContain('hifz academy');

    // Binding Decision 2: Aden Funeral Home MUST NOT appear in editorial guide
    expect(tb.overview.toLowerCase()).not.toContain('aden funeral');
    expect(tb.communityContext.toLowerCase()).not.toContain('aden funeral');
    expect(tb.geographicDistribution.toLowerCase()).not.toContain('aden funeral');
    expect(tb.dataNotice.toLowerCase()).not.toContain('aden funeral');

    // Binding Decision 3: Remove superlatives and unsupported demographics
    expect(tb.overview.toLowerCase()).not.toContain('primary regional anchor');
    expect(tb.communityContext.toLowerCase()).not.toContain('civic and spiritual foundation');
    expect(tb.communityContext.toLowerCase()).not.toContain('distinct residential and academic populations');
    expect(tb.communityContext.toLowerCase()).not.toContain('arabic-speaking');
    expect(tb.communityContext.toLowerCase()).not.toContain('somali');

    // Binding Decision 4: Ismaili Jamatkhana qualified as private worship space
    expect(tb.communityContext).toContain('functions as a private place of worship reserved for registered members of the Shia Ismaili community');
    expect(tb.dataNotice).toContain('One listing is a private Ismaili worship center not open for general public attendance');

    // Geographic boundary accuracy: Safe disclosure of postal vs municipal scope without exact count split
    expect(tb.geographicDistribution).toContain('facilities are located across the incorporated City of Tampa and surrounding unincorporated areas of Hillsborough County');
    expect(tb.geographicDistribution).toContain('a Tampa postal address does not necessarily mean the facility is within the City\'s municipal boundaries');
    expect(tb.geographicDistribution).toContain('East Lake-Orient Park');
    expect(tb.geographicDistribution).toContain('Egypt Lake-Leto');
    expect(tb.geographicDistribution).toContain('Carrollwood');
    expect(tb.geographicDistribution).toContain('Keystone');

    // In-store prayer space qualification
    expect(tb.geographicDistribution).toContain('in-store prayer space operates on East Fowler Avenue');

    // Binding Decision 5: Hours and transparency disclosure in dataNotice
    expect(tb.dataNotice).toContain('This directory contains 14 verified listings carrying Tampa postal addresses');
    expect(tb.dataNotice).toContain('These facilities are located across the incorporated City of Tampa and surrounding unincorporated areas of Hillsborough County; a Tampa postal address does not necessarily mean the facility is within the City\'s municipal boundaries');
    expect(tb.dataNotice).toContain('Eight of the 14 facilities do not display published opening hours in directory records');
    expect(tb.dataNotice).toContain('Web links are listed for eight facilities, including one social media page');
    expect(tb.dataNotice).not.toContain('active official websites');

    // Verification metadata
    expect(tb.verification.verifiedDate).toBe('2026-11-02');
    expect(tb.verification.sourceName).toBe('Phase 4A Batch 2 Research, November 2026');

    // Repository confirmation of 14 total records, all 14 verified
    const repoCity = await cityRepository.getCityBySlug('tampa', true, 'FL');
    expect(repoCity).toBeDefined();
    expect(repoCity?.mosqueCount).toBe(14);
    const verifiedInCity = repoCity?.mosques.filter((m) => m.dataStatus === 'verified') || [];
    expect(verifiedInCity.length).toBe(14);
  });

  it('guarantees distinct, non-repetitive prose across all Batch 1 and Batch 2 guides', () => {
    const sd = getCityEditorial('CA', 'san-diego')!;
    const bk = getCityEditorial('NY', 'brooklyn')!;
    const chi = getCityEditorial('IL', 'chicago')!;
    const la = getCityEditorial('CA', 'los-angeles')!;
    const tb = getCityEditorial('FL', 'tampa')!;

    const entries = [sd, bk, chi, la, tb];

    // Headlines are all mutually unique
    const headlines = entries.map((e) => e.headline);
    expect(new Set(headlines).size).toBe(5);

    // Overviews are all mutually unique
    const overviews = entries.map((e) => e.overview);
    expect(new Set(overviews).size).toBe(5);

    // Community contexts are all mutually unique
    const contexts = entries.map((e) => e.communityContext);
    expect(new Set(contexts).size).toBe(5);

    // Geographic distributions are all mutually unique
    const dists = entries.map((e) => e.geographicDistribution);
    expect(new Set(dists).size).toBe(5);

    // Data notices are all mutually unique
    const notices = entries.map((e) => e.dataNotice);
    expect(new Set(notices).size).toBe(5);
  });

  it('strictly enforces scope boundaries (non-editorial cities remain undefined)', () => {
    // Phase 4B candidates (not yet implemented)
    expect(getCityEditorial('CA', 'sacramento')).toBeUndefined();
    expect(getCityEditorial('MD', 'baltimore')).toBeUndefined();

    // Random non-editorial cities
    expect(getCityEditorial('CA', 'san-francisco')).toBeUndefined();
    expect(getCityEditorial('TX', 'dallas')).toBeUndefined();
    expect(getCityEditorial('IL', 'naperville')).toBeUndefined();
    expect(getCityEditorial('FL', 'orlando')).toBeUndefined();
    expect(getCityEditorial('FL', 'miami')).toBeUndefined();
  });

  it('regression test: confirms Tampa editorial disclosure removes exact municipal inside/outside counts and explains postal vs municipal scope neutrally', () => {
    const tb = getCityEditorial('FL', 'tampa');
    expect(tb).toBeDefined();
    if (!tb) return;

    // Must NOT assert an exact municipal boundary split count (neither 6/8 nor 5/9)
    const combined = `${tb.overview} ${tb.geographicDistribution} ${tb.dataNotice}`.toLowerCase();
    expect(combined).not.toMatch(/six facilities (lie|are located) within/);
    expect(combined).not.toMatch(/eight facilities are located in unincorporated/);
    expect(combined).not.toMatch(/remaining eight facilities/);
    expect(combined).not.toMatch(/six facilities.*eight/);
    expect(combined).not.toMatch(/five facilities/);
    expect(combined).not.toMatch(/nine facilities/);

    // Consistently asserts neutral geographic explanation in overview, geographicDistribution, and dataNotice
    for (const field of [tb.overview, tb.geographicDistribution, tb.dataNotice]) {
      expect(field).toMatch(/Tampa postal address(es)?/i);
      expect(field).toContain('incorporated City of Tampa');
      expect(field).toContain('unincorporated');
      expect(field).toContain('does not necessarily mean the facility is within the City\'s municipal boundaries');
    }
  });
});
