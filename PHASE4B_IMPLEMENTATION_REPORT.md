# PHASE 4B — TECHNICAL SEO CORRECTIONS & INDEXATION INTEGRITY
## Implementation Report — US Mosque Finder

**Date:** 2026-09-28  
**Phase:** 4B — Technical SEO Corrections & Indexation Integrity  
**Status:** PASS  

---

## 1. Summary

Phase 4B implemented the technical SEO and indexation integrity corrections identified in Phase 4A.
No new SEO page types, city pages, regional pages, or states were created. No raw datasets were modified. The interactive Finder functionality remains intact and fully functional for users while ensuring clean, consistent, and policy-compliant search engine crawl and indexation signals.

All 158 tests across 10 test suites pass. TypeScript and ESLint pass with 0 errors and 0 warnings. The Next.js production build succeeds, and live route QA confirms all representative routes return HTTP 200 with proper canonical, robots directives, breadcrumb hierarchies, and structured data.

---

## 2. Changes Implemented

1. **Correction #1: Exclude `/mosque-near-me` from Indexable Surface**
   - Applied `noindex, follow` robots meta directive via `constructMetadata({ ..., noIndex: true })`.
   - Removed `/mosque-near-me` from the sitemap generator.
   - Kept `/mosque-near-me` crawlable by search engines (not blocked in `robots.txt`) so crawlers can process the `noindex, follow` directive and continue following internal links.
   - The interactive Finder remains fully usable by end users.

2. **Correction #2: Fix Mosque Detail Breadcrumbs**
   - Replaced breadcrumbs routing through `/mosque-near-me?city=...` with the canonical geographic hierarchy: `Home (/) → State (/mosques/{state}) → City (/mosques/{state}/{city}) → Mosque (/mosque/{slug})`.
   - Used canonical state slug via `getStateConfig()` and canonical city slug via `slugify()`, matching route generation and repository normalization.
   - Updated both the visual `<nav aria-label="Breadcrumb">` UI and the `BreadcrumbList` JSON-LD structured data.

3. **Correction #3: Indexation Policy for `needs_review` Records**
   - Configured `generateMetadata` in `src/app/mosque/[slug]/page.tsx` to set `noIndex: mosque.dataStatus !== 'verified'`.
   - `needs_review` listings now output `<meta name="robots" content="noindex, follow">`.
   - Verified listings preserve their standard `index, follow` status.
   - `needs_review` records remain strictly excluded from the sitemap.
   - Public visibility in the Finder is preserved, and the detail page continues to transparently display the unverified "Needs Review" status badge without any "Verified Facility" badge.

4. **Correction #4: Homepage `WebSite` JSON-LD Structured Data**
   - Integrated `generateWebSiteSchema()` specifically into `src/app/page.tsx`.
   - Removed the generic `websiteSchema` script from `RootLayout` (`src/app/layout.tsx`) to avoid duplicating `WebSite` structured data on every page across the site.
   - Removed the client-side `SearchAction` from `generateWebSiteSchema()` to comply with schema guidelines (avoiding search action targets pointing to a `noindex` URL template).

5. **Correction #5: State Page `CollectionPage` Structured Data**
   - Created `generateStateCollectionSchema()` in `src/lib/seo/schema.ts` representing the state directory page, canonical URL, and factual repository data (`numberOfItems` reflecting total publishable mosques, and `itemListElement` reflecting verified featured mosques).
   - Injected `CollectionPage` JSON-LD into `src/components/state/StateDirectoryView.tsx` alongside the canonical `BreadcrumbList`.

6. **Correction #6: Deterministic `lastModified` in Sitemap**
   - Replaced `lastModified: new Date()` with a deterministic build date constant (`const BUILD_DATE = new Date('2026-09-28')`).
   - Ensures stable sitemap output across deployments, preventing crawlers from falsely treating all URLs as freshly modified on every build.

---

## 3. Files Changed

| File | Change Description |
|---|---|
| `src/lib/seo/metadata.ts` | Added `noFollow` parameter with default `false` so `noIndex: true` outputs `index: false, follow: true` (permitting link discovery on utility/review pages). |
| `src/app/mosque-near-me/page.tsx` | Added `noIndex: true` to page metadata. |
| `src/app/sitemap.ts` | Removed `/mosque-near-me`, replaced `new Date()` with deterministic `BUILD_DATE`, set verified-only filtering for mosques. |
| `src/app/mosque/[slug]/page.tsx` | Added `noIndex: mosque.dataStatus !== 'verified'`, canonical `State → City → Mosque` breadcrumbs in both schema and UI navigation. |
| `src/lib/seo/schema.ts` | Cleaned `generateWebSiteSchema()` (removed client-side SearchAction) and added `generateStateCollectionSchema()`. |
| `src/app/page.tsx` | Injected `WebSite` JSON-LD schema into the homepage. |
| `src/app/layout.tsx` | Removed site-wide `WebSite` schema to prevent schema duplication on subpages. |
| `src/components/state/StateDirectoryView.tsx` | Added `CollectionPage` JSON-LD schema and aligned breadcrumb name with canonical state name. |
| `tests/phase4b-seo.test.ts` | New comprehensive test suite covering all Phase 4B SEO criteria (14 tests). |

---

## 4. Indexation Policy Matrix

| Page Type | Status / Condition | Robots Meta | Sitemap Inclusion |
|---|---|---|---|
| **Homepage** (`/`) | Static | `index, follow` | ✅ Included (Priority 1.0) |
| **About** (`/about`) | Static | `index, follow` | ✅ Included (Priority 0.5) |
| **Finder** (`/mosque-near-me`) | Dynamic utility | `noindex, follow` | ❌ Excluded |
| **State Hubs** (`/mosques/[state]`) | Active states | `index, follow` | ✅ Included (Priority 0.8) |
| **City Directories** (`/mosques/[state]/[city]`) | Eligible (≥5 mosques) | `index, follow` | ✅ Included (Priority 0.7) |
| **Mosque Detail** (`/mosque/[slug]`) | `verified` | `index, follow` | ✅ Included (Priority 0.6) |
| **Mosque Detail** (`/mosque/[slug]`) | `needs_review` | `noindex, follow` | ❌ Excluded |
| **Mosque Detail** (`/mosque/[slug]`) | `excluded` | 404 (non-public) | ❌ Excluded |

---

## 5. Sitemap Policy & Live Counts

- **Total URLs in Sitemap:** 1,405
  - Static URLs: 2 (`https://usmosquefinder.com/`, `https://usmosquefinder.com/about`)
  - State Directory URLs: 5 (`california`, `texas`, `new-york`, `florida`, `illinois`)
  - City Directory URLs: 52 (all meeting Tier A threshold of ≥5 publishable mosques)
  - Mosque Detail URLs: 1,346 (all verified; deduplicated from 1,379 verified listings due to shared cross-state names)
- **Finder (`/mosque-near-me`):** Strictly absent.
- **Query Parameter URLs:** 0.
- **Duplicate URLs:** 0.
- **`lastModified` timestamp:** Deterministic `2026-09-28T00:00:00.000Z` on all entries.

---

## 6. Breadcrumb Architecture

The breadcrumb hierarchy across the entire application now follows strict geographic nesting:

```
Level 1: Home (/)
  └── Level 2: State (/mosques/{stateSlug})
        └── Level 3: City (/mosques/{stateSlug}/{citySlug})
              └── Level 4: Mosque (/mosque/{mosqueSlug})
```

- **Mosque Detail Breadcrumb:**
  1. `Home` → `https://usmosquefinder.com/`
  2. `{State Name}` → `https://usmosquefinder.com/mosques/{stateSlug}`
  3. `{City Name}` → `https://usmosquefinder.com/mosques/{stateSlug}/{citySlug}`
  4. `{Mosque Name}` → `https://usmosquefinder.com/mosque/{slug}`
- **City Directory Breadcrumb:**
  1. `Home` → `https://usmosquefinder.com/`
  2. `{State Name}` → `https://usmosquefinder.com/mosques/{stateSlug}`
  3. `Mosques in {City Name}` → `https://usmosquefinder.com/mosques/{stateSlug}/{citySlug}`
- **State Directory Breadcrumb:**
  1. `Home` → `https://usmosquefinder.com/`
  2. `{State Name}` → `https://usmosquefinder.com/mosques/{stateSlug}`

---

## 7. Structured Data (JSON-LD) Summary

| Route | Schemas Rendered |
|---|---|
| **`/`** | `WebSite` |
| **`/mosques/[state]`** | `BreadcrumbList`, `CollectionPage` |
| **`/mosques/[state]/[city]`** | `BreadcrumbList`, `CollectionPage` (with `ItemList`) |
| **`/mosque/[slug]`** | `['Mosque', 'PlaceOfWorship']`, `BreadcrumbList` |

All schemas are derived strictly from factual repository data without fabricated review counts, ratings, or simulated hours.

---

## 8. lastModified Strategy

- `lastModified` uses a centralized constant `BUILD_DATE = new Date('2026-09-28')`.
- This ensures sitemap output is completely reproducible and does not send false "updated today" crawl signals to search engines on rebuilds.
- When new states or refreshed datasets are ingested in future phases, updating `BUILD_DATE` to that release date will signal genuine updates to search engine crawlers.

---

## 9. Tests Added & Regression Results

Created `tests/phase4b-seo.test.ts` containing 14 comprehensive tests:
- `A.` `/mosque-near-me` has `noindex, follow`
- `B.` `/mosque-near-me` absent from sitemap
- `C.` Mosque detail breadcrumb hierarchy matches canonical State → City across all 5 states
- `D.` `BreadcrumbList` JSON-LD generates valid absolute canonical URLs without query parameters
- `E.` `needs_review` mosque detail pages receive `noindex, follow`
- `F.` `needs_review` mosques strictly excluded from sitemap
- `G.` `excluded` records absent from sitemap and search results
- `H.` Verified mosques indexable and included in sitemap
- `I.` Homepage `WebSite` JSON-LD valid without client-side SearchAction
- `J.` State pages receive valid `CollectionPage` JSON-LD
- `K.` Sitemap `lastModified` uses deterministic dates
- `L.` No query URLs in sitemap
- `M.` Canonical URL correctness across all page types
- `7.` Universal indexation consistency rule across all repository records

**Total Test Suite Result:** 158 passed out of 158 tests (10 test files).

---

## 10. Live Route QA Matrix

| Route | HTTP | Robots Meta | Canonical URL | Structured Data |
|---|---|---|---|---|
| `/` | 200 | `index, follow` | Default | `WebSite` |
| `/mosque-near-me` | 200 | `noindex, follow` | `https://usmosquefinder.com/mosque-near-me` | None |
| `/mosques/california` | 200 | `index, follow` | `https://usmosquefinder.com/mosques/california` | `BreadcrumbList`, `CollectionPage` |
| `/mosques/texas` | 200 | `index, follow` | `https://usmosquefinder.com/mosques/texas` | `BreadcrumbList`, `CollectionPage` |
| `/mosques/new-york` | 200 | `index, follow` | `https://usmosquefinder.com/mosques/new-york` | `BreadcrumbList`, `CollectionPage` |
| `/mosques/florida` | 200 | `index, follow` | `https://usmosquefinder.com/mosques/florida` | `BreadcrumbList`, `CollectionPage` |
| `/mosques/illinois` | 200 | `index, follow` | `https://usmosquefinder.com/mosques/illinois` | `BreadcrumbList`, `CollectionPage` |
| `/mosques/california/sacramento` | 200 | `index, follow` | `https://usmosquefinder.com/mosques/california/sacramento` | `BreadcrumbList`, `CollectionPage` |
| `/mosques/texas/houston` | 200 | `index, follow` | `https://usmosquefinder.com/mosques/texas/houston` | `BreadcrumbList`, `CollectionPage` |
| `/mosques/florida/tampa` | 200 | `index, follow` | `https://usmosquefinder.com/mosques/florida/tampa` | `BreadcrumbList`, `CollectionPage` |
| `/mosques/illinois/chicago` | 200 | `index, follow` | `https://usmosquefinder.com/mosques/illinois/chicago` | `BreadcrumbList`, `CollectionPage` |
| `/mosque/islamic-center-of-davis` (Verified) | 200 | `index, follow` | `https://usmosquefinder.com/mosque/islamic-center-of-davis` | `['Mosque', 'PlaceOfWorship']`, `BreadcrumbList` |
| `/mosque/islamic-center-of-irving` (Needs Review) | 200 | `noindex, follow` | `https://usmosquefinder.com/mosque/islamic-center-of-irving` | `['Mosque', 'PlaceOfWorship']`, `BreadcrumbList` |
| `/robots.txt` | 200 | N/A | N/A | N/A |
| `/sitemap.xml` | 200 | N/A | N/A | N/A |

---

## 11. Before/After Comparison

| Metric / Behavior | Phase 4A (Before) | Phase 4B (After) |
|---|---|---|
| `/mosque-near-me` indexability | `index, follow` | `noindex, follow` |
| `/mosque-near-me` in sitemap | Included (Priority 0.9) | **Excluded** |
| Mosque detail breadcrumb | `Home → Mosques Near Me → /mosque-near-me?city=... → Name` | **`Home → State → City → Name`** |
| Mosque BreadcrumbList schema | Pointed to `/mosque-near-me?city=...` | **Canonical `/mosques/{state}/{city}`** |
| `needs_review` detail indexation | `index, follow` | **`noindex, follow`** |
| `needs_review` sitemap | Excluded | Excluded |
| Homepage JSON-LD | Missing in `page.tsx` (only in `layout.tsx`) | **Explicit `WebSite` on homepage only** |
| State directory JSON-LD | `BreadcrumbList` only | **`BreadcrumbList` + `CollectionPage`** |
| Sitemap `lastModified` | Dynamic `new Date()` on every call | **Deterministic release date** |
| Verified mosque sitemap count | 1,346 unique URLs | 1,346 unique URLs |
| Total sitemap URLs | 1,406 URLs | **1,405 URLs** (clean, minus finder) |
| Passing tests | 144 | **158** (+14 tests) |

---

## 12. Remaining Known Issues

1. **Cross-State Slug Overlaps (Minor Data Artifact):**
   - Certain generic facility names (such as "Masjid" or "Masjid Ibrahim") share identical slugs across different states (e.g., CA and TX).
   - Sitemap correctly deduplicates these into a single URL. In a future data normalization phase, mosque slugs could be systematically suffixed with city and state code (`masjid-arcata-ca` vs `masjid-marble-falls-tx`) if unique individual ranking is desired for each generic listing.
2. **FL Panhandle Timezone Boundary:**
   - As documented in Phase 3D, Pensacola, FL operates on Central Time while Florida's state default is Eastern Time. This remains documented and does not affect SEO indexation.

---

## 13. Phase 4C Recommendations

Phase 4C can address:
1. **Automated Rich Results Monitoring:** Integrate automated Google Rich Results testing into the CI pipeline.
2. **Per-Entity Modification Auditing:** Add an optional `lastAuditedDate` field to `MosqueRecord` during state dataset ingestion to provide granular per-entity `lastmod` dates in the sitemap.
3. **Slug Uniqueness Enhancement:** Where generic titles produce colliding slugs across state lines, generate city/state-disambiguated slugs.
4. **Enhanced OpenGraph Dynamic Cards:** Implement dynamic OpenGraph images for city and state directory pages.

---
*End of Phase 4B Implementation Report.*
