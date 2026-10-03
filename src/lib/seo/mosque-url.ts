import { Mosque } from '@/types/mosque';
import { slugify } from '@/lib/data/normalization';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://usmosques.com';

/**
 * Returns the canonical URL path for a mosque entity.
 * Example: `/mosque/islamic-center-of-davis`
 */
export function getMosquePath(mosque: { slug: string }): string {
  return `/mosque/${mosque.slug}`;
}

/**
 * Returns the full absolute canonical URL for a mosque entity.
 * Example: `https://usmosques.com/mosque/islamic-center-of-davis`
 */
export function getMosqueCanonicalUrl(mosque: { slug: string }): string {
  return `${BASE_URL}${getMosquePath(mosque)}`;
}

/**
 * Builds a deterministic disambiguated slug for a mosque using:
 * `{name}-{city}-{stateCode}`
 */
export function buildDisambiguatedSlug(name: string, city: string, stateCode: string): string {
  const baseName = slugify(name);
  const citySlug = slugify(city);
  const stateSlug = stateCode.trim().toLowerCase();
  return `${baseName}-${citySlug}-${stateSlug}`;
}

/**
 * Resolves global canonical unique slugs for a collection of mosques across all enabled states.
 *
 * Implements the 7-step collision resolution algorithm (Phase 4C.1 §7):
 * STEP 1: Determine the baseline slug (from mosque.slug).
 * STEP 2: Check whether that slug is unique among all entities.
 * STEP 3: If unique: preserve it unchanged (preserves 1,419 existing unique URLs).
 * STEP 4: If duplicated: generate deterministic `name + city + state` slug.
 * STEP 5: Check uniqueness again against all allocated slugs.
 * STEP 6: If still duplicated: append a deterministic stable entity identifier (short ID from placeId/cid).
 * STEP 7: Verify final global uniqueness.
 *
 * @param mosques Array of normalized mosques across all states
 * @returns Map of mosque.id -> unique canonical slug
 */
export function resolveCanonicalMosqueSlugs(mosques: Mosque[]): Map<string, string> {
  // Map of mosque.id -> canonicalSlug
  const idToCanonicalSlug = new Map<string, string>();

  // Count frequencies of baseline slugs across all records
  const baselineCounts = new Map<string, number>();
  for (const m of mosques) {
    baselineCounts.set(m.slug, (baselineCounts.get(m.slug) || 0) + 1);
  }

  // Set of all currently claimed canonical slugs
  const claimedSlugs = new Set<string>();

  // Step 3: First pass — allocate all unique baseline slugs
  for (const m of mosques) {
    if (baselineCounts.get(m.slug) === 1) {
      idToCanonicalSlug.set(m.id, m.slug);
      claimedSlugs.add(m.slug);
    }
  }

  // Step 4 & 5 & 6: Second pass — resolve collision groups
  for (const m of mosques) {
    if (baselineCounts.get(m.slug)! > 1) {
      // Step 4: Generate name + city + state
      let disambiguated = buildDisambiguatedSlug(m.name, m.city, m.stateCode);

      // Step 5 & 6: If still colliding with an existing slug, append stable short ID
      if (claimedSlugs.has(disambiguated)) {
        const rawId = m.placeId || m.cid || m.id;
        const shortId = rawId.slice(-6).replace(/[^\w]/g, '').toLowerCase() || '1';
        disambiguated = `${disambiguated}-${shortId}`;
      }

      // If extreme theoretical collision still occurs, increment suffix
      let finalSlug = disambiguated;
      let counter = 2;
      while (claimedSlugs.has(finalSlug)) {
        finalSlug = `${disambiguated}-${counter}`;
        counter++;
      }

      idToCanonicalSlug.set(m.id, finalSlug);
      claimedSlugs.add(finalSlug);
    }
  }

  // Step 7: Final global uniqueness check
  if (claimedSlugs.size !== mosques.length) {
    throw new Error(
      `[mosque-url] Global slug uniqueness invariant violated: ${claimedSlugs.size} unique slugs for ${mosques.length} mosques.`
    );
  }

  return idToCanonicalSlug;
}

/**
 * Returns a new array of mosques where each mosque's `.slug` is updated to its
 * globally unique canonical slug.
 */
export function applyCanonicalSlugs(mosques: Mosque[]): Mosque[] {
  const canonicalMap = resolveCanonicalMosqueSlugs(mosques);
  return mosques.map(m => {
    const canonicalSlug = canonicalMap.get(m.id);
    if (!canonicalSlug || canonicalSlug === m.slug) {
      return m;
    }
    return {
      ...m,
      slug: canonicalSlug,
    };
  });
}
