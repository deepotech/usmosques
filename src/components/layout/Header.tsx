'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Search, Menu, X, Compass, ChevronDown } from 'lucide-react';
import { getEnabledStates } from '@/lib/config/state-registry';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const enabledStates = getEnabledStates();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm transition-transform group-hover:scale-105">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-brand-800 transition-colors">
              Mosque Finder
            </span>
            <span className="text-xs font-medium text-slate-500 -mt-1">
              US Directory & Local Search
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          <Link
            href="/mosque-near-me"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-brand-700 transition-colors"
          >
            <MapPin className="h-4 w-4 text-brand-600" />
            Find Mosques Near Me
          </Link>

          {/* States Dropdown */}
          <div className="relative group py-2">
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors cursor-pointer"
              aria-haspopup="true"
            >
              <span>States</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-700 transition-transform group-hover:rotate-180" />
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50">
              {enabledStates.map(s => (
                <Link
                  key={s.code}
                  href={`/mosques/${s.slug}`}
                  className="block px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-800 transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/about"
            className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors"
          >
            About & Transparency
          </Link>
          <Link
            href="/mosque-near-me"
            className="inline-flex items-center justify-center rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 transition-all"
          >
            <Search className="mr-1.5 h-4 w-4" />
            Search Mosques
          </Link>
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-600"
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg" id="mobile-menu">
          <div className="space-y-2">
            <Link
              href="/mosque-near-me"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-semibold text-brand-800 bg-brand-50"
            >
              <MapPin className="h-5 w-5 text-brand-600" />
              Find Mosques Near Me
            </Link>

            <div className="pt-2 pb-1 border-t border-slate-100">
              <span className="block px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                State Directories
              </span>
              <div className="grid grid-cols-2 gap-1 px-1">
                {enabledStates.map(s => (
                  <Link
                    key={s.code}
                    href={`/mosques/${s.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-800"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 border-t border-slate-100 pt-2"
            >
              About & Transparency
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
