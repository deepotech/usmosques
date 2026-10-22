import { Metadata } from 'next';
import { generateStateCityMetadata, generateStateCityStaticParams } from '@/lib/seo/state-city-helpers';
import { StateCityView } from '@/components/state/StateCityView';

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return generateStateCityStaticParams('NJ');
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  return generateStateCityMetadata('NJ', city);
}

export default async function NewJerseyCityPage({ params }: CityPageProps) {
  const { city } = await params;
  return <StateCityView stateCode="NJ" citySlug={city} />;
}
