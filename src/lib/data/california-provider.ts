import fs from 'fs';
import path from 'path';
import { RawMosqueRecord } from './validation';
import { normalizeMosqueDataset } from './normalization';
import { Mosque } from '@/types/mosque';
import { GenericStateProvider } from './state-provider';

let cachedMosques: Mosque[] | null = null;

function loadCaliforniaRawRecords(): RawMosqueRecord[] {
  const candidatePaths = [
    path.join(process.cwd(), 'data', 'raw', 'california.json'),
    path.join(process.cwd(), 'California – over 400 mosques.json'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      return JSON.parse(content);
    }
  }

  console.warn('[california-provider] Could not find California raw JSON file');
  return [];
}

/**
 * Loads and normalizes the California dataset synchronously (retained for backward compatibility)
 */
export function getCaliforniaMosquesSync(): Mosque[] {
  if (cachedMosques) {
    return cachedMosques;
  }

  const rawRecords = loadCaliforniaRawRecords();
  cachedMosques = normalizeMosqueDataset(rawRecords);
  return cachedMosques;
}

/**
 * California Mosque Provider
 * Implements IStateMosqueProvider via GenericStateProvider.
 */
export class CaliforniaProvider extends GenericStateProvider {
  constructor() {
    super('CA', () => loadCaliforniaRawRecords());
  }

  override async getAll(): Promise<Mosque[]> {
    if (!this.cachedMosques) {
      this.cachedMosques = getCaliforniaMosquesSync();
    }
    return this.cachedMosques;
  }

  /**
   * Retrieves aggregated cities for California (retained for backward compatibility)
   */
  async getCities(): Promise<{ city: string; count: number }[]> {
    const list = await this.getPublishable();
    const cityMap = new Map<string, number>();

    list.forEach(m => {
      const c = m.city.trim();
      if (c) {
        cityMap.set(c, (cityMap.get(c) || 0) + 1);
      }
    });

    return Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count);
  }
}

export const californiaProvider = new CaliforniaProvider();
