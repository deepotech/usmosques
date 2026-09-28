import { Mosque } from '@/types/mosque';
import { CitySummary, CityTier, CityCoordinates } from '@/types/city';
import { IStateMosqueProvider } from '@/types/state';
import { californiaProvider } from './california-provider';
import { mosqueRepository } from './mosque-repository';
import { slugify } from './normalization';
import { CitySeoConfig, DEFAULT_CITY_SEO_CONFIG, isCityEligibleForSeo } from '../config/city-seo';
import { normalizeStateCode } from '../config/state-registry';

export class CityRepository {
  private cachedCitiesByState = new Map<string, CitySummary[]>();
  private customProvider?: IStateMosqueProvider;

  constructor(provider?: IStateMosqueProvider) {
    if (provider) {
      this.customProvider = provider;
    }
  }

  /**
   * Resolves stateCode and config arguments cleanly
   */
  private resolveArgs(
    stateCodeOrConfig?: string | CitySeoConfig,
    config?: CitySeoConfig
  ): { stateCode: string; seoConfig: CitySeoConfig } {
    let stateCode = 'CA';
    let seoConfig = DEFAULT_CITY_SEO_CONFIG;

    if (typeof stateCodeOrConfig === 'string') {
      stateCode = normalizeStateCode(stateCodeOrConfig);
      if (config) {
        seoConfig = config;
      }
    } else if (typeof stateCodeOrConfig === 'object' && stateCodeOrConfig !== null) {
      seoConfig = stateCodeOrConfig;
    }

    return { stateCode, seoConfig };
  }

  /**
   * Aggregates mosques into comprehensive CitySummary models
   */
  async getAllCities(
    stateCodeOrConfig?: string | CitySeoConfig,
    config?: CitySeoConfig
  ): Promise<CitySummary[]> {
    const { stateCode, seoConfig } = this.resolveArgs(stateCodeOrConfig, config);
    const cacheKey = `${stateCode}_${seoConfig.minMosqueCount}_${seoConfig.allowTierB}`;

    if (this.cachedCitiesByState.has(cacheKey)) {
      return this.cachedCitiesByState.get(cacheKey)!;
    }

    let allMosques: Mosque[];
    if (this.customProvider) {
      allMosques = await this.customProvider.getAll();
    } else {
      allMosques = await mosqueRepository.getMosquesByState(stateCode);
      if (allMosques.length === 0 && stateCode === 'CA') {
        allMosques = await californiaProvider.getAll();
      }
    }

    const cityMap = new Map<string, {
      city: string;
      state: string;
      stateCode: string;
      mosques: Mosque[];
      excludedCount: number;
    }>();

    allMosques.forEach(m => {
      const cityName = m.city.trim();
      const slug = slugify(cityName);

      if (!cityMap.has(slug)) {
        cityMap.set(slug, {
          city: cityName,
          state: m.state,
          stateCode: m.stateCode,
          mosques: [],
          excludedCount: 0,
        });
      }

      const entry = cityMap.get(slug)!;
      if (m.dataStatus === 'excluded') {
        entry.excludedCount++;
      } else {
        entry.mosques.push(m);
      }
    });

    const summaries: CitySummary[] = Array.from(cityMap.entries()).map(([slug, data]) => {
      const publishableMosques = data.mosques;
      const count = publishableMosques.length;

      let verifiedCount = 0;
      let needsReviewCount = 0;
      let withHoursCount = 0;
      let withPhoneCount = 0;
      let withWebsiteCount = 0;
      let withImagesCount = 0;
      let totalReviewsCount = 0;
      let sumLat = 0;
      let sumLng = 0;

      publishableMosques.forEach(m => {
        if (m.dataStatus === 'verified') verifiedCount++;
        if (m.dataStatus === 'needs_review') needsReviewCount++;
        if (m.openingHours && m.openingHours.length > 0) withHoursCount++;
        if (m.phone) withPhoneCount++;
        if (m.website) withWebsiteCount++;
        if (m.imageUrl || (m.images && m.images.length > 0)) withImagesCount++;
        if (m.reviewCount && m.reviewCount > 0) totalReviewsCount += m.reviewCount;
        sumLat += m.latitude;
        sumLng += m.longitude;
      });

      // Calculate centroid
      const centerCoordinates: CityCoordinates | undefined =
        count > 0
          ? {
              latitude: Math.round((sumLat / count) * 1000000) / 1000000,
              longitude: Math.round((sumLng / count) * 1000000) / 1000000,
            }
          : undefined;

      // Tier classification
      let tier: CityTier = 'tier_c';
      if (count >= 5) {
        tier = 'tier_a';
      } else if (count >= 2) {
        tier = 'tier_b';
      }

      const isEligible = isCityEligibleForSeo(count, seoConfig);

      // Deterministically sort mosques within city: verified first, then review count, then name
      publishableMosques.sort((a, b) => {
        if (a.dataStatus === 'verified' && b.dataStatus !== 'verified') return -1;
        if (b.dataStatus === 'verified' && a.dataStatus !== 'verified') return 1;
        const revDiff = (b.reviewCount || 0) - (a.reviewCount || 0);
        if (revDiff !== 0) return revDiff;
        return a.name.localeCompare(b.name);
      });

      return {
        city: data.city,
        slug,
        state: data.state,
        stateCode: data.stateCode,
        mosqueCount: count,
        verifiedCount,
        needsReviewCount,
        excludedCount: data.excludedCount,
        mosques: publishableMosques,
        centerCoordinates,
        withHoursCount,
        withPhoneCount,
        withWebsiteCount,
        withImagesCount,
        totalReviewsCount,
        tier,
        isEligible,
      };
    });

    // Deterministic sorting: highest mosque count first, then alphabetical city name
    summaries.sort((a, b) => {
      if (b.mosqueCount !== a.mosqueCount) {
        return b.mosqueCount - a.mosqueCount;
      }
      return a.city.localeCompare(b.city);
    });

    this.cachedCitiesByState.set(cacheKey, summaries);
    return summaries;
  }

  /**
   * Retrieves only cities eligible for public indexable SEO pages
   */
  async getEligibleCities(
    stateCodeOrConfig?: string | CitySeoConfig,
    config?: CitySeoConfig
  ): Promise<CitySummary[]> {
    const { seoConfig } = this.resolveArgs(stateCodeOrConfig, config);
    const all = await this.getAllCities(stateCodeOrConfig, config);
    return all.filter(c => isCityEligibleForSeo(c.mosqueCount, seoConfig));
  }

  /**
   * Retrieves a specific city by slug.
   * If onlyEligible is true (default), returns null if the city does not meet SEO threshold.
   */
  async getCityBySlug(
    citySlug: string,
    onlyEligible = true,
    stateCodeOrConfig?: string | CitySeoConfig,
    config?: CitySeoConfig
  ): Promise<CitySummary | null> {
    const normalizedSlug = slugify(citySlug);
    const all = await this.getAllCities(stateCodeOrConfig, config);
    const found = all.find(c => c.slug === normalizedSlug);

    if (!found) return null;
    if (onlyEligible && !found.isEligible) return null;

    return found;
  }

  /**
   * Retrieves other eligible cities for contextual internal linking
   */
  async getRelatedEligibleCities(
    currentCitySlug: string,
    limit = 6,
    stateCodeOrConfig?: string | CitySeoConfig,
    config?: CitySeoConfig
  ): Promise<CitySummary[]> {
    const eligible = await this.getEligibleCities(stateCodeOrConfig, config);
    return eligible
      .filter(c => c.slug !== currentCitySlug)
      .slice(0, limit);
  }
}

export const cityRepository = new CityRepository();
