import { Metadata } from 'next';
import { getStateConfig } from '@/lib/config/state-registry';
import { cityRepository } from '@/lib/data/city-repository';
import { constructMetadata } from '@/lib/seo/metadata';

export async function generateStateMetadata(stateCode: string): Promise<Metadata> {
  const config = getStateConfig(stateCode);
  if (!config) {
    return { title: 'State Not Found' };
  }

  return constructMetadata({
    title: `Mosques in ${config.name} | Complete Directory of Masajid & Islamic Centers`,
    description: `Browse all verified mosques and Islamic centers in ${config.name}. Explore city directories, locations, contact details, opening hours, and driving directions across ${config.name}.`,
    canonical: `/mosques/${config.slug}`,
  });
}

export async function generateStateCityMetadata(stateCode: string, citySlug: string): Promise<Metadata> {
  const config = getStateConfig(stateCode);
  const city = await cityRepository.getCityBySlug(citySlug, true, stateCode);

  if (!config || !city) {
    return {
      title: 'City Not Found',
    };
  }

  return constructMetadata({
    title: `Mosques in ${city.city}, ${city.stateCode} (${city.mosqueCount} Locations)`,
    description: `Find ${city.mosqueCount} verified mosques and Islamic centers in ${city.city}, ${city.state}. Browse locations, contact details, hours when available, websites, and driving directions.`,
    canonical: `/mosques/${config.slug}/${city.slug}`,
  });
}

export async function generateStateCityStaticParams(stateCode: string): Promise<{ city: string }[]> {
  const eligibleCities = await cityRepository.getEligibleCities(stateCode);
  return eligibleCities.map(c => ({
    city: c.slug,
  }));
}
