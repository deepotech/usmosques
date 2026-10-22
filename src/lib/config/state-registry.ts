/**
 * Centralized State Registry
 * 
 * Source of truth for all U.S. states supported or configured in the system.
 * Separates configured state metadata from publicly active/enabled state status.
 */

export interface StateConfig {
  /** Two-letter uppercase postal state code, e.g. 'CA', 'TX', 'NY' */
  code: string;
  /** Full English state name, e.g. 'California', 'Texas' */
  name: string;
  /** Canonical URL slug, e.g. 'california', 'texas' */
  slug: string;
  /** Primary IANA timezone name */
  timezone: string;
  /** All valid IANA timezones within state boundaries */
  timezones: string[];
  /** Whether the state is actively published and public */
  enabled: boolean;
  /** Whether the state is available in the finder */
  finderEnabled: boolean;
  /** Whether the state is enabled for public SEO routes and sitemaps */
  seoEnabled: boolean;
  /** Relative path to primary raw dataset file if available */
  datasetPath?: string;
  /** Approximate geographic bounding box for state boundary validation */
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}

export const STATE_REGISTRY: Record<string, StateConfig> = {
  CA: {
    code: 'CA',
    name: 'California',
    slug: 'california',
    timezone: 'America/Los_Angeles',
    timezones: ['America/Los_Angeles'],
    enabled: true, // Only California is publicly enabled in Phase 3A
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/california.json',
    bounds: { minLat: 32.5, maxLat: 42.1, minLng: -124.5, maxLng: -114.1 },
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    slug: 'texas',
    timezone: 'America/Chicago',
    timezones: ['America/Chicago', 'America/Denver'],
    enabled: true, // Activated in Phase 3B after dataset validation
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/texas.json',
    bounds: { minLat: 25.8, maxLat: 36.6, minLng: -106.7, maxLng: -93.5 },
  },
  NY: {
    code: 'NY',
    name: 'New York',
    slug: 'new-york',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: true, // Activated in Phase 3B after dataset validation
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/new-york.json',
    bounds: { minLat: 40.4, maxLat: 45.1, minLng: -79.8, maxLng: -71.8 },
  },
  FL: {
    code: 'FL',
    name: 'Florida',
    slug: 'florida',
    timezone: 'America/New_York',
    timezones: ['America/New_York', 'America/Chicago'],
    enabled: true, // Activated in Phase 3C after dataset validation
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/florida.json',
    bounds: { minLat: 24.4, maxLat: 31.0, minLng: -87.4, maxLng: -79.9 },
  },
  IL: {
    code: 'IL',
    name: 'Illinois',
    slug: 'illinois',
    timezone: 'America/Chicago',
    timezones: ['America/Chicago'],
    enabled: true, // Activated in Phase 3C after dataset validation
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/illinois.json',
    bounds: { minLat: 37.6, maxLat: 42.5, minLng: -91.5, maxLng: -87.5 },
  },
  GA: {
    code: 'GA',
    name: 'Georgia',
    slug: 'georgia',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: true, // Activated in Phase 6
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/georgia.json',
    bounds: { minLat: 30.3, maxLat: 35.1, minLng: -85.7, maxLng: -80.7 },
  },
  NJ: {
    code: 'NJ',
    name: 'New Jersey',
    slug: 'new-jersey',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: true, // Activated in Phase 6
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/new-jersey.json',
    bounds: { minLat: 38.8, maxLat: 41.4, minLng: -75.7, maxLng: -73.8 },
  },
  MI: {
    code: 'MI',
    name: 'Michigan',
    slug: 'michigan',
    timezone: 'America/Detroit',
    timezones: ['America/Detroit'],
    enabled: true, // Activated in Phase 6
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/michigan.json',
    bounds: { minLat: 41.6, maxLat: 48.4, minLng: -90.5, maxLng: -82.1 },
  },
  PA: {
    code: 'PA',
    name: 'Pennsylvania',
    slug: 'pennsylvania',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: true, // Activated in Phase 6
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/pennsylvania.json',
    bounds: { minLat: 39.7, maxLat: 42.3, minLng: -80.6, maxLng: -74.6 },
  },
  MD: {
    code: 'MD',
    name: 'Maryland',
    slug: 'maryland',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: true, // Activated in Phase 6
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/maryland.json',
    bounds: { minLat: 37.8, maxLat: 39.8, minLng: -79.6, maxLng: -75.0 },
  },
  VA: {
    code: 'VA',
    name: 'Virginia',
    slug: 'virginia',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: true, // Activated in Phase 6
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/virginia.json',
    bounds: { minLat: 36.5, maxLat: 39.5, minLng: -83.7, maxLng: -75.1 },
  },
  OH: {
    code: 'OH',
    name: 'Ohio',
    slug: 'ohio',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: true, // Activated in Phase 6
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/ohio.json',
    bounds: { minLat: 38.4, maxLat: 42.0, minLng: -84.9, maxLng: -80.5 },
  },
  NC: {
    code: 'NC',
    name: 'North Carolina',
    slug: 'north-carolina',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: true, // Activated in Phase 6
    finderEnabled: true,
    seoEnabled: true,
    datasetPath: 'data/raw/north-carolina.json',
    bounds: { minLat: 33.7, maxLat: 36.6, minLng: -84.4, maxLng: -75.4 },
  },
  CT: {
    code: 'CT',
    name: 'Connecticut',
    slug: 'connecticut',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: false,
    finderEnabled: false,
    seoEnabled: false,
    datasetPath: 'Connecticut – over 62 mosques.json',
    bounds: { minLat: 40.9, maxLat: 42.1, minLng: -73.8, maxLng: -71.7 },
  },
  IN: {
    code: 'IN',
    name: 'Indiana',
    slug: 'indiana',
    timezone: 'America/Indiana/Indianapolis',
    timezones: ['America/Indiana/Indianapolis', 'America/Chicago'],
    enabled: false,
    finderEnabled: false,
    seoEnabled: false,
    datasetPath: 'Indiana – around 57 mosques.json',
    bounds: { minLat: 37.7, maxLat: 41.8, minLng: -88.1, maxLng: -84.7 },
  },
  SC: {
    code: 'SC',
    name: 'South Carolina',
    slug: 'south-carolina',
    timezone: 'America/New_York',
    timezones: ['America/New_York'],
    enabled: false,
    finderEnabled: false,
    seoEnabled: false,
    datasetPath: 'South Carolina – at least 30 mosques.json',
    bounds: { minLat: 32.0, maxLat: 35.3, minLng: -83.4, maxLng: -78.5 },
  },
};

/**
 * Normalizes state identifier into standard 2-letter uppercase code
 */
export function normalizeStateCode(codeOrSlugOrName: string): string {
  const clean = codeOrSlugOrName.trim().toUpperCase();
  if (STATE_REGISTRY[clean]) {
    return clean;
  }

  const lower = codeOrSlugOrName.trim().toLowerCase();
  for (const config of Object.values(STATE_REGISTRY)) {
    if (config.slug === lower || config.name.toLowerCase() === lower) {
      return config.code;
    }
  }

  return clean;
}

/**
 * Retrieves StateConfig by code, slug, or name.
 */
export function getStateConfig(codeOrSlugOrName: string): StateConfig | undefined {
  const code = normalizeStateCode(codeOrSlugOrName);
  return STATE_REGISTRY[code];
}

/**
 * Returns all currently enabled (publicly active) states.
 */
export function getEnabledStates(): StateConfig[] {
  return Object.values(STATE_REGISTRY).filter(s => s.enabled);
}

/**
 * Returns all configured states in the registry.
 */
export function getAllConfiguredStates(): StateConfig[] {
  return Object.values(STATE_REGISTRY);
}

/**
 * Checks whether a given state is enabled for public access.
 */
export function isStateEnabled(codeOrSlugOrName: string): boolean {
  const config = getStateConfig(codeOrSlugOrName);
  return Boolean(config?.enabled);
}

/**
 * Returns the default primary state (California).
 */
export function getDefaultState(): StateConfig {
  return STATE_REGISTRY.CA;
}
