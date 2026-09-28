'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AmenityFilterState, AmenityFilterCounts } from '@/types/amenity';
import { countActiveAmenityFilters } from '@/lib/amenity/amenity-engine';
import { Accessibility, ChevronDown, Info } from 'lucide-react';

interface AmenityFilterDrawerProps {
  filters: AmenityFilterState;
  onChange: (filters: AmenityFilterState) => void;
  counts: AmenityFilterCounts;
  className?: string;
}

export function AmenityFilterDrawer({
  filters,
  onChange,
  counts,
  className = '',
}: AmenityFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCount = countActiveAmenityFilters(filters);

  // Close on outside click
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleToggle = (key: keyof AmenityFilterState) => {
    onChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const handleClear = () => {
    onChange({
      wheelchairEntrance: false,
      wheelchairParking: false,
      wheelchairRestroom: false,
      parking: false,
      restroom: false,
    });
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all shadow-sm ${
          activeCount > 0
            ? 'bg-brand-800 text-white ring-1 ring-brand-900'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
        }`}
      >
        <Accessibility className="h-3.5 w-3.5" />
        <span>Accessibility & Amenities</span>
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-900">
            {activeCount}
          </span>
        )}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Filter by amenities and accessibility"
          className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-[300px] sm:w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Verified Facilities</h4>
              <p className="text-[11px] text-slate-500">Filter by confirmed public features</p>
            </div>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="py-3 space-y-4 max-h-[320px] overflow-y-auto">
            {/* Accessibility Section */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Wheelchair Accessibility
              </span>
              <div className="mt-2 space-y-2">
                <label className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(filters.wheelchairEntrance)}
                      onChange={() => handleToggle('wheelchairEntrance')}
                      className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                    />
                    <span className="text-xs text-slate-700 font-medium">Accessible Entrance</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">({counts.wheelchairEntrance})</span>
                </label>

                <label className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(filters.wheelchairParking)}
                      onChange={() => handleToggle('wheelchairParking')}
                      className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                    />
                    <span className="text-xs text-slate-700 font-medium">Accessible Parking</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">({counts.wheelchairParking})</span>
                </label>

                <label className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(filters.wheelchairRestroom)}
                      onChange={() => handleToggle('wheelchairRestroom')}
                      className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                    />
                    <span className="text-xs text-slate-700 font-medium">Accessible Restroom</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">({counts.wheelchairRestroom})</span>
                </label>
              </div>
            </div>

            {/* General Amenities Section */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                General Facilities
              </span>
              <div className="mt-2 space-y-2">
                <label className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(filters.parking)}
                      onChange={() => handleToggle('parking')}
                      className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                    />
                    <span className="text-xs text-slate-700 font-medium">Parking (Lot / Garage)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">({counts.parking})</span>
                </label>

                <label className="flex items-center justify-between rounded-lg p-1.5 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(filters.restroom)}
                      onChange={() => handleToggle('restroom')}
                      className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                    />
                    <span className="text-xs text-slate-700 font-medium">Restrooms</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">({counts.restroom})</span>
                </label>
              </div>
            </div>
          </div>

          {/* Data Trust Notice */}
          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-slate-50 p-2 text-[10px] text-slate-500 border border-slate-100">
            <Info className="h-3.5 w-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <span>
              Filters match confirmed public features only. Unlisted facilities are omitted.
            </span>
          </div>

          {/* Footer Action */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {activeCount} filter{activeCount === 1 ? '' : 's'} active
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
