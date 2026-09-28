export type MosqueDataStatus = 'verified' | 'needs_review' | 'excluded';

export interface MosqueOpeningHourDay {
  day: string; // e.g. "Monday"
  hours: string; // e.g. "5 AM to 10:05 PM", "Open 24 hours", "Closed"
}

export interface MosqueReviewSummary {
  stars?: number; // Average computed from actual reviews if available
  reviewsCount?: number; // Total reviews recorded
}

export interface Mosque {
  id: string; // unique ID (cid or placeId)
  placeId?: string;
  cid?: string;
  name: string;
  slug: string;
  address: string;
  street?: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  images: string[];
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  openingHours?: MosqueOpeningHourDay[];
  categoryName: string;
  categories: string[];
  amenities: string[];
  accessibility: string[];
  description?: string;
  source: string;
  sourceUrl?: string;
  dataStatus: MosqueDataStatus;
  statusReason?: string;
  // Computed runtime distance
  distanceMiles?: number;
}

export interface MosqueFilterParams {
  query?: string;
  city?: string;
  stateCode?: string;
  postalCode?: string;
  status?: MosqueDataStatus | 'all';
  openNow?: boolean;
  userLat?: number;
  userLng?: number;
  maxDistanceMiles?: number;
  limit?: number;
  offset?: number;
}

export type OpenStatusResult = 
  | { state: 'open'; label: 'Open Now'; detail?: string }
  | { state: 'closed'; label: 'Closed'; detail?: string }
  | { state: '24hours'; label: 'Open 24 Hours'; detail?: string }
  | { state: 'unknown'; label: 'Hours not listed' };
