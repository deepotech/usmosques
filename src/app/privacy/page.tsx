import { Metadata } from 'next';
import { constructMetadata } from '@/lib/seo/metadata';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy | US Mosque Finder',
  description:
    'Privacy policy for US Mosque Finder — how we handle your information, geolocation, and third-party services.',
  canonical: '/privacy',
  noIndex: false,
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-0.5 text-xs font-semibold text-brand-800 mb-3">
          <ShieldCheck className="h-3.5 w-3.5" />
          Legal &amp; Privacy
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-base text-slate-600 leading-relaxed">
          This privacy policy explains how US Mosque Finder operates with respect to your information and the information we display.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed shadow-sm">

        {/* Section 1 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. What Information We Display</h2>
          <p>
            US Mosque Finder displays publicly available directory information about mosques and Islamic centers, including name, address, phone number, website, and opening hours. This is information about organizations, not about individual users. It is sourced from verified public records.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Information We Do Not Collect</h2>
          <p>
            This site does not require account registration or login. We do not collect your name, email address, or personal data through normal use of the directory. You can browse all listings without providing any personal information.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Browser Geolocation</h2>
          <p>
            The optional &ldquo;Find Mosques Near Me&rdquo; feature uses your browser&apos;s built-in Geolocation API. When you activate this feature, your browser may ask for your permission before sharing your location. Your coordinates are processed entirely within your browser to calculate distances to nearby mosques. We do not store, log, or transmit your location to our servers.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Server Logs and Hosting</h2>
          <p>
            This site is served through a hosting platform. Like all web servers, our hosting provider may automatically collect standard server log data (such as IP addresses, browser type, and pages visited) for operational and security purposes. Please refer to the hosting provider&apos;s own privacy policy for details on how they handle server log data.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Cookies</h2>
          <p>
            We do not use tracking cookies, analytics cookies, or advertising cookies on this site at this time. No first-party or third-party cookies are set through normal browsing of the directory.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">6. External Links</h2>
          <p>
            Mosque detail pages may include links to third-party websites, such as a mosque&apos;s official website or Google Maps directions. We are not responsible for the privacy practices or content of those external websites. We encourage you to review the privacy policy of any third-party site you visit.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">7. Future Advertising</h2>
          <p>
            We may introduce third-party advertising services (such as Google AdSense) in the future to help support the maintenance and development of this directory. If we do, this privacy policy will be updated in advance to explain which advertising cookies may be set, what data may be shared with advertising partners, how to opt out of interest-based advertising, and how Google&apos;s advertising cookies work.
          </p>
          <p>
            We will not activate any advertising service without first updating this policy and, where required by law, obtaining appropriate user consent.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">8. Contact About Privacy</h2>
          <p>
            If you have questions or concerns about this privacy policy, please contact us at:{' '}
            <a
              href="mailto:dounia.elmarradi@gmail.com"
              className="text-brand-700 underline hover:text-brand-900 font-medium"
            >
              dounia.elmarradi@gmail.com
            </a>
          </p>
        </section>

        {/* Effective date */}
        <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
          This policy was last updated in October 2026.
        </p>
      </div>
    </div>
  );
}
