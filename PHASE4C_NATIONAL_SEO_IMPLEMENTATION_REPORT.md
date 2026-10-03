# PHASE 4C — NATIONAL SEO & TOPICAL DISCOVERY
## Implementation Report

**Project:** US Mosque Finder  
**Phase:** 4C — National SEO & Topical Discovery  
**Date:** 2026-09-28  
**Status:** ✅ COMPLETE — ALL CHECKS PASS

---

## 1. Phase Summary

Phase 4C expands organic search coverage across the United States without creating thin pages, doorway pages, or fabricated content. It builds on the locked Phase 4C.1 URL architecture and Phase 4B technical SEO corrections.

---

## 2. Goals Achieved

| Goal | Result |
|------|--------|
| Centralized SEO eligibility service | ✅ Created |
| State directory towns/communities discovery section | ✅ Implemented |
| Conditional city breadcrumbs (eligible cities only) | ✅ Implemented |
| Phase 4C.1 URL invariants preserved | ✅ Verified |
| No thin/doorway city pages created | ✅ Confirmed |
| No raw data modified | ✅ Confirmed |
| All mosque links use `getMosquePath` | ✅ Confirmed |
| Sitemap contains only canonical indexable URLs | ✅ Confirmed |
| TypeScript clean | ✅ PASS |
| ESLint clean | ✅ PASS |
| Tests: 241/241 pass (12 test files) | ✅ PASS |
| Build: 1,548 static pages generated | ✅ PASS |
| Live QA: 18 routes 200 OK, non-routes 404 | ✅ PASS |

---

## 3. Files Changed

### Created

| File | Purpose |
|------|---------|
| `src/lib/seo/eligibility.ts` | Centralized SEO eligibility service |
| `tests/phase4c-national-seo.test.ts` | Phase 4C test suite (57 tests, A–Z) |
| `PHASE4C_NATIONAL_SEO_IMPLEMENTATION_REPORT.md` | This file |
| `PHASE4C_SEO_ELIGIBILITY.md` | Eligibility architecture documentation |

### Modified

| File | Change |
|------|--------|
| `src/components/state/StateDirectoryView.tsx` | Added towns directory section with canonical `getMosquePath` links for non-eligible cities |
| `src/app/mosque/[slug]/page.tsx` | Added `isIndexableCity` check; breadcrumb city link conditional |

---

## 4. SEO Eligibility Architecture

### State Eligibility

All 5 enabled states (CA, TX, NY, FL, IL) are eligible for indexable state directory pages. Eligibility is determined by the state registry (`enabled: true`, `seoEnabled: true`).

Disabled states (CT, IN, SC) produce no SEO routes.

### City Eligibility — Tier System

| Tier | Mosque Count | Eligible | Action |
|------|-------------|----------|--------|
| A    | ≥ 5         | ✅ Yes   | Standalone indexable city directory page |
| B    | 2–4         | ❌ No    | Entity linked from state directory towns section |
| C    | 1           | ❌ No    | Entity linked from state directory towns section |

**Rationale:** Generating hundreds of thin city pages for 1–4 mosque towns creates low-value doorway pages penalized under Google Search Essentials. All entities remain discoverable via canonical detail pages.

### Eligible Cities (52 total)

| State | Count | Cities |
|-------|-------|--------|
| CA | 14 | Sacramento, Los Angeles, San Diego, Oakland, Fresno, Fremont, San Jose, San Francisco, Stockton, Hayward, Anaheim, Pomona, Bakersfield, El Cajon |
| TX | 16 | Houston, Sugar Land, Dallas, Arlington, Fort Worth, San Antonio, Irving, Katy, Richardson, Austin, Plano, Spring, Garland, Carrollton, Cypress, Richmond |
| NY | 13 | Brooklyn, Bronx, Jamaica, New York, Staten Island, Flushing, Astoria, Jackson Heights, Woodside, Long Island City, Ozone Park, Queens Village, Richmond Hill |
| FL | 6  | Tampa, Jacksonville, Orlando, Kissimmee, Miami, Tallahassee |
| IL | 3  | Chicago, Elgin, Skokie |

---

## 5. Non-Eligible City Mosque Discovery

629 verified mosques reside in non-eligible cities (< 5 mosques). These are NOT orphans:

**Discovery path:** Home → State directory → Towns & Communities section → Mosque detail page

The "Additional Towns & Communities" section in `StateDirectoryView.tsx` renders:
- Every non-eligible city in the state
- Up to 3 direct canonical `getMosquePath` links per town
- Overflow count badge ("+ N more")
- CTA linking to the GPS-based `/mosque-near-me` finder

These entities are also included in the sitemap via their canonical `getMosqueCanonicalUrl` URL.

---

## 6. Breadcrumb Architecture

### Eligible City Mosque
```
Home > California > Los Angeles > King Fahad Mosque
```
City link renders as a clickable `<Link>` to `/mosques/california/los-angeles`.

### Non-Eligible City Mosque
```
Home > California > Davis > Islamic Center of Davis
```
City name renders as plain `<span>` (no broken link to a non-existent city page).

---

## 7. Sitemap Composition

| Route Type | Count | Notes |
|------------|-------|-------|
| Static (/, /about) | 2 | |
| State directories | 5 | All enabled states |
| City directories | 52 | Eligible cities only |
| Mosque entity pages | 1,379 | Verified only; needs_review excluded |
| **Total** | **~1,438** | 0 duplicates |

`/mosque-near-me` is intentionally excluded (interactive utility, `noindex,follow`).

---

## 8. Structured Data

### Mosque Detail Pages
- `@type: ['Mosque', 'PlaceOfWorship']`
- `@id: <canonicalUrl>#place` (entity node identifier)
- `url: <canonicalUrl>` (clean canonical URL)
- All URLs use `getMosqueCanonicalUrl(mosque)` — never manual construction

### State Pages
- `@type: CollectionPage`
- `@type: BreadcrumbList`

### City Pages
- `@type: CollectionPage` with `ItemList` of eligible mosques
- `@type: BreadcrumbList`

---

## 9. Indexation Rules

| Entity Type | Indexed | Canonical | In Sitemap |
|-------------|---------|-----------|------------|
| State directory | ✅ | `/mosques/{state}` | ✅ |
| Eligible city page | ✅ | `/mosques/{state}/{city}` | ✅ |
| Non-eligible city page | ❌ Does not exist | n/a | ❌ |
| Verified mosque | ✅ | `/mosque/{slug}` | ✅ |
| `needs_review` mosque | ❌ noindex | `/mosque/{slug}` | ❌ |
| `excluded` mosque | ❌ Not accessible | n/a | ❌ |
| `/mosque-near-me` | ❌ noindex | n/a | ❌ |

---

## 10. Phase 4C.1 Regression Check

Phase 4C.1 invariants verified:

| Invariant | Status |
|-----------|--------|
| Global slug uniqueness (0 duplicates) | ✅ PASS |
| Public entity count: 1,483 | ✅ PASS |
| Verified entity count: 1,379 | ✅ PASS |
| Duplicate canonical URLs: 0 | ✅ PASS |
| All 26 Phase 4C.1 tests pass | ✅ PASS |

---

## 11. Test Suite

**File:** `tests/phase4c-national-seo.test.ts`  
**Tests:** 57  
**Result:** 57/57 PASS  

| Section | Tests |
|---------|-------|
| A. State eligibility | 3 |
| B. City eligibility | 6 |
| C. State route generation | 2 |
| D. City route generation | 2 |
| E. Sitemap eligibility | 2 |
| F. Sitemap uniqueness | 2 |
| G. noindex behaviour | 1 |
| H. Canonical URL behaviour | 3 |
| I. State metadata | 1 |
| J. City metadata | 1 |
| K. State CollectionPage schema | 1 |
| L. City CollectionPage schema | 1 |
| M. Mosque structured-data canonical URL | 2 |
| N. Breadcrumbs | 2 |
| O. Internal links | 2 |
| P. Orphan entity detection | 1 |
| Q. needs_review exclusion | 1 |
| R. Excluded entity exclusion | 2 |
| S. /mosque-near-me exclusion | 1 |
| T. Deterministic routes | 1 |
| U. Deterministic sitemap | 1 |
| V. Duplicate search-intent prevention | 2 |
| W. Phase 4C.1 regression invariants | 4 |
| X. Cross-state isolation | 2 |
| Y. No raw data modification | 7 |
| Z. Eligibility service | 3 |

---

## 12. Live QA Results

Production server: `http://localhost:3000`

| Route | Expected | Actual | Result |
|-------|----------|--------|--------|
| `/` | 200 | 200 | ✅ |
| `/about` | 200 | 200 | ✅ |
| `/sitemap.xml` | 200 | 200 | ✅ |
| `/robots.txt` | 200 | 200 | ✅ |
| `/mosques/california` | 200 | 200 | ✅ |
| `/mosques/california/los-angeles` | 200 | 200 | ✅ |
| `/mosques/california/sacramento` | 200 | 200 | ✅ |
| `/mosques/texas` | 200 | 200 | ✅ |
| `/mosques/texas/houston` | 200 | 200 | ✅ |
| `/mosques/new-york` | 200 | 200 | ✅ |
| `/mosques/new-york/brooklyn` | 200 | 200 | ✅ |
| `/mosques/florida` | 200 | 200 | ✅ |
| `/mosques/florida/tampa` | 200 | 200 | ✅ |
| `/mosques/illinois` | 200 | 200 | ✅ |
| `/mosques/illinois/chicago` | 200 | 200 | ✅ |
| `/mosque-near-me` | 200 | 200 | ✅ |
| `/mosque/east-plano-islamic-center` | 200 | 200 | ✅ |
| `/mosque/king-fahad-mosque-los-angeles` | 200 | 200 | ✅ |
| `/mosques/california/davis` (non-eligible) | 404 | 404 | ✅ |
| `/mosque/masjid-ibrahim` (ambiguous legacy) | 404 | 404 | ✅ |

**Result: 20/20 routes correct**
