import React from 'react';
import { SlidersHorizontal, ArrowUpDown, X, Check } from 'lucide-react';

export type SortOption = 'nearest' | 'rating' | 'name';

interface FinderFiltersProps {
  openNowOnly: boolean;
  onToggleOpenNow: () => void;
  selectedStatus: 'all' | 'verified';
  onToggleStatus: () => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  hasLocation: boolean;
  selectedCity: string;
  topCities: { city: string; count: number }[];
  onSelectCity: (city: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FinderFilters({
  openNowOnly,
  onToggleOpenNow,
  selectedStatus,
  onToggleStatus,
  sortBy,
  onSortChange,
  hasLocation,
  selectedCity,
  topCities,
  onSelectCity,
  onClearFilters,
  hasActiveFilters,
}: FinderFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Top Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            Filters:
          </span>

          {/* Open Now */}
          <button
            type="button"
            onClick={onToggleOpenNow}
            aria-pressed={openNowOnly}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              openNowOnly
                ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {openNowOnly && <Check className="h-3 w-3" />}
            Open Now
          </button>

          {/* Verified Only */}
          <button
            type="button"
            onClick={onToggleStatus}
            aria-pressed={selectedStatus === 'verified'}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              selectedStatus === 'verified'
                ? 'bg-brand-800 text-white shadow-sm ring-1 ring-brand-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {selectedStatus === 'verified' && <Check className="h-3 w-3" />}
            Verified Only
          </button>

          {/* Clear Filters CTA */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by-select" className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            Sort:
          </label>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={e => onSortChange(e.target.value as SortOption)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600 cursor-pointer"
          >
            <option value="nearest" disabled={!hasLocation}>
              Nearest Distance {!hasLocation ? '(Use location)' : ''}
            </option>
            <option value="rating">Highest Rating</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Quick City Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2">
        <span className="text-xs font-medium text-slate-400 mr-1">Popular Cities:</span>
        {topCities.slice(0, 6).map(({ city, count }) => {
          const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
          return (
            <button
              key={city}
              type="button"
              onClick={() => onSelectCity(isSelected ? '' : city)}
              aria-pressed={isSelected}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {city} <span className="text-[10px] opacity-75">({count})</span>
            </button>
          );
        })}
        {selectedCity && (
          <button
            type="button"
            onClick={() => onSelectCity('')}
            className="inline-flex items-center gap-0.5 text-xs text-rose-600 font-semibold hover:underline ml-1"
          >
            <X className="h-3 w-3" />
            Reset city
          </button>
        )}
      </div>
    </div>
  );
}
