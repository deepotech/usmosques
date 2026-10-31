import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { ShieldCheck, Database, MapPin, Users, BookOpen, Mail } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'About US Mosque Finder | Independent U.S. Mosque Directory',
  description:
    'Learn about US Mosque Finder — an independent directory of mosques, Islamic centers, and prayer facilities in the United States. Understand our data sources, verification process, and how to report corrections.',
  canonical: '/about',
});

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">

      {/* Page header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-800 mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          Transparency &amp; Methodology
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          About US Mosque Finder
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          US Mosque Finder is an independent online directory designed to help people locate mosques,
          Islamic centers, and prayer facilities across the United States. It is not affiliated with any
          mosque, Islamic organization, government agency, or religious authority.
        </p>
      </div>

      {/* Who we serve */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-700" />
          Who This Directory Serves
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          This directory is designed for anyone who needs to find a place of prayer or an Islamic
          community center in the United States:
        </p>
        <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 ml-2">
          <li>Muslims looking for the nearest masjid for daily or Jumu&apos;ah prayer</li>
          <li>Travelers and visitors searching for a local mosque while away from home</li>
          <li>Families and newcomers exploring Islamic centers in a new city or neighborhood</li>
          <li>People seeking verified contact information, addresses, or directions</li>
          <li>Community researchers looking for publicly available facility data</li>
        </ul>
        <p className="text-sm text-slate-600 leading-relaxed">
          The directory is free to use and does not require registration or an account.
        </p>
      </div>

      {/* Data sources */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Database className="h-5 w-5 text-brand-700" />
          Where Our Data Comes From
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Listings in this directory are compiled from publicly available information, primarily sourced
          from Google Places public business records. Each record includes data fields such as the facility
          name, street address, phone number, website URL, opening hours, and accessibility attributes,
          where those details are available in the public record.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Google Places data is used as a starting point for geographic coverage and basic facility
          identification. USMosques.com is an independent project and is not operated, endorsed, or
          affiliated with Google LLC.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Community-submitted corrections supplement the initial dataset. When a visitor reports that a
          listing is incorrect, outdated, or missing information, we review and update the record manually.
        </p>

        <div className="space-y-4 border-t border-slate-100 pt-5">
          <h3 className="font-semibold text-slate-900">What &ldquo;Verified&rdquo; means in this directory</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            A listing marked as <strong>verified</strong> has passed our automated normalization pipeline,
            which checks that the entity is plausibly a mosque, Islamic center, or prayer facility — not a
            commercial business or unrelated entity mistakenly included in the public dataset.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Verified status does not mean that every detail (hours, phone number, website) has been
            individually confirmed by phone or in-person visit. Some fields may be outdated or incomplete.
            We always recommend contacting a facility directly before visiting, especially for prayer times
            or special schedules during Ramadan and holidays.
          </p>

          <h3 className="font-semibold text-slate-900 mt-4">Records under review</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Some records in our dataset are flagged as requiring additional review — for example, when an
            address appears to be shared with another listing, or when the facility category is ambiguous.
            These records are not published as public listing pages until the ambiguity is resolved.
          </p>
        </div>
      </div>

      {/* Data principles */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-700" />
          Our Data Principles
        </h2>

        <div className="space-y-4">
          <div className="border-l-4 border-brand-600 pl-4 py-1">
            <h3 className="font-semibold text-slate-900">1. We do not fabricate information</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              We never invent ratings, generate artificial reviews, or guess opening hours. If an official
              website or phone number does not exist in our source records, we leave that field blank rather
              than display a placeholder or an estimate.
            </p>
          </div>

          <div className="border-l-4 border-brand-600 pl-4 py-1">
            <h3 className="font-semibold text-slate-900">2. We filter out non-mosque businesses</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Our normalization pipeline identifies and excludes commercial entities — such as clothing
              stores, catering companies, or unrelated businesses — that may appear in public maps data
              under mosque-adjacent category labels. Only genuine prayer facilities and Islamic centers
              are published.
            </p>
          </div>

          <div className="border-l-4 border-brand-600 pl-4 py-1">
            <h3 className="font-semibold text-slate-900">3. We display honest availability status</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Opening hours are displayed in each facility&apos;s local timezone. When hours are not available
              in the source data, we display &ldquo;Hours not listed&rdquo; rather than showing a misleading open or
              closed status.
            </p>
          </div>

          <div className="border-l-4 border-brand-600 pl-4 py-1">
            <h3 className="font-semibold text-slate-900">4. We do not store your location</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              The &ldquo;Find Mosques Near Me&rdquo; feature uses your browser&apos;s built-in Geolocation API. Your
              coordinates are processed entirely within your browser to calculate distances. We do not log,
              store, or transmit your location to any server.
            </p>
          </div>
        </div>
      </div>

      {/* Corrections */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Mail className="h-5 w-5 text-brand-700" />
          Reporting Errors and Requesting Corrections
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Directory data can become outdated when mosques move, change phone numbers, update their hours,
          or permanently close. We rely on visitors with local knowledge to help us keep listings accurate.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          If you find an incorrect address, a wrong phone number, a closed facility that is still listed,
          or any other inaccuracy, please use the{' '}
          <Link href="/contact" className="text-brand-700 underline hover:text-brand-900 font-medium">
            Contact page
          </Link>{' '}
          to submit a correction report. Each listing page also includes a &ldquo;Report an Issue&rdquo; link that
          pre-fills the correction form with the facility name.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          Correction reports are reviewed manually. We aim to update confirmed corrections as quickly
          as possible, but we cannot guarantee a specific response time. We cannot add information
          that we have no way to independently verify.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          You may also contact us directly by email at{' '}
          <a
            href="mailto:dounia.elmarradi@gmail.com"
            className="text-brand-700 underline hover:text-brand-900 font-medium"
          >
            dounia.elmarradi@gmail.com
          </a>
          .
        </p>
      </div>

      {/* Advertising notice */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8 space-y-3 shadow-sm text-sm text-slate-600 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900">Advertising</h2>
        <p>
          This site displays advertisements served by Google AdSense to help support the costs of
          operating the directory. Ads are served by Google LLC and may be personalised based on your
          browsing activity. You can review our{' '}
          <Link href="/privacy" className="text-brand-700 underline hover:text-brand-900 font-medium">
            Privacy Policy
          </Link>{' '}
          for details on how advertising cookies work and how to manage your preferences.
        </p>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-slate-200 bg-brand-50/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-brand-950">Ready to locate a mosque?</h3>
          <p className="text-xs text-brand-800 mt-1">
            Find masajid with driving directions and contact information.
          </p>
        </div>
        <Link
          href="/mosque-near-me"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors"
        >
          <MapPin className="h-4 w-4" />
          Search Mosques
        </Link>
      </div>
    </div>
  );
}
