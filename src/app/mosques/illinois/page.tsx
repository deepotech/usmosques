import { generateStateMetadata } from '@/lib/seo/state-city-helpers';
import { StateDirectoryView } from '@/components/state/StateDirectoryView';

export const revalidate = 3600;

export async function generateMetadata() {
  return generateStateMetadata('IL');
}

export default async function IllinoisDirectoryPage() {
  return <StateDirectoryView stateCode="IL" />;
}
