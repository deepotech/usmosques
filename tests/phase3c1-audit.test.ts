import { describe, it, expect } from 'vitest';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { ingestStateDataset } from '@/lib/data/state-ingestion';
import fs from 'fs';
import path from 'path';

describe('PHASE 3C.1 — Data Count Audit', () => {
  it('reports exact counts for all 5 active states', async () => {
    const states = ['CA', 'TX', 'NY', 'FL', 'IL'];
    const rawFiles: Record<string, string> = {
      CA: 'california.json',
      TX: 'texas.json',
      NY: 'new-york.json',
      FL: 'florida.json',
      IL: 'illinois.json',
    };

    let totalRaw = 0, totalVerified = 0, totalNeedsReview = 0, totalExcluded = 0, totalPublishable = 0;

    for (const code of states) {
      const rawData = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'data/raw', rawFiles[code]), 'utf-8')
      );
      const rawCount = rawData.length;

      const all = await mosqueRepository.getMosquesByState(code);
      const v   = all.filter(m => m.dataStatus === 'verified').length;
      const nr  = all.filter(m => m.dataStatus === 'needs_review').length;
      const ex  = all.filter(m => m.dataStatus === 'excluded').length;
      const pub = all.filter(m => m.dataStatus !== 'excluded').length;

      console.log(`${code}: RAW=${rawCount} | repo_total=${all.length} | verified=${v} | needs_review=${nr} | excluded=${ex} | publishable=${pub}`);
      console.log(`  sum_check: verified+needs_review+excluded = ${v+nr+ex} vs repo_total=${all.length}`);

      totalRaw += rawCount;
      totalVerified += v;
      totalNeedsReview += nr;
      totalExcluded += ex;
      totalPublishable += pub;
    }

    console.log('---');
    console.log(`GRAND TOTAL RAW: ${totalRaw}`);
    console.log(`GRAND TOTAL verified: ${totalVerified}`);
    console.log(`GRAND TOTAL needs_review: ${totalNeedsReview}`);
    console.log(`GRAND TOTAL excluded: ${totalExcluded}`);
    console.log(`GRAND TOTAL publishable (verified+needs_review): ${totalPublishable}`);

    expect(true).toBe(true);
  });

  it('reports city eligibility counts per state', async () => {
    const { cityRepository } = await import('@/lib/data/city-repository');
    const states = ['CA', 'TX', 'NY', 'FL', 'IL'];
    let totalEligible = 0;
    for (const code of states) {
      const eligible = await cityRepository.getEligibleCities(code);
      console.log(`${code}: eligible_cities=${eligible.length} -> ${eligible.map(c => c.city + '(' + c.mosqueCount + ')').join(', ')}`);
      totalEligible += eligible.length;
    }
    console.log(`TOTAL eligible city pages: ${totalEligible}`);
    expect(true).toBe(true);
  });

  it('verifies state isolation - no cross-state contamination', async () => {
    const states = ['CA', 'TX', 'NY', 'FL', 'IL'];
    for (const code of states) {
      const all = await mosqueRepository.getMosquesByState(code);
      const wrongState = all.filter(m => m.stateCode !== code);
      console.log(`${code}: total=${all.length} wrongState=${wrongState.length}`);
      expect(wrongState.length).toBe(0);
    }
  });

  it('verifies timezone configuration per state', async () => {
    const { getTimezoneForState } = await import('@/lib/geo/timezone');
    const expectedTimezones: Record<string, string> = {
      CA: 'America/Los_Angeles',
      TX: 'America/Chicago',
      NY: 'America/New_York',
      FL: 'America/New_York',
      IL: 'America/Chicago',
    };
    for (const [code, expectedTz] of Object.entries(expectedTimezones)) {
      const actual = getTimezoneForState(code);
      console.log(`${code}: configured_timezone=${actual} | expected=${expectedTz} | match=${actual === expectedTz}`);
      expect(actual).toBe(expectedTz);
    }
  });
});
