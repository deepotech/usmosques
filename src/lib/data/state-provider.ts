import fs from 'fs';
import path from 'path';
import { Mosque } from '@/types/mosque';
import { IStateMosqueProvider, StateIngestionResult } from '@/types/state';
import { getStateConfig, getDefaultState } from '@/lib/config/state-registry';
import { ingestStateDataset } from './state-ingestion';

/**
 * Generic state data provider that loads, validates, and normalizes
 * mosque datasets for any configured state.
 */
export class GenericStateProvider implements IStateMosqueProvider {
  readonly stateCode: string;
  readonly stateName: string;
  readonly timezone: string;

  protected cachedMosques: Mosque[] | null = null;
  protected cachedIngestionResult: StateIngestionResult | null = null;
  protected rawRecordsLoader?: () => unknown[];

  constructor(stateCode: string, rawRecordsLoader?: () => unknown[]) {
    const config = getStateConfig(stateCode) || getDefaultState();
    this.stateCode = config.code;
    this.stateName = config.name;
    this.timezone = config.timezone;
    this.rawRecordsLoader = rawRecordsLoader;
  }

  /**
   * Sets custom raw records directly (useful for tests and synthetic fixtures)
   */
  setRawRecords(records: unknown[]): { result: StateIngestionResult; mosques: Mosque[] } {
    const { result, mosques } = this.ingest(records);
    this.cachedMosques = mosques;
    this.cachedIngestionResult = result;
    return { result, mosques };
  }

  /**
   * Loads raw records using provided loader or filesystem path from state registry
   */
  protected loadRawRecords(): unknown[] {
    if (this.rawRecordsLoader) {
      return this.rawRecordsLoader();
    }

    const config = getStateConfig(this.stateCode);
    if (!config?.datasetPath) {
      return [];
    }

    const candidatePaths = [
      path.join(process.cwd(), config.datasetPath),
      path.join(process.cwd(), 'data', 'raw', `${config.slug}.json`),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          const content = fs.readFileSync(p, 'utf-8');
          return JSON.parse(content);
        } catch (e) {
          console.error(`[GenericStateProvider:${this.stateCode}] Failed to parse dataset:`, e);
          return [];
        }
      }
    }

    return [];
  }

  /**
   * Evaluates raw records through the state ingestion pipeline
   */
  ingest(rawRecords: unknown[]): { result: StateIngestionResult; mosques: Mosque[] } {
    return ingestStateDataset(rawRecords, this.stateCode);
  }

  /**
   * Retrieves all normalized mosque records for this state
   */
  async getAll(): Promise<Mosque[]> {
    if (this.cachedMosques) {
      return this.cachedMosques;
    }

    const raw = this.loadRawRecords();
    const { result, mosques } = this.ingest(raw);
    this.cachedMosques = mosques;
    this.cachedIngestionResult = result;
    return mosques;
  }

  /**
   * Retrieves all publishable records (excludes commercial/non-mosque records)
   */
  async getPublishable(): Promise<Mosque[]> {
    const all = await this.getAll();
    return all.filter(m => m.dataStatus !== 'excluded');
  }

  /**
   * Retrieves a specific mosque by ID
   */
  async getById(id: string): Promise<Mosque | undefined> {
    const all = await this.getAll();
    return all.find(m => m.id === id || m.cid === id || m.placeId === id);
  }

  /**
   * Retrieves a specific mosque by canonical slug
   */
  async getBySlug(slug: string): Promise<Mosque | undefined> {
    const all = await this.getAll();
    return all.find(m => m.slug === slug);
  }

  /**
   * Retrieves the latest ingestion audit report for this state
   */
  async getIngestionResult(): Promise<StateIngestionResult | null> {
    if (!this.cachedIngestionResult) {
      await this.getAll();
    }
    return this.cachedIngestionResult;
  }
}
