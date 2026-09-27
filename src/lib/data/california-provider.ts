import fs from 'fs';
import path from 'path';
import { RawMosqueRecord } from './validation';
import { normalizeMosqueDataset } from './normalization';
import { Mosque } from '@/types/mosque';

let cachedMosques: Mosque[] | null = null;

/**
 * Loads and normalizes the California dataset from data/raw/california.json
 */
export function getCaliforniaMosquesSync(): Mosque[] {
  if (cachedMosques) {
    return cachedMosques;
  }

  // Resolve path to raw file
  const candidatePaths = [
    path.join(process.cwd(), 'data', 'raw', 'california.json'),
    path.join(process.cwd(), 'California – over 400 mosques.json'),
  ];

  let rawContent: string | null = null;
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      rawContent = fs.readFileSync(p, 'utf-8');
      break;
    }
  }

  if (!rawContent) {
    // If running in environment without filesystem access, fallback to empty array
    console.warn('[california-provider] Could not find California raw JSON file');
    cachedMosques = [];
    return cachedMosques;
  }

  const rawRecords: RawMosqueRecord[] = JSON.parse(rawContent);
  cachedMosques = normalizeMosqueDataset(rawRecords);
  return cachedMosques;
}

export class CaliforniaProvider {
  async getAll(): Promise<Mosque[]> {
    return getCaliforniaMosquesSync();
  }

  async getBySlug(slug: string): Promise<Mosque | null> {
    const list = getCaliforniaMosquesSync();
    return list.find(m => m.slug === slug) || null;
  }

  async getById(id: string): Promise<Mosque | null> {
    const list = getCaliforniaMosquesSync();
    return list.find(m => m.id === id || m.cid === id || m.placeId === id) || null;
  }

  async getCities(): Promise<{ city: string; count: number }[]> {
    const list = getCaliforniaMosquesSync().filter(m => m.dataStatus !== 'excluded');
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
