import React from 'react';
import { List, Map as MapIcon } from 'lucide-react';

interface ViewToggleProps {
  mode: 'list' | 'map';
  onChange: (mode: 'list' | 'map') => void;
  resultCount: number;
}

export function ViewToggle({ mode, onChange, resultCount }: ViewToggleProps) {
  return (
    <div
      role="tablist"
      aria-label="View layout switcher"
      className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 shadow-inner"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'list'}
        onClick={() => onChange('list')}
        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
          mode === 'list'
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <List className="h-3.5 w-3.5" />
        <span>List ({resultCount})</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={mode === 'map'}
        onClick={() => onChange('map')}
        className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
          mode === 'map'
            ? 'bg-white text-brand-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <MapIcon className="h-3.5 w-3.5 text-brand-700" />
        <span>Map View</span>
      </button>
    </div>
  );
}
