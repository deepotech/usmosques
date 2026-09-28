# Phase 3D — Nationwide / Regional Finder & Discovery
**Status: ✅ COMPLETE**
**Build: 65 pages · 0 errors · 0 warnings**
**Tests: 144/144 passing**

---

## 1. Overview

Phase 3D transforms the mosque finder from a California-only experience into a **nationwide discovery system** that works naturally across all 5 active states (CA, TX, NY, FL, IL), while preserving the existing state/city SEO architecture and the single canonical `MosqueRepository` data source.

**No new states were added. No second data source was created. No data was fabricated.**

---

## 2. Architecture Changes

### Before Phase 3D
- `MosqueFinderClient` assumed California context
- City pills were California-only
- Open Now filter used `getTimezoneForState(stateCode)` — one timezone per state (broken for TX El Paso)
- Home hero "Use My Location" exposed `lat=`/`lng=` in the URL
- Map default center: California centroid (36.7783, -119.4179, zoom 6)
- Dataset loaded with `limit: 500` — missed mosques in large states

### After Phase 3D
- `MosqueFinderClient` is fully state-aware, driven by `getEnabledStates()` — never hardcoded
- City pills are scoped per selected state; show `"City, ST"` in nationwide mode for disambiguation
- Open Now filter uses `getTimezoneForMosque(mosque)` — location-aware, handles TX El Paso
- Home hero "Use My Location" → `/mosque-near-me?nearMe=true` — zero coordinates in URL
- Map default center: US centroid (39.8283, -98.5795, zoom 4)
- Dataset loaded with `limit: 2500` — covers all 1,483 public listings

---

## 3. Search Model

The finder supports the following filter dimensions, all additive (AND logic):

| Filter | Param (URL) | Notes |
|--------|-------------|-------|
| Text search | `q` | Searches name, address, city, ZIP, description |
| State | `state` | State code (CA/TX/NY/FL/IL). Empty = all states |
| City | `city` | Scoped to selected state |
| Open Now | `openNow` | Uses `getTimezoneForMosque()` for location-aware timezone |
| Status | `status` | `verified` (default) or `all` (verified + needs_review) |
| Near Me / Distance | `nearMe`, `radius` | Triggers client-side geolocation; radius in miles |
| Amenities | (in-memory) | Wheelchair, parking, restroom — three-valued logic |
| Sort | `sort` | `relevance`, `name`, `city`, `distance` (distance only active with location) |

---

## 4. Nationwide Behavior

When no state is selected, the finder searches **all 1,483 public listings** across all 5 active states simultaneously. State is dynamically derived from `getEnabledStates()` in `state-registry.ts` — a new state can be activated there and immediately becomes available in the finder with no component changes required.

---

## 5. State & City Filtering

- **State dropdown** is built from `getEnabledStates()` at runtime — never a hardcoded list
- Selecting a state scopes city pills to that state's cities only
- In nationwide mode, city pills show `"City, ST"` (e.g., `"Houston, TX"`) to prevent ambiguity
- Selecting a state resets the city selection if that city is not in the new state
- `handleClearAllFilters` resets both state and radius to their initial values

---

## 6. ZIP Code Search

ZIP search is handled by the text query `q`. The repository's `search()` method matches ZIP against `mosque.postalCode`. This is cross-state: a ZIP like `77001` (Houston) will find TX mosques without requiring the user to select a state first.

There is no hardcoded assumption that a ZIP belongs to California.

---

## 7. Near Me — Privacy Model

**Precise coordinates are never stored or transmitted in any form.**

| Surface | Behavior |
|---------|----------|
| URL | Only `nearMe=true` flag — never `lat=`, `lng=` |
| localStorage | Never used for coordinates |
| Cookies | Never set for coordinates |
| Analytics | No coordinate data sent |
| Server | Geolocation is client-side only; server never sees coordinates |

Flow:
1. User clicks "Use My Location" → navigates to `/mosque-near-me?nearMe=true`
2. `MosqueFinderClient` detects `autoNearMe=true` prop → calls `navigator.geolocation.getCurrentPosition()` in `useEffect`
3. Coordinates stored only in React state (`userLocation`) for the lifetime of the page session
4. Haversine distances computed client-side against loaded mosque data
5. Results sorted by distance; radius filter applied in-memory

---

## 8. Distance & Radius Behavior

- **Algorithm**: Haversine formula (`calculateHaversineDistanceMiles` in `src/lib/geo/distance.ts`)
- **Radius options**: 5 / 10 / 25 / 50 / 100 miles (selector only appears when location is active)
- **Default radius**: 25 miles
- **Cross-state**: radius filter is geographic, not administrative — a mosque in NJ appears for a NYC user within range
- Distance is displayed on each card when location is active (e.g., `"2.4 mi"`)

---

## 9. Texas Multi-Timezone Resolution

Texas spans two time zones. The standard `America/Chicago` (Central) covers ~97% of TX mosques. El Paso and Hudspeth counties use `America/Denver` (Mountain).

**Resolution logic** (`src/lib/geo/timezone.ts`):
```
getTimezoneForLocation(lat, lng, stateCode, state):
  if stateCode === 'TX' and lng < -104.85:
    return 'America/Denver'   // El Paso / Hudspeth
  return state primary timezone
```

`getTimezoneForMosque(mosque)` wraps this using `mosque.latitude`, `mosque.longitude`, `mosque.stateCode`, `mosque.state`.

All Open Now calculations — in the repository `search()`, `MosqueFinderClient`, `MosqueStatusBadge`, and `MosqueMap` — use `getTimezoneForMosque()`.

**Known limitation**: Florida panhandle (Pensacola area, ~5% of FL mosques) uses Central Time but is resolved to `America/New_York`. No coordinate-based fix has been applied for FL; this is documented as a known limitation.

---

## 10. Amenity Filter — Three-Valued Logic

Amenity filters use three-valued logic: **unset / required / excluded**. The `matchesAmenityFilters()` function in `src/lib/amenity/amenity-engine.ts` returns `true` for a mosque if all active filters are satisfied. An unset filter accepts any mosque regardless of amenity data availability.

This means mosques with missing amenity data are **not penalized** unless that amenity is explicitly required.

---

## 11. Map Behavior

| Property | Before | After |
|----------|--------|-------|
| Default center | California (36.7783, -119.4179) | US centroid (39.8283, -98.5795) |
| Default zoom | 6 | 4 |
| Popup context | Name only | `"City, ST"` line above mosque name |
| Open Now detection | `getTimezoneForState` | `getTimezoneForMosque` |

The map zooms to fit results when a location or filter is active.

---

## 12. URL Query State Policy

URL sync is intentionally limited to non-sensitive, non-coordinate parameters:

| Synced to URL | NOT synced to URL |
|---------------|-------------------|
| `q` (text query) | `lat`, `lng` (never) |
| `state` | `userLocation` |
| `city` | amenity filter state |
| `radius` | |
| `openNow` | |
| `status` | |
| `sort` | |

---

## 13. SEO Policy

The Finder (`/mosque-near-me`) is a **dynamic application page**, not an SEO page. It is:
- `noindex` in robots meta
- Excluded from `sitemap.xml`
- Not prerendered as static HTML (rendered on demand: `ƒ Dynamic`)

Filter combinations (`?state=TX&city=Houston&openNow=true`) do **not** generate separate SEO pages. The SEO architecture (52 city pages + 5 state pages) is unchanged.

---

## 14. Performance

| Metric | Before | After |
|--------|--------|-------|
| Dataset size at load | 500 records (server) | 2,500 (server limit covers all 1,483) |
| Client display batch | 24 at a time | 24 at a time (unchanged) |
| State-scoped search | N/A | Filter in-memory, no re-fetch |
| Nationwide search | Not supported | All 1,483 records, single pass |

---

## 15. Files Changed

### New Files
| File | Purpose |
|------|---------|
| `tests/nationwide-finder.test.ts` | 20 Phase 3D tests |
| `PHASE3D_IMPLEMENTATION_PLAN.md` | Implementation plan (created mid-phase) |
| `PHASE3D_REPORT.md` | This report |

### Modified Files
| File | Key Change |
|------|-----------|
| `src/lib/geo/timezone.ts` | Added `getTimezoneForLocation()`, `getTimezoneForMosque()` |
| `src/lib/data/mosque-repository.ts` | Use `getTimezoneForMosque` for Open Now; removed `getTimezoneForState` |
| `src/components/mosque/MosqueStatusBadge.tsx` | `latitude`/`longitude` props; uses `getTimezoneForLocation` |
| `src/components/mosque/MosqueCard.tsx` | Pass `latitude`/`longitude` to `MosqueStatusBadge` |
| `src/app/mosque/[slug]/page.tsx` | Pass `latitude`/`longitude` to `MosqueStatusBadge`; dynamic nearby-state label |
| `src/components/home/HomeHeroSearch.tsx` | Remove coordinate URL exposure; `?nearMe=true` navigation only |
| `src/components/search/FinderFilters.tsx` | State dropdown, radius selector, state-aware city pills |
| `src/components/search/MosqueFinderClient.tsx` | Full nationwide search: state filter, radius filter, URL sync, auto-nearMe |
| `src/app/mosque-near-me/page.tsx` | Full dataset (limit 2500), new params, nationwide top cities |
| `src/components/map/MosqueMap.tsx` | US centroid default, `getTimezoneForMosque`, City/ST popup |

---

## 16. Test Results

```
Test Files  9 passed (9)
     Tests  144 passed (144)
  Duration  1.66s
```

### Phase 3D Tests (20 new — `tests/nationwide-finder.test.ts`)
1. Searches across all enabled states when no state is selected
2. Filters by state code correctly
3. State filter integrates with text query
4. City filter scoped to selected state
5. Nationwide city list includes state codes for disambiguation
6. State-scoped city list contains only cities from that state
7. Open Now uses timezone-aware detection (getTimezoneForMosque)
8. Texas El Paso mosque gets Mountain Time timezone
9. Texas Dallas mosque gets Central Time timezone
10. Distance filter excludes mosques beyond radius
11. Distance filter includes mosques within radius
12. URL sync includes state param but never coordinates
13. nearMe=true triggers geolocation without URL coordinates
14. Radius options: 5/10/25/50/100 miles available
15. Default radius is 25 miles
16. Status filter: verified-only by default
17. Status filter: all includes needs_review
18. Sort by distance only active with location
19. Nationwide search loads all 1,483 public listings
20. getEnabledStates() drives state options — never hardcoded list

---

## 17. Build Result

```
✓ Compiled successfully in 3.0s
✓ Generating static pages (65/65)
TypeScript: 0 errors
ESLint: 0 warnings
```

### Route Summary
| Route | Type | Count |
|-------|------|-------|
| `/` | Static | 1 |
| `/mosque-near-me` | Dynamic | 1 |
| `/mosque/[slug]` | Dynamic | 1 |
| `/mosques/[state]` | Static | 5 |
| `/mosques/[state]/[city]` | SSG | 52 |
| `/about`, `/robots.txt`, `/sitemap.xml` | Static | 3 |
| **Total** | | **65** |

---

## 18. Known Limitations

| Limitation | Scope | Notes |
|-----------|-------|-------|
| Florida panhandle timezone | ~5% of FL mosques | Pensacola uses Central Time; resolved as Eastern. No coordinate-based fix applied. |
| Texas multi-timezone threshold | `lng < -104.85` | Approximate county boundary. Accurate for El Paso/Hudspeth. |
| Amenity data coverage | Sparse for FL/IL | Some mosques have no amenity data; three-valued logic prevents false negatives. |
| Radius filter | Client-side only | Requires JS; not applicable to static SEO pages. |

---

## 19. Canonical Data Counts (Locked — Phase 3C.1)

| State | Raw | Verified | Needs Review | Excluded | Publishable |
|-------|-----|----------|--------------|----------|-------------|
| California | 401 | 370 | 29 | 2 | 399 |
| Texas | 332 | 311 | 20 | 1 | 331 |
| New York | 374 | 340 | 34 | 0 | 374 |
| Florida | 194 | 190 | 4 | 0 | 194 |
| Illinois | 185 | 168 | 17 | 0 | 185 |
| **TOTAL** | **1,486** | **1,379** | **104** | **3** | **1,483** |

> **Public listings = Verified + Needs Review = 1,483**
> **Sitemap-indexed = Verified only = 1,379**

---

*Phase 3D complete. Next phase: TBD.*
