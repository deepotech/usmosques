import { Mosque } from '@/types/mosque';
import {
  AmenityCapabilities,
  AmenityFilterState,
  AmenityFilterCounts,
} from '@/types/amenity';

/**
 * Pure function deriving normalized amenity & accessibility capabilities
 * from any canonical Mosque entity across any state (California, Texas, etc.).
 * 
 * Strict Three-Valued Logic:
 * - If a capability is verified in raw tags, it evaluates to true.
 * - If no information is listed, it evaluates to false (representing "unlisted", never assumed).
 */
export function extractAmenityCapabilities(mosque: Mosque): AmenityCapabilities {
  const acc = (mosque.accessibility || []).map(s => s.toLowerCase());
  const amen = (mosque.amenities || []).map(s => s.toLowerCase());
  const allTags = [...acc, ...amen];

  const wheelchairEntrance = acc.some(s => s.includes('wheelchair accessible entrance'));
  const wheelchairParking = acc.some(
    s => s.includes('wheelchair accessible parking') || s.includes('accessible parking')
  );
  const wheelchairRestroom = acc.some(s => s.includes('wheelchair accessible restroom'));
  const wheelchairSeating = acc.some(s => s.includes('wheelchair accessible seating'));

  const anyWheelchairAccessible =
    wheelchairEntrance ||
    wheelchairParking ||
    wheelchairRestroom ||
    wheelchairSeating ||
    acc.some(s => s.includes('wheelchair') || s.includes('accessible'));

  const hasParking =
    wheelchairParking ||
    allTags.some(s => s.includes('parking') || s.includes('garage') || s.includes('lot'));

  const hasRestroom =
    wheelchairRestroom ||
    allTags.some(s => s.includes('restroom') || s.includes('toilet') || s.includes('washroom'));

  const hearingLoop = acc.some(
    s => s.includes('hearing loop') || s.includes('auracast') || s.includes('broadcast audio')
  );

  return {
    wheelchairEntrance,
    wheelchairParking,
    wheelchairRestroom,
    wheelchairSeating,
    anyWheelchairAccessible,
    hasParking,
    hasRestroom,
    hearingLoop,
    rawAccessibility: mosque.accessibility || [],
    rawAmenities: mosque.amenities || [],
  };
}

/**
 * Evaluates whether a mosque satisfies all currently active amenity filters.
 * Missing or unlisted data NEVER matches an active filter (data trust rule).
 */
export function matchesAmenityFilters(mosque: Mosque, filters: AmenityFilterState): boolean {
  const caps = extractAmenityCapabilities(mosque);

  if (filters.wheelchairEntrance && !caps.wheelchairEntrance) {
    return false;
  }
  if (filters.wheelchairParking && !caps.wheelchairParking) {
    return false;
  }
  if (filters.wheelchairRestroom && !caps.wheelchairRestroom) {
    return false;
  }
  if (filters.parking && !caps.hasParking) {
    return false;
  }
  if (filters.restroom && !caps.hasRestroom) {
    return false;
  }

  return true;
}

/**
 * Counts how many mosques in a given candidate set satisfy each amenity filter.
 */
export function countAmenityCapabilities(mosques: Mosque[]): AmenityFilterCounts {
  let wheelchairEntrance = 0;
  let wheelchairParking = 0;
  let wheelchairRestroom = 0;
  let parking = 0;
  let restroom = 0;

  for (const m of mosques) {
    const caps = extractAmenityCapabilities(m);
    if (caps.wheelchairEntrance) wheelchairEntrance++;
    if (caps.wheelchairParking) wheelchairParking++;
    if (caps.wheelchairRestroom) wheelchairRestroom++;
    if (caps.hasParking) parking++;
    if (caps.hasRestroom) restroom++;
  }

  return {
    wheelchairEntrance,
    wheelchairParking,
    wheelchairRestroom,
    parking,
    restroom,
  };
}

/**
 * Returns the number of currently active amenity filters.
 */
export function countActiveAmenityFilters(filters: AmenityFilterState): number {
  let count = 0;
  if (filters.wheelchairEntrance) count++;
  if (filters.wheelchairParking) count++;
  if (filters.wheelchairRestroom) count++;
  if (filters.parking) count++;
  if (filters.restroom) count++;
  return count;
}

/**
 * Returns concise, user-friendly labels for confirmed amenities to render on cards.
 */
export function formatAmenityHighlights(caps: AmenityCapabilities): string[] {
  const highlights: string[] = [];

  if (caps.anyWheelchairAccessible) {
    highlights.push('♿ Accessible');
  }
  if (caps.hasParking) {
    highlights.push('🅿 Parking');
  }
  if (caps.hasRestroom) {
    highlights.push('🚻 Restroom');
  }

  return highlights;
}
