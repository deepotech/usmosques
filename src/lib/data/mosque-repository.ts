import { Mosque, MosqueFilterParams } from '@/types/mosque';
import { IStateMosqueProvider } from '@/types/state';
import { californiaProvider } from './california-provider';
import { calculateHaversineDistanceMiles } from '../geo/distance';
import { getMosqueOpenStatus, getTimezoneForState } from '../geo/timezone';
import { normalizeStateCode, isStateEnabled } from '../config/state-registry';

export interface IMosqueRepository {
  search(params: MosqueFilterParams): Promise<{ mosques: Mosque[]; total: number }>;
  findBySlug(slug: string, stateCode?: string): Promise<Mosque | null>;
  findById(id: string, stateCode?: string): Promise<Mosque | null>;
  findNearby(lat: number, lng: number, limit?: number, maxDistance?: number, stateCode?: string): Promise<Mosque[]>;
  getTopCities(limit?: number, stateCode?: string): Promise<{ city: string; count: number }[]>;
  getMosquesByState(stateCode: string): Promise<Mosque[]>;
  registerProvider(provider: IStateMosqueProvider): void;
  getProvider(stateCode: string): IStateMosqueProvider | undefined;
}

export class MosqueRepository implements IMosqueRepository {
  private providers = new Map<string, IStateMosqueProvider>();

  constructor(defaultProvider: IStateMosqueProvider = californiaProvider) {
    if (defaultProvider) {
      this.registerProvider(defaultProvider);
    }
  }

  /**
   * Registers a state data provider in the repository
   */
  registerProvider(provider: IStateMosqueProvider): void {
    const code = normalizeStateCode(provider.stateCode);
    this.providers.set(code, provider);
  }

  /**
   * Gets a registered provider by state code
   */
  getProvider(stateCode: string): IStateMosqueProvider | undefined {
    const code = normalizeStateCode(stateCode);
    return this.providers.get(code);
  }

  /**
   * Returns all registered providers
   */
  getRegisteredProviders(): IStateMosqueProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Returns registered providers that are enabled in the state registry
   */
  getEnabledProviders(): IStateMosqueProvider[] {
    return Array.from(this.providers.values()).filter(p => isStateEnabled(p.stateCode));
  }

  /**
   * Retrieves all normalized mosques for a specific state
   */
  async getMosquesByState(stateCode: string): Promise<Mosque[]> {
    const code = normalizeStateCode(stateCode);
    const provider = this.providers.get(code);
    if (!provider) {
      return [];
    }
    return provider.getAll();
  }

  /**
   * Helper to retrieve mosques for searching (either scoped to a state or across enabled states)
   */
  private async getMosquesForSearch(stateCode?: string): Promise<Mosque[]> {
    if (stateCode) {
      return this.getMosquesByState(stateCode);
    }

    const enabled = this.getEnabledProviders();
    // Fallback: if no providers are enabled (e.g., custom unit test), use all registered
    const providersToQuery = enabled.length > 0 ? enabled : Array.from(this.providers.values());
    const mosqueArrays = await Promise.all(providersToQuery.map(p => p.getAll()));
    return mosqueArrays.flat();
  }

  async search(params: MosqueFilterParams): Promise<{ mosques: Mosque[]; total: number }> {
    let list = await this.getMosquesForSearch(params.stateCode);

    // 1. Filter out excluded records by default unless explicitly requested
    if (params.status && params.status !== 'all') {
      list = list.filter(m => m.dataStatus === params.status);
    } else {
      list = list.filter(m => m.dataStatus !== 'excluded');
    }

    // 2. State filter (if multiple states loaded in search list)
    if (params.stateCode) {
      const targetState = normalizeStateCode(params.stateCode);
      list = list.filter(m => normalizeStateCode(m.stateCode) === targetState);
    }

    // 3. City filter
    if (params.city) {
      const cityClean = params.city.trim().toLowerCase();
      list = list.filter(m => m.city.toLowerCase() === cityClean);
    }

    // 4. Postal code filter
    if (params.postalCode) {
      const zipClean = params.postalCode.trim();
      list = list.filter(m => m.postalCode && m.postalCode.startsWith(zipClean));
    }

    // 5. Query filter (matches name, address, city, categories)
    if (params.query) {
      const q = params.query.trim().toLowerCase();
      // Check if query is a 5-digit zip code
      if (/^\d{5}$/.test(q)) {
        list = list.filter(m => m.postalCode && m.postalCode.startsWith(q));
      } else {
        list = list.filter(m => {
          return (
            m.name.toLowerCase().includes(q) ||
            m.city.toLowerCase().includes(q) ||
            m.address.toLowerCase().includes(q) ||
            (m.postalCode && m.postalCode.includes(q)) ||
            m.categories.some(c => c.toLowerCase().includes(q))
          );
        });
      }
    }

    // 6. Open Now filter if requested
    if (params.openNow) {
      list = list.filter(m => {
        const tz = getTimezoneForState(m.stateCode, m.state);
        const status = getMosqueOpenStatus(m.openingHours, tz);
        return status.state === 'open' || status.state === '24hours';
      });
    }

    // 7. Compute distance and sort if user location provided
    if (typeof params.userLat === 'number' && typeof params.userLng === 'number') {
      list = list.map(m => {
        const dist = calculateHaversineDistanceMiles(
          params.userLat!,
          params.userLng!,
          m.latitude,
          m.longitude
        );
        return { ...m, distanceMiles: dist };
      });

      // Filter by max distance if specified
      if (params.maxDistanceMiles) {
        list = list.filter(m => (m.distanceMiles ?? Infinity) <= params.maxDistanceMiles!);
      }

      // Sort by nearest distance
      list.sort((a, b) => (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity));
    } else {
      // Default sort: verified first, then highest review count / rating, then name
      list.sort((a, b) => {
        if (a.dataStatus === 'verified' && b.dataStatus !== 'verified') return -1;
        if (b.dataStatus === 'verified' && a.dataStatus !== 'verified') return 1;
        const reviewDiff = (b.reviewCount || 0) - (a.reviewCount || 0);
        if (reviewDiff !== 0) return reviewDiff;
        return a.name.localeCompare(b.name);
      });
    }

    const total = list.length;
    const offset = params.offset || 0;
    const limit = params.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { mosques: paginated, total };
  }

  async findBySlug(slug: string, stateCode?: string): Promise<Mosque | null> {
    if (stateCode) {
      const provider = this.getProvider(stateCode);
      if (provider) {
        const found = await provider.getBySlug(slug);
        return found ?? null;
      }
      return null;
    }

    for (const provider of this.providers.values()) {
      const found = await provider.getBySlug(slug);
      if (found) return found;
    }
    return null;
  }

  async findById(id: string, stateCode?: string): Promise<Mosque | null> {
    if (stateCode) {
      const provider = this.getProvider(stateCode);
      if (provider) {
        const found = await provider.getById(id);
        return found ?? null;
      }
      return null;
    }

    for (const provider of this.providers.values()) {
      const found = await provider.getById(id);
      if (found) return found;
    }
    return null;
  }

  async findNearby(
    lat: number,
    lng: number,
    limit = 4,
    maxDistance = 50,
    stateCode?: string
  ): Promise<Mosque[]> {
    const list = await this.getMosquesForSearch(stateCode);
    return list
      .filter(m => m.dataStatus !== 'excluded')
      .map(m => ({
        ...m,
        distanceMiles: calculateHaversineDistanceMiles(lat, lng, m.latitude, m.longitude),
      }))
      .filter(m => m.distanceMiles <= maxDistance)
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, limit);
  }

  async getTopCities(limit = 12, stateCode?: string): Promise<{ city: string; count: number }[]> {
    if (stateCode) {
      const provider = this.getProvider(stateCode);
      type ProviderWithCities = IStateMosqueProvider & {
        getCities: () => Promise<{ city: string; count: number }[]>;
      };
      const hasCities = (p: IStateMosqueProvider): p is ProviderWithCities =>
        'getCities' in p && typeof (p as ProviderWithCities).getCities === 'function';
      if (provider && hasCities(provider)) {
        const cities = await provider.getCities();
        return cities.slice(0, limit);
      }
    }

    const mosques = await this.getMosquesForSearch(stateCode);
    const cityMap = new Map<string, number>();

    mosques.forEach(m => {
      if (m.dataStatus !== 'excluded') {
        const c = m.city.trim();
        if (c) {
          cityMap.set(c, (cityMap.get(c) || 0) + 1);
        }
      }
    });

    return Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const mosqueRepository = new MosqueRepository();
