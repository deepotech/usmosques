'use client';

import React, { useState } from 'react';
import { Locate, Loader2 } from 'lucide-react';

interface LocationButtonProps {
  onLocationFound: (coords: { lat: number; lng: number }) => void;
  className?: string;
}

export function LocationButton({ onLocationFound, className = '' }: LocationButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      position => {
        setLoading(false);
        onLocationFound({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      error => {
        setLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg('Location permission denied. You can search by city or ZIP code above.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg('Location information is currently unavailable.');
            break;
          case error.TIMEOUT:
            setErrorMsg('Location request timed out. Please try again or search by city.');
            break;
          default:
            setErrorMsg('Unable to detect location. Please search by city or ZIP.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleGetLocation}
        disabled={loading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-brand-300 bg-brand-50 px-5 py-3 text-sm font-semibold text-brand-900 shadow-sm hover:bg-brand-100 hover:border-brand-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60 transition-all ${className}`}
        aria-label="Use my current location to find nearby mosques"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-brand-700" />
        ) : (
          <Locate className="h-4 w-4 text-brand-700" />
        )}
        <span>{loading ? 'Finding your location…' : 'Use My Location'}</span>
      </button>

      {errorMsg && (
        <p className="mt-2 text-xs text-rose-600 font-medium text-center" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
