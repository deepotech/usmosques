'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Locate } from 'lucide-react';

export function HomeHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/mosque-near-me?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/mosque-near-me');
    }
  };

  const handleUseLocation = () => {
    // Preserve privacy: navigate with nearMe flag to trigger in-memory client-side geolocation
    router.push('/mosque-near-me?nearMe=true');
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
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-brand-800 hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all"
        >
          <Locate className="h-4 w-4 text-brand-600" />
          <span>Use My Current Location</span>
        </button>
      </div>
    </div>
  );
}
