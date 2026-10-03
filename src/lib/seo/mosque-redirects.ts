/**
 * Centralized Legacy Mosque Redirect Service (Phase 4C.1 §11, §12)
 *
 * Rules:
 * 1. An old slug may ONLY receive a 301 redirect if it historically mapped to
 *    EXACTLY ONE entity and that entity moved to a new canonical slug.
 * 2. If an old slug currently represents multiple distinct entities (ambiguous),
 *    it MUST NOT be redirected to an arbitrarily selected entity.
 *    Arbitrary redirects would incorrectly send users of facility B to facility A.
 */

/**
 * Known ambiguous legacy slugs from Phase 4C-Preflight.
 * Each of these slugs historically corresponded to multiple distinct physical
 * entities across different states. None of these may receive an automated redirect.
 */
export const AMBIGUOUS_LEGACY_SLUGS: ReadonlySet<string> = new Set([
  'ahmadiyya-movement-in-islam',
  'al-ansar-mosque',
  'al-farooq-mosque',
  'al-ihsaan-mosque',
  'al-iman-mosque',
  'al-islam-mosque',
  'al-noor-mosque',
  'al-rahma-mosque',
  'albanian-american-islamic-center',
  'ar-rahman-islamic-center',
  'islamic-center',
  'islamic-center-of-quad-cities',
  'makki-masjid',
  'masjid',
  'masjid-abu-bakr',
  'masjid-abu-huraira',
  'masjid-al-huda',
  'masjid-al-ihsaan',
  'masjid-al-ihsan',
  'masjid-al-ikhlas',
  'masjid-al-noor',
  'masjid-al-rahman',
  'masjid-hamza',
  'masjid-ibrahim',
  'masjid-salam',
  'masjid-usman',
  'mosque',
  'muhammad-mosque',
  'musalla',
  'umar-mosque',
]);

/**
 * Verified, unambiguous 1:1 legacy redirects.
 * Only populated if a historical slug uniquely represented one entity.
 */
export const SAFE_LEGACY_REDIRECTS: ReadonlyMap<string, string> = new Map([
  // Example for future single-entity migrations:
  // ['old-unique-slug', '/mosque/new-canonical-slug'],
]);

/**
 * Evaluates whether a requested slug has a safe, unambiguous redirect target.
 *
 * @param slug The requested slug from URL
 * @returns The destination canonical path if safe, or null if ambiguous or not found.
 */
export function getLegacyRedirect(slug: string): string | null {
  // If the slug is known to be ambiguous, NEVER redirect.
  if (AMBIGUOUS_LEGACY_SLUGS.has(slug)) {
    return null;
  }

  // If a verified 1:1 mapping exists, return the destination path.
  const destination = SAFE_LEGACY_REDIRECTS.get(slug);
  return destination || null;
}

/**
 * Checks whether a requested slug is an ambiguous legacy collision slug.
 */
export function isAmbiguousLegacySlug(slug: string): boolean {
  return AMBIGUOUS_LEGACY_SLUGS.has(slug);
}
