import { Metadata } from 'next';
import { generateStateCityMetadata, generateStateCityStaticParams } from '@/lib/seo/state-city-helpers';
import { StateCityView } from '@/components/state/StateCityView';

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return generateStateCityStaticParams('OH');
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  return generateStateCityMetadata('OH', city);
}

export default async function OhioCityPage({ params }: CityPageProps) {
  const { city } = await params;
  return <StateCityView stateCode="OH" citySlug={city} />;
}
