import { generateStateMetadata } from '@/lib/seo/state-city-helpers';
import { StateDirectoryView } from '@/components/state/StateDirectoryView';

export const revalidate = 3600;

export async function generateMetadata() {
  return generateStateMetadata('NJ');
}

export default async function NewJerseyDirectoryPage() {
  return <StateDirectoryView stateCode="NJ" />;
}
