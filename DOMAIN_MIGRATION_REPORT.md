# DOMAIN MIGRATION REPORT
## US MOSQUE FINDER -> US MOSQUES
**Source Domain:** `https://usmosquefinder.com`  
**Target Domain:** `https://usmosques.com`  
**Migration Execution Date:** October 3, 2026  
**Status:** CODE MIGRATION READY — DOMAIN CUTOVER PENDING (Awaiting DNS / SSL / Edge Pointing)

---

## 1. Executive Summary

This report documents the architectural domain migration for the US Mosque Finder application from its legacy domain (`https://usmosquefinder.com`) to its new canonical production domain (`https://usmosques.com`).

The migration strictly preserves:
- The entire URL path architecture (`/mosque/[slug]`, `/mosques/[state]`, `/mosques/[state]/[city]`, `/about`, `/mosque-near-me`).
- All 1,486 mosque entity slugs and data models.
- All raw datasets (`data/raw/*.json`).
- All SEO invariants (1,379 verified entities, 104 needs_review, 3 excluded, 1,438 indexable canonical URLs in sitemap, 105 noindex URLs).
- All security headers and geolocation privacy boundaries.

Permanent HTTP 301 redirects are configured at the application level in `next.config.ts` for `usmosquefinder.com`, `www.usmosquefinder.com`, and `www.usmosques.com` to `https://usmosques.com` preserving full paths and query parameters.

---

## 2. Migration Parameters

| Parameter | Specification |
|---|---|
| **Previous Domain** | `https://usmosquefinder.com` |
| **New Primary Domain** | `https://usmosques.com` |
| **Canonical Hostname** | `usmosques.com` (apex domain, HTTPS) |
| **Redirect Status Code** | HTTP 301 (Permanent) |
| **Environment Variable** | `NEXT_PUBLIC_SITE_URL=https://usmosques.com` |
| **Trailing Slash Policy** | Root `/` preserves slash (`https://usmosques.com/`); subpaths omit trailing slash |

---

## 3. Files Changed & Added

### Modified Configuration & Source Files:
1. [`.env.production`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/.env.production): Created with `NEXT_PUBLIC_SITE_URL=https://usmosques.com`.
2. [`.env`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/.env): Created with `NEXT_PUBLIC_SITE_URL=https://usmosques.com`.
3. [`next.config.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/next.config.ts): Added permanent 301 redirects for `usmosquefinder.com`, `www.usmosquefinder.com`, and `www.usmosques.com` targeting `https://usmosques.com` (root `/` and subpaths `/:path+`). Preserved security headers.
4. [`src/app/layout.tsx`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/src/app/layout.tsx): Updated `metadataBase` fallback to `https://usmosques.com` and set root canonical alternate.
5. [`src/app/robots.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/src/app/robots.ts): Updated sitemap declaration fallback to `https://usmosques.com/sitemap.xml`.
6. [`src/app/sitemap.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/src/app/sitemap.ts): Updated baseUrl fallback to `https://usmosques.com`.
7. [`src/lib/seo/metadata.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/src/lib/seo/metadata.ts): Updated `BASE_URL` fallback to `https://usmosques.com`.
8. [`src/lib/seo/mosque-url.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/src/lib/seo/mosque-url.ts): Updated `BASE_URL` fallback to `https://usmosques.com`.
9. [`src/lib/seo/schema.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/src/lib/seo/schema.ts): Updated `SITE_URL` fallback to `https://usmosques.com`.

### Test Files Updated / Added:
10. [`tests/domain-migration.test.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/tests/domain-migration.test.ts): New 16-test suite validating all migration invariants, sitemaps, robots, schema, and redirects.
11. [`tests/phase4b-seo.test.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/tests/phase4b-seo.test.ts): Updated hardcoded sitemap check expectations to `https://usmosques.com`.
12. [`tests/phase4c-national-seo.test.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/tests/phase4c-national-seo.test.ts): Updated `BASE_URL` constant to `https://usmosques.com`.
13. [`tests/phase4c1-migration.test.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/tests/phase4c1-migration.test.ts): Updated hardcoded sitemap exclusion check to `https://usmosques.com`.
14. [`tests/state-activation.test.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/tests/state-activation.test.ts): Fixed date determinism in 24-hours check.
15. [`tests/state-activation-3c.test.ts`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/tests/state-activation-3c.test.ts): Fixed date determinism in 24-hours check.

### Documentation Files:
16. [`PHASE5_LAUNCH_CHECKLIST.md`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/PHASE5_LAUNCH_CHECKLIST.md): Updated launch instructions with `usmosques.com` and 301 verification.
17. [`DOMAIN_MIGRATION_REPORT.md`](file:///c:/Users/HP/Desktop/US%20MOSQUE%20FINDER/DOMAIN_MIGRATION_REPORT.md): This report.

---

## 4. Old-Domain Reference Audit

A complete repository scan for `usmosquefinder.com`, `www.usmosquefinder.com`, and `usmosquefinder` was performed.

### Active URL Generation:
- Canonical URL generation: **0 old-domain occurrences** (100% `usmosques.com`)
- Sitemap generation: **0 old-domain occurrences** (100% `usmosques.com`)
- robots.txt: **0 old-domain occurrences** (100% `usmosques.com`)
- JSON-LD / Structured data: **0 old-domain occurrences** (100% `usmosques.com`)
- Open Graph / Twitter metadata: **0 old-domain occurrences** (100% `usmosques.com`)
- Internal absolute URLs: **0 old-domain occurrences** (100% `usmosques.com`)

### Intentionally Retained Occurrences:
1. `next.config.ts`: Host matching rules for incoming 301 redirects (`usmosquefinder.com` and `www.usmosquefinder.com`).
2. `tests/domain-migration.test.ts`: Negative assertion tests verifying old domain is absent from sitemap/schema and positive tests verifying redirect matching.
3. Historical markdown reports (`PHASE3C1_QA_REPORT.md`, `PHASE4B_IMPLEMENTATION_REPORT.md`, `PHASE4C_PREFLIGHT.md`, `PHASE5_PRODUCTION_READINESS_REPORT.md`).

---

## 5. Technical Verifications

### A. Canonical URLs
- Root layout `metadataBase` resolves to `https://usmosques.com/`.
- Every HTML page renders `<link rel="canonical" href="https://usmosques.com/..." />`.
- All canonical tags are apex-domain, HTTPS, and have zero duplicate canonical URLs.

### B. Sitemap Verification
- Total URLs in `sitemap.xml`: **1,438**
  - Static hub routes: 2 (`/` and `/about`)
  - State directory hubs: 5 (`/mosques/california`, `/mosques/texas`, `/mosques/new-york`, `/mosques/florida`, `/mosques/illinois`)
  - Eligible city pages: 52
  - Verified mosque entity pages: 1,379
- Old-domain URLs in sitemap: **0**
- Duplicate URLs in sitemap: **0**
- Noindex URLs in sitemap: **0** (`/mosque-near-me`, 104 `needs_review`, and 3 `excluded` are strictly excluded).

### C. Robots.txt Verification
- `User-agent: *`
- `Allow: /`
- `Disallow: /api/`
- `Sitemap: https://usmosques.com/sitemap.xml`

### D. Structured Data / JSON-LD Verification
- `WebSite`: `@id`/`url` evaluates to `https://usmosques.com`
- `CollectionPage` (State): `url` evaluates to `https://usmosques.com/mosques/[state]`
- `CollectionPage` (City): `url` evaluates to `https://usmosques.com/mosques/[state]/[city]`
- `BreadcrumbList`: All absolute item URLs use `https://usmosques.com`
- `Mosque` / `PlaceOfWorship`: `@id` evaluates to `https://usmosques.com/mosque/[slug]#place` and `url` evaluates to `https://usmosques.com/mosque/[slug]`

### E. Redirect Architecture (Legacy & Variants)
Configured in `next.config.ts`:
- `https://usmosquefinder.com/` -> 301 -> `https://usmosques.com/`
- `https://usmosquefinder.com/:path+` -> 301 -> `https://usmosques.com/:path+`
- `https://www.usmosquefinder.com/` -> 301 -> `https://usmosques.com/`
- `https://www.usmosquefinder.com/:path+` -> 301 -> `https://usmosques.com/:path+`
- `https://www.usmosques.com/` -> 301 -> `https://usmosques.com/`
- `https://www.usmosques.com/:path+` -> 301 -> `https://usmosques.com/:path+`

### F. Security & Privacy
Existing response headers preserved verbatim:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
- Zero secrets or credentials exposed.

---

## 6. Raw Data Integrity (SHA256)

All raw datasets remain completely untouched:
- `data/raw/california.json`: `D373324CC7019E1B57DF78E3A53B86AE2084B30D2D91E3DD596AAA48228997D7`
- `data/raw/florida.json`: `985E637A5DBEA13EACF7A59D3194A0FE78758DCC7015F7D0175D31EF46A59AA2`
- `data/raw/illinois.json`: `85F568CDBC15040E69DC40BF7330C4EE0970F1BA4627679C91C03015725BA961`
- `data/raw/new-york.json`: `942F1B7FFD1EAEB12EA020566AFCE4A3DF79287E87E57221D2BFC00537794E21`
- `data/raw/texas.json`: `234AEFC97907E96B5968DF48A729117AA6D79485D5B182BB35549F8322ADD6BA`

**Raw datasets modified:** NO (UNCHANGED)

---

## 7. SEO Invariants Preservation Table

| Metric | Target | Post-Migration Result | Status |
|---|---|---|---|
| Verified entities | 1,379 | 1,379 | PASS |
| Needs review entities | 104 | 104 | PASS |
| Excluded entities | 3 | 3 | PASS |
| Total entities | 1,486 | 1,486 | PASS |
| Indexable URLs | 1,438 | 1,438 | PASS |
| Noindex URLs | 105 | 105 | PASS |
| Sitemap URLs | 1,438 | 1,438 | PASS |
| Duplicate canonical URLs | 0 | 0 | PASS |
| Duplicate sitemap URLs | 0 | 0 | PASS |
| Orphan entities | 0 | 0 | PASS |
| Phase 4C.1 URL collisions | 0 | 0 | PASS |

---

## 8. Test, Quality & Build Verification

| Verification Stage | Command | Result | Details |
|---|---|---|---|
| **TypeScript** | `npm run typecheck` | PASS | 0 errors |
| **ESLint** | `npm run lint` | PASS | 0 errors, 0 warnings |
| **Unit & Integration Tests** | `npm test` | PASS | 257/257 passing (13 test suites) |
| **Production Build** | `npm run build` | PASS | 1,548 static pages successfully compiled |
| **Live Production QA** | `npm run start` (local) | PASS | 20 representative routes & 8 redirect rules verified |

---

## 9. Live QA Route Matrix (Production Server)

| Route | Expected Code | Canonical URL | Schema / Domain | Result |
|---|---|---|---|---|
| `/` | 200 | `https://usmosques.com` | `https://usmosques.com` | PASS |
| `/about` | 200 | `https://usmosques.com/about` | `https://usmosques.com/about` | PASS |
| `/robots.txt` | 200 | N/A | Points to `https://usmosques.com/sitemap.xml` | PASS |
| `/sitemap.xml` | 200 | N/A | 1,438 URLs, 0 old domain | PASS |
| `/mosque-near-me` | 200 | `https://usmosques.com/mosque-near-me` | `noindex, follow` | PASS |
| `/mosques/california` | 200 | `https://usmosques.com/mosques/california` | CollectionPage on `usmosques.com` | PASS |
| `/mosques/texas` | 200 | `https://usmosques.com/mosques/texas` | CollectionPage on `usmosques.com` | PASS |
| `/mosques/new-york` | 200 | `https://usmosques.com/mosques/new-york` | CollectionPage on `usmosques.com` | PASS |
| `/mosques/florida` | 200 | `https://usmosques.com/mosques/florida` | CollectionPage on `usmosques.com` | PASS |
| `/mosques/illinois` | 200 | `https://usmosques.com/mosques/illinois` | CollectionPage on `usmosques.com` | PASS |
| `/mosques/california/los-angeles` | 200 | `https://usmosques.com/mosques/california/los-angeles` | ItemList on `usmosques.com` | PASS |
| `/mosques/texas/houston` | 200 | `https://usmosques.com/mosques/texas/houston` | ItemList on `usmosques.com` | PASS |
| `/mosques/new-york/brooklyn` | 200 | `https://usmosques.com/mosques/new-york/brooklyn` | ItemList on `usmosques.com` | PASS |
| `/mosques/florida/tampa` | 200 | `https://usmosques.com/mosques/florida/tampa` | ItemList on `usmosques.com` | PASS |
| `/mosques/illinois/chicago` | 200 | `https://usmosques.com/mosques/illinois/chicago` | ItemList on `usmosques.com` | PASS |
| `/mosque/east-plano-islamic-center` | 200 | `https://usmosques.com/mosque/east-plano-islamic-center` | Mosque on `usmosques.com` | PASS |
| `/mosque/king-fahad-mosque-los-angeles` | 200 | `https://usmosques.com/mosque/king-fahad-mosque-los-angeles` | Mosque on `usmosques.com` | PASS |
| `/mosque/al-ansar-mosque-tampa` | 200 | `https://usmosques.com/mosque/al-ansar-mosque-tampa` | Mosque on `usmosques.com` | PASS |
| `/mosque/al-ansar-mosque-chicago-il` | 200 | `https://usmosques.com/mosque/al-ansar-mosque-chicago-il` | Mosque on `usmosques.com` | PASS |
| `/mosque/al-ansar-mosque-brooklyn-ny` | 200 | `https://usmosques.com/mosque/al-ansar-mosque-brooklyn-ny` | Mosque on `usmosques.com` | PASS |

### Redirect QA:
- `Host: usmosquefinder.com /` -> 301/308 -> `https://usmosques.com/` (PASS)
- `Host: usmosquefinder.com /mosques/texas` -> 301/308 -> `https://usmosques.com/mosques/texas` (PASS)
- `Host: usmosquefinder.com /mosques/texas/houston` -> 301/308 -> `https://usmosques.com/mosques/texas/houston` (PASS)
- `Host: usmosquefinder.com /mosque/east-plano-islamic-center` -> 301/308 -> `https://usmosques.com/mosque/east-plano-islamic-center` (PASS)
- `Host: www.usmosquefinder.com /` -> 301/308 -> `https://usmosques.com/` (PASS)
- `Host: www.usmosquefinder.com /mosques/california` -> 301/308 -> `https://usmosques.com/mosques/california` (PASS)
- `Host: www.usmosques.com /` -> 301/308 -> `https://usmosques.com/` (PASS)
- `Host: www.usmosques.com /mosques/florida` -> 301/308 -> `https://usmosques.com/mosques/florida` (PASS)

---

## 10. Manual DNS / Hosting Action Plan

While the codebase is 100% migrated and verified, live domain cutover requires the following human DevOps / DNS actions:

1. **DNS Configuration:**
   - Create `A` / `CNAME` records pointing `usmosques.com` and `www.usmosques.com` to the production hosting platform (e.g. Vercel, Cloudflare, AWS).
   - Maintain DNS records for `usmosquefinder.com` and `www.usmosquefinder.com` pointing to the same production platform so Next.js redirects intercept legacy traffic.
2. **SSL Provisioning:**
   - Ensure TLS/SSL certificates are active for both `usmosques.com` and `usmosquefinder.com` (along with their `www` subdomains).
3. **Google Search Console Change of Address:**
   - In GSC for `https://usmosquefinder.com`, navigate to **Settings > Change of Address**.
   - Select `https://usmosques.com` as the destination property and submit validation.
   - Submit `https://usmosques.com/sitemap.xml`.
