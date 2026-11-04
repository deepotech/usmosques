import { describe, it, expect } from 'vitest';
import {
  CITY_EDITORIAL_REGISTRY,
  MOSQUE_EDITORIAL_REGISTRY,
  getCityEditorial,
  getMosqueEditorial,
} from '@/lib/data/editorial-content';
import { cityRepository } from '@/lib/data/city-repository';
import { mosqueRepository } from '@/lib/data/mosque-repository';

describe('Phase 4A Batch 1 — Metropolitan City Guides Test Suite', () => {
  it('contains at least 6 city entries in CITY_EDITORIAL_REGISTRY (3 Phase 2 + 3 Batch 1 preserved, Batch 2 added)', () => {
    const keys = Object.keys(CITY_EDITORIAL_REGISTRY);
    expect(keys.length).toBeGreaterThanOrEqual(6);
    // Phase 2
    expect(keys).toContain('TX|houston');
    expect(keys).toContain('MI|dearborn');
    expect(keys).toContain('PA|mechanicsburg');
    // Phase 4A Batch 1
    expect(keys).toContain('CA|san-diego');
    expect(keys).toContain('NY|brooklyn');
    expect(keys).toContain('IL|chicago');
    // Phase 4A Batch 2 now present
    expect(keys).toContain('CA|los-angeles');
    expect(keys).toContain('FL|tampa');
  });

  it('preserves existing 9 Phase 2 mosque editorial entries untouched', () => {
    const mosqueKeys = Object.keys(MOSQUE_EDITORIAL_REGISTRY);
    expect(mosqueKeys.length).toBe(9);
    expect(getMosqueEditorial('east-plano-islamic-center')).toBeDefined();
    expect(getMosqueEditorial('al-farooq-mosque-atlanta-ga')).toBeDefined();
    expect(getMosqueEditorial('mclean-islamic-center')).toBeDefined();
    expect(getMosqueEditorial('harrisburg-mosque')).toBeDefined();
  });

  it('validates San Diego editorial content, completeness, and local accuracy', async () => {
    const sd = getCityEditorial('CA', 'san-diego');
    expect(sd).toBeDefined();
    if (!sd) return;

    expect(sd.stateCode).toBe('CA');
    expect(sd.citySlug).toBe('san-diego');
    expect(sd.headline).toContain('San Diego');
    expect(sd.overview).toContain('13 verified mosques');
    expect(sd.overview).toContain('Islamic Center of San Diego');
    expect(sd.overview).toContain('Muslim Community Center');

    // Community context checks
    expect(sd.communityContext).toContain('Robert de Lauriers');
    expect(sd.communityContext).toContain('Al-Manar');
    expect(sd.communityContext).toContain('Masjidul Taqwa');
    expect(sd.communityContext).toContain('Imperial Avenue');

    // Geographic distribution checks
    expect(sd.geographicDistribution).toContain('Clairemont');
    expect(sd.geographicDistribution).toContain('Miramar');
    expect(sd.geographicDistribution).toContain('City Heights');
    expect(sd.geographicDistribution).toContain('El Cajon'); // Distinguishes El Cajon as separate

    // Data notice checks
    expect(sd.dataNotice).toContain('9 display published opening hours in directory records');
    expect(sd.dataNotice).toContain('Hours Not Listed');
    expect(sd.dataNotice).not.toContain('active official websites');

    // Verification metadata
    expect(sd.verification.verifiedDate).toBe('2026-11-02');
    expect(sd.verification.sourceName).toBeDefined();

    // Verify city exists in repository
    const repoCity = await cityRepository.getCityBySlug('san-diego', true, 'CA');
    expect(repoCity).toBeDefined();
    expect(repoCity?.mosqueCount).toBe(13);
  });

  it('validates Brooklyn editorial content, shared-address disclosure, and historical qualifications', async () => {
    const bk = getCityEditorial('NY', 'brooklyn');
    expect(bk).toBeDefined();
    if (!bk) return;

    expect(bk.stateCode).toBe('NY');
    expect(bk.citySlug).toBe('brooklyn');
    expect(bk.headline).toContain('Brooklyn');

    // Correction 2: Brooklyn Shared-Address Disclosure in dataNotice
    const requiredDisclosure =
      'Our directory contains 103 listing records in Brooklyn. Of these, 93 currently have verified data status, while 10 records associated with shared addresses remain under review. These records should not be interpreted as 10 independently verified facilities.';
    expect(bk.dataNotice).toContain(requiredDisclosure);

    // Ensure it accurately distinguishes total (103), verified (93), and under review (10)
    expect(bk.overview).toContain('103 listing records');
    expect(bk.dataNotice).toContain(
      'The directory includes phone and website fields for some listings; availability and accuracy should be confirmed with each facility.'
    );
    // Micro-fix assertions: eliminate unsupported prayer-time inference and active website assertions
    expect(bk.dataNotice).not.toContain('open primarily around daily prayer times');
    expect(bk.dataNotice).not.toContain('active official websites');
    expect(bk.dataNotice).not.toContain('65 facilities have published operating schedules');

    // Correction 3: Qualified Sheikh Dawood phrasing for 143 State Street
    const sheikhDawoodPhrase =
      'A historic 20th-century Brooklyn Heights institution with mid-20th-century roots founded by Sheikh Dawood';
    expect(bk.communityContext.toLowerCase()).toContain(
      'historic 20th-century brooklyn heights institution with mid-20th-century roots founded by sheikh dawood'
    );
    // Must NOT contain imprecise "post-war" label
    expect(bk.communityContext.toLowerCase()).not.toContain('post-war');

    // Anchor institutions
    expect(bk.communityContext).toContain('Masjid Al-Farooq');
    expect(bk.communityContext).toContain('1976');
    expect(bk.communityContext).toContain('1928');
    expect(bk.communityContext).toContain('Coney Island Avenue');
    expect(bk.communityContext).toContain('Masjid At-Taqwa');

    // Verification metadata
    expect(bk.verification.verifiedDate).toBe('2026-11-02');

    // Repository confirmation of 103 total, 93 verified, 10 needs_review
    const repoCity = await cityRepository.getCityBySlug('brooklyn', true, 'NY');
    expect(repoCity).toBeDefined();
    expect(repoCity?.mosqueCount).toBe(103);
    const verifiedInCity = repoCity?.mosques.filter((m) => m.dataStatus === 'verified') || [];
    const needsReviewInCity = repoCity?.mosques.filter((m) => m.dataStatus === 'needs_review') || [];
    expect(verifiedInCity.length).toBe(93);
    expect(needsReviewInCity.length).toBe(10);

    // Safeguard SG-2 & SG-5 verification: all 10 quarantined records must remain needs_review
    for (const record of needsReviewInCity) {
      expect(record.dataStatus).toBe('needs_review');
    }
  });

  it('validates Chicago editorial content, Mosque Maryam qualification, and suburban exclusions', async () => {
    const chi = getCityEditorial('IL', 'chicago');
    expect(chi).toBeDefined();
    if (!chi) return;

    expect(chi.stateCode).toBe('IL');
    expect(chi.citySlug).toBe('chicago');
    expect(chi.headline).toContain('Chicago');
    expect(chi.overview).toContain('64 listing records');
    expect(chi.overview).toContain('62 verified facilities');
    expect(chi.overview).toContain('Downtown Islamic Center');
    expect(chi.overview).toContain('Muslim Community Center');

    // Institutional history
    expect(chi.communityContext).toContain('1969');
    expect(chi.communityContext).toContain('Rivoli Theater');
    expect(chi.communityContext).toContain('1980');
    expect(chi.communityContext).toContain('231 S State Street');
    expect(chi.communityContext).toContain('1976');

    // Correction 4: Mosque Maryam qualified description
    const mosqueMaryamQualified =
      'An indigenous American Muslim historic and civil rights landmark and the National Center of the Nation of Islam';
    expect(chi.communityContext.toLowerCase()).toContain(
      'indigenous american muslim historic and civil rights landmark and the national center of the nation of islam'
    );
    // Must NOT imply it is a mainstream Sunni mosque
    expect(chi.communityContext).toContain('Mosque Maryam');
    expect(chi.communityContext).toContain('Masjid Al-Fatir');

    // Geographic distribution and Cook County suburban exclusions
    expect(chi.geographicDistribution).toContain('The Loop');
    expect(chi.geographicDistribution).toContain('Elston Avenue');
    expect(chi.geographicDistribution).toContain('Devon Avenue');
    expect(chi.geographicDistribution).toContain('Bridgeview'); // Clarifies Bridgeview is suburban
    expect(chi.geographicDistribution).toContain('Morton Grove'); // Clarifies Morton Grove is suburban

    // Data notice checks
    expect(chi.dataNotice).toContain('32 (50%) display published opening hours in directory records');
    expect(chi.dataNotice).toContain('Hours Not Listed');
    expect(chi.dataNotice).not.toContain('active official websites');

    // Verification metadata
    expect(chi.verification.verifiedDate).toBe('2026-11-02');

    // Repository confirmation
    const repoCity = await cityRepository.getCityBySlug('chicago', true, 'IL');
    expect(repoCity).toBeDefined();
    expect(repoCity?.mosqueCount).toBe(64);
  });

  it('guarantees distinct, non-repetitive prose across all three Batch 1 guides', () => {
    const sd = getCityEditorial('CA', 'san-diego')!;
    const bk = getCityEditorial('NY', 'brooklyn')!;
    const chi = getCityEditorial('IL', 'chicago')!;

    // Headlines are distinct
    expect(sd.headline).not.toBe(bk.headline);
    expect(sd.headline).not.toBe(chi.headline);
    expect(bk.headline).not.toBe(chi.headline);

    // Overviews are distinct
    expect(sd.overview).not.toBe(bk.overview);
    expect(sd.overview).not.toBe(chi.overview);
    expect(bk.overview).not.toBe(chi.overview);

    // Community contexts are distinct
    expect(sd.communityContext).not.toBe(bk.communityContext);
    expect(sd.communityContext).not.toBe(chi.communityContext);
    expect(bk.communityContext).not.toBe(chi.communityContext);

    // Geographic distributions are distinct
    expect(sd.geographicDistribution).not.toBe(bk.geographicDistribution);
    expect(sd.geographicDistribution).not.toBe(chi.geographicDistribution);
    expect(bk.geographicDistribution).not.toBe(chi.geographicDistribution);
  });

  it('strictly enforces scope boundaries (authorized cities present, non-authorized cities remain undefined)', () => {
    // Phase 4A Batch 2 (now present with valid contracts)
    expect(getCityEditorial('CA', 'los-angeles')).toBeDefined();
    expect(getCityEditorial('FL', 'tampa')).toBeDefined();

    // Phase 4B candidates (not yet implemented)
    expect(getCityEditorial('CA', 'sacramento')).toBeUndefined();
    expect(getCityEditorial('MD', 'baltimore')).toBeUndefined();

    // Random non-editorial cities
    expect(getCityEditorial('CA', 'san-francisco')).toBeUndefined();
    expect(getCityEditorial('TX', 'dallas')).toBeUndefined();
    expect(getCityEditorial('IL', 'naperville')).toBeUndefined();
    expect(getCityEditorial('FL', 'orlando')).toBeUndefined();
  });
});
