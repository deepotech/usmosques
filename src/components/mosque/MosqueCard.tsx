import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mosque } from '@/types/mosque';
import { MosqueStatusBadge } from './MosqueStatusBadge';
import { DistanceBadge } from './DistanceBadge';
import { RatingSummary } from './RatingSummary';
import { ActionButtons } from './ActionButtons';
import { MapPin, Building2, CheckCircle2 } from 'lucide-react';

interface MosqueCardProps {
  mosque: Mosque;
  priority?: boolean;
}

export function MosqueCard({ mosque, priority = false }: MosqueCardProps) {
  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
      <div>
        {/* Header row: Status badges & Distance */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <MosqueStatusBadge
              openingHours={mosque.openingHours}
              stateCode={mosque.stateCode}
              state={mosque.state}
            />
            {mosque.dataStatus === 'verified' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-400/20" title="Verified Islamic center or mosque listing">
                <CheckCircle2 className="h-3 w-3 text-brand-600" />
                Verified
              </span>
            )}
          </div>
          <DistanceBadge distanceMiles={mosque.distanceMiles} />
        </div>

        {/* Image & Title layout */}
        <div className="flex gap-4 items-start">
          {mosque.imageUrl ? (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
              <Image
                src={mosque.imageUrl}
                alt={`Photo of ${mosque.name}`}
                fill
                sizes="80px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                priority={priority}
                loading={priority ? undefined : 'lazy'}
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-100 text-slate-400">
              <Building2 className="h-8 w-8 text-slate-300" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-brand-800 transition-colors">
              <Link href={`/mosque/${mosque.slug}`} className="focus:outline-none focus:underline">
                {mosque.name}
              </Link>
            </h3>

            {/* Address */}
            <div className="mt-1 flex items-start gap-1.5 text-xs text-slate-600">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 mt-0.5" />
              <span className="line-clamp-2">{mosque.address}</span>
            </div>

            {/* Ratings & Reviews */}
            <div className="mt-2">
              <RatingSummary rating={mosque.rating} reviewCount={mosque.reviewCount} />
            </div>
          </div>
        </div>

        {/* Amenities / Accessibility tags if present */}
        {(mosque.accessibility.length > 0 || mosque.amenities.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {mosque.accessibility.slice(0, 2).map(acc => (
              <span
                key={acc}
                className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"
              >
                {acc}
              </span>
            ))}
            {mosque.amenities.slice(0, 1).map(amenity => (
              <span
                key={amenity}
                className="rounded bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons row */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <ActionButtons
          address={mosque.address}
          latitude={mosque.latitude}
          longitude={mosque.longitude}
          phone={mosque.phone}
          website={mosque.website}
        />
      </div>
    </article>
  );
}
