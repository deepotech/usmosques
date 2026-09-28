/**
 * Three-valued logic representing capability presence:
 * - 'true': Verified present in dataset
 * - 'false': Explicitly verified absent
 * - 'unknown': Data not listed in directory (never assume true or false)
 */
export type TriState = 'true' | 'false' | 'unknown';

export interface AmenityCapabilities {
  wheelchairEntrance: boolean;
  wheelchairParking: boolean;
  wheelchairRestroom: boolean;
  wheelchairSeating: boolean;
  anyWheelchairAccessible: boolean;
  hasParking: boolean;
  hasRestroom: boolean;
  hearingLoop: boolean;
  // Raw features for complete transparency
  rawAccessibility: string[];
  rawAmenities: string[];
}

export interface AmenityFilterState {
  wheelchairEntrance?: boolean;
  wheelchairParking?: boolean;
  wheelchairRestroom?: boolean;
  parking?: boolean;
  restroom?: boolean;
}

export const EMPTY_AMENITY_FILTERS: AmenityFilterState = {
  wheelchairEntrance: false,
  wheelchairParking: false,
  wheelchairRestroom: false,
  parking: false,
  restroom: false,
};

export interface AmenityFilterCounts {
  wheelchairEntrance: number;
  wheelchairParking: number;
  wheelchairRestroom: number;
  parking: number;
  restroom: number;
}
