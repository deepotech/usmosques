import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { mosqueRepository } from '@/lib/data/mosque-repository';
import { cityRepository } from '@/lib/data/city-repository';
import { generateMetadata as generateMosqueMetadata } from '@/app/mosque/[slug]/page';
import sitemap from '@/app/sitemap';
import { determineDataStatus } from '@/lib/data/normalization';
import { ENTITY_STATUS_OVERRIDES, getEntityStatusOverride } from '@/lib/data/entity-overrides';

describe('Phase 3A — Fresno Entity Reconciliation & Shared-Address Safeguards', () => {
  const FRESNO_MASJID_CID = '10783269688215790709';
  const INFO_2_ISLAM_CID = '5173828336142633657';
  const SHARED_ADDRESS = '2111 E Shaw Ave, Fresno, CA 93710';

  // 1. Raw Data Immutability
  it('1. Raw California dataset remains completely immutable byte-for-byte', () => {
    const rawPath = path.join(process.cwd(), 'data/raw/california.json');
    const content = fs.readFileSync(rawPath, 'utf8');
    const records = JSON.parse(content);
    expect(records.length).toBe(401);

    const masjidFresno = records.find((r: any) => r.cid === FRESNO_MASJID_CID);
    const info2Islam = records.find((r: any) => r.cid === INFO_2_ISLAM_CID);

    expect(masjidFresno).toBeDefined();
    expect(info2Islam).toBeDefined();

    // Raw fields preserved exactly
    expect(masjidFresno.title).toBe('Masjid Fresno مسجد Islamic Center');
    expect(masjidFresno.address).toBe(SHARED_ADDRESS);
    expect(masjidFresno.website).toBe('http://www.masjidfresno.org/');
    expect(masjidFresno.reviewsCount).toBe(287);

    expect(info2Islam.title).toBe('Info 2 Islam');
    expect(info2Islam.address).toBe(SHARED_ADDRESS);
    expect(info2Islam.phone).toBe('(559) 229-4752');
  });

  // 2. Exact Fresno Records Classification
  it('2. Reconciles Masjid Fresno to verified while Info 2 Islam remains needs_review', async () => {
    const caMosques = await mosqueRepository.getMosquesByState('CA');
    const masjidFresno = caMosques.find(m => m.cid === FRESNO_MASJID_CID);
    const info2Islam = caMosques.find(m => m.cid === INFO_2_ISLAM_CID);

    expect(masjidFresno).toBeDefined();
    expect(info2Islam).toBeDefined();

    // Primary place of worship is verified
    expect(masjidFresno!.dataStatus).toBe('verified');
    expect(masjidFresno!.statusReason).toContain('Primary verified place of worship');

    // Secondary outreach listing remains needs_review
    expect(info2Islam!.dataStatus).toBe('needs_review');
    expect(info2Islam!.statusReason).toBe('Shares address with another organization or facility');
  });

  // 3. Preservation of Shared-Address Safeguard for Unrelated Records
  it('3. Preserves the shared-address safeguard globally for un-overridden records', () => {
    // Un-overridden record at a shared address must resolve to needs_review
    const dummyRecord = {
      title: 'Random Islamic Society',
      address: '123 Main St, Los Angeles, CA 90001',
      categoryName: 'Mosque',
      categories: ['Mosque'],
      location: { lat: 34.05, lng: -118.25 },
    };

    const resultWithoutShared = determineDataStatus(dummyRecord, false);
    expect(resultWithoutShared.status).toBe('verified');

    const resultWithShared = determineDataStatus(dummyRecord, true);
    expect(resultWithShared.status).toBe('needs_review');
    expect(resultWithShared.reason).toBe('Shares address with another organization or facility');
  });

  // 4. Override Registry Integrity
  it('4. Override registry is strictly scoped to empirically documented entities', () => {
    const keys = Object.keys(ENTITY_STATUS_OVERRIDES);
    expect(keys).toEqual([FRESNO_MASJID_CID]);

    const override = getEntityStatusOverride(FRESNO_MASJID_CID);
    expect(override).toBeDefined();
    expect(override?.overrideStatus).toBe('verified');
    expect(override?.evidence).toBeTruthy();

    // Non-existent CID returns undefined
    expect(getEntityStatusOverride('999999999999')).toBeUndefined();
    expect(getEntityStatusOverride(undefined, undefined)).toBeUndefined();
  });

  // 5. Unique Canonical URL Generation
  it('5. Generates unique, non-colliding canonical slugs for both Fresno records', async () => {
    const caMosques = await mosqueRepository.getMosquesByState('CA');
    const masjidFresno = caMosques.find(m => m.cid === FRESNO_MASJID_CID);
    const info2Islam = caMosques.find(m => m.cid === INFO_2_ISLAM_CID);

    expect(masjidFresno!.slug).toBe('masjid-fresno-islamic-center');
    expect(info2Islam!.slug).toBe('info-2-islam');
    expect(masjidFresno!.slug).not.toBe(info2Islam!.slug);
  });

  // 6. Robots Directives & Sitemap Eligibility
  it('6. Grants indexable robots & sitemap inclusion to Masjid Fresno; preserves noindex for Info 2 Islam', async () => {
    const caMosques = await mosqueRepository.getMosquesByState('CA');
    const masjidFresno = caMosques.find(m => m.cid === FRESNO_MASJID_CID)!;
    const info2Islam = caMosques.find(m => m.cid === INFO_2_ISLAM_CID)!;

    // Metadata & Robots check for Masjid Fresno
    const mfMeta = await generateMosqueMetadata({
      params: Promise.resolve({ slug: masjidFresno.slug }),
    });
    expect(mfMeta.robots).toBeDefined();
    const mfRobots = mfMeta.robots as { index?: boolean; follow?: boolean };
    expect(mfRobots.index).toBe(true);
    expect(mfRobots.follow).toBe(true);

    // Metadata & Robots check for Info 2 Islam
    const infoMeta = await generateMosqueMetadata({
      params: Promise.resolve({ slug: info2Islam.slug }),
    });
    expect(infoMeta.robots).toBeDefined();
    const infoRobots = infoMeta.robots as { index?: boolean; follow?: boolean };
    expect(infoRobots.index).toBe(false);
    expect(infoRobots.follow).toBe(true);

    // Sitemap check
    const routes = await sitemap();
    const sitemapUrls = new Set(routes.map(r => r.url));

    expect(sitemapUrls.has(`https://usmosques.com/mosque/${masjidFresno.slug}`)).toBe(true);
    expect(sitemapUrls.has(`https://usmosques.com/mosque/${info2Islam.slug}`)).toBe(false);
  });

  // 7. City Page Integration & Sorting in Fresno
  it('7. Promotes Masjid Fresno to Card #1 in Fresno City Directory by review count', async () => {
    const fresnoCity = await cityRepository.getCityBySlug('fresno', true, 'CA');
    expect(fresnoCity).toBeDefined();

    // Log statuses
    fresnoCity!.mosques.forEach(m => {
      console.log(`[Fresno City Listing] "${m.name}" | Status: ${m.dataStatus} | Reason: ${m.statusReason}`);
    });
    expect(fresnoCity!.mosqueCount).toBe(10);
    expect(fresnoCity!.verifiedCount).toBe(7);
    expect(fresnoCity!.needsReviewCount).toBe(3);

    // Card #1 must be Masjid Fresno because it is verified with 287 reviews
    const firstMosque = fresnoCity!.mosques[0];
    expect(firstMosque.cid).toBe(FRESNO_MASJID_CID);
    expect(firstMosque.name).toBe('Masjid Fresno مسجد Islamic Center');
    expect(firstMosque.reviewCount).toBe(287);

    // Info 2 Islam is at the bottom (needs_review)
    const lastMosque = fresnoCity!.mosques[fresnoCity!.mosques.length - 1];
    expect(lastMosque.cid).toBe(INFO_2_ISLAM_CID);
    expect(lastMosque.dataStatus).toBe('needs_review');
  });

  // 8. No Regressions to City Eligibility
  it('8. Preserves California and national city eligibility counts', async () => {
    const caEligible = await cityRepository.getEligibleCities('CA');
    expect(caEligible.length).toBe(14);
    expect(caEligible.some(c => c.slug === 'fresno')).toBe(true);

    const states = ['CA', 'TX', 'NY', 'FL', 'IL'];
    let totalEligible = 0;
    for (const s of states) {
      const eligible = await cityRepository.getEligibleCities(s);
      totalEligible += eligible.length;
    }
    expect(totalEligible).toBe(52);
  });
});
