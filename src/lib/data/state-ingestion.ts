import { RawMosqueRecord, RawMosqueRecordSchema } from './validation';
import { normalizeMosqueRecord, parseAddressFallback } from './normalization';
import { Mosque } from '@/types/mosque';
import { StateIngestionResult } from '@/types/state';
import { getStateConfig, normalizeStateCode } from '@/lib/config/state-registry';

/**
 * Checks whether latitude/longitude coordinates fall inside a state's geographic bounding box.
 */
export function isCoordinateInState(lat: number, lng: number, stateCode: string): boolean {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    return false;
  }
  const config = getStateConfig(stateCode);
  if (!config?.bounds) return false;
  return (
    lat >= config.bounds.minLat &&
    lat <= config.bounds.maxLat &&
    lng >= config.bounds.minLng &&
    lng <= config.bounds.maxLng
  );
}

/**
 * Validates whether coordinates or a raw record belongs inside the expected state boundaries.
 */
export function validateStateBoundary(lat: number, lng: number, expectedStateCode: string): boolean;
export function validateStateBoundary(
  raw: RawMosqueRecord,
  expectedStateCode: string
): { matches: boolean; detectedState?: string };
export function validateStateBoundary(
  rawOrLat: RawMosqueRecord | number,
  expectedOrLng: string | number,
  maybeExpectedStateCode?: string
): boolean | { matches: boolean; detectedState?: string } {
  if (typeof rawOrLat === 'number' && typeof expectedOrLng === 'number' && maybeExpectedStateCode) {
    return isCoordinateInState(rawOrLat, expectedOrLng, maybeExpectedStateCode);
  }

  const raw = rawOrLat as RawMosqueRecord;
  const expectedStateCode = expectedOrLng as string;
  const normExpected = expectedStateCode.toUpperCase().trim();
  const rawStateCode = raw.state ? normalizeStateCode(raw.state) : undefined;
  const fallback = parseAddressFallback(raw.address);
  const detectedCode = (rawStateCode || fallback.stateCode || '').toUpperCase().trim();

  // Also check GPS coordinates against state bounds if available
  const lat = raw.location?.lat;
  const lng = raw.location?.lng;
  let coordMatches = true;
  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    coordMatches = isCoordinateInState(lat, lng, normExpected);
  }

  if (detectedCode && detectedCode !== normExpected) {
    return { matches: false, detectedState: detectedCode };
  }

  if (!coordMatches) {
    return { matches: false, detectedState: 'OUT_OF_BOUNDS' };
  }

  return {
    matches: true,
    detectedState: detectedCode || normExpected,
  };
}

/**
 * Ingests, validates, and normalizes a state dataset.
 * Guaranteed to be pure: DOES NOT mutate raw input data.
 */
export function ingestStateDataset(
  rawRecords: unknown[],
  stateCode: string
): {
  result: StateIngestionResult;
  mosques: Mosque[];
} {
  const config = getStateConfig(stateCode);
  const normStateCode = config?.code || stateCode.toUpperCase().trim();
  const stateName = config?.name || normStateCode;

  const errors: string[] = [];
  const warnings: string[] = [];
  const boundaryMismatches: StateIngestionResult['boundaryMismatches'] = [];

  let validSchemaCount = 0;
  let invalidSchemaCount = 0;

  // Coordinate and address maps for deduplication
  const coordMap = new Map<string, string[]>();
  const addrMap = new Map<string, string[]>();

  const validRawRecords: RawMosqueRecord[] = [];

  rawRecords.forEach((item, idx) => {
    const parseResult = RawMosqueRecordSchema.safeParse(item);
    if (!parseResult.success) {
      invalidSchemaCount++;
      const title =
        typeof item === 'object' && item !== null && 'title' in item
          ? String((item as Record<string, unknown>).title)
          : `Record #${idx}`;
      errors.push(`Invalid schema for record "${title}": ${parseResult.error.message}`);
      return;
    }

    validSchemaCount++;
    const raw = parseResult.data;
    validRawRecords.push(raw);

    // Boundary check
    const boundaryCheck = validateStateBoundary(raw, normStateCode);
    if (!boundaryCheck.matches) {
      boundaryMismatches.push({
        recordIndex: idx,
        title: raw.title,
        detectedState: boundaryCheck.detectedState,
      });
      warnings.push(
        `Record "${raw.title}" has state "${boundaryCheck.detectedState}" differing from expected "${normStateCode}"`
      );
    }

    // Duplicate detection
    if (raw.location && typeof raw.location.lat === 'number' && typeof raw.location.lng === 'number') {
      const coordKey = `${raw.location.lat.toFixed(5)},${raw.location.lng.toFixed(5)}`;
      const coordList = coordMap.get(coordKey) || [];
      coordList.push(raw.title);
      coordMap.set(coordKey, coordList);
    }

    const normAddr = raw.address.trim().toLowerCase();
    const addrList = addrMap.get(normAddr) || [];
    addrList.push(raw.title);
    addrMap.set(normAddr, addrList);
  });

  const duplicateCoordinates = Array.from(coordMap.entries()).filter(([, list]) => list.length > 1);
  const duplicateAddresses = Array.from(addrMap.entries()).filter(([, list]) => list.length > 1);
  const sharedAddressSet = new Set(duplicateAddresses.map(([addr]) => addr));

  // Normalization
  const existingSlugs = new Set<string>();
  const mosques: Mosque[] = [];
  let verifiedCount = 0;
  let needsReviewCount = 0;
  let excludedCount = 0;

  let withPhone = 0;
  let withWebsite = 0;
  let withHours = 0;
  let withImages = 0;
  let withAmenities = 0;
  let withValidGps = 0;

  validRawRecords.forEach((raw, idx) => {
    const mosque = normalizeMosqueRecord(
      raw,
      idx,
      existingSlugs,
      sharedAddressSet,
      normStateCode,
      stateName
    );

    // If boundary mismatch occurred, mark as needs_review if not already excluded
    if (boundaryMismatches.some(bm => bm.recordIndex === idx) && mosque.dataStatus === 'verified') {
      mosque.dataStatus = 'needs_review';
      mosque.statusReason = `Potential state boundary mismatch (${mosque.stateCode} vs ${normStateCode})`;
    }

    if (mosque.dataStatus === 'verified') verifiedCount++;
    if (mosque.dataStatus === 'needs_review') needsReviewCount++;
    if (mosque.dataStatus === 'excluded') excludedCount++;

    if (
      typeof mosque.latitude === 'number' &&
      !isNaN(mosque.latitude) &&
      typeof mosque.longitude === 'number' &&
      !isNaN(mosque.longitude)
    ) {
      withValidGps++;
    }
    if (mosque.phone) withPhone++;
    if (mosque.website) withWebsite++;
    if (mosque.openingHours && mosque.openingHours.length > 0) withHours++;
    if (mosque.imageUrl || mosque.images.length > 0) withImages++;
    if (mosque.accessibility.length > 0 || mosque.amenities.length > 0) withAmenities++;

    mosques.push(mosque);
  });

  const total = rawRecords.length;
  const metrics = {
    validGpsPercentage: total > 0 ? Math.round((withValidGps / total) * 100) : 0,
    phoneCoveragePercentage: total > 0 ? Math.round((withPhone / total) * 100) : 0,
    websiteCoveragePercentage: total > 0 ? Math.round((withWebsite / total) * 100) : 0,
    hoursCoveragePercentage: total > 0 ? Math.round((withHours / total) * 100) : 0,
    imagesCoveragePercentage: total > 0 ? Math.round((withImages / total) * 100) : 0,
    amenitiesCoveragePercentage: total > 0 ? Math.round((withAmenities / total) * 100) : 0,
  };

  // Quality gate rules: GPS >= 95%, valid schema = 100%
  if (metrics.validGpsPercentage < 95) {
    errors.push(`GPS coverage (${metrics.validGpsPercentage}%) is below minimum threshold of 95%`);
  }
  if (invalidSchemaCount > 0) {
    errors.push(`Dataset contains ${invalidSchemaCount} schema validation failures`);
  }

  const qualityGatePassed =
    invalidSchemaCount === 0 &&
    metrics.validGpsPercentage >= 95 &&
    errors.length === 0;

  const result: StateIngestionResult = {
    stateCode: normStateCode,
    stateName,
    totalRaw: total,
    validSchemaCount,
    invalidSchemaCount,
    verifiedCount,
    needsReviewCount,
    excludedCount,
    duplicateCoordinatesCount: duplicateCoordinates.length,
    duplicateAddressesCount: duplicateAddresses.length,
    metrics,
    boundaryMismatches,
    warnings,
    errors,
    qualityGatePassed,
  };

  return { result, mosques };
}
