/**
 * GA4 Integration Tests
 *
 * Verifies:
 *  1. The GA4 component is guarded by a valid-looking Measurement ID (starts with "G-").
 *  2. No placeholder or fabricated Measurement ID is present in layout source.
 *  3. AdSense code remains present and is not duplicated.
 *  4. Existing page metadata, canonical URL, robots rules, and sitemap remain unchanged.
 *  5. No duplicate GA4 page-view mechanism was introduced.
 *  6. Privacy policy now discloses Google Analytics and Google AdSense.
 *  7. Privacy policy no longer contains the outdated "no analytics cookies" claim.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// Read source files once for the whole suite
const layoutSource = fs.readFileSync(path.join(SRC, 'app', 'layout.tsx'), 'utf-8');
const privacySource = fs.readFileSync(path.join(SRC, 'app', 'privacy', 'page.tsx'), 'utf-8');

// ─── 1. GA4 Component Guard ───────────────────────────────────────────────────

describe('1. GA4 component guard', () => {
  it('layout.tsx imports GoogleAnalytics from @next/third-parties/google', () => {
    expect(layoutSource).toContain("from '@next/third-parties/google'");
  });

  it('GoogleAnalytics component is gated on NEXT_PUBLIC_GA_MEASUREMENT_ID starting with "G-"', () => {
    // The guard must check startsWith('G-') before rendering <GoogleAnalytics>
    expect(layoutSource).toContain("startsWith('G-')");
  });

  it('GoogleAnalytics receives gaId from the env var, not a hardcoded string', () => {
    // gaId must be set to process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    expect(layoutSource).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID');
    // No literal G- string should appear (would indicate a hardcoded ID)
    const hardcodedIdPattern = /gaId=["']G-[A-Z0-9]+["']/;
    expect(hardcodedIdPattern.test(layoutSource)).toBe(false);
  });
});

// ─── 2. No Placeholder / Fabricated ID ───────────────────────────────────────

describe('2. No placeholder or fabricated Measurement ID in source', () => {
  it('layout.tsx does not contain any hardcoded G- Measurement ID literal', () => {
    // Allow only the env-var reference, not a literal like G-XXXXXXXXXX
    const literalIdPattern = /["']G-[A-Z0-9]{6,}["']/;
    expect(literalIdPattern.test(layoutSource)).toBe(false);
  });

  it('layout.tsx does not contain the example placeholder "G-REPLACE_WITH_REAL_ID"', () => {
    expect(layoutSource).not.toContain('G-REPLACE_WITH_REAL_ID');
  });

  it('.env.example placeholder is G-REPLACE_WITH_REAL_ID (owner must substitute)', () => {
    const envExamplePath = path.join(ROOT, '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);
    const envExample = fs.readFileSync(envExamplePath, 'utf-8');
    expect(envExample).toContain('NEXT_PUBLIC_GA_MEASUREMENT_ID=G-REPLACE_WITH_REAL_ID');
  });
});

// ─── 3. AdSense Preservation and No Duplication ──────────────────────────────

describe('3. AdSense code preserved and not duplicated', () => {
  const ADSENSE_SRC = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
  const ADSENSE_CLIENT = 'ca-pub-6331163447795368';

  it('layout.tsx still contains the AdSense script src', () => {
    expect(layoutSource).toContain(ADSENSE_SRC);
  });

  it('layout.tsx still contains the correct AdSense client ID', () => {
    expect(layoutSource).toContain(ADSENSE_CLIENT);
  });

  it('AdSense script appears exactly once (no duplication)', () => {
    const count = (layoutSource.match(new RegExp(ADSENSE_SRC, 'g')) || []).length;
    expect(count).toBe(1);
  });
});

// ─── 4. Existing Metadata, Canonical, Robots, and Sitemap Unchanged ──────────

describe('4. Existing metadata and SEO safeguards unchanged', () => {
  it('layout.tsx still exports metadata object', () => {
    expect(layoutSource).toContain('export const metadata');
  });

  it('layout.tsx metadata still has canonical "/"', () => {
    expect(layoutSource).toContain("canonical: '/'");
  });

  it('layout.tsx metadata robots still set to index: true', () => {
    expect(layoutSource).toContain('index: true');
  });

  it('layout.tsx metadata robots still set to follow: true', () => {
    expect(layoutSource).toContain('follow: true');
  });

  it('sitemap module exists', () => {
    const sitemapPath = path.join(SRC, 'app', 'sitemap.ts');
    expect(fs.existsSync(sitemapPath)).toBe(true);
  });

  it('sitemap includes /privacy', async () => {
    const sitemap = await import('@/app/sitemap');
    const routes = await sitemap.default();
    const urls = routes.map((r: { url: string }) => r.url);
    expect(urls.some((u: string) => u.endsWith('/privacy'))).toBe(true);
  });
});

// ─── 5. No Duplicate GA4 Page-View Mechanism ─────────────────────────────────

describe('5. No duplicate GA4 page-view mechanism', () => {
  it('layout.tsx does not contain a manual gtag("event", "page_view") call', () => {
    expect(layoutSource).not.toContain("gtag('event', 'page_view'");
    expect(layoutSource).not.toContain('gtag("event", "page_view"');
  });

  it('layout.tsx does not load gtag.js directly (only via @next/third-parties)', () => {
    // Raw gtag.js URL should not be in layout — @next/third-parties injects it internally
    expect(layoutSource).not.toContain('googletagmanager.com/gtag/js');
    expect(layoutSource).not.toContain('google-analytics.com/analytics.js');
  });

  it('layout.tsx contains at most one GoogleAnalytics component instance', () => {
    const count = (layoutSource.match(/<GoogleAnalytics/g) || []).length;
    expect(count).toBeLessThanOrEqual(1);
  });

  it('no route-change listener duplicating page_view is present in layout.tsx', () => {
    // @next/third-parties handles SPA navigation; we should not have a manual useRouter/pathname listener
    expect(layoutSource).not.toContain('usePathname');
    expect(layoutSource).not.toContain('useRouter');
  });
});

// ─── 6. Privacy Policy Discloses Analytics and AdSense ───────────────────────

describe('6. Privacy policy discloses Google Analytics and AdSense', () => {
  it('privacy page mentions Google Analytics 4 or GA4', () => {
    expect(
      privacySource.toLowerCase().includes('google analytics') ||
      privacySource.includes('GA4')
    ).toBe(true);
  });

  it('privacy page mentions _ga cookie or analytics cookie', () => {
    expect(
      privacySource.includes('_ga') || privacySource.toLowerCase().includes('analytics cookie')
    ).toBe(true);
  });

  it('privacy page mentions Google Analytics opt-out', () => {
    expect(privacySource.toLowerCase()).toContain('opt-out');
  });

  it('privacy page mentions Google AdSense', () => {
    expect(privacySource.toLowerCase()).toContain('adsense');
  });

  it('privacy page links to Google Privacy Policy', () => {
    expect(privacySource).toContain('policies.google.com/privacy');
  });
});

// ─── 7. Outdated "No Cookies" Claim Removed ──────────────────────────────────

describe('7. Outdated "no analytics cookies" claim removed', () => {
  it('privacy page no longer states "We do not use tracking cookies, analytics cookies"', () => {
    expect(privacySource).not.toContain(
      'We do not use tracking cookies, analytics cookies'
    );
  });

  it('privacy page no longer contains "No first-party or third-party cookies are set"', () => {
    expect(privacySource).not.toContain(
      'No first-party or third-party cookies are set'
    );
  });
});
