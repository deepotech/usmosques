import { describe, it, expect } from 'vitest';
import { getCityEditorial } from '@/lib/data/editorial-content';
import { cityRepository } from '@/lib/data/city-repository';
import { mosqueRepository } from '@/lib/data/mosque-repository';

describe('Phase 4C — P0 Factual Integrity Remediation Test Suite', () => {
  it('1. Houston verified count excludes the two quarantined records in editorial and repository', async () => {
    const houston = await cityRepository.getCityBySlug('houston', true, 'TX');
    expect(houston).toBeDefined();
    expect(houston?.mosqueCount).toBe(72);
    expect(houston?.verifiedCount).toBe(70);
    expect(houston?.needsReviewCount).toBe(2);

    const ed = getCityEditorial('TX', 'houston');
    expect(ed).toBeDefined();
    if (!ed) return;

    // Overview and dataNotice must assert 70 verified facilities, NOT 72 verified
    expect(ed.overview).toContain('70 verified mosques and Islamic centers');
    expect(ed.overview).not.toContain('72 verified');
    expect(ed.dataNotice).toContain('70 verified facilities');
    expect(ed.dataNotice).not.toContain('72 verified');
    expect(ed.dataNotice).toContain('2 records associated with a shared address currently under review');
  });

  it('2. Houston editorial content does not recommend the quarantined El Farouq records as verified facilities', () => {
    const ed = getCityEditorial('TX', 'houston');
    expect(ed).toBeDefined();
    if (!ed) return;

    const fullContent = `${ed.overview} ${ed.communityContext} ${ed.geographicDistribution} ${ed.dataNotice}`.toLowerCase();
    // Must NOT promote El-Farooq / ElFarouq as a verified regional destination
    expect(fullContent).not.toContain('masjid el-farooq');
    expect(fullContent).not.toContain('elfarouq');

    // Preserves ISGH institutional governance context
    expect(ed.overview).toContain('Islamic Society of Greater Houston (ISGH)');
    expect(ed.communityContext).toContain('Islamic Society of Greater Houston (ISGH)');
  });

  it('3. Chicago verified count excludes its two quarantined educational records in editorial and repository', async () => {
    const chicago = await cityRepository.getCityBySlug('chicago', true, 'IL');
    expect(chicago).toBeDefined();
    expect(chicago?.mosqueCount).toBe(64);
    expect(chicago?.verifiedCount).toBe(62);
    expect(chicago?.needsReviewCount).toBe(2);

    const ed = getCityEditorial('IL', 'chicago');
    expect(ed).toBeDefined();
    if (!ed) return;

    // Overview and dataNotice must assert 62 verified facilities, NOT 64 verified
    expect(ed.overview).toContain('62 verified facilities');
    expect(ed.overview).toContain('64 listing records');
    expect(ed.overview).not.toContain('64 verified facilities');

    expect(ed.dataNotice).toContain('62 verified facilities');
    expect(ed.dataNotice).not.toContain('64 verified facilities');
    expect(ed.dataNotice).toContain('64 listing records');
  });

  it('4. Chicago editorial content does not present quarantined educational records as verified mosque facilities', () => {
    const ed = getCityEditorial('IL', 'chicago');
    expect(ed).toBeDefined();
    if (!ed) return;

    expect(ed.overview).toContain('two educational institutions currently under administrative review');
    expect(ed.dataNotice).toContain('2 educational institutions currently under administrative review');

    // Preserves distinct institutional identity of Mosque Maryam and anchor institutions
    expect(ed.communityContext).toContain('Mosque Maryam');
    expect(ed.communityContext).toContain('National Center of the Nation of Islam');
    expect(ed.overview).toContain('Downtown Islamic Center (DIC)');
    expect(ed.overview).toContain('Muslim Community Center (MCC)');
  });

  it('5. The city subtitle logic distinguishes unverified-inclusive listings from fully verified collections', async () => {
    // Helper replicating the updated StateCityView subtitle logic
    const getSubtitleText = (summary: { mosques: unknown[]; verifiedCount: number; needsReviewCount: number }) => {
      return summary.needsReviewCount > 0
        ? `Showing ${summary.mosques.length} listed facilities (${summary.verifiedCount} verified, ${summary.needsReviewCount} under review)`
        : `Showing ${summary.mosques.length} verified facilities`;
    };

    // Cities with needs_review records: must NOT label entire count as verified
    const brooklyn = (await cityRepository.getCityBySlug('brooklyn', true, 'NY'))!;
    expect(brooklyn.needsReviewCount).toBe(10);
    expect(getSubtitleText(brooklyn)).toBe('Showing 103 listed facilities (93 verified, 10 under review)');

    const losAngeles = (await cityRepository.getCityBySlug('los-angeles', true, 'CA'))!;
    expect(losAngeles.needsReviewCount).toBe(1);
    expect(getSubtitleText(losAngeles)).toBe('Showing 21 listed facilities (20 verified, 1 under review)');

    const houston = (await cityRepository.getCityBySlug('houston', true, 'TX'))!;
    expect(houston.needsReviewCount).toBe(2);
    expect(getSubtitleText(houston)).toBe('Showing 72 listed facilities (70 verified, 2 under review)');

    const chicago = (await cityRepository.getCityBySlug('chicago', true, 'IL'))!;
    expect(chicago.needsReviewCount).toBe(2);
    expect(getSubtitleText(chicago)).toBe('Showing 64 listed facilities (62 verified, 2 under review)');

    // Cities where all records are verified: subtitle states "verified facilities"
    const tampa = (await cityRepository.getCityBySlug('tampa', true, 'FL'))!;
    expect(tampa.needsReviewCount).toBe(0);
    expect(getSubtitleText(tampa)).toBe('Showing 14 verified facilities');

    const sanDiego = (await cityRepository.getCityBySlug('san-diego', true, 'CA'))!;
    expect(sanDiego.needsReviewCount).toBe(0);
    expect(getSubtitleText(sanDiego)).toBe('Showing 13 verified facilities');
  });

  it('6. Brooklyn and Los Angeles disclosures remain accurate and unaffected', async () => {
    const bk = getCityEditorial('NY', 'brooklyn')!;
    expect(bk.overview).toContain('103 listing records');
    expect(bk.dataNotice).toContain('93 currently have verified data status');
    expect(bk.dataNotice).toContain('10 records associated with shared addresses remain under review');

    const la = getCityEditorial('CA', 'los-angeles')!;
    expect(la.overview).toContain('twenty verified mosques and Islamic centers');
    expect(la.overview).toContain('one facility currently pending administrative review');
    expect(la.dataNotice).toContain('20 verified facilities and 1 facility classified as pending review');
  });

  it('7. Shared-address safeguard behavior remains active and unchanged', async () => {
    // Both El Farouq records at 1207 Conrad Sauer Dr must remain quarantined as needs_review
    const txMosques = await mosqueRepository.getMosquesByState('TX');
    const elFarouqRecords = txMosques.filter(m => m.address.toLowerCase().includes('1207 conrad sauer'));
    expect(elFarouqRecords.length).toBe(2);
    for (const record of elFarouqRecords) {
      expect(record.dataStatus).toBe('needs_review');
      expect(record.statusReason).toContain('Shares address with another organization or facility');
    }
  });

  it('8. Dearborn overview does not assert an unsupported "century" of heritage; attributes 1937 AMS founding explicitly', () => {
    const ed = getCityEditorial('MI', 'dearborn');
    expect(ed).toBeDefined();
    if (!ed) return;

    // Must NOT claim "more than a century" or "over a century" — unsupported by evidence
    // (oldest institution is American Moslem Society, est. 1937 ≈ 89 years as of 2026)
    expect(ed.overview).not.toMatch(/more than a century/i);
    expect(ed.overview).not.toMatch(/over a century/i);
    expect(ed.overview).not.toMatch(/a century of/i);

    // Must explicitly reference the 1937 founding date to anchor the heritage claim
    expect(ed.overview).toContain('1937');

    // Must reference the American Moslem Society as the dated institution
    expect(ed.overview).toContain('American Moslem Society');

    // Directory count must remain accurate
    expect(ed.overview).toContain('12 verified mosques and Islamic centers');
  });
});
