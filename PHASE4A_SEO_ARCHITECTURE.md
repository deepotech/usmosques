# PHASE 4A — NATIONAL SEO ARCHITECTURE & TOPICAL DISCOVERY
## US Mosque Finder — Audit & Planning Document

> **STATUS:** Planning / Audit Only — No source code was modified in Phase 4A.  
> **GENERATED:** 2026-09-28  
> **SCOPE:** All 5 active states (CA, TX, NY, FL, IL) · 1,483 public listings · 52 eligible city pages

---

## TABLE OF CONTENTS

1. [Canonical Data Inventory](#1-canonical-data-inventory)
2. [Existing Page Types — Indexability Audit](#2-existing-page-types--indexability-audit)
3. [URL & Route Structure](#3-url--route-structure)
4. [SEO Hierarchy — Home → State → City → Mosque](#4-seo-hierarchy--home--state--city--mosque)
5. [Internal Linking Architecture](#5-internal-linking-architecture)
6. [Metadata Strategy](#6-metadata-strategy)
7. [Canonical URL Correctness](#7-canonical-url-correctness)
8. [Structured Data (Schema.org)](#8-structured-data-schemaorg)
9. [Sitemap Architecture](#9-sitemap-architecture)
10. [Robots.txt & Crawl Budget](#10-robotstxt--crawl-budget)
11. [Breadcrumb Correctness](#11-breadcrumb-correctness)
12. [Candidate New Page Types](#12-candidate-new-page-types)
13. [Page Types That Must NOT Be Created](#13-page-types-that-must-not-be-created)
14. [needs_review Mosque Indexability](#14-needs_review-mosque-indexability)
15. [/mosque-near-me — Indexability Problem](#15-mosque-near-me--indexability-problem)
16. [Homepage — Schema Gap](#16-homepage--schema-gap)
17. [State Pages — Schema Gap](#17-state-pages--schema-gap)
18. [lastModified & Content Freshness](#18-lastmodified--content-freshness)
19. [Crawl Signal Summary (What's Working)](#19-crawl-signal-summary-whats-working)
20. [Critical Gaps — Priority Order](#20-critical-gaps--priority-order)
21. [Phase 4B Implementation Plan](#21-phase-4b-implementation-plan)
22. [What Phase 4B Must NOT Do](#22-what-phase-4b-must-not-do)
23. [Validation Checklist](#23-validation-checklist)

---

## 1. Canonical Data Inventory

Derived from live test run against `MosqueRepository` — the single source of truth.  
`needs_review` is NOT verified. `excluded` records are never public.

| State | Raw Records | Verified | Needs Review | Excluded | **Publishable** |
|-------|-------------|----------|--------------|----------|-----------------|
| California (CA) | 401 | 370 | 29 | 2 | **399** |
| Texas (TX) | 332 | 311 | 20 | 1 | **331** |
| New York (NY) | 374 | 340 | 34 | 0 | **374** |
| Florida (FL) | 194 | 190 | 4 | 0 | **194** |
| Illinois (IL) | 185 | 168 | 17 | 0 | **185** |
| **TOTAL** | **1,486** | **1,379** | **104** | **3** | **1,483** |

> **Definition:** Publishable = `dataStatus !== 'excluded'`.  
> **Sitemap-eligible:** Only `dataStatus === 'verified'` (1,379 records).  
> **Source:** `src/lib/data/mosque-repository.ts` + `src/lib/config/state-registry.ts`

### Eligible City Pages (≥5 publishable mosques — Tier A)

**Total: 52 eligible city pages across 5 states**

| State | Count | Top Cities |
|-------|-------|-----------|
| CA | 14 | Sacramento (27), Los Angeles (21), San Diego (13), Oakland (12), Fresno (10), Fremont (9), San Jose (9), San Francisco (8), Stockton (8), Hayward (7), Anaheim (6), Pomona (6), Bakersfield (5), El Cajon (5) |
| TX | 16 | Houston (72), Sugar Land (14), Dallas (10), Arlington (9), Fort Worth (9), San Antonio (9), Irving (8), Katy (8), Richardson (8), Austin (7), Plano (7), Spring (7), Garland (6), Carrollton (5), Cypress (5), Richmond (5) |
| NY | 13 | Brooklyn (103), Bronx (87), Jamaica (44), New York (35), Staten Island (13), Flushing (12), Astoria (9), Jackson Heights (8), Woodside (8), Long Island City (6), Ozone Park (6), Queens Village (6), Richmond Hill (5) |
| FL | 6 | Tampa (14), Jacksonville (13), Orlando (12), Kissimmee (10), Miami (9), Tallahassee (5) |
| IL | 3 | Chicago (64), Elgin (7), Skokie (5) |

> **Source:** `src/lib/config/city-seo.ts` → `DEFAULT_CITY_SEO_CONFIG.tier_a_min_mosques = 5`  
> **Tier B** (2–4 mosques) is disabled. **Tier C** (1 mosque) is never indexed. This is correct.

---

## 2. Existing Page Types — Indexability Audit

### 2A. Pages That SHOULD Be Indexed

| Route | Status | Count | Verdict |
|-------|--------|-------|---------|
| `/` | Static | 1 | ✅ Index |
| `/mosques/[state]` | Static | 5 | ✅ Index |
| `/mosques/[state]/[city]` | Static (eligible) | 52 | ✅ Index |
| `/mosque/[slug]` (verified) | Static (SSG) | 1,379 | ✅ Index |

### 2B. Pages That Should Be NOINDEX

| Route | Current State | Problem | Fix |
|-------|---------------|---------|-----|
| `/mosque-near-me` | **Indexed** (sitemap, no noindex) | Dynamic app page, no canonical content | Add `noindex` + remove from sitemap |
| `/mosque/[slug]` (needs_review) | **Indexed** (no noindex) | Quality risk — unverified content | Add `noindex` to needs_review slugs |

### 2C. Pages That Should NOT Exist in Sitemap

| Route | Current State | Fix |
|-------|---------------|-----|
| `/mosque-near-me` | **In sitemap with priority 0.9** | Remove from sitemap |

---

## 3. URL & Route Structure

### Current Route Map

```
/                                    → Homepage
/mosque-near-me                      → Dynamic Finder (SPA-like)
/mosque-near-me?q=...               → Search query (ephemeral)
/mosque-near-me?state=...           → State filter (ephemeral)
/mosque-near-me?city=...            → City filter (ephemeral)
/mosque-near-me?nearMe=true         → Geolocation (ephemeral)
/mosques/california                  → State directory
/mosques/california/los-angeles      → City directory
/mosque/[slug]                       → Individual mosque detail
```

### URL Design Decisions — Currently Correct

- ✅ All slugs are lowercase + hyphenated (alphanumeric only)
- ✅ City slugs are state-scoped — no cross-state conflicts
- ✅ No coordinates in URLs (critical: geolocation not persisted)
- ✅ State uses full slug (`california`, not `CA`)
- ✅ City uses slug derived from canonical city name
- ✅ Mosque detail uses `mosque/[slug]` — the `slug` field is set during ingestion

### URL Design Decisions — Issues

- ⚠️ `/mosque-near-me` uses query parameters (`?q=`, `?state=`, `?city=`, `?nearMe=true`) — these generate infinite URL variants. Currently relying on no-canonical-tag-setting for these, but the base `/mosque-near-me` page itself is indexed.

---

## 4. SEO Hierarchy — Home → State → City → Mosque

### Target Hierarchy

```
Home (/)
  └── State Directory (/mosques/california)
        └── City Directory (/mosques/california/los-angeles)
              └── Mosque Detail (/mosque/masjid-al-rasool-los-angeles-ca)
```

### Current Implementation Status

| Hierarchy Level | Route Exists | Sitemap | Breadcrumb | Internal Links | Status |
|-----------------|-------------|---------|------------|---------------|--------|
| Home | ✅ | ✅ | N/A | ✅ State links in header/footer | ✅ |
| State | ✅ (5 states) | ✅ | ✅ (`Home → State`) | ✅ From homepage, header, footer | ✅ |
| City | ✅ (52 cities) | ✅ | ✅ (`Home → State → City`) | ✅ From state pages, footer hubs | ✅ |
| Mosque | ✅ (1,379 verified) | ✅ | ⚠️ **BROKEN** | ✅ From city pages | **GAP** |

### Mosque Detail Breadcrumb Gap

The mosque detail page breadcrumb currently goes through `/mosque-near-me`:

```
// Current (WRONG):
Home → Mosques Near Me (/mosque-near-me) → {City} (/mosque-near-me?city=...) → Mosque Name

// Correct:
Home → {State} (/mosques/{state}) → {City} (/mosques/{state}/{city}) → Mosque Name
```

This breaks the SEO hierarchy for Google's understanding of the site structure.  
**Source:** `src/app/mosque/[slug]/page.tsx` — breadcrumb construction uses `/mosque-near-me?city=...`

---

## 5. Internal Linking Architecture

### What's Working Well

- **Homepage** (`/`): Links to all 5 state directories + popular city hubs (Chicago, Houston, Brooklyn, etc.)
- **Header**: Dynamic state dropdown driven by `getEnabledStates()` — links to all active state directories
- **Footer**: All 5 state links + popular city hub links
- **State pages**: Link to all eligible city pages within the state
- **City pages**: Link to individual mosque detail pages + related eligible cities (`getRelatedEligibleCities()`)
- **Mosque detail pages**: Link back to... `/mosque-near-me?city=...` (broken — see breadcrumb gap)

### Internal Linking Gap

Mosque detail pages should link back to their canonical city directory page (`/mosques/[state]/[city]`), not to the finder with query params. This affects:
1. Breadcrumb schema injected into `<head>` 
2. The visible breadcrumb UI
3. PageRank flow through the SEO hierarchy

### Cross-Linking

- Related cities are linked from city pages via `getRelatedEligibleCities()` — ✅ correct
- No circular links detected
- No orphan pages — every city page is reachable from its state page

---

## 6. Metadata Strategy

### Current Implementation

All metadata is generated via `constructMetadata()` in `src/lib/seo/metadata.ts`.

```typescript
// Relevant fields:
{
  title,
  description,
  canonical,          // absolute URL
  robots: {
    index: !noIndex,
    follow: true,
    'max-image-preview': 'large'
  },
  openGraph: { ... },
  twitter: { ... }
}
```

### Metadata per Page Type

| Page | Title Pattern | Description | Canonical | noIndex flag |
|------|---------------|-------------|-----------|--------------|
| Homepage | "Find Mosques Near You..." | Hardcoded, good | `/` | false ✅ |
| State page | "Mosques in {State} — Directory" | State-specific | `/mosques/{state}` | false ✅ |
| City page | "Mosques in {City}, {State}" | City-specific with count | `/mosques/{state}/{city}` | false ✅ |
| Mosque detail (verified) | "{Name} — Mosque in {City}, {State}" | Address/hours | `/mosque/{slug}` | false ✅ |
| Mosque detail (needs_review) | Same | Same | `/mosque/{slug}` | **false** ⚠️ |
| `/mosque-near-me` | "Mosques Near Me — Finder" | Dynamic page | `/mosque-near-me` | **false** ⚠️ |

### Metadata Gaps

1. **`/mosque-near-me`** — `noIndex` is not set to `true`. The page's metadata call does not pass `noIndex: true`.
2. **`needs_review` mosque pages** — No conditional `noIndex: true` based on `dataStatus`.
3. **No `article:modified_time`** or `lastModified` on mosque detail pages — all use `new Date()` (current build time), not actual data modification date.

---

## 7. Canonical URL Correctness

| Page Type | Canonical Set | Correct | Notes |
|-----------|---------------|---------|-------|
| Homepage | ✅ | ✅ | `/` |
| State pages | ✅ | ✅ | `/mosques/{state}` |
| City pages | ✅ | ✅ | `/mosques/{state}/{city}` |
| Mosque detail | ✅ | ✅ | `/mosque/{slug}` |
| `/mosque-near-me` | ✅ (self) | ⚠️ | Self-canonical doesn't prevent indexing — needs `noindex` |
| Query param URLs | ❌ (no canonical) | N/A | These are generated client-side and not served as HTML pages |

> **Key principle:** Self-canonical + no `noindex` = the page will be indexed. `/mosque-near-me` needs `noindex` regardless of canonical.

---

## 8. Structured Data (Schema.org)

### Current Schema Inventory

| Page | Schema Types | Status |
|------|-------------|--------|
| Homepage | None | ⚠️ `generateWebSiteSchema()` exists but unused |
| State pages | `BreadcrumbList` only | ⚠️ Missing `CollectionPage` or `WebPage` |
| City pages | `BreadcrumbList` + `CollectionPage` + `ItemList` | ✅ |
| Mosque detail | `BreadcrumbList` + `Mosque` + `PlaceOfWorship` | ✅ (but breadcrumb uses wrong URLs — see §11) |

### Schema Detail: `generateMosqueSchema(mosque)`

```jsonc
{
  "@type": ["Mosque", "PlaceOfWorship"],
  "name": "...",
  "address": { "@type": "PostalAddress", ... },
  "geo": { "@type": "GeoCoordinates", ... },
  // CONDITIONALLY included (only when real data exists):
  "telephone": "...",
  "url": "...",
  "image": "...",
  "openingHoursSpecification": [...],
  "aggregateRating": { ... }   // only when real ratings
}
```

✅ No fabricated properties — schema is strictly data-driven.  
✅ Three-valued amenity model prevents false claims (never outputs `false` for unknown amenities).

### Schema Gaps

1. **Homepage** — `generateWebSiteSchema()` exists in `src/lib/seo/schema.ts` but is NOT injected in `src/app/page.tsx`. Missing `WebSite` schema with `SearchAction` is a lost opportunity for sitelinks searchbox.
2. **State pages** — Only `BreadcrumbList`. Should add `CollectionPage` schema to signal this is a directory page.
3. **Mosque detail breadcrumb** — `BreadcrumbList` items link through `/mosque-near-me` not the canonical hierarchy. Google's breadcrumb parser will follow these URLs — they resolve to the finder app, not the canonical city directory.

### Schema: What Must NOT Be Added

- `aggregateRating` without real rating data — ❌ never fabricate
- `amenityFeature` without verified data — ❌ three-valued model prevents this
- `openingHours` from Jumu'ah times only — ❌ misleading (Jumu'ah is weekly, not daily hours)

---

## 9. Sitemap Architecture

### Current Sitemap Structure

```
/sitemap.xml
  ├── Static routes (3):
  │   ├── /                  priority 1.0, daily
  │   ├── /mosque-near-me    priority 0.9, daily  ← REMOVE
  │   └── /about             priority 0.7, monthly
  │
  ├── State routes (5):
  │   ├── /mosques/california    priority 0.8, weekly
  │   ├── /mosques/texas         priority 0.8, weekly
  │   ├── /mosques/new-york      priority 0.8, weekly
  │   ├── /mosques/florida       priority 0.8, weekly
  │   └── /mosques/illinois      priority 0.8, weekly
  │
  ├── City routes (52):
  │   └── /mosques/{state}/{city}  priority 0.7, weekly
  │
  └── Mosque detail routes (1,379 verified):
      └── /mosque/{slug}           priority 0.6, monthly
```

**Total:** ~1,439 URL slots → deduplicated to **1,406 unique URLs** in current build.

### Sitemap Issues

1. **`/mosque-near-me` must be removed** from the sitemap. It is a dynamic JS-rendered app page with no stable content. Including it with priority 0.9 sends incorrect crawl signals and wastes crawl budget.
2. **`lastmod` on mosque detail pages** is set to `new Date()` at build time — not actual content modification date. This means every build re-declares all 1,379 mosques as freshly modified.

### Sitemap Architecture — What's Correct

- ✅ Only `verified` mosques in sitemap (not `needs_review`, not `excluded`)
- ✅ Only `getEligibleCities()` city pages in sitemap (≥5 publishable threshold)
- ✅ Only `getEnabledStates()` state pages — future states auto-appear when activated
- ✅ URL deduplication prevents duplicate entries
- ✅ Driven by the canonical repository layer — no hardcoded URLs

### Future Sitemap Scaling

When new states are added to `STATE_REGISTRY` with `enabled: true`, they will automatically appear in the sitemap via `getEnabledStates()`. No sitemap code changes needed.

---

## 10. Robots.txt & Crawl Budget

### Current `robots.txt`

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://usmosgefinder.com/sitemap.xml
```

### Issues

1. **No query parameter blocking.** The finder page generates URLs like:
   - `/mosque-near-me?q=mosque`
   - `/mosque-near-me?state=TX`
   - `/mosque-near-me?city=houston`
   - `/mosque-near-me?nearMe=true`
   
   These are all client-side rendered and produce no unique HTML content. However, if Google crawls them (they're linked from the page UI), they waste crawl budget.

2. **`/mosque-near-me` itself** is not disallowed. Combined with the sitemap inclusion, this actively encourages Google to crawl and index it.

### Recommended `robots.txt` Changes

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /mosque-near-me

Sitemap: https://usmosgefinder.com/sitemap.xml
```

> **Note:** Disallowing `/mosque-near-me` in robots.txt prevents crawling. Combined with removing it from the sitemap, this fully removes it from Google's index consideration. The finder is still accessible to users — robots.txt is not a user-access control.

> **Alternative approach:** Keep it crawlable but add `<meta name="robots" content="noindex, nofollow">` via the `constructMetadata()` noIndex flag. This is safer if you want to preserve any direct links to it.

---

## 11. Breadcrumb Correctness

### Current Breadcrumb Chains

| Page | Current Chain | Correct? |
|------|---------------|----------|
| Homepage | (none) | ✅ n/a |
| State page | `Home → {State}` | ✅ |
| City page | `Home → {State} → {City}` | ✅ |
| Mosque detail | `Home → Mosques Near Me → {City (query URL)} → {Name}` | ❌ **WRONG** |

### Mosque Detail Breadcrumb Problem

**File:** `src/app/mosque/[slug]/page.tsx`

The breadcrumb items array currently includes:

```typescript
// CURRENT (wrong):
{
  name: 'Mosques Near Me',
  url: `${process.env.NEXT_PUBLIC_BASE_URL}/mosque-near-me`
},
{
  name: mosque.city,
  url: `${process.env.NEXT_PUBLIC_BASE_URL}/mosque-near-me?city=${encodeURIComponent(mosque.city)}`
},
```

**What it should be:**

```typescript
// CORRECT:
{
  name: stateConfig.name,                         // e.g. "California"
  url: `${BASE_URL}/mosques/${stateConfig.slug}`  // /mosques/california
},
{
  name: mosque.city,
  url: `${BASE_URL}/mosques/${stateConfig.slug}/${citySlug}` // /mosques/california/los-angeles
},
```

This affects both the `BreadcrumbList` JSON-LD schema and the visible UI breadcrumb. Google uses both to understand site hierarchy.

---

## 12. Candidate New Page Types

These are page types not yet implemented. Each is evaluated for SEO justifiability based on current data.

### 12A. Regional / Metro Pages

**Example:** `/mosques/texas/houston-metro` covering Houston + Sugar Land + Katy + ...

| Criterion | Assessment |
|-----------|------------|
| Data support | ❌ No metro/regional grouping in current data model |
| Content depth | ❌ Would aggregate already-covered city pages — thin |
| Duplication risk | ⚠️ High — overlaps with individual city pages |
| Verdict | **FUTURE — Data model change required first** |

A metro grouping field would need to be added to `StateConfig` and the `MosqueRecord` model before this is justifiable.

### 12B. Mosque Type / Category Pages

**Example:** `/mosques/california/sunni` or `/mosques/texas/shia`

| Criterion | Assessment |
|-----------|------------|
| Data support | ⚠️ `categories` field exists on some records but coverage is inconsistent |
| Content depth | ⚠️ Would be thin if category coverage is <30% across all records |
| Duplication risk | ⚠️ Medium — overlaps with city pages |
| Verdict | **FUTURE — Requires data audit of category coverage first** |

Do not create category pages until category data coverage is ≥60% nationally and categories are normalized/standardized.

### 12C. Nearby / Related Mosque Pages

**Example:** `/mosque/[slug]/nearby`

| Criterion | Assessment |
|-----------|------------|
| Data support | ✅ Coordinates available on all records |
| Content depth | ❌ Purely algorithmic — no unique content |
| Duplication risk | ❌ Very high — every mosque generates a page listing its neighbors, which are already indexed |
| Doorway page risk | ❌ Classic doorway page pattern |
| Verdict | **DO NOT CREATE — doorway/duplication risk** |

### 12D. Amenity Filter Pages

**Example:** `/mosques/california/los-angeles/sisters-section`

| Criterion | Assessment |
|-----------|------------|
| Data support | ⚠️ Three-valued (true/false/unknown) — insufficient for reliable filtering |
| Content depth | ❌ Would be very thin — small subsets of already-indexed mosques |
| Duplication risk | ❌ Very high |
| Verdict | **DO NOT CREATE — insufficient data, thin page risk** |

### 12E. Neighborhood Pages

**Example:** `/mosques/new-york/brooklyn/crown-heights`

| Criterion | Assessment |
|-----------|------------|
| Data support | ❌ No neighborhood data in current model |
| Content depth | ❌ Would be extremely thin (1–3 mosques per neighborhood typically) |
| Verdict | **DO NOT CREATE — no data** |

---

## 13. Page Types That Must NOT Be Created

The following page types would create thin, duplicate, or doorway pages and must not be implemented:

| Page Type | Reason |
|-----------|--------|
| `/mosque-near-me/[city]` | Duplicate of `/mosques/[state]/[city]` without SEO value |
| `/mosque/[slug]/nearby` | Doorway page — purely algorithmic, no unique content |
| `/mosques/[state]/[city]/sisters-section` | Thin — amenity data insufficient, small result sets |
| `/mosques/[state]/[city]/parking` | Same as above |
| `/mosques/[state]/sunni` | Thin — category coverage inconsistent nationally |
| `/mosques/[state]/[city]/sunni` | Thin — double-filter, tiny result sets |
| `/mosques/[region]` (metro) | No metro data model — would be fabricated groupings |
| `/search?q=...` | Query param URL — ephemeral, no indexable content |
| Pagination routes (page 2, 3...) | City pages currently fit in one page; no paginated hierarchy needed |

---

## 14. needs_review Mosque Indexability

### Current State

Mosques with `dataStatus === 'needs_review'` (104 records):
- ✅ **Not in sitemap** — `sitemap.ts` filters for `dataStatus === 'verified'` only
- ❌ **Accessible via `/mosque/[slug]`** — the route does not 404 for needs_review records
- ❌ **No `noindex` directive** — `metadata` function does not check `dataStatus` before setting `noIndex`

### Risk

Google may discover these 104 pages via:
1. Internal links from city pages (city pages include all publishable mosques — verified + needs_review)
2. Direct URL access if users share links

These pages have the same markup as verified pages but represent data that has not been fully validated. Quality signals are weaker.

### Recommendation for Phase 4B

Add a conditional `noIndex: true` check in the mosque detail page metadata:

```typescript
// Pseudocode — in src/app/mosque/[slug]/page.tsx
const noIndex = mosque.dataStatus !== 'verified';
// Pass noIndex to constructMetadata()
```

Additionally, consider whether city pages should exclude `needs_review` mosques from their listings (currently they include all publishable = verified + needs_review).

> **Key principle from project conventions:** Never treat `needs_review` as verified. This should apply to indexability as well.

---

## 15. /mosque-near-me — Indexability Problem

### Current State

`/mosque-near-me` is:
1. **In the sitemap** with `priority: 0.9` and `changeFrequency: 'daily'`
2. **No `noindex` directive** in its metadata
3. **Self-canonical** (canonical = `/mosque-near-me`) — does not redirect to a different page
4. **Dynamic JS-rendered page** — content is generated client-side, varies by browser geolocation, and changes with every filter interaction

### Why This Is a Problem

- A priority 0.9 signal tells Google this is one of the most important pages on the site
- The page has no stable text content — it renders a map + mosque cards based on user location
- Google will crawl it, attempt to render it, find dynamic content, and potentially give it inconsistent signals
- Query parameter variants (`?q=`, `?state=`, `?city=`, `?nearMe=true`) may be discovered and crawled

### Recommended Fix (Phase 4B)

**Option A (Recommended):** Remove from sitemap + add `noindex` via metadata

```typescript
// In src/app/mosque-near-me/page.tsx metadata:
noIndex: true
```

```typescript
// In src/app/sitemap.ts — remove from staticRoutes:
// { url: `${BASE_URL}/mosque-near-me`, ... }  ← DELETE THIS LINE
```

**Option B:** Disallow in `robots.txt`

```
Disallow: /mosque-near-me
```

**Recommendation:** Use Option A (noindex + remove from sitemap). This is the cleanest signal. Option B prevents crawling but the page may still appear in index if other sites link to it.

---

## 16. Homepage — Schema Gap

### Current State

The homepage (`src/app/page.tsx`) renders NO structured data. No JSON-LD script tags are injected.

### The Gap

`generateWebSiteSchema()` exists in `src/lib/seo/schema.ts`:

```typescript
export function generateWebSiteSchema(): WebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'US Mosque Finder',
    url: `${BASE_URL}/`,
    description: '...',
    // SearchAction not yet implemented
  };
}
```

This function is **never called** from `src/app/page.tsx`.

### Recommended Fix (Phase 4B)

Inject `generateWebSiteSchema()` into the homepage. Consider also adding a `SearchAction` to enable Google Sitelinks Searchbox — but only if the search resolves to a stable indexable URL (it currently uses client-side state, so `SearchAction` is premature).

```tsx
// In src/app/page.tsx:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema()) }}
/>
```

---

## 17. State Pages — Schema Gap

### Current State

State directory pages (`src/components/state/StateDirectoryView.tsx`) inject:
- ✅ `BreadcrumbList` — correct

### The Gap

State pages do NOT inject `CollectionPage` or `WebPage` schema. For comparison, city pages inject both `BreadcrumbList` + `CollectionPage` + `ItemList`.

### What State Pages Currently Have (Schema)

```jsonc
// Only this:
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "/" },
    { "@type": "ListItem", "position": 2, "name": "California", "item": "/mosques/california" }
  ]
}
```

### Recommended Fix (Phase 4B)

Add `CollectionPage` schema to state pages, similar to the pattern already used on city pages in `generateCityCollectionSchema()`. A parallel `generateStateCollectionSchema()` function should be created.

```jsonc
// Add to state pages:
{
  "@type": "CollectionPage",
  "name": "Mosques in California",
  "description": "Directory of X mosques across Y cities in California",
  "url": "https://usmosgefinder.com/mosques/california",
  "breadcrumb": { ... }  // reuse BreadcrumbList
}
```

---

## 18. lastModified & Content Freshness

### Current State

In `src/app/sitemap.ts`, mosque detail URLs use:

```typescript
lastModified: new Date()  // ← build time, not content modification time
```

### Problem

Every production build marks all 1,379 verified mosques as modified "today". This:
1. Consumes unnecessary crawl budget — Google prioritizes recently-modified URLs
2. Erodes the `lastModified` signal — if everything is always "new", Google ignores it
3. Can mislead Google into thinking content changed when it hasn't

### Recommendation for Phase 4B

Add a `lastVerified` or `lastModified` date field to the `MosqueRecord` model. This can be:
- Set during data ingestion to the JSON file modification date
- Or a static ISO date string per record in the raw JSON

Until this field exists, consider using a fixed static date per state (e.g., the date the state dataset was last audited) rather than `new Date()`.

```typescript
// Better than new Date():
lastModified: new Date('2026-09-01')  // date of last state audit
```

---

## 19. Crawl Signal Summary (What's Working)

These elements of the current implementation are architecturally sound and should be preserved in Phase 4B:

| Signal | Implementation | Notes |
|--------|---------------|-------|
| Canonical URLs | ✅ All page types | Via `constructMetadata()` |
| robots meta | ✅ index/follow by default | Just needs `needs_review` + `/mosque-near-me` fix |
| Sitemap structure | ✅ Hierarchical (state → city → mosque) | Remove `/mosque-near-me` |
| City eligibility threshold | ✅ ≥5 publishable mosques | Prevents thin pages |
| State registry as sole enabler | ✅ `getEnabledStates()` drives everything | Future-proof |
| Schema accuracy | ✅ Data-driven, no fabrication | Three-valued amenity model |
| Breadcrumb hierarchy | ✅ On state & city pages | Fix mosque detail |
| Internal linking | ✅ Comprehensive (header, footer, city→state→mosque) | Fix mosque→city link |
| URL structure | ✅ Clean, no params in static URLs | `/mosque-near-me` is the exception |
| No `needs_review` in sitemap | ✅ Sitemap filters `verified` only | Fix their indexability |
| Structured data on city pages | ✅ `CollectionPage` + `ItemList` + `BreadcrumbList` | Add to state pages |
| OG/Twitter metadata | ✅ All pages | |
| URL deduplication in sitemap | ✅ Built into sitemap generator | |

---

## 20. Critical Gaps — Priority Order

Ranked by SEO impact (P1 = fix immediately in Phase 4B):

| Priority | Gap | Impact | Fix Location |
|----------|-----|--------|-------------|
| **P1** | `/mosque-near-me` in sitemap with priority 0.9 | High — wastes crawl budget, wrong signal | `src/app/sitemap.ts` |
| **P1** | `/mosque-near-me` no `noindex` | High — will be indexed | `src/app/mosque-near-me/page.tsx` |
| **P1** | Mosque detail breadcrumb goes through `/mosque-near-me` | High — breaks SEO hierarchy for all 1,379 detail pages | `src/app/mosque/[slug]/page.tsx` |
| **P2** | `needs_review` mosques indexed with no `noindex` | Medium — quality risk for 104 pages | `src/app/mosque/[slug]/page.tsx` |
| **P2** | Homepage missing `WebSite` schema | Medium — lost sitelinks opportunity | `src/app/page.tsx` |
| **P2** | State pages missing `CollectionPage` schema | Medium — weaker directory signal | `src/components/state/StateDirectoryView.tsx` |
| **P3** | `lastModified: new Date()` on all mosque URLs | Low-medium — erodes crawl freshness signal | `src/app/sitemap.ts` |
| **P3** | Robots.txt does not disallow `/mosque-near-me` | Low — mitigated by noindex fix | `src/app/robots.ts` |

---

## 21. Phase 4B Implementation Plan

Phase 4B should implement the following changes **in this order**:

### Step 1 — Fix `/mosque-near-me` Indexability (P1)

1. Add `noIndex: true` to `/mosque-near-me` page metadata
2. Remove `/mosque-near-me` from `staticRoutes` in `src/app/sitemap.ts`
3. Add `Disallow: /mosque-near-me` to `src/app/robots.ts` (belt-and-suspenders with noindex)

**Expected outcome:** `/mosque-near-me` removed from sitemap, marked noindex, excluded from crawl.

### Step 2 — Fix Mosque Detail Breadcrumbs (P1)

1. In `src/app/mosque/[slug]/page.tsx`, resolve the mosque's `stateCode` to its `StateConfig` via `STATE_REGISTRY`
2. Compute the city slug using the same `slugify()` function used by `CityRepository`
3. Replace breadcrumb items that reference `/mosque-near-me` with the canonical hierarchy:  
   `Home → {State} (/mosques/{state-slug}) → {City} (/mosques/{state-slug}/{city-slug}) → {Mosque Name}`
4. Verify the city slug resolves to an eligible city (if not eligible, use state as the last parent — do not link to a non-existent city page)

**Expected outcome:** All 1,379 verified mosque detail pages have correct canonical breadcrumb chains.

### Step 3 — Fix needs_review Indexability (P2)

1. In `src/app/mosque/[slug]/page.tsx`, check `mosque.dataStatus`
2. Pass `noIndex: mosque.dataStatus !== 'verified'` to `constructMetadata()`

**Expected outcome:** 104 `needs_review` pages marked noindex. 1,379 verified pages unchanged.

### Step 4 — Add WebSite Schema to Homepage (P2)

1. Import `generateWebSiteSchema` in `src/app/page.tsx`
2. Inject the JSON-LD script tag in the page return

**Expected outcome:** Homepage emits `WebSite` schema — Google can parse site identity.

### Step 5 — Add CollectionPage Schema to State Pages (P2)

1. Create `generateStateCollectionSchema(stateConfig, cityCount, mosqueCount)` in `src/lib/seo/schema.ts`
2. Inject in `src/components/state/StateDirectoryView.tsx`

**Expected outcome:** State pages emit `CollectionPage` schema consistent with city pages.

### Step 6 — Improve lastModified Signals (P3)

1. Define a `lastAudited` date per state in `StateConfig` within `state-registry.ts`
2. Use `state.lastAudited` (or a reasonable static date) instead of `new Date()` for mosque URLs in sitemap

**Expected outcome:** Sitemap `lastModified` signals are meaningful, not always "today".

### Step 7 — Tests

For each change, add or update test cases in the existing test files:
- `tests/state-activation.test.ts` — sitemap exclusion of `/mosque-near-me`, noindex for needs_review
- `tests/city-seo.test.ts` — breadcrumb chain correctness
- New test: `tests/phase4b-seo.test.ts` — comprehensive Phase 4B regression suite

---

## 22. What Phase 4B Must NOT Do

| Must NOT | Reason |
|----------|--------|
| Create amenity filter pages | Thin pages, three-valued data insufficient |
| Create neighborhood pages | No neighborhood data |
| Create `/mosque/[slug]/nearby` pages | Doorway pages |
| Create metro/regional pages | No metro data model |
| Create category (sunni/shia) pages | Coverage inconsistent nationally |
| Add `SearchAction` to `WebSite` schema | Finder uses client-side state, no stable search URL |
| Add `aggregateRating` fabricated data | Schema.org policy violation |
| Add `needs_review` mosques to city page listings | Violates project convention |
| Change city eligibility threshold | 5 is the correct Tier A minimum |
| Modify `STATE_REGISTRY` to add new states | Not in Phase 4B scope |
| Change URL structure for existing routes | Breaking change, no SEO benefit |
| Add `hreflang` | English-only site, not needed |
| Add pagination to city pages | No city has enough mosques to require it |
| Create `/search` as an indexable route | Ephemeral query results, doorway page pattern |

---

## 23. Validation Checklist

After Phase 4B implementation, validate with:

```bash
# Unit tests — expect all passing (currently 144/144)
npm test

# TypeScript — expect 0 errors
npm run typecheck

# ESLint — expect 0 warnings
npm run lint

# Production build — expect 65+ pages, 0 errors
npm run build

# Git status — expect clean after committing Phase 4B
git status
```

### Functional Checks (Post-Build)

```bash
# Start server and verify key routes
npm run start

# Verify /mosque-near-me returns noindex header
curl -s http://localhost:3000/mosque-near-me | grep -i "noindex"

# Verify sitemap does NOT contain /mosque-near-me
curl -s http://localhost:3000/sitemap.xml | grep -v "mosque-near-me"

# Verify a verified mosque detail page IS indexed
curl -s http://localhost:3000/mosque/[slug] | grep -i "index, follow"

# Verify a needs_review mosque detail page is noindexed
# (requires knowing a needs_review slug)
```

### Schema Validation

After Phase 4B, validate using:
- [Google Rich Results Test](https://search.google.com/test/rich-results) — test homepage, state, city, mosque detail
- [Schema.org Validator](https://validator.schema.org) — paste JSON-LD from page source
- Google Search Console → URL Inspection → check breadcrumb rendering

---

## APPENDIX A — Source File Reference

| File | Role | Phase 4B Changes? |
|------|------|-------------------|
| `src/app/sitemap.ts` | Sitemap generator | ✅ Remove `/mosque-near-me`, fix `lastModified` |
| `src/app/robots.ts` | Robots.txt | ✅ Add `/mosque-near-me` disallow |
| `src/app/page.tsx` | Homepage | ✅ Add `WebSite` schema |
| `src/app/mosque-near-me/page.tsx` | Finder page | ✅ Add `noIndex: true` |
| `src/app/mosque/[slug]/page.tsx` | Mosque detail | ✅ Fix breadcrumb, add noindex for needs_review |
| `src/components/state/StateDirectoryView.tsx` | State page view | ✅ Add `CollectionPage` schema |
| `src/lib/seo/schema.ts` | Schema generators | ✅ Add `generateStateCollectionSchema()` |
| `src/lib/seo/metadata.ts` | Metadata constructor | ℹ️ No changes needed — already supports noIndex |
| `src/lib/config/state-registry.ts` | State config | ✅ Add `lastAudited` date per state |
| `src/lib/data/mosque-repository.ts` | Data source | ❌ No changes |
| `src/lib/data/city-repository.ts` | City data | ❌ No changes |
| `src/lib/config/city-seo.ts` | SEO thresholds | ❌ No changes |

---

## APPENDIX B — Data Flow Diagram

```
STATE_REGISTRY (state-registry.ts)
  ↓ getEnabledStates()
  ├─→ sitemap.ts           (state + city + mosque URLs)
  ├─→ Header.tsx           (state dropdown)
  ├─→ Footer.tsx           (state links)
  └─→ FinderFilters.tsx    (state selector)

RAW JSON (data/raw/*.json)
  ↓ GenericStateProvider
  ↓ state-ingestion.ts
  ↓ MosqueRepository       ← SINGLE SOURCE OF TRUTH
  ├─→ CityRepository
  │     ├─→ getEligibleCities() → city pages, sitemap, internal links
  │     └─→ getRelatedEligibleCities() → city cross-links
  ├─→ getMosquesByState() [verified only] → sitemap
  ├─→ getMosqueBySlug()   → mosque detail page
  └─→ search()            → finder client
```

---

*End of Phase 4A — SEO Architecture & Topical Discovery Audit*  
*Next: Phase 4B — Implementation of fixes identified above*
