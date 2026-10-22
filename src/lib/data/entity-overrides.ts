import { MosqueDataStatus } from '@/types/mosque';

/**
 * Targeted Entity Classification Override Definition
 */
export interface EntityStatusOverride {
  /** Unique Google Maps CID or PlaceID identifying the record */
  id: string;
  /** Exact entity title in raw dataset for audit verification */
  title: string;
  /** Physical address for audit verification */
  address: string;
  /** Resolved data classification status */
  overrideStatus: MosqueDataStatus;
  /** Concise classification rationale */
  reason: string;
  /** Empirical evidence supporting the override */
  evidence: string;
}

/**
 * Auditable registry of empirical entity classification overrides.
 *
 * POLICY:
 * - An override is ONLY permitted when documented empirical evidence resolves
 *   an automated heuristic conflict (e.g. address-sharing false positive between
 *   a physical place of worship and its secondary outreach service).
 * - Must NOT be used to bypass genuine validation failures or fabricate status.
 */
export const ENTITY_STATUS_OVERRIDES: Record<string, EntityStatusOverride> = {
  // CID 10783269688215790709: Masjid Fresno مسجد Islamic Center
  // Located at 2111 E Shaw Ave, Fresno, CA 93710.
  // Co-located with its secondary dawah hotline listing "Info 2 Islam" (559-229-ISLAM).
  // Overwhelming evidence confirms it is the primary physical place of worship:
  // 287 Google reviews, 117 photos displaying dome and minaret architecture,
  // 7-day operating hours (10 AM to 10 PM), wheelchair accessibility, and official
  // domain (masjidfresno.org).
  '10783269688215790709': {
    id: '10783269688215790709',
    title: 'Masjid Fresno مسجد Islamic Center',
    address: '2111 E Shaw Ave, Fresno, CA 93710',
    overrideStatus: 'verified',
    reason: 'Primary verified place of worship at 2111 E Shaw Ave (co-located with outreach hotline)',
    evidence: '287 reviews, 117 photos with dome/minaret, 7-day operating hours, official domain masjidfresno.org',
  },
};

/**
 * Retrieves an empirical status override by record CID or placeId if one exists.
 */
export function getEntityStatusOverride(
  cid?: string | null,
  placeId?: string | null
): EntityStatusOverride | undefined {
  if (cid && ENTITY_STATUS_OVERRIDES[cid]) {
    return ENTITY_STATUS_OVERRIDES[cid];
  }
  if (placeId && ENTITY_STATUS_OVERRIDES[placeId]) {
    return ENTITY_STATUS_OVERRIDES[placeId];
  }
  return undefined;
}
