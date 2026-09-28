'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Mosque } from '@/types/mosque';
import { createMosqueIcon, createUserLocationIcon } from './map-icons';
import { getMosqueOpenStatus, getTimezoneForState } from '@/lib/geo/timezone';
import { formatDistance } from '@/lib/geo/distance';
import { Maximize2, Navigation } from 'lucide-react';

interface MosqueMapProps {
  mosques: Mosque[];
  selectedMosqueId: string | null;
  onSelectMosque: (id: string) => void;
  userCoords: { lat: number; lng: number } | null;
  className?: string;
  onLocateUser?: () => void;
}

// California centroid
const DEFAULT_CENTER: [number, number] = [36.7783, -119.4179];
const DEFAULT_ZOOM = 6;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function MosqueMap({
  mosques,
  selectedMosqueId,
  onSelectMosque,
  userCoords,
  className = '',
  onLocateUser,
}: MosqueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const prevMosqueIdsRef = useRef<string>('');

  // Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapRef.current = map;

    // Invalidate size after container settles
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const markerMap = markerMapRef.current;

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      markerMap.clear();
      userMarkerRef.current = null;
    };
  }, []);

  // Update User GPS Marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userCoords) {
      const { lat, lng } = userCoords;
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: createUserLocationIcon(),
          zIndexOffset: 1000,
          title: 'Your Location',
        }).addTo(map);
        marker.bindTooltip('Your Location', { direction: 'top', offset: [0, -10] });
        userMarkerRef.current = marker;
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords]);

  // Update Mosque Markers
  useEffect(() => {
    const map = mapRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    const bounds = L.latLngBounds([]);
    let validCount = 0;

    mosques.forEach(m => {
      // Validate coordinates safely
      if (
        typeof m.latitude !== 'number' ||
        typeof m.longitude !== 'number' ||
        isNaN(m.latitude) ||
        isNaN(m.longitude)
      ) {
        return;
      }

      const isSelected = m.id === selectedMosqueId;
      const marker = L.marker([m.latitude, m.longitude], {
        icon: createMosqueIcon(isSelected),
        zIndexOffset: isSelected ? 500 : 0,
        title: m.name,
      });

      // Compute hours status
      const tz = getTimezoneForState(m.stateCode, m.state);
      const hoursStatus = getMosqueOpenStatus(m.openingHours, tz);

      let statusBadgeHtml = '';
      if (hoursStatus.state === 'open' || hoursStatus.state === '24hours') {
        statusBadgeHtml = `<span style="background-color: #dcfce7; color: #15803d; border-radius: 9999px; padding: 2px 8px; font-size: 10px; font-weight: 600;">Open Now</span>`;
      } else if (hoursStatus.state === 'closed') {
        statusBadgeHtml = `<span style="background-color: #fee2e2; color: #b91c1c; border-radius: 9999px; padding: 2px 8px; font-size: 10px; font-weight: 600;">Closed</span>`;
      } else {
        statusBadgeHtml = `<span style="background-color: #f1f5f9; color: #64748b; border-radius: 9999px; padding: 2px 8px; font-size: 10px; font-weight: 500;">Hours not listed</span>`;
      }

      const distanceHtml =
        typeof m.distanceMiles === 'number'
          ? `<span style="background-color: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 9999px; padding: 1px 6px; font-size: 10px; font-weight: 700;">${formatDistance(
              m.distanceMiles
            )}</span>`
          : '';

      const ratingHtml =
        m.rating && m.rating > 0
          ? `<div style="font-size: 11px; color: #b45309; font-weight: 600; margin-top: 2px;">★ ${m.rating.toFixed(
              1
            )} (${m.reviewCount || 0} reviews)</div>`
          : '';

      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        m.address
      )}&destination_place_id=${m.latitude},${m.longitude}`;

      const popupContent = `
        <div style="font-family: inherit; min-width: 200px; max-width: 260px; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            ${statusBadgeHtml}
            ${distanceHtml}
          </div>
          <h4 style="margin: 0 0 2px 0; font-size: 14px; font-weight: 700; line-height: 1.25; color: #0f172a;">
            ${escapeHtml(m.name)}
          </h4>
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; line-height: 1.3;">
            ${escapeHtml(m.address)}
          </p>
          ${ratingHtml}
          <div style="display: flex; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
            <a href="/mosque/${escapeHtml(
              m.slug
            )}" style="flex: 1; text-align: center; background-color: #15803d; color: white; border-radius: 6px; padding: 5px 8px; font-size: 11px; font-weight: 600; text-decoration: none;">
              View Details
            </a>
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex: 1; text-align: center; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; padding: 5px 8px; font-size: 11px; font-weight: 600; text-decoration: none;">
              Directions
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'mosque-map-popup',
      });

      marker.on('click', () => {
        onSelectMosque(m.id);
      });

      marker.addTo(layer);
      markerMapRef.current.set(m.id, marker);
      bounds.extend([m.latitude, m.longitude]);
      validCount++;
    });

    // Auto fit bounds only when the list of mosque IDs actually changes
    const currentMosqueIds = mosques.map(m => m.id).join(',');
    if (currentMosqueIds !== prevMosqueIdsRef.current) {
      prevMosqueIdsRef.current = currentMosqueIds;

      if (userCoords) {
        bounds.extend([userCoords.lat, userCoords.lng]);
      }

      if (validCount > 0) {
        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: validCount === 1 ? 14 : 13,
        });
      }
    }
  }, [mosques, selectedMosqueId, onSelectMosque, userCoords]);

  // Focus and open popup on selection change
  useEffect(() => {
    if (!selectedMosqueId) return;
    const marker = markerMapRef.current.get(selectedMosqueId);
    const map = mapRef.current;
    if (marker && map) {
      const latLng = marker.getLatLng();
      map.panTo(latLng, { animate: true });
      marker.openPopup();
    }
  }, [selectedMosqueId]);

  // Reset to full view of current results
  const handleResetBounds = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = L.latLngBounds([]);
    let count = 0;

    mosques.forEach(m => {
      if (typeof m.latitude === 'number' && typeof m.longitude === 'number') {
        bounds.extend([m.latitude, m.longitude]);
        count++;
      }
    });

    if (userCoords) {
      bounds.extend([userCoords.lat, userCoords.lng]);
      count++;
    }

    if (count > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [mosques, userCoords]);

  // Center on user location
  const handleCenterUser = useCallback(() => {
    if (userCoords && mapRef.current) {
      mapRef.current.setView([userCoords.lat, userCoords.lng], 12, { animate: true });
      if (userMarkerRef.current) {
        userMarkerRef.current.openTooltip();
      }
    } else if (onLocateUser) {
      onLocateUser();
    }
  }, [userCoords, onLocateUser]);

  return (
    <div className={`relative isolate rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm ${className}`}>
      {/* Map DOM Element */}
      <div
        ref={mapContainerRef}
        className="h-full w-full min-h-[380px] sm:min-h-[460px] lg:min-h-[580px] z-0"
        aria-label="Interactive map of California mosques"
        role="region"
      />

      {/* Floating Control Buttons */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleResetBounds}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
          title="Fit map to all results"
          aria-label="Fit map to all results"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={handleCenterUser}
          className={`flex h-9 w-9 items-center justify-center rounded-lg shadow-md border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 ${
            userCoords
              ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title={userCoords ? 'Center map on my location' : 'Locate my position'}
          aria-label={userCoords ? 'Center map on my location' : 'Locate my position'}
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>

      {/* Result Count Watermark */}
      <div className="absolute bottom-2 left-2 z-[400] rounded-md bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200 shadow-sm pointer-events-none">
        {mosques.length} {mosques.length === 1 ? 'mosque' : 'mosques'} on map
      </div>
    </div>
  );
}
