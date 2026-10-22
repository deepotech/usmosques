import { Metadata } from 'next';
import { generateStateCityMetadata, generateStateCityStaticParams } from '@/lib/seo/state-city-helpers';
import { StateCityView } from '@/components/state/StateCityView';

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return generateStateCityStaticParams('MD');
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  return generateStateCityMetadata('MD', city);
}

export default async function MarylandCityPage({ params }: CityPageProps) {
  const { city } = await params;
  return <StateCityView stateCode="MD" citySlug={city} />;
}
