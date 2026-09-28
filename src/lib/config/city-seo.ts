/**
 * Centralized configuration for City-level SEO pages.
 * 
 * Rules:
 * - Tier A: Cities with >= CITY_SEO_MIN_MOSQUES (Default: 5)
 * - Tier B: Cities with 2-4 mosques (Can be selectively enabled)
 * - Tier C: Cities with 1 mosque (Never indexed as standalone city landing pages)
 */

export interface CitySeoConfig {
  /** Minimum number of publishable mosques required for an indexable city landing page */
  minMosqueCount: number;
  /** Whether to allow Tier B cities (2-4 mosques) if they meet content thresholds */
  allowTierB: boolean;
}

export const DEFAULT_CITY_SEO_CONFIG: CitySeoConfig = {
  minMosqueCount: 5, // Strict threshold: prevents thin content and doorway pages
  allowTierB: false,
};

/**
 * Determines if a city qualifies for an indexable SEO landing page
 */
export function isCityEligibleForSeo(
  mosqueCount: number,
  config: CitySeoConfig = DEFAULT_CITY_SEO_CONFIG
): boolean {
  if (mosqueCount >= config.minMosqueCount) {
    return true;
  }
  if (config.allowTierB && mosqueCount >= 2 && mosqueCount < config.minMosqueCount) {
    return true;
  }
  return false;
}
