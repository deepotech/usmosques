import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-white">
                <Compass className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                US Mosque Finder
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              A community-first local search platform helping Muslims and visitors find verified mosques, Islamic centers, directions, prayer spaces, and official contact information across the United States.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Independent & Community-Verified Local Data</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/mosque-near-me" className="hover:text-white transition-colors">
                  Mosques Near Me
                </Link>
              </li>
              <li>
                <Link href="/mosques/california" className="hover:text-white transition-colors">
                  California Mosques
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Data Quality & Methodology
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              California Hubs
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/mosques/california/sacramento" className="hover:text-white transition-colors">
                  Sacramento Mosques
                </Link>
              </li>
              <li>
                <Link href="/mosques/california/los-angeles" className="hover:text-white transition-colors">
                  Los Angeles Mosques
                </Link>
              </li>
              <li>
                <Link href="/mosques/california/san-diego" className="hover:text-white transition-colors">
                  San Diego Mosques
                </Link>
              </li>
              <li>
                <Link href="/mosques/california/fremont" className="hover:text-white transition-colors">
                  Fremont Mosques
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} US Mosque Finder. All rights reserved.</p>
          <p>
            Data sourced from verified public records. Hours and prayer times may vary during Ramadan and holidays.
          </p>
        </div>
      </div>
    </footer>
  );
}
