import { Metadata } from 'next';
import { generateStateCityMetadata, generateStateCityStaticParams } from '@/lib/seo/state-city-helpers';
import { StateCityView } from '@/components/state/StateCityView';

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return generateStateCityStaticParams('MI');
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  return generateStateCityMetadata('MI', city);
}

export default async function MichiganCityPage({ params }: CityPageProps) {
  const { city } = await params;
  return <StateCityView stateCode="MI" citySlug={city} />;
}
