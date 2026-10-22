import { generateStateMetadata } from '@/lib/seo/state-city-helpers';
import { StateDirectoryView } from '@/components/state/StateDirectoryView';

export const revalidate = 3600;

export async function generateMetadata() {
  return generateStateMetadata('VA');
}

export default async function VirginiaDirectoryPage() {
  return <StateDirectoryView stateCode="VA" />;
}
