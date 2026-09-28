'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { MapPlaceholder } from './MapPlaceholder';
import { Mosque } from '@/types/mosque';

export interface DynamicMosqueMapProps {
  mosques: Mosque[];
  selectedMosqueId: string | null;
  onSelectMosque: (id: string) => void;
  userCoords: { lat: number; lng: number } | null;
  className?: string;
  onLocateUser?: () => void;
}

export const DynamicMosqueMap = dynamic(
  () => import('./MosqueMap').then(mod => mod.MosqueMap),
  {
    ssr: false,
    loading: () => <MapPlaceholder />,
  }
);
