import { z } from 'zod';

export const RawLocationSchema = z.object({
  lat: z.number().refine(n => !isNaN(n) && n >= -90 && n <= 90, { message: 'Invalid latitude' }),
  lng: z.number().refine(n => !isNaN(n) && n >= -180 && n <= 180, { message: 'Invalid longitude' }),
});

export const RawOpeningHourSchema = z.object({
  day: z.string(),
  hours: z.string(),
});

export const RawReviewSchema = z.object({
  stars: z.number().nullable().optional(),
  rating: z.number().nullable().optional(),
  text: z.string().nullable().optional(),
  publishedAtDate: z.string().nullable().optional(),
  reviewerNumberOfReviews: z.number().nullable().optional(),
  isLocalGuide: z.boolean().nullable().optional(),
}).passthrough();

export const RawMosqueRecordSchema = z.object({
  title: z.string().min(1, 'Name/title is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  location: RawLocationSchema,
  phone: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  categories: z.array(z.string()).default([]),
  categoryName: z.string().default('Mosque'),
  openingHours: z.array(RawOpeningHourSchema).nullable().optional(),
  reviewsCount: z.number().nullable().optional(),
  reviews: z.array(RawReviewSchema).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  imageUrls: z.array(z.string()).nullable().optional(),
  additionalInfo: z.record(z.unknown()).nullable().optional(),
  cid: z.string().nullable().optional(),
  placeId: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
}).passthrough();

export type RawMosqueRecord = z.infer<typeof RawMosqueRecordSchema>;

export interface ValidationIssue {
  recordIndex: number;
  recordTitle: string;
  field: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface DataQualityReportData {
  totalRecords: number;
  validSchemaCount: number;
  invalidSchemaCount: number;
  duplicateCoordinates: { coords: string; records: string[] }[];
  duplicateAddresses: { address: string; records: string[] }[];
  missingCityCount: number;
  missingStateCount: number;
  missingPostalCodeCount: number;
  missingPhoneCount: number;
  missingWebsiteCount: number;
  missingOpeningHoursCount: number;
  missingImageCount: number;
  suspiciousCategoryCount: number;
  malformedUrls: { title: string; url: string; reason: string }[];
  issues: ValidationIssue[];
}

export function validateDataset(records: unknown[]): DataQualityReportData {
  const issues: ValidationIssue[] = [];
  let validSchemaCount = 0;
  let invalidSchemaCount = 0;

  const coordMap = new Map<string, string[]>();
  const addrMap = new Map<string, string[]>();
  const malformedUrls: { title: string; url: string; reason: string }[] = [];

  let missingCityCount = 0;
  let missingStateCount = 0;
  let missingPostalCodeCount = 0;
  let missingPhoneCount = 0;
  let missingWebsiteCount = 0;
  let missingOpeningHoursCount = 0;
  let missingImageCount = 0;
  let suspiciousCategoryCount = 0;

  // Commercial / retail keywords indicating non-mosque entities
  const suspiciousCategoryKeywords = ['clothing store', 'caterer', 'restaurant', 'hair salon'];

  records.forEach((raw, idx) => {
    const parseResult = RawMosqueRecordSchema.safeParse(raw);
    const title =
      typeof raw === 'object' && raw !== null && 'title' in raw
        ? String((raw as Record<string, unknown>).title)
        : `Record #${idx}`;

    if (!parseResult.success) {
      invalidSchemaCount++;
      parseResult.error.issues.forEach(iss => {
        issues.push({
          recordIndex: idx,
          recordTitle: title,
          field: iss.path.join('.'),
          severity: 'error',
          message: iss.message,
        });
      });
    } else {
      validSchemaCount++;
      const data = parseResult.data;

      // Coordinate tracking
      const coordKey = `${data.location.lat.toFixed(6)},${data.location.lng.toFixed(6)}`;
      if (!coordMap.has(coordKey)) coordMap.set(coordKey, []);
      coordMap.get(coordKey)!.push(data.title);

      // Address tracking
      const normAddr = data.address.trim().toLowerCase();
      if (!addrMap.has(normAddr)) addrMap.set(normAddr, []);
      addrMap.get(normAddr)!.push(data.title);

      // Field presence
      if (!data.city || data.city.trim() === '') {
        missingCityCount++;
        issues.push({
          recordIndex: idx,
          recordTitle: data.title,
          field: 'city',
          severity: 'warning',
          message: 'Missing city field in raw data (can be parsed from address)',
        });
      }

      if (!data.state || data.state.trim() === '') {
        missingStateCount++;
        issues.push({
          recordIndex: idx,
          recordTitle: data.title,
          field: 'state',
          severity: 'warning',
          message: 'Missing state field in raw data (can be parsed from address)',
        });
      }

      if (!data.postalCode || data.postalCode.trim() === '') {
        missingPostalCodeCount++;
      }

      if (!data.phone || data.phone.trim() === '') {
        missingPhoneCount++;
      }

      if (!data.website || data.website.trim() === '') {
        missingWebsiteCount++;
      } else {
        // Validate URL
        try {
          const parsedUrl = new URL(data.website);
          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            malformedUrls.push({ title: data.title, url: data.website, reason: 'Invalid protocol' });
          }
        } catch {
          malformedUrls.push({ title: data.title, url: data.website, reason: 'Invalid URL format' });
        }
      }

      if (!data.openingHours || data.openingHours.length === 0) {
        missingOpeningHoursCount++;
      }

      if (!data.imageUrl && (!data.imageUrls || data.imageUrls.length === 0)) {
        missingImageCount++;
      }

      // Check category
      const catLower = (data.categoryName || '').toLowerCase();
      const allCatsLower = (data.categories || []).map(c => c.toLowerCase());
      const isSuspicious = suspiciousCategoryKeywords.some(
        kw => catLower.includes(kw) || allCatsLower.some(c => c.includes(kw))
      );
      if (isSuspicious) {
        suspiciousCategoryCount++;
        issues.push({
          recordIndex: idx,
          recordTitle: data.title,
          field: 'categoryName',
          severity: 'warning',
          message: `Category indicates non-mosque business: ${data.categoryName}`,
        });
      }
    }
  });

  const duplicateCoordinates = Array.from(coordMap.entries())
    .filter(([, list]) => list.length > 1)
    .map(([coords, records]) => ({ coords, records }));

  const duplicateAddresses = Array.from(addrMap.entries())
    .filter(([, list]) => list.length > 1)
    .map(([address, records]) => ({ address, records }));

  return {
    totalRecords: records.length,
    validSchemaCount,
    invalidSchemaCount,
    duplicateCoordinates,
    duplicateAddresses,
    missingCityCount,
    missingStateCount,
    missingPostalCodeCount,
    missingPhoneCount,
    missingWebsiteCount,
    missingOpeningHoursCount,
    missingImageCount,
    suspiciousCategoryCount,
    malformedUrls,
    issues,
  };
}
