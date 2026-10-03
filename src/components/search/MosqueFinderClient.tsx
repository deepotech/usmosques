'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Mosque } from '@/types/mosque';
import { MosqueCard } from '@/components/mosque/MosqueCard';
import { SearchBar } from '@/components/search/SearchBar';
import { LocationButton } from '@/components/search/LocationButton';
import { DynamicMosqueMap } from '@/components/map/DynamicMosqueMap';
import { FinderFilters, SortOption } from '@/components/search/FinderFilters';
import { ViewToggle } from '@/components/search/ViewToggle';
import { calculateHaversineDistanceMiles, formatDistance } from '@/lib/geo/distance';
import { getMosqueOpenStatus, getTimezoneForMosque } from '@/lib/geo/timezone';
import { getEnabledStates } from '@/lib/config/state-registry';
import { AmenityFilterState, EMPTY_AMENITY_FILTERS } from '@/types/amenity';
import {
  matchesAmenityFilters,
  countAmenityCapabilities,
  countActiveAmenityFilters,
} from '@/lib/amenity/amenity-engine';
import { getMosquePath } from '@/lib/seo/mosque-url';
import { Compass, AlertCircle, XCircle, MapPin, Navigation, ExternalLink } from 'lucide-react';

interface MosqueFinderClientProps {
  initialMosques: Mosque[];
  topCities: { city: string; count: number; stateCode?: string }[];
  enabledStates?: { code: string; name: string; slug: string }[];
  defaultQuery?: string;
  defaultState?: string;
  defaultCity?: string;
  defaultSort?: SortOption;
  defaultRadius?: number | null;
  defaultOpenNow?: boolean;
  defaultStatus?: 'all' | 'verified';
  autoNearMe?: boolean;
}

export function MosqueFinderClient({
  initialMosques,
  topCities,
  enabledStates,
  defaultQuery = '',
  defaultState = '',
  defaultCity = '',
  defaultSort = 'rating',
  defaultRadius = null,
  defaultOpenNow = false,
  defaultStatus = 'verified',
  autoNearMe = false,
}: MosqueFinderClientProps) {
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [selectedState, setSelectedState] = useState(defaultState.toUpperCase());
  const [selectedCity, setSelectedCity] = useState(defaultCity);
  const [selectedRadius, setSelectedRadius] = useState<number | null>(defaultRadius);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(defaultOpenNow);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'verified'>(defaultStatus);
  const [sortBy, setSortBy] = useState<SortOption>(defaultSort);
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'list' | 'map'>('list');
  const [visibleCount, setVisibleCount] = useState(24);
  const [amenityFilters, setAmenityFilters] = useState<AmenityFilterState>(EMPTY_AMENITY_FILTERS);

  // Active states resolved dynamically from state registry or props
  const activeStates = useMemo(() => {
    if (enabledStates && enabledStates.length > 0) return enabledStates;
    return getEnabledStates().map(s => ({ code: s.code, name: s.name, slug: s.slug }));
  }, [enabledStates]);

  // Reset pagination when search or filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, selectedState, selectedCity, selectedRadius, openNowOnly, selectedStatus, sortBy, userCoords, amenityFilters]);

  // Geolocation handlers
  const handleLocationFound = useCallback((coords: { lat: number; lng: number }) => {
    setUserCoords(coords);
    setSortBy('nearest');
  }, []);

  const handleClearLocation = useCallback(() => {
    setUserCoords(null);
    setSelectedRadius(null);
    if (sortBy === 'nearest') {
      setSortBy('rating');
    }
  }, [sortBy]);

  // Auto near-me trigger if requested via URL flag (client-side only, no coordinates in URL)
  useEffect(() => {
    if (autoNearMe && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          handleLocationFound({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, [autoNearMe, handleLocationFound]);

  // Synchronize non-sensitive search parameters to URL query string (NEVER coordinates)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedState) params.set('state', selectedState);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedRadius) params.set('radius', String(selectedRadius));
    if (openNowOnly) params.set('openNow', 'true');
    if (selectedStatus !== 'verified') params.set('status', selectedStatus);
    if (sortBy !== 'rating' && sortBy !== 'nearest') params.set('sort', sortBy);

    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [searchQuery, selectedState, selectedCity, selectedRadius, openNowOnly, selectedStatus, sortBy]);

  // Handle state change with city scoping
  const handleSelectState = useCallback((stateCode: string) => {
    const norm = stateCode.trim().toUpperCase();
    setSelectedState(norm);
    if (selectedCity && norm) {
      const cityExistsInState = initialMosques.some(
        m => m.stateCode === norm && m.city.toLowerCase() === selectedCity.toLowerCase()
      );
      if (!cityExistsInState) {
        setSelectedCity('');
      }
    }
  }, [selectedCity, initialMosques]);

  // Compute available cities scoped to the selected state or high-density nationwide
  const scopedTopCities = useMemo(() => {
    if (selectedState) {
      const stateMosques = initialMosques.filter(
        m => m.stateCode === selectedState && m.dataStatus !== 'excluded'
      );
      const cityMap = new Map<string, number>();
      for (const m of stateMosques) {
        cityMap.set(m.city, (cityMap.get(m.city) || 0) + 1);
      }
      return Array.from(cityMap.entries())
        .map(([city, count]) => ({ city, count, stateCode: selectedState }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }
    return topCities;
  }, [initialMosques, selectedState, topCities]);

  // Filter and sort mosques pipeline
  const filteredMosques = useMemo(() => {
    let result = [...initialMosques];

    // Filter out excluded records (preserves repository classification)
    result = result.filter(m => m.dataStatus !== 'excluded');

    // Status filter
    if (selectedStatus === 'verified') {
      result = result.filter(m => m.dataStatus === 'verified');
    }

    // State filter (Nationwide when empty)
    if (selectedState) {
      result = result.filter(m => m.stateCode === selectedState);
    }

    // City quick filter
    if (selectedCity) {
      result = result.filter(m => m.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // Search query filter (ZIP / City / Name / Category / Address)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      if (/^\d{5}$/.test(q)) {
        result = result.filter(m => m.postalCode && m.postalCode.startsWith(q));
      } else {
        result = result.filter(
          m =>
            m.name.toLowerCase().includes(q) ||
            m.city.toLowerCase().includes(q) ||
            m.state.toLowerCase().includes(q) ||
            m.stateCode.toLowerCase() === q ||
            m.address.toLowerCase().includes(q) ||
            (m.postalCode && m.postalCode.includes(q)) ||
            m.categories.some(c => c.toLowerCase().includes(q))
        );
      }
    }

    // Open Now filter (timezone-aware with location-aware coordinate resolver)
    if (openNowOnly) {
      result = result.filter(m => {
        const tz = getTimezoneForMosque(m);
        const status = getMosqueOpenStatus(m.openingHours, tz);
        return status.state === 'open' || status.state === '24hours';
      });
    }

    // Amenity & Accessibility filters (Strict three-valued matching)
    if (countActiveAmenityFilters(amenityFilters) > 0) {
      result = result.filter(m => matchesAmenityFilters(m, amenityFilters));
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

      // Radius filter (5, 10, 25, 50, 100 miles)
      if (typeof selectedRadius === 'number' && selectedRadius > 0) {
        result = result.filter(m => typeof m.distanceMiles === 'number' && m.distanceMiles <= selectedRadius);
      }
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'nearest' && userCoords) {
        return (a.distanceMiles ?? Infinity) - (b.distanceMiles ?? Infinity);
      }
      if (sortBy === 'rating') {
        const reviewDiff = (b.reviewCount || 0) - (a.reviewCount || 0);
        if (reviewDiff !== 0) return reviewDiff;
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [
    initialMosques,
    searchQuery,
    selectedState,
    selectedCity,
    selectedRadius,
    userCoords,
    openNowOnly,
    selectedStatus,
    sortBy,
    amenityFilters,
  ]);

  // Compute live amenity capabilities counts based on active city/status candidate pool
  const amenityCounts = useMemo(() => {
    let candidates = initialMosques.filter(m => m.dataStatus !== 'excluded');
    if (selectedStatus === 'verified') {
      candidates = candidates.filter(m => m.dataStatus === 'verified');
    }
    if (selectedCity) {
      candidates = candidates.filter(m => m.city.toLowerCase() === selectedCity.toLowerCase());
    }
    return countAmenityCapabilities(candidates);
  }, [initialMosques, selectedStatus, selectedCity]);

  // Ensure selected mosque remains valid when filtered results change
  useEffect(() => {
    if (selectedMosqueId && !filteredMosques.some(m => m.id === selectedMosqueId)) {
      setSelectedMosqueId(null);
    }
  }, [filteredMosques, selectedMosqueId]);

  // Marker selection callback: highlights card and scrolls into view on desktop
  const handleSelectMosque = useCallback(
    (id: string) => {
      setSelectedMosqueId(id);

      // If clicked mosque is beyond currently loaded cards, expand visible count
      const targetIdx = filteredMosques.findIndex(m => m.id === id);
      if (targetIdx >= 0) {
        setVisibleCount(prev => Math.max(prev, targetIdx + 1));
      }

      // Gently scroll card into view if in list mode
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          const cardEl = document.getElementById(`mosque-card-${id}`);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 50);
      }
    },
    [filteredMosques]
  );

  const handleCardClick = useCallback((id: string) => {
    setSelectedMosqueId(prev => (prev === id ? null : id));
  }, []);

  const handleViewOnMapMobile = useCallback((id: string) => {
    setSelectedMosqueId(id);
    setMobileViewMode('map');
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedCity('');
    setSelectedRadius(null);
    setOpenNowOnly(false);
    setSelectedStatus('verified');
    setUserCoords(null);
    setSortBy('rating');
    setSelectedMosqueId(null);
    setAmenityFilters(EMPTY_AMENITY_FILTERS);
  }, []);

  const hasActiveFilters = Boolean(
    searchQuery ||
      selectedState ||
      selectedCity ||
      selectedRadius !== null ||
      openNowOnly ||
      selectedStatus !== 'verified' ||
      userCoords ||
      countActiveAmenityFilters(amenityFilters) > 0
  );

  const selectedMosque = useMemo(
    () => filteredMosques.find(m => m.id === selectedMosqueId) || null,
    [filteredMosques, selectedMosqueId]
  );

  return (
    <div className="space-y-6">
      {/* Search & Location Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
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
          <div className="mt-3 flex items-center justify-between rounded-lg bg-brand-50 border border-brand-200 px-3.5 py-2 text-xs text-brand-900">
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-brand-700 animate-spin-slow flex-shrink-0" />
              <span>
                Sorted by nearest to your GPS coordinates ({userCoords.lat.toFixed(3)}, {userCoords.lng.toFixed(3)})
                {selectedRadius ? ` • Filtered to within ${selectedRadius} miles` : ''}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearLocation}
              className="inline-flex items-center gap-1 font-semibold text-brand-800 hover:text-brand-950 underline focus:outline-none ml-2 flex-shrink-0"
            >
              <XCircle className="h-3.5 w-3.5" />
              Clear location
            </button>
          </div>
        )}

        {/* Filters and sorting */}
        <FinderFilters
          openNowOnly={openNowOnly}
          onToggleOpenNow={() => setOpenNowOnly(!openNowOnly)}
          selectedStatus={selectedStatus}
          onToggleStatus={() => setSelectedStatus(selectedStatus === 'verified' ? 'all' : 'verified')}
          selectedState={selectedState}
          onSelectState={handleSelectState}
          enabledStates={activeStates}
          selectedRadius={selectedRadius}
          onSelectRadius={setSelectedRadius}
          sortBy={sortBy}
          onSortChange={setSortBy}
          hasLocation={Boolean(userCoords)}
          selectedCity={selectedCity}
          topCities={scopedTopCities}
          onSelectCity={setSelectedCity}
          onClearFilters={handleClearAllFilters}
          hasActiveFilters={hasActiveFilters}
          amenityFilters={amenityFilters}
          onAmenityFiltersChange={setAmenityFilters}
          amenityCounts={amenityCounts}
        />
      </div>

      {/* Discovery Header & Mobile View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {userCoords
              ? selectedRadius
                ? `Mosques Within ${selectedRadius} Miles of You`
                : 'Mosques Nearest to You'
              : selectedCity && selectedState
              ? `Mosques in ${selectedCity}, ${selectedState}`
              : selectedCity
              ? `Mosques in ${selectedCity}`
              : selectedState
              ? `Mosques in ${activeStates.find(s => s.code === selectedState)?.name || selectedState}`
              : 'U.S. Mosque Directory (Nationwide)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <strong className="text-slate-800">{filteredMosques.length}</strong> {filteredMosques.length === 1 ? 'mosque' : 'mosques'}
            {userCoords
              ? selectedRadius
                ? ` • within ${selectedRadius} miles, sorted by distance`
                : ' • sorted by distance'
              : selectedState
              ? ` in ${activeStates.find(s => s.code === selectedState)?.name || selectedState}`
              : ' across active U.S. states'}
            {` • ${selectedStatus === 'verified' ? 'Verified listings' : 'All listings'}`}
          </p>
        </div>

        {/* Mobile View Switcher (Hidden on Desktop) */}
        <div className="lg:hidden flex items-center justify-end">
          <ViewToggle
            mode={mobileViewMode}
            onChange={setMobileViewMode}
            resultCount={filteredMosques.length}
          />
        </div>
      </div>

      {/* Main Discover Layout: Split Map & List */}
      {filteredMosques.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Mosque List Column */}
          <div
            className={`space-y-4 lg:col-span-7 xl:col-span-7 ${
              mobileViewMode === 'map' ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMosques.slice(0, visibleCount).map((mosque, idx) => (
                <div key={mosque.id} className="flex flex-col">
                  <MosqueCard
                    mosque={mosque}
                    priority={idx < 4}
                    isSelected={mosque.id === selectedMosqueId}
                    onSelect={() => handleCardClick(mosque.id)}
                  />
                  {/* Mobile-only action to switch to map */}
                  <div className="lg:hidden mt-1 px-1">
                    <button
                      type="button"
                      onClick={() => handleViewOnMapMobile(mosque.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-900"
                    >
                      <MapPin className="h-3 w-3" />
                      Show on map &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Progressive Loading Controls */}
            {visibleCount < filteredMosques.length ? (
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  Showing <strong className="text-slate-900">{Math.min(visibleCount, filteredMosques.length)}</strong> of{' '}
                  <strong className="text-slate-900">{filteredMosques.length}</strong> mosques
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleCount(prev => Math.min(prev + 24, filteredMosques.length))}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    Load 24 More Mosques
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleCount(filteredMosques.length)}
                    className="rounded-xl bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors"
                  >
                    Show All ({filteredMosques.length})
                  </button>
                </div>
              </div>
            ) : filteredMosques.length > 24 ? (
              <div className="pt-4 text-center border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium">
                  All {filteredMosques.length} mosques loaded
                </p>
              </div>
            ) : null}
          </div>

          {/* Interactive Map Column */}
          <div
            className={`lg:col-span-5 xl:col-span-5 lg:sticky lg:top-20 space-y-3 ${
              mobileViewMode === 'list' ? 'hidden lg:block' : 'block'
            }`}
          >
            <DynamicMosqueMap
              mosques={filteredMosques}
              selectedMosqueId={selectedMosqueId}
              onSelectMosque={handleSelectMosque}
              userCoords={userCoords}
              onLocateUser={() => {
                if (typeof window !== 'undefined' && navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    pos => {
                      handleLocationFound({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                      });
                    },
                    () => {}
                  );
                }
              }}
            />

            {/* Mobile Floating Selected Card Preview */}
            {selectedMosque && (
              <div className="lg:hidden rounded-xl border border-brand-200 bg-white p-4 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-800">
                      {selectedMosque.city}, {selectedMosque.stateCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {selectedMosque.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {selectedMosque.address}
                    </p>
                  </div>
                  {typeof selectedMosque.distanceMiles === 'number' && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-800 border border-brand-200">
                      {formatDistance(selectedMosque.distanceMiles)}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
                  <Link
                    href={getMosquePath(selectedMosque)}
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-800"
                  >
                    View Details
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      selectedMosque.address
                    )}&destination_place_id=${selectedMosque.latitude},${selectedMosque.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Navigation className="h-3 w-3 text-brand-700" />
                    Directions
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty Results State */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No mosques match your criteria</h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find any mosques matching "${searchQuery}". Try searching for another city, ZIP code, or clearing your active filters.`
              : 'No mosques matched the active filters. Try toggling "Open Now" off or clearing city selections.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="rounded-lg bg-brand-700 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-800 transition-colors shadow-sm"
            >
              Reset All Filters
            </button>
            {userCoords && (
              <button
                type="button"
                onClick={handleClearLocation}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Clear Location
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
