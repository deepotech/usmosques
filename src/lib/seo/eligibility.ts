import { getStateConfig, getEnabledStates, StateConfig, normalizeStateCode } from '@/lib/config/state-registry';
import { cityRepository } from '@/lib/data/city-repository';
import { CitySummary } from '@/types/city';

/**
 * State-level SEO Eligibility Policy
 */
export interface StateSeoEligibilityPolicy {
  /** Minimum number of verified mosque entities required for an indexable state directory */
  minVerifiedMosques: number;
  /** Minimum number of eligible city directories required for an indexable state directory */
  minEligibleCities: number;
}

export const DEFAULT_STATE_SEO_POLICY: StateSeoEligibilityPolicy = {
  minVerifiedMosques: 10,
  minEligibleCities: 1,
};

/**
 * City-level SEO Eligibility Policy
 *
 * Strict Threshold Rationale:
 * - Tier A: Cities with >= 5 publishable mosques (Eligible for standalone indexable city directory).
 * - Tier B (2-4 mosques) & Tier C (1 mosque): Ineligible for standalone city landing pages.
 *   Generating hundreds of standalone city pages for single-mosque towns creates thin,
 *   low-value doorway pages penalized under Google Search Essentials.
 *   Entities in smaller towns are instead indexed via canonical detail pages and linked
 *   from their respective State Directory.
 */
export interface CitySeoEligibilityPolicy {
  /** Minimum number of publishable mosques required for an indexable city landing page */
  minMosqueCount: number;
  /** Whether to allow Tier B cities (2-4 mosques) as standalone indexable pages */
  allowTierB: boolean;
}

export const DEFAULT_CITY_SEO_POLICY: CitySeoEligibilityPolicy = {
  minMosqueCount: 5,
  allowTierB: false,
};

/**
 * Evaluates whether a state qualifies for an indexable SEO directory page.
 * Eligibility is determined by the state registry (enabled + seoEnabled flags).
 */
export function isStateEligibleForSeo(stateCodeOrSlug: string): boolean {
  const config = getStateConfig(stateCodeOrSlug);
  if (!config || !config.enabled || !config.seoEnabled) {
    return false;
  }
  // Enabled states in the registry have been verified through data ingestion
  return true;
}

/**
 * Returns all states that qualify for indexable state directories.
 */
export function getIndexableStates(): StateConfig[] {
  return getEnabledStates().filter(s => isStateEligibleForSeo(s.code));
}

/**
 * Evaluates whether a mosque count qualifies a city for an indexable SEO landing page.
 */
export function isCityCountEligible(
  mosqueCount: number,
  policy: CitySeoEligibilityPolicy = DEFAULT_CITY_SEO_POLICY
): boolean {
  if (mosqueCount >= policy.minMosqueCount) {
    return true;
  }
  if (policy.allowTierB && mosqueCount >= 2 && mosqueCount < policy.minMosqueCount) {
    return true;
  }
  return false;
}

/**
 * Checks whether a specific city in a state is eligible for an indexable SEO directory page.
 *
 * @param stateCode State code or slug (e.g. 'CA' or 'california')
 * @param cityOrSlug City name or slug (e.g. 'Los Angeles' or 'los-angeles')
 */
export async function isIndexableCity(
  stateCode: string,
  cityOrSlug: string,
  policy: CitySeoEligibilityPolicy = DEFAULT_CITY_SEO_POLICY
): Promise<boolean> {
  const code = normalizeStateCode(stateCode);
  const city = await cityRepository.getCityBySlug(cityOrSlug, false, code);
  if (!city) {
    return false;
  }
  return isCityCountEligible(city.mosqueCount, policy);
}

/**
 * Retrieves all indexable city directories for a given state.
 */
export async function getIndexableCities(
  stateCode: string,
  policy: CitySeoEligibilityPolicy = DEFAULT_CITY_SEO_POLICY
): Promise<CitySummary[]> {
  const code = normalizeStateCode(stateCode);
  const allCities = await cityRepository.getAllCities(code);
  return allCities.filter(c => isCityCountEligible(c.mosqueCount, policy));
}
