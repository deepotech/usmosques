import { Mosque } from './mosque';

/**
 * Standardized data quality metrics computed for a state dataset
 */
export interface StateQualityMetrics {
  validGpsPercentage: number;
  phoneCoveragePercentage: number;
  websiteCoveragePercentage: number;
  hoursCoveragePercentage: number;
  imagesCoveragePercentage: number;
  amenitiesCoveragePercentage: number;
}

/**
 * Standardized state ingestion result returned by state ingestion pipeline
 */
export interface StateIngestionResult {
  stateCode: string;
  stateName: string;
  totalRaw: number;
  validSchemaCount: number;
  invalidSchemaCount: number;
  verifiedCount: number;
  needsReviewCount: number;
  excludedCount: number;
  duplicateCoordinatesCount: number;
  duplicateAddressesCount: number;
  metrics: StateQualityMetrics;
  boundaryMismatches: {
    recordIndex: number;
    title: string;
    detectedState?: string;
  }[];
  warnings: string[];
  errors: string[];
  qualityGatePassed: boolean;
}

/**
 * Common interface that every state data provider must implement.
 * Abstracted so the application layer is completely state-agnostic.
 */
export interface IStateMosqueProvider {
  readonly stateCode: string;
  readonly stateName: string;
  readonly timezone: string;

  /** Retrieves all normalized mosque records for this state */
  getAll(): Promise<Mosque[]>;

  /** Retrieves a specific mosque by ID */
  getById(id: string): Promise<Mosque | undefined>;

  /** Retrieves a specific mosque by canonical slug */
  getBySlug(slug: string): Promise<Mosque | undefined>;

  /** Retrieves all publishable records (excludes commercial/restaurant entities) */
  getPublishable(): Promise<Mosque[]>;

  /** Ingests and evaluates raw records, producing an audit result and normalized entities */
  ingest(rawRecords: unknown[]): {
    result: StateIngestionResult;
    mosques: Mosque[];
  };
}
