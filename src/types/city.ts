import { Mosque } from './mosque';

export type CityTier = 'tier_a' | 'tier_b' | 'tier_c';

export interface CityCoordinates {
  latitude: number;
  longitude: number;
}

export interface CitySummary {
  city: string;
  slug: string;
  state: string;
  stateCode: string;
  /** Number of publishable mosques (excludes commercial/restaurant entities) */
  mosqueCount: number;
  verifiedCount: number;
  needsReviewCount: number;
  excludedCount: number;
  mosques: Mosque[];
  centerCoordinates?: CityCoordinates;
  withHoursCount: number;
  withPhoneCount: number;
  withWebsiteCount: number;
  withImagesCount: number;
  totalReviewsCount: number;
  tier: CityTier;
  isEligible: boolean;
}
