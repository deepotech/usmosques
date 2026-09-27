'use client';

import React, { useState, useMemo } from 'react';
import { Mosque } from '@/types/mosque';
import { MosqueCard } from '@/components/mosque/MosqueCard';
import { SearchBar } from '@/components/search/SearchBar';
import { LocationButton } from '@/components/search/LocationButton';
import { calculateHaversineDistanceMiles } from '@/lib/geo/distance';
import { getMosqueOpenStatus, getTimezoneForState } from '@/lib/geo/timezone';
import { SlidersHorizontal, Compass, AlertCircle, XCircle } from 'lucide-react';

interface MosqueFinderClientProps {
  initialMosques: Mosque[];
  topCities: { city: string; count: number }[];
  defaultQuery?: string;
  defaultCity?: string;
}

export function MosqueFinderClient({
  initialMosques,
  topCities,
  defaultQuery = '',
  defaultCity = '',
}: MosqueFinderClientProps) {
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'verified'>('verified');

  const handleLocationFound = (coords: { lat: number; lng: number }) => {
    setUserCoords(coords);
  };

  const handleClearLocation = () => {
    setUserCoords(null);
  };

  // Filter and sort mosques
  const filteredMosques = useMemo(() => {
    let result = [...initialMosques];

    // Filter out excluded records
    result = result.filter(m => m.dataStatus !== 'excluded');

    // Status filter
    if (selectedStatus === 'verified') {
      result = result.filter(m => m.dataStatus === 'verified');
    }

    // City quick filter
    if (selectedCity) {
      result = result.filter(m => m.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      // Check if 5-digit zip
      if (/^\d{5}$/.test(q)) {
        result = result.filter(m => m.postalCode && m.postalCode.startsWith(q));
      } else {
        result = result.filter(
          m =>
            m.name.toLowerCase().includes(q) ||
            m.city.toLowerCase().includes(q) ||
            m.address.toLowerCase().includes(q) ||
            (m.postalCode && m.postalCode.includes(q)) ||
            m.categories.some(c => c.toLowerCase().includes(q))
        );
      }
    }

    // Open Now filter
    if (openNowOnly) {
      result = result.filter(m => {
        const tz = getTimezoneForState(m.stateCode, m.state);
        const status = getMosqueOpenStatus(m.openingHours, tz);
        return status.state === 'open' || status.state === '24hours';
      });
    }

    // Calculate distance if user location is available
    if (userCoords) {
      result = result.map(m => ({
        ...m,
        distanceMiles: calculateHaversineDistanceMiles(
          userCoords.lat,
          userCoords.lng,
          m.latitude,
          m.longitude
        ),
      }));

      // Sort by nearest distance
      result.sort((a, b) => (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity));
    } else {
      // Default sort: highest review count / rating, then name
      result.sort((a, b) => {
        const reviewDiff = (b.reviewCount || 0) - (a.reviewCount || 0);
        if (reviewDiff !== 0) return reviewDiff;
        return a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [initialMosques, searchQuery, selectedCity, userCoords, openNowOnly, selectedStatus]);

  return (
    <div className="space-y-8">
      {/* Controls Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8">
            <SearchBar
              value={searchQuery}
              onChange={val => setSearchQuery(val)}
              placeholder="Search by city, ZIP code, or mosque name…"
            />
          </div>

          <div className="md:col-span-4 flex items-center justify-start md:justify-end">
            <LocationButton onLocationFound={handleLocationFound} className="w-full md:w-auto" />
          </div>
        </div>

        {/* User Location active banner */}
        {userCoords && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-brand-50 border border-brand-200 px-4 py-2.5 text-xs text-brand-900">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-brand-700 animate-spin-slow" />
              <span>
                Sorted by nearest to your current location (lat: {userCoords.lat.toFixed(3)}, lng: {userCoords.lng.toFixed(3)})
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearLocation}
              className="inline-flex items-center gap-1 font-semibold text-brand-800 hover:text-brand-950 underline focus:outline-none"
            >
              <XCircle className="h-3.5 w-3.5" />
              Clear location
            </button>
          </div>
        )}

        {/* Secondary Filters row */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filter:
            </span>

            {/* Open Now toggle */}
            <button
              type="button"
              onClick={() => setOpenNowOnly(!openNowOnly)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                openNowOnly
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Open Now
            </button>

            {/* Verified toggle */}
            <button
              type="button"
              onClick={() =>
                setSelectedStatus(selectedStatus === 'verified' ? 'all' : 'verified')
              }
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedStatus === 'verified'
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {selectedStatus === 'verified' ? 'Verified Only' : 'All Listings'}
            </button>
          </div>

          {/* Quick city selector pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-400">Popular:</span>
            {topCities.slice(0, 5).map(({ city, count }) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(selectedCity === city ? '' : city)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  selectedCity.toLowerCase() === city.toLowerCase()
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {city} ({count})
              </button>
            ))}
            {selectedCity && (
              <button
                type="button"
                onClick={() => setSelectedCity('')}
                className="text-xs text-rose-600 font-semibold hover:underline ml-1"
              >
                Reset city
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {userCoords
              ? 'Mosques Nearest to You'
              : selectedCity
              ? `Mosques in ${selectedCity}, California`
              : 'All Verified Mosques in California'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredMosques.length} {filteredMosques.length === 1 ? 'mosque' : 'mosques'}
            {userCoords ? ' sorted by distance' : ''}
          </p>
        </div>
      </div>

      {/* Results Grid or Empty State */}
      {filteredMosques.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMosques.map((mosque, idx) => (
            <MosqueCard key={mosque.id} mosque={mosque} priority={idx < 6} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">No mosques found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            We couldn&apos;t find any mosques matching your filters. Try clearing your search query or selecting a different city.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('');
                setOpenNowOnly(false);
                setSelectedStatus('verified');
              }}
              className="rounded-lg bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-800 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
