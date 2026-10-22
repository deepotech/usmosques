/**
 * PHASE B — TRUST IMPROVEMENTS & CORRECTION REPORTING
 * Test Suite
 *
 * Scope:
 *   1. Zero [OWNER: placeholders in src/
 *   2. Authorized contact email dounia.elmarradi@gmail.com present in Privacy, Terms, and Contact
 *   3. Contact form mailto target correctly configured
 *   4. Mosque detail page includes update/correction link to /contact?mosque=
 *   5. Input sanitization for ?mosque= handles XSS, malformed input, and length limits safely
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { sanitizeMosqueName } from '@/lib/data/normalization';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

describe('PHASE B — Trust & Correction Improvements', () => {

  describe('1. Placeholders completely eliminated', () => {
    it('no [OWNER: placeholders exist in src/ directory', () => {
      function scanDir(dir: string): string[] {
        const results: string[] = [];
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            results.push(...scanDir(fullPath));
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('[OWNER:')) {
              results.push(fullPath);
            }
          }
        }
        return results;
      }

      const matches = scanDir(SRC);
      expect(matches).toEqual([]);
    });
  });

  describe('2. Authorized owner email configured across legal routes', () => {
    const privacySrc = fs.readFileSync(path.join(SRC, 'app', 'privacy', 'page.tsx'), 'utf-8');
    const termsSrc = fs.readFileSync(path.join(SRC, 'app', 'terms', 'page.tsx'), 'utf-8');
    const contactSrc = fs.readFileSync(path.join(SRC, 'app', 'contact', 'page.tsx'), 'utf-8');

    it('privacy policy contains dounia.elmarradi@gmail.com', () => {
      expect(privacySrc).toContain('dounia.elmarradi@gmail.com');
      expect(privacySrc).toContain('mailto:dounia.elmarradi@gmail.com');
    });

    it('terms of use contains dounia.elmarradi@gmail.com', () => {
      expect(termsSrc).toContain('dounia.elmarradi@gmail.com');
      expect(termsSrc).toContain('mailto:dounia.elmarradi@gmail.com');
    });

    it('contact page contains dounia.elmarradi@gmail.com as mailto and display', () => {
      expect(contactSrc).toContain('action="mailto:dounia.elmarradi@gmail.com"');
      expect(contactSrc).toContain('dounia.elmarradi@gmail.com');
    });
  });

  describe('3. Mosque detail page correction link', () => {
    const mosqueDetailSrc = fs.readFileSync(path.join(SRC, 'app', 'mosque', '[slug]', 'page.tsx'), 'utf-8');

    it('contains correction/report link pointing to /contact?mosque=', () => {
      expect(mosqueDetailSrc).toContain('/contact?mosque=');
    });

    it('encodes mosque name safely with encodeURIComponent', () => {
      expect(mosqueDetailSrc).toContain('encodeURIComponent(mosque.name)');
    });

    it('has accessible label for reporting closed facility or update', () => {
      expect(mosqueDetailSrc).toContain('aria-label=');
      expect(mosqueDetailSrc).toContain('Suggest an update or report closed facility');
    });
  });

  describe('4. Input sanitization for mosque prefill', () => {
    it('handles undefined and empty string safely', () => {
      expect(sanitizeMosqueName(undefined)).toBe('');
      expect(sanitizeMosqueName('')).toBe('');
      expect(sanitizeMosqueName('   ')).toBe('');
    });

    it('preserves clean mosque names and trims whitespace', () => {
      expect(sanitizeMosqueName('  Islamic Center of Davis  ')).toBe('Islamic Center of Davis');
      expect(sanitizeMosqueName('Al-Farooq Mosque (Atlanta)')).toBe('Al-Farooq Mosque (Atlanta)');
    });

    it('strips HTML and script tags to prevent XSS injection', () => {
      expect(sanitizeMosqueName('<script>alert("xss")</script>Masjid')).toBe('alert("xss")Masjid');
      expect(sanitizeMosqueName('<b>bold</b> mosque')).toBe('bold mosque');
      expect(sanitizeMosqueName('<img src=x onerror=alert(1)>')).toBe('');
    });

    it('truncates inputs longer than 200 characters', () => {
      const veryLong = 'A'.repeat(300);
      const sanitized = sanitizeMosqueName(veryLong);
      expect(sanitized.length).toBe(200);
    });
  });

});
