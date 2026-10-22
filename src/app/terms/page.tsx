import { Metadata } from 'next';
import Link from 'next/link';
import { constructMetadata } from '@/lib/seo/metadata';
import { FileText } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Terms of Use | US Mosque Finder',
  description:
    'Terms of use for US Mosque Finder — conditions for using this mosque and Islamic center directory.',
  canonical: '/terms',
  noIndex: false,
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-800 mb-3">
          <FileText className="h-3.5 w-3.5" />
          Legal
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Terms of Use
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          By using US Mosque Finder, you agree to the following terms. Please read them carefully.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed shadow-sm">

        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Directory Purpose</h2>
          <p>
            US Mosque Finder provides a community-indexed directory of mosques and Islamic centers in the United States to help people locate facilities for prayer and worship. The directory is provided as a public service and is not affiliated with any individual mosque, Islamic organization, or government agency.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Accuracy Disclaimer</h2>
          <p>
            Listing details — including hours, phone numbers, addresses, and websites — are drawn from public sources and may be incomplete, outdated, or changed by the listed organization. We strive for accuracy but cannot guarantee that every listing reflects current real-world conditions.
          </p>
          <p className="text-slate-500">
            <strong>Always verify important details directly with the mosque before visiting.</strong> This is especially important for prayer times, Jumu&apos;ah schedules, and facility access hours, which may change during Ramadan, holidays, or for special events.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Lawful Use</h2>
          <p>
            Use of this directory is subject to applicable local, state, and federal laws. The following uses are prohibited:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
            <li>Scraping, automated data extraction, or bulk downloading of listings</li>
            <li>Republication of listings on other platforms without permission</li>
            <li>Use of directory data to solicit, spam, or commercially target listed organizations without their explicit consent</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Respectful Use</h2>
          <p>
            This directory serves faith communities and their visitors. Harassment, defamation, or abuse directed at any listed mosque, Islamic center, community, or the operators of this platform is not permitted and may result in reports to appropriate authorities.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. External Links</h2>
          <p>
            This directory links to third-party websites, including mosque official websites and Google Maps. We are not responsible for the content, availability, accuracy, or privacy practices of those external sites. Links to third-party sites do not constitute endorsement of those sites or their content.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">6. Reporting Incorrect Information</h2>
          <p>
            If you notice an incorrect, outdated, or harmful listing, we want to know. Please contact us via our{' '}
            <Link href="/contact" className="text-brand-700 underline hover:text-brand-900 font-medium">
              Contact Page
            </Link>{' '}
            or by email at{' '}
            <a
              href="mailto:dounia.elmarradi@gmail.com"
              className="text-brand-700 underline hover:text-brand-900 font-medium"
            >
              dounia.elmarradi@gmail.com
            </a>
            .
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">7. Limitation of Liability</h2>
          <p>
            This directory is provided as a convenience tool. We make no warranties — express or implied — regarding the accuracy, completeness, or fitness of listed information for any particular purpose. Use of this directory does not create any warranty, obligation, or professional relationship between the site operator and any visitor, mosque, or organization.
          </p>
          <p>
            To the fullest extent permitted by applicable law, US Mosque Finder and its operators shall not be liable for any loss, harm, or damages arising from reliance on directory information, including but not limited to navigation errors, incorrect hours, or outdated contact details.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">8. Governing Law and Severability</h2>
          <p>
            These terms of use are governed by and construed in accordance with applicable laws of the United States. If any provision of these terms is found to be unlawful, void, or unenforceable, that provision shall be deemed severable and shall not affect the validity and enforceability of any remaining provisions.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">9. Changes to Terms</h2>
          <p>
            We may update these terms of use at any time. The updated version will be posted on this page with a revised effective date. Continued use of the site after any changes constitutes your acceptance of the revised terms.
          </p>
        </section>

        {/* Effective date */}
        <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
          These terms were last updated in October 2026.
        </p>
      </div>
    </div>
  );
}
