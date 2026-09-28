import { RawMosqueRecord } from './validation';
import { Mosque, MosqueDataStatus, MosqueOpeningHourDay } from '@/types/mosque';
import { getStateConfig, normalizeStateCode } from '@/lib/config/state-registry';

/**
 * Creates a URL-friendly, safe slug from mosque name and city/id
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^\w\s-]/g, '') // remove non-word chars except hyphens
    .trim()
    .replace(/[\s_-]+/g, '-') // collapse spaces and dashes
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

/**
 * Standardizes phone number to US format: (xxx) xxx-xxxx or preserves clean raw
 */
export function normalizePhone(rawPhone?: string | null): string | undefined {
  if (!rawPhone) return undefined;
  const trimmed = rawPhone.trim();
  if (!trimmed) return undefined;

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return trimmed;
}

/**
 * Validates and normalizes website URL
 */
export function normalizeWebsite(rawWebsite?: string | null): string | undefined {
  if (!rawWebsite) return undefined;
  const trimmed = rawWebsite.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed);
    if (['http:', 'https:'].includes(url.protocol)) {
      return url.toString();
    }
  } catch {
    // Malformed URL, do not publish
    return undefined;
  }
  return undefined;
}

/**
 * Parses fallback city, state, postal code from address string if missing
 * e.g. "3852 Akers Rd, Bakersfield, CA 93309"
 */
export function parseAddressFallback(address: string): {
  city?: string;
  state?: string;
  stateCode?: string;
  postalCode?: string;
} {
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 3) {
    const city = parts[parts.length - 2];
    const stateZip = parts[parts.length - 1]; // "CA 93309"
    const stateZipMatch = stateZip.match(/^([A-Za-z]{2})\s*(\d{5}(-\d{4})?)?$/);
    if (stateZipMatch) {
      const stateCode = stateZipMatch[1].toUpperCase();
      const postalCode = stateZipMatch[2];
      const config = getStateConfig(stateCode);
      const state = config ? config.name : stateCode;
      return { city, state, stateCode, postalCode };
    }
    return { city };
  }
  return {};
}

/**
 * Classifies the validation status of a record based on category, name, and attributes
 */
export function determineDataStatus(
  raw: RawMosqueRecord,
  isSharedAddress = false
): { status: MosqueDataStatus; reason?: string } {
  const catNameLower = (raw.categoryName || '').toLowerCase();
  const allCats = (raw.categories || []).map(c => c.toLowerCase());
  const titleLower = raw.title.toLowerCase();

  // 1. Explicit commercial / retail exclusion
  const hasCommercial =
    catNameLower.includes('caterer') ||
    catNameLower.includes('restaurant') ||
    catNameLower.includes('grocery') ||
    catNameLower.includes('food market') ||
    allCats.some(c =>
      c.includes('caterer') || c.includes('restaurant') || c.includes('grocery') || c.includes('food market')
    );

  if (hasCommercial) {
    return { status: 'excluded', reason: 'Commercial food/catering business' };
  }
  if (catNameLower.includes('clothing store') || allCats.some(c => c.includes('clothing store'))) {
    return { status: 'excluded', reason: 'Retail clothing store' };
  }

  // 2. Needs review: Pure educational or cultural entity without mosque in primary title/category
  const isPureSchool =
    (catNameLower.includes('school') || catNameLower.includes('educational institution')) &&
    !titleLower.includes('masjid') &&
    !titleLower.includes('mosque') &&
    !titleLower.includes('islamic center');

  if (isPureSchool) {
    return { status: 'needs_review', reason: 'Educational institution requiring facility verification' };
  }

  if (isSharedAddress) {
    return { status: 'needs_review', reason: 'Shares address with another organization or facility' };
  }

  const isCulturalOrFoundation =
    catNameLower.includes('cultural center') ||
    catNameLower.includes('foundation') ||
    catNameLower.includes('non-profit organization');

  if (isCulturalOrFoundation && !titleLower.includes('masjid') && !titleLower.includes('mosque')) {
    return { status: 'needs_review', reason: 'Community/cultural foundation needing prayer hall verification' };
  }

  // 3. Verified
  return { status: 'verified', reason: 'Standard recognized Islamic center or mosque' };
}

/**
 * Extracts structured accessibility and amenities from raw.additionalInfo
 */
export function extractFeatures(additionalInfo?: Record<string, unknown> | null): {
  accessibility: string[];
  amenities: string[];
} {
  const accessibility: string[] = [];
  const amenities: string[] = [];

  if (!additionalInfo || typeof additionalInfo !== 'object') {
    return { accessibility, amenities };
  }

  // Accessibility
  if (Array.isArray(additionalInfo.Accessibility)) {
    additionalInfo.Accessibility.forEach((item: Record<string, boolean>) => {
      Object.entries(item).forEach(([key, val]) => {
        if (val === true && !accessibility.includes(key)) {
          accessibility.push(key);
        }
      });
    });
  }

  // Amenities
  if (Array.isArray(additionalInfo.Amenities)) {
    additionalInfo.Amenities.forEach((item: Record<string, boolean>) => {
      Object.entries(item).forEach(([key, val]) => {
        if (val === true && !amenities.includes(key)) {
          amenities.push(key);
        }
      });
    });
  }

  // Parking
  if (Array.isArray(additionalInfo.Parking)) {
    additionalInfo.Parking.forEach((item: Record<string, boolean>) => {
      Object.entries(item).forEach(([key, val]) => {
        if (val === true && !amenities.includes(key)) {
          amenities.push(key);
        }
      });
    });
  }

  return { accessibility, amenities };
}

/**
 * Calculates rating and review count from authentic review data without inventing scores
 */
export function computeReviewStats(raw: RawMosqueRecord): {
  rating?: number;
  reviewCount?: number;
} {
  const reviewCount = typeof raw.reviewsCount === 'number' && raw.reviewsCount > 0
    ? raw.reviewsCount
    : raw.reviews?.length || undefined;

  // Compute average rating from reviews if stars are recorded
  let rating: number | undefined = undefined;
  if (Array.isArray(raw.reviews) && raw.reviews.length > 0) {
    const validStars = raw.reviews
      .map(r => r.stars)
      .filter((s): s is number => typeof s === 'number' && s >= 1 && s <= 5);

    if (validStars.length > 0) {
      const avg = validStars.reduce((acc, curr) => acc + curr, 0) / validStars.length;
      rating = Math.round(avg * 10) / 10;
    }
  }

  return { rating, reviewCount };
}

/**
 * Normalizes a raw mosque record into the domain Mosque model.
 * Pure function: DOES NOT mutate raw input.
 */
export function normalizeMosqueRecord(
  raw: RawMosqueRecord,
  index: number,
  existingSlugs = new Set<string>(),
  sharedAddressSet = new Set<string>(),
  defaultStateCode = 'CA',
  defaultStateName = 'California'
): Mosque {
  // Deep clone check / safety
  const rawCopy: RawMosqueRecord = JSON.parse(JSON.stringify(raw));

  const fallback = parseAddressFallback(rawCopy.address);
  const city = (rawCopy.city?.trim() || fallback.city || 'Unknown City').trim();
  const rawStateCode = rawCopy.state ? normalizeStateCode(rawCopy.state) : undefined;
  const stateCode = (fallback.stateCode || rawStateCode || defaultStateCode).trim().toUpperCase();
  const stateConfig = getStateConfig(stateCode);
  const state = (rawCopy.state?.trim() || fallback.state || (stateConfig ? stateConfig.name : defaultStateName)).trim();
  const postalCode = rawCopy.postalCode?.trim() || fallback.postalCode || undefined;

  // Unique ID
  const id = rawCopy.cid || rawCopy.placeId || `mosque-${stateCode.toLowerCase()}-${index}`;

  // Unique Slug generation
  let baseSlug = slugify(rawCopy.title);
  if (!baseSlug) baseSlug = `mosque-${index}`;
  let finalSlug = baseSlug;

  if (existingSlugs.has(finalSlug)) {
    finalSlug = `${baseSlug}-${slugify(city)}`;
  }
  if (existingSlugs.has(finalSlug)) {
    const shortId = id.slice(-6).replace(/[^\w]/g, '');
    finalSlug = `${finalSlug}-${shortId || index}`;
  }
  existingSlugs.add(finalSlug);

  // Address deduplication check
  const normAddr = rawCopy.address.trim().toLowerCase();
  const isSharedAddress = sharedAddressSet.has(normAddr);

  // Status classification
  const { status, reason } = determineDataStatus(rawCopy, isSharedAddress);

  // Features
  const { accessibility, amenities } = extractFeatures(rawCopy.additionalInfo);

  // Reviews
  const { rating, reviewCount } = computeReviewStats(rawCopy);

  // Images
  const rawImages: string[] = [];
  if (rawCopy.imageUrl && rawCopy.imageUrl.startsWith('http')) {
    rawImages.push(rawCopy.imageUrl);
  }
  if (Array.isArray(rawCopy.imageUrls)) {
    rawCopy.imageUrls.forEach(img => {
      if (typeof img === 'string' && img.startsWith('http') && !rawImages.includes(img)) {
        rawImages.push(img);
      }
    });
  }

  // Opening hours
  const openingHours: MosqueOpeningHourDay[] = Array.isArray(rawCopy.openingHours)
    ? rawCopy.openingHours.map(oh => ({
        day: oh.day,
        hours: oh.hours.replace(/\u202f/g, ' ').trim(), // standardize non-breaking spaces
      }))
    : [];

  return {
    id,
    cid: rawCopy.cid || undefined,
    placeId: rawCopy.placeId || undefined,
    name: rawCopy.title.trim(),
    slug: finalSlug,
    address: rawCopy.address.trim(),
    street: rawCopy.street?.trim() || undefined,
    city,
    state,
    stateCode,
    postalCode,
    latitude: rawCopy.location.lat,
    longitude: rawCopy.location.lng,
    phone: normalizePhone(rawCopy.phone),
    website: normalizeWebsite(rawCopy.website),
    imageUrl: rawImages[0] || undefined,
    images: rawImages,
    rating,
    reviewCount,
    openingHours: openingHours.length > 0 ? openingHours : undefined,
    categoryName: rawCopy.categoryName || 'Mosque',
    categories: rawCopy.categories || ['Mosque'],
    amenities,
    accessibility,
    description: rawCopy.description?.trim() || undefined,
    source: 'california_dataset',
    sourceUrl: rawCopy.url || undefined,
    dataStatus: status,
    statusReason: reason,
  };
}

/**
 * Normalizes an entire array of raw records
 */
export function normalizeMosqueDataset(records: RawMosqueRecord[]): Mosque[] {
  // Pre-calculate duplicate addresses
  const addrCounts = new Map<string, number>();
  records.forEach(r => {
    if (r.address) {
      const a = r.address.trim().toLowerCase();
      addrCounts.set(a, (addrCounts.get(a) || 0) + 1);
    }
  });

  const sharedAddressSet = new Set<string>();
  for (const [addr, count] of addrCounts.entries()) {
    if (count > 1) {
      sharedAddressSet.add(addr);
    }
  }

  const existingSlugs = new Set<string>();
  return records.map((record, idx) =>
    normalizeMosqueRecord(record, idx, existingSlugs, sharedAddressSet)
  );
}
