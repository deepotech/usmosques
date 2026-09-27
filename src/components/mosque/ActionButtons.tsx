import React from 'react';
import { Phone, Globe, Navigation } from 'lucide-react';

interface ActionButtonsProps {
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  className?: string;
}

export function ActionButtons({
  address,
  latitude,
  longitude,
  phone,
  website,
  className = '',
}: ActionButtonsProps) {
  // Google Maps directions link
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address
  )}&destination_place_id=${latitude},${longitude}`;

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-2 ${className}`}>
      {/* Directions */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        aria-label={`Get directions to ${address}`}
      >
        <Navigation className="h-3.5 w-3.5" />
        Directions
      </a>

      {/* Phone Call (Only rendered if phone exists) */}
      {phone && (
        <a
          href={`tel:${phone.replace(/[^\d+]/g, '')}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          aria-label={`Call ${phone}`}
        >
          <Phone className="h-3.5 w-3.5 text-slate-500" />
          Call
        </a>
      )}

      {/* Official Website (Only rendered if website exists) */}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          aria-label="Visit official website"
        >
          <Globe className="h-3.5 w-3.5 text-slate-500" />
          Website
        </a>
      )}
    </div>
  );
}
