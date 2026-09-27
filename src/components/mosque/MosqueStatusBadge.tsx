import React from 'react';
import { MosqueOpeningHourDay } from '@/types/mosque';
import { getMosqueOpenStatus, getTimezoneForState } from '@/lib/geo/timezone';
import { Clock } from 'lucide-react';

interface MosqueStatusBadgeProps {
  openingHours?: MosqueOpeningHourDay[] | null;
  stateCode?: string;
  state?: string;
  className?: string;
}

export function MosqueStatusBadge({
  openingHours,
  stateCode,
  state,
  className = '',
}: MosqueStatusBadgeProps) {
  const timezone = getTimezoneForState(stateCode, state);
  const status = getMosqueOpenStatus(openingHours, timezone);

  if (status.state === 'open' || status.state === '24hours') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
        {status.label}
      </span>
    );
  }

  if (status.state === 'closed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
        {status.label}
      </span>
    );
  }

  // Unknown / hours not listed
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 ${className}`}
    >
      <Clock className="h-3 w-3 text-slate-400" />
      {status.label}
    </span>
  );
}
