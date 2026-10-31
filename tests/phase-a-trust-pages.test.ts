/**
 * PHASE A — TRUST & LEGAL PAGES
 * Test Suite
 *
 * Scope:
 *   1. Privacy page module exports valid metadata (no runtime throw)
 *   2. Terms page module exports valid metadata (no runtime throw)
 *   3. Contact page module exports valid metadata (no runtime throw)
 *   4. Footer contains all required legal navigation links
 *   5. Sitemap includes /privacy, /terms, and /contact
 *   6. About page no longer contains the phrase "ad-free"
 *   7. Canonical metadata is set correctly for the three new pages
 *   8. Contact page does NOT collect unnecessary sensitive data fields
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import sitemap from '@/app/sitemap';
import { metadata as privacyMetadata } from '@/app/privacy/page';
import { metadata as termsMetadata } from '@/app/terms/page';
import { metadata as contactMetadata } from '@/app/contact/page';
import { constructMetadata } from '@/lib/seo/metadata';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

describe('PHASE A — Trust & Legal Pages', () => {

  // ─── 1. Privacy Page Module ──────────────────────────────────────────────

  describe('1. Privacy page module', () => {
    it('exports a metadata object without throwing', () => {
      expect(privacyMetadata).toBeDefined();
    });

    it('privacy metadata title contains "Privacy Policy"', () => {
      const titleStr = JSON.stringify(privacyMetadata.title);
      expect(titleStr.toLowerCase()).toContain('privacy policy');
    });

    it('privacy metadata has a description', () => {
      expect(privacyMetadata.description).toBeTruthy();
      expect(typeof privacyMetadata.description).toBe('string');
    });
  });

  // ─── 2. Terms Page Module ─────────────────────────────────────────────────

  describe('2. Terms page module', () => {
    it('exports a metadata object without throwing', () => {
      expect(termsMetadata).toBeDefined();
    });

    it('terms metadata title contains "Terms of Use"', () => {
      const titleStr = JSON.stringify(termsMetadata.title);
      expect(titleStr.toLowerCase()).toContain('terms of use');
    });

    it('terms metadata has a description', () => {
      expect(termsMetadata.description).toBeTruthy();
      expect(typeof termsMetadata.description).toBe('string');
    });
  });

  // ─── 3. Contact Page Module ───────────────────────────────────────────────

  describe('3. Contact page module', () => {
    it('exports a metadata object without throwing', () => {
      expect(contactMetadata).toBeDefined();
    });

    it('contact metadata title contains "Contact"', () => {
      const titleStr = JSON.stringify(contactMetadata.title);
      expect(titleStr.toLowerCase()).toContain('contact');
    });

    it('contact metadata has a description', () => {
      expect(contactMetadata.description).toBeTruthy();
      expect(typeof contactMetadata.description).toBe('string');
    });
  });

  // ─── 4. Footer — Legal Navigation Links ──────────────────────────────────

  describe('4. Footer contains required legal links', () => {
    const footerSource = fs.readFileSync(
      path.join(SRC, 'components', 'layout', 'Footer.tsx'),
      'utf-8'
    );

    it('footer includes href="/about"', () => {
      expect(footerSource).toContain('href="/about"');
    });

    it('footer includes href="/contact"', () => {
      expect(footerSource).toContain('href="/contact"');
    });

    it('footer includes href="/privacy"', () => {
      expect(footerSource).toContain('href="/privacy"');
    });

    it('footer includes href="/terms"', () => {
      expect(footerSource).toContain('href="/terms"');
    });
  });

  // ─── 5. Sitemap — New Routes Present ─────────────────────────────────────

  describe('5. Sitemap includes /privacy, /terms, and /contact', () => {
    it('sitemap output contains /privacy', async () => {
      const routes = await sitemap();
      const urls = routes.map(r => r.url);
      expect(urls.some(u => u.endsWith('/privacy'))).toBe(true);
    });

    it('sitemap output contains /terms', async () => {
      const routes = await sitemap();
      const urls = routes.map(r => r.url);
      expect(urls.some(u => u.endsWith('/terms'))).toBe(true);
    });

    it('sitemap output contains /contact', async () => {
      const routes = await sitemap();
      const urls = routes.map(r => r.url);
      expect(urls.some(u => u.endsWith('/contact'))).toBe(true);
    });

    it('/privacy sitemap entry has changeFrequency "monthly" and priority 0.4', async () => {
      const routes = await sitemap();
      const privacyRoute = routes.find(r => r.url.endsWith('/privacy'));
      expect(privacyRoute).toBeDefined();
      expect(privacyRoute!.changeFrequency).toBe('monthly');
      expect(privacyRoute!.priority).toBe(0.4);
    });

    it('/terms sitemap entry has changeFrequency "monthly" and priority 0.4', async () => {
      const routes = await sitemap();
      const termsRoute = routes.find(r => r.url.endsWith('/terms'));
      expect(termsRoute).toBeDefined();
      expect(termsRoute!.changeFrequency).toBe('monthly');
      expect(termsRoute!.priority).toBe(0.4);
    });

    it('/contact sitemap entry has changeFrequency "monthly" and priority 0.4', async () => {
      const routes = await sitemap();
      const contactRoute = routes.find(r => r.url.endsWith('/contact'));
      expect(contactRoute).toBeDefined();
      expect(contactRoute!.changeFrequency).toBe('monthly');
      expect(contactRoute!.priority).toBe(0.4);
    });
  });

  // ─── 6. About Page — "ad-free" Phrase Removed ────────────────────────────

  describe('6. About page no longer contains "ad-free"', () => {
    const aboutSource = fs.readFileSync(
      path.join(SRC, 'app', 'about', 'page.tsx'),
      'utf-8'
    );

    it('About page source does not contain the phrase "ad-free"', () => {
      expect(aboutSource).not.toContain('ad-free');
    });

    it('About page source still contains the expected replacement text', () => {
      // Updated in Phase 1 remediation: About page rewritten for editorial transparency.
      // Verifies the page contains its new introductory statement.
      expect(aboutSource).toContain('independent online directory designed to help people locate mosques');
    });
  });

  // ─── 7. Canonical Metadata Correctness ───────────────────────────────────

  describe('7. Canonical metadata is set correctly for new pages', () => {
    it('constructMetadata sets robots.index = true for noIndex: false', () => {
      const meta = constructMetadata({
        title: 'Test Page',
        description: 'Test description.',
        canonical: '/test',
        noIndex: false,
      });
      const robots = meta.robots as { index?: boolean; follow?: boolean };
      expect(robots.index).toBe(true);
      expect(robots.follow).toBe(true);
    });

    it('privacy metadata robots allows indexing (index: true)', () => {
      const robots = privacyMetadata.robots as { index?: boolean; follow?: boolean };
      expect(robots?.index).toBe(true);
    });

    it('terms metadata robots allows indexing (index: true)', () => {
      const robots = termsMetadata.robots as { index?: boolean; follow?: boolean };
      expect(robots?.index).toBe(true);
    });

    it('contact metadata robots allows indexing (index: true)', () => {
      const robots = contactMetadata.robots as { index?: boolean; follow?: boolean };
      expect(robots?.index).toBe(true);
    });

    it('privacy metadata canonical includes "/privacy"', () => {
      const canonical = JSON.stringify(privacyMetadata.alternates);
      expect(canonical).toContain('/privacy');
    });

    it('terms metadata canonical includes "/terms"', () => {
      const canonical = JSON.stringify(termsMetadata.alternates);
      expect(canonical).toContain('/terms');
    });

    it('contact metadata canonical includes "/contact"', () => {
      const canonical = JSON.stringify(contactMetadata.alternates);
      expect(canonical).toContain('/contact');
    });
  });

  // ─── 8. Contact Page — No Sensitive Data Fields ───────────────────────────

  describe('8. Contact page does not collect unnecessary sensitive data', () => {
    const contactSource = fs.readFileSync(
      path.join(SRC, 'app', 'contact', 'page.tsx'),
      'utf-8'
    );

    it('contact page source does not contain a "password" field', () => {
      // Check for type="password" input
      expect(contactSource.toLowerCase()).not.toContain('type="password"');
      expect(contactSource.toLowerCase()).not.toContain("type='password'");
    });

    it('contact page source does not contain an SSN or social security field', () => {
      // Check for "ssn" as a standalone term (field id, name, label, or value),
      // not as a substring of normal words like "className".
      // We look for "ssn" bounded by word boundaries or quotes/spaces.
      const ssnPattern = /\bssn\b|social[- ]security/i;
      expect(ssnPattern.test(contactSource)).toBe(false);
    });

    it('contact page source does not contain a government ID field', () => {
      const lower = contactSource.toLowerCase();
      expect(lower).not.toContain('government id');
      expect(lower).not.toContain('driver license');
      expect(lower).not.toContain('passport');
    });

    it('contact page only collects mosque name, issue type, details, and optional email', () => {
      // Verify the four expected fields are present
      expect(contactSource).toContain('mosque-name');
      expect(contactSource).toContain('issue-type');
      expect(contactSource).toContain('correction-details');
      expect(contactSource).toContain('contact-email');
    });
  });

}); // end PHASE A describe
