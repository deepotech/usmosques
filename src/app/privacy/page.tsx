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
          <h2 className="text-base font-bold text-slate-900">5. Cookies and Analytics</h2>
          <p>
            <strong>Google Analytics 4 (GA4):</strong> This site uses Google Analytics 4 to collect anonymised information about how visitors use the site — for example, which pages are visited, how long visitors stay, and which country traffic comes from. This data helps us understand usage patterns and improve the directory.
          </p>
          <p>
            Google Analytics sets one or more cookies (such as <code>_ga</code> and <code>_ga_*</code>) in your browser to distinguish visitors and report aggregated statistics. These cookies are set by Google LLC, a third party, not directly by this site.
          </p>
          <p>
            The data collected by Google Analytics is processed by Google in accordance with{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline hover:text-brand-900"
            >
              Google&apos;s Privacy Policy
            </a>
            . You can opt out of Google Analytics tracking at any time by installing the{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline hover:text-brand-900"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            , or by using your browser&apos;s built-in privacy or &ldquo;Do Not Track&rdquo; controls.
          </p>
          <p>
            <strong>Google AdSense:</strong> This site also loads Google AdSense, which may set advertising-related cookies to display relevant ads and measure ad performance. AdSense is operated by Google LLC. Please refer to{' '}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline hover:text-brand-900"
            >
              Google&apos;s Advertising Privacy Policy
            </a>{' '}
            for full details. You can manage interest-based advertising preferences via{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline hover:text-brand-900"
            >
              Google Ad Settings
            </a>
            .
          </p>
          <p>
            No cookie consent banner is currently displayed on this site. If you do not wish analytics or advertising cookies to be set, please use your browser&apos;s cookie controls or the opt-out links above before or during your visit.
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
          <h2 className="text-base font-bold text-slate-900">7. Advertising</h2>
          <p>
            This site uses <strong>Google AdSense</strong> to display advertisements. AdSense is operated by Google LLC and may use cookies and similar technologies to show ads based on your interests and browsing activity across the web. These are third-party cookies set by Google, not by this site.
          </p>
          <p>
            You can opt out of personalised advertising by visiting{' '}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline hover:text-brand-900 font-medium"
            >
              Google Ad Settings
            </a>
            {' '}or by using the{' '}
            <a
              href="https://optout.aboutads.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline hover:text-brand-900 font-medium"
            >
              Digital Advertising Alliance opt-out tool
            </a>
            .
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
