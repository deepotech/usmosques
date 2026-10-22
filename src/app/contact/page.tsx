import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { Mail, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { sanitizeMosqueName } from '@/lib/data/normalization';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Us | US Mosque Finder',
  description:
    'Get in touch with US Mosque Finder to report a listing update, closure, or ask a general question.',
  canonical: '/contact',
  noIndex: false,
});

interface ContactPageProps {
  searchParams: Promise<{ mosque?: string }>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const preFillMosqueName = sanitizeMosqueName(params.mosque);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-800 mb-3">
          <Mail className="h-3.5 w-3.5" />
          Contact
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Contact Us
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          Have a listing update, question, or privacy inquiry? Use the appropriate section below.
        </p>
      </div>

      {/* ── Section 1: Report a Listing Update ────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-brand-700 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Report a Listing Update or Closure</h2>
            <p className="mt-1 text-sm text-slate-600">
              If a mosque listing on this site has incorrect hours, a wrong address, a changed phone number, or has permanently closed, we want to know. Use the form below to send us a correction report.
            </p>
          </div>
        </div>

        <form
          action="mailto:dounia.elmarradi@gmail.com"
          method="post"
          encType="text/plain"
          className="space-y-4"
        >
          <div>
            <label htmlFor="mosque-name" className="block text-sm font-medium text-slate-700 mb-1">
              Mosque Name <span className="text-red-500">*</span>
            </label>
            <input
              id="mosque-name"
              name="mosque-name"
              type="text"
              required
              defaultValue={preFillMosqueName}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Enter the mosque name"
            />
          </div>

          <div>
            <label htmlFor="issue-type" className="block text-sm font-medium text-slate-700 mb-1">
              Issue Type <span className="text-red-500">*</span>
            </label>
            <select
              id="issue-type"
              name="issue-type"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select an issue type…</option>
              <option value="wrong-address">Wrong address or location</option>
              <option value="wrong-phone-website">Wrong phone or website</option>
              <option value="changed-hours">Changed hours</option>
              <option value="permanently-closed">Permanently closed</option>
              <option value="duplicate-listing">Duplicate listing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="correction-details" className="block text-sm font-medium text-slate-700 mb-1">
              Correction Details <span className="text-red-500">*</span>
            </label>
            <textarea
              id="correction-details"
              name="correction-details"
              required
              maxLength={1000}
              rows={5}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-vertical"
              placeholder="Describe the correction needed (max 1,000 characters)…"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1">
              Your Email{' '}
              <span className="text-slate-400 font-normal">(optional — for follow-up only)</span>
            </label>
            <input
              id="contact-email"
              name="contact-email"
              type="email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Send Correction Report
          </button>
        </form>

        <p className="text-xs text-slate-500 border-t border-slate-100 pt-4 leading-relaxed">
          <strong>Note:</strong> Submitting this form will open your default email application with your correction report pre-filled and addressed to{' '}
          <a href="mailto:dounia.elmarradi@gmail.com" className="text-brand-700 underline font-medium">
            dounia.elmarradi@gmail.com
          </a>
          . We do not store or process your submission on a web server. You may also email us directly at that address.
        </p>
      </div>

      {/* ── Section 2: General Questions ──────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-brand-700 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">General Questions</h2>
            <p className="mt-1 text-sm text-slate-600">
              For general questions about US Mosque Finder — including partnership inquiries, data licensing questions, or feedback about the directory — please reach out by email at:{' '}
              <a
                href="mailto:dounia.elmarradi@gmail.com"
                className="text-brand-700 underline hover:text-brand-900 font-medium"
              >
                dounia.elmarradi@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Privacy Inquiries ──────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-brand-700 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Privacy Inquiries</h2>
            <p className="mt-1 text-sm text-slate-600">
              For questions or concerns about how we handle your information, please review our{' '}
              <Link href="/privacy" className="text-brand-700 underline hover:text-brand-900 font-medium">
                Privacy Policy
              </Link>
              . If you have a specific privacy-related inquiry, you may contact us directly at:{' '}
              <a
                href="mailto:dounia.elmarradi@gmail.com"
                className="text-brand-700 underline hover:text-brand-900 font-medium"
              >
                dounia.elmarradi@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
