/**
 * Radius of the Earth in miles and kilometers
 */
const EARTH_RADIUS_MILES = 3958.8;

/**
 * Calculates Haversine distance between two latitude/longitude points in miles
 */
export function calculateHaversineDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2) ||
    lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90 ||
    lon1 < -180 || lon1 > 180 || lon2 < -180 || lon2 > 180
  ) {
    return Infinity;
  }

  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_MILES * c;
  return Math.round(distance * 10) / 10;
}

/**
 * Human-friendly distance badge string
 * e.g. "0.4 mi", "3.2 mi", "15 mi"
 */
export function formatDistanceMiles(distance?: number | null): string | null {
  if (distance === undefined || distance === null || isNaN(distance) || distance === Infinity) {
    return null;
  }
  if (distance < 0.1) {
    return '< 0.1 mi';
  }
  if (distance < 10) {
    return `${distance.toFixed(1)} mi`;
  }
  return `${Math.round(distance)} mi`;
}
