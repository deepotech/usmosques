import React from 'react';
import { Star } from 'lucide-react';

interface RatingSummaryProps {
  rating?: number | null;
  reviewCount?: number | null;
  className?: string;
}

export function RatingSummary({ rating, reviewCount, className = '' }: RatingSummaryProps) {
  if (!rating && !reviewCount) return null;

  return (
    <div className={`flex items-center gap-1.5 text-xs text-slate-600 ${className}`}>
      {rating ? (
        <span className="flex items-center gap-1 font-bold text-slate-900 bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded ring-1 ring-amber-400/30">
          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
          {rating.toFixed(1)}
        </span>
      ) : null}

      {reviewCount ? (
        <span className="text-slate-500 font-medium">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      ) : null}
    </div>
  );
}
