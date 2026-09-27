import React from 'react';
import { formatDistanceMiles } from '@/lib/geo/distance';
import { Navigation } from 'lucide-react';

interface DistanceBadgeProps {
  distanceMiles?: number | null;
  className?: string;
}

export function DistanceBadge({ distanceMiles, className = '' }: DistanceBadgeProps) {
  const formatted = formatDistanceMiles(distanceMiles);
  if (!formatted) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20 ${className}`}
    >
      <Navigation className="h-3 w-3 text-brand-600 fill-brand-600/30" />
      {formatted}
    </span>
  );
}
