# PHASE 4C — SEO ELIGIBILITY ARCHITECTURE
## US Mosque Finder

**File:** `src/lib/seo/eligibility.ts`  
**Status:** Active  
**Phase:** 4C — National SEO & Topical Discovery

---

## Overview

`eligibility.ts` is the single source of truth for determining which pages on the US Mosque Finder site are eligible for indexation in the sitemap and entitled to standalone directory pages.

It enforces the architectural decision that **only content-rich pages are indexed** — preventing the creation of thin, low-value doorway pages.

---

## Module Exports

### `isStateEligibleForSeo(stateCodeOrSlug: string): boolean`

Returns `true` if a state has an indexable SEO directory page. Eligibility is determined by the state registry (`enabled: true`, `seoEnabled: true`).

```ts
isStateEligibleForSeo('CA')   // true
isStateEligibleForSeo('CT')   // false (disabled)
isStateEligibleForSeo('XX')   // false (unknown)
```

**Eligible states:** CA, TX, NY, FL, IL

---

### `getIndexableStates(): StateConfig[]`

Returns all `StateConfig` objects for states that qualify for indexable state directory pages.

```ts
const states = getIndexableStates();
// Returns: [CA, TX, NY, FL, IL]
```

---

### `isCityCountEligible(mosqueCount: number, policy?: CitySeoEligibilityPolicy): boolean`

Evaluates whether a mosque count qualifies a city for an indexable city landing page.

```ts
isCityCountEligible(5)   // true  — Tier A
isCityCountEligible(4)   // false — Tier B (disabled by default)
isCityCountEligible(1)   // false — Tier C
```

**Default policy:**
- `minMosqueCount: 5`
- `allowTierB: false`

---

### `isIndexableCity(stateCode: string, cityOrSlug: string): Promise<boolean>`

Async check for whether a specific city in a state qualifies for an indexable city directory page. Used in `mosque/[slug]/page.tsx` to determine whether to render a clickable city breadcrumb link.

```ts
await isIndexableCity('CA', 'los-angeles')  // true (21 mosques)
await isIndexableCity('CA', 'davis')        // false (1 mosque)
await isIndexableCity('TX', 'houston')      // true (72 mosques)
```

> **Note:** This is an async function (queries `cityRepository`). It can only be called in Server Components, not client components.

---

### `getIndexableCities(stateCode: string): Promise<CitySummary[]>`

Returns all `CitySummary` objects for cities in a state that qualify for indexable city directory pages.

```ts
const cities = await getIndexableCities('CA');
// Returns: 14 cities with mosqueCount >= 5
```

---

## Tier Definitions

| Tier | Condition | Eligible | Page Type |
|------|-----------|----------|-----------|
| **Tier A** | ≥ 5 publishable mosques | ✅ Yes | Standalone indexable city directory at `/mosques/{state}/{city}` |
| **Tier B** | 2–4 mosques | ❌ No (by default) | Mosque entities linked from state directory towns section |
| **Tier C** | 1 mosque | ❌ No | Mosque entity linked from state directory towns section |

**Rationale for Tier B/C exclusion:**

Generating standalone landing pages for towns with only 1–4 mosques creates:
- **Thin content** — insufficient substance for a quality directory page
- **Doorway pages** — content that exists only to intercept specific search queries
- **Crawl budget waste** — hundreds of near-identical low-value pages

Google Search Essentials explicitly penalizes these patterns. The correct approach is to ensure all entities remain crawlable via their canonical detail pages and discoverable via the state directory.

---

## Non-Eligible City Discovery Path

Mosques in non-eligible cities are NOT orphaned. They have a complete discovery path:

```
Home (/)
  └─► State Directory (/mosques/california)
         ├─► City Directories (eligible cities)
         │      └─► /mosques/california/los-angeles
         └─► Additional Towns & Communities (non-eligible)
                └─► Direct canonical links: /mosque/{slug}
                        └─► Mosque Detail Page
```

The "Additional Towns & Communities" section in `StateDirectoryView.tsx` renders:
- All non-eligible cities grouped by town
- Up to 3 direct mosque links per town (canonical `getMosquePath` href)
- Count of remaining mosques ("+ N more")
- CTA to GPS-based finder at `/mosque-near-me`

---

## Interfaces

### `StateSeoEligibilityPolicy`

```ts
interface StateSeoEligibilityPolicy {
  minVerifiedMosques: number;  // default: 10
  minEligibleCities: number;   // default: 1
}
```

> Currently, eligibility is determined entirely by the state registry flags. This interface is reserved for future policy-driven thresholds.

### `CitySeoEligibilityPolicy`

```ts
interface CitySeoEligibilityPolicy {
  minMosqueCount: number;  // default: 5
  allowTierB: boolean;     // default: false
}
```

---

## Integration Points

| Component | Uses | Purpose |
|-----------|------|---------|
| `src/app/mosque/[slug]/page.tsx` | `isIndexableCity` | Breadcrumb city link conditionality |
| `src/components/state/StateDirectoryView.tsx` | `cityRepository.getEligibleCities` | City directory grid |
| `src/app/sitemap.ts` | `cityRepository.getEligibleCities` | Only eligible city URLs in sitemap |
| `tests/phase4c-national-seo.test.ts` | All exports | A–Z test coverage |

---

## Constants

```ts
DEFAULT_STATE_SEO_POLICY = { minVerifiedMosques: 10, minEligibleCities: 1 }
DEFAULT_CITY_SEO_POLICY  = { minMosqueCount: 5,     allowTierB: false    }
```

---

## Related Files

- [`src/lib/config/city-seo.ts`](src/lib/config/city-seo.ts) — Lower-level `isCityEligibleForSeo` used by `cityRepository`
- [`src/lib/data/city-repository.ts`](src/lib/data/city-repository.ts) — `getEligibleCities`, `getAllCities`
- [`src/lib/config/state-registry.ts`](src/lib/config/state-registry.ts) — `STATE_REGISTRY`, `getEnabledStates`
- [`PHASE4C_NATIONAL_SEO_IMPLEMENTATION_REPORT.md`](PHASE4C_NATIONAL_SEO_IMPLEMENTATION_REPORT.md) — Full implementation report
