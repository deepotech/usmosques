'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Locate, Loader2 } from 'lucide-react';

export function HomeHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/mosque-near-me?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/mosque-near-me');
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsLocating(false);
        router.push(
          `/mosque-near-me?lat=${pos.coords.latitude.toFixed(6)}&lng=${pos.coords.longitude.toFixed(6)}`
        );
      },
      err => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please enter your city or ZIP below.');
        } else {
          setLocationError('Unable to retrieve location. Please search by city or ZIP.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by city, ZIP code, or mosque name…"
            className="w-full rounded-xl border border-slate-300 bg-white py-4 pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30 transition-all"
          />
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-brand-700 px-7 py-4 text-base font-semibold text-white shadow-sm hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-col items-center">
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-brand-800 hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all"
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
          ) : (
            <Locate className="h-4 w-4 text-brand-600" />
          )}
          <span>{isLocating ? 'Detecting your location…' : 'Use My Current Location'}</span>
        </button>

        {locationError && (
          <p className="mt-2 text-xs text-rose-600 font-medium" role="alert">
            {locationError}
          </p>
        )}
      </div>
    </div>
  );
}
