import React from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';

interface MapPlaceholderProps {
  error?: string | null;
  className?: string;
}

export function MapPlaceholder({ error, className = '' }: MapPlaceholderProps) {
  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-300 bg-rose-50/50 p-8 text-center text-slate-700 min-h-[400px] ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700 mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Map Unavailable</h3>
        <p className="mt-1 text-xs text-slate-600 max-w-xs">
          {error || 'Unable to render the interactive map. You can still browse and search all mosques in the directory.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-100/70 p-8 text-center min-h-[400px] overflow-hidden ${className}`}
      aria-label="Loading interactive mosque map"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative flex flex-col items-center z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-brand-700 mb-3">
          <MapPin className="h-6 w-6 animate-bounce" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Loader2 className="h-4 w-4 animate-spin text-brand-700" />
          <span>Loading Interactive Map...</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Preparing verified mosque locations
        </p>
      </div>
    </div>
  );
}
