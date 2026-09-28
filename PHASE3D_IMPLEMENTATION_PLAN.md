# PHASE 3D IMPLEMENTATION PLAN
# Nationwide / Regional Finder & Discovery

**Project:** US Mosque Finder  
**Phase:** 3D  
**Target:** Transform the finder from a single-state/hardcoded structure into a true nationwide, state-agnostic discovery system.

---

## 1. Existing Architecture & Audit Findings

### Components Inspected
- `MosqueRepository` (`src/lib/data/mosque-repository.ts`):
  Already holds multi-provider registry (`CA`, `TX`, `NY`, `FL`, `IL`). Search queries enabled states by default.
  `search(params)` accepts `stateCode`, `city`, `postalCode`, `query`, `status`, `openNow`, `userLat`, `userLng`, `maxDistanceMiles`.
- `GenericStateProvider` (`src/lib/data/state-provider.ts`):
  Loads and normalizes raw state JSON datasets. Cleanly isolates state entities.
- `state-registry.ts` (`src/lib/config/state-registry.ts`):
  Source of truth for `StateConfig` (code, name, slug, timezone, bounds, enabled, finderEnabled). Currently 5 active states: CA, TX, NY, FL, IL.
- `timezone.ts` (`src/lib/geo/timezone.ts`):
  Currently returns state primary timezone (`getTimezoneForState(stateCode)`).
  Texas spans Central and Mountain Time (El Paso).
- `MosqueFinderClient.tsx` (`src/components/search/MosqueFinderClient.tsx`):
  Receives `initialMosques` and `topCities`.
  Missing explicit State selector filter.
  Popular city pills were nationwide without state scoping.
  URL state was not synchronizing non-sensitive filters (state, city, query, openNow, verified, radius).
  `HomeHeroSearch.tsx` was passing precise coordinates (`lat=...&lng=...`) in the URL query string.
- `/mosque-near-me/page.tsx`:
  Loaded with `limit: 500`, truncating the dataset of 1,483 publishable records.

---

## 2. Canonical Search Model Refinement

We will extend `MosqueFilterParams` in `src/types/mosque.ts` and `MosqueFinderClient` props:
- `query?: string`: free text matching name, address, city, ZIP, categories.
- `stateCode?: string`: 2-letter uppercase postal code (`CA`, `TX`, `NY`, `FL`, `IL`) or `all`.
- `city?: string`: city name, strictly scoped to selected state when state filter is active.
- `postalCode?: string`: 5-digit ZIP code.
- `userLat?: number` & `userLng?: number`: memory-only coordinates from browser geolocation API.
- `maxDistanceMiles?: number`: optional radius (5, 10, 25, 50, 100 miles).
- `openNow?: boolean`: timezone-aware open/closed filter.
- `status?: 'all' | 'verified'`: default 'verified'.
- `amenities?: AmenityFilterState`: 3-valued (`true`/`false`/`unknown`) evaluation.
- `sortBy?: 'nearest' | 'rating' | 'name'`.

---

## 3. Nationwide Default & State Registry Integration

- Default state: Nationwide (`all`).
- When no state is selected, search runs across all enabled states dynamically via `getEnabledStates()`.
- Never hardcode `['CA', 'TX', 'NY', 'FL', 'IL']`; derive directly from the state registry.
- Dormant states (`CT`, `IN`, `SC`) remain disabled and never leak into active dropdowns or results.

---

## 4. State & City Filter Architecture

1. **State Selector:**
   - Dropdown added to `FinderFilters.tsx`.
   - Populated dynamically with enabled states from `STATE_REGISTRY`.
   - Options: "All Active States (Nationwide)", "California", "Florida", "Illinois", "New York", "Texas".
2. **State-Scoped City Selector:**
   - When a state is selected, the city selector and popular city pills display cities for that selected state only.
   - Disambiguates duplicate city names across states (e.g. Richmond, CA vs Richmond, TX).
   - When nationwide is selected, popular cities show high-density cities with state tags (e.g. "Houston, TX", "Chicago, IL", "Brooklyn, NY").

---

## 5. ZIP Search Architecture

- Works across all enabled states using prefix matching on `postalCode`.
- Does not rely on external or hardcoded ZIP tables.
- Input is trimmed and validated (5-digit numeric or text).

---

## 6. Privacy & Near Me Model

- Geolocation is strictly client-side via `navigator.geolocation`.
- Precise latitude/longitude are **never** written to URLs, localStorage, cookies, or logs.
- If user clicks "Use My Location" from homepage or finder, it triggers client-side geolocation and calculates distances in-memory using Haversine formula.
- `HomeHeroSearch.tsx` will be updated to use `/mosque-near-me?nearMe=true` rather than exposing raw coordinates in query strings.

---

## 7. Distance & Radius Filtering

- Haversine formula calculates distance in miles when user coordinates exist.
- Radius filter added to `FinderFilters` when location is active:
  Options: "Any distance", "5 miles", "10 miles", "25 miles", "50 miles", "100 miles".
- Sort defaults to `nearest` when location is active.

---

## 8. Open Now & Timezone Architecture

- `getTimezoneForMosque(mosque)`:
  - If state is Texas (`TX`) and longitude is west of `-104.85` (El Paso area), resolves to `America/Denver` (Mountain Time).
  - Otherwise uses primary state timezone (`America/Chicago` for TX, `America/New_York` for NY & FL, `America/Los_Angeles` for CA).
- Fully deterministic and testable.
- Document Texas multi-timezone limitation and fallback.

---

## 9. Amenity & Accessibility Model

- Preserves three-valued evaluation (`true`, `false`, `unknown`).
- Works across all 5 states without inventing features.

---

## 10. Map & Progressive Loading Synchronization

- Map displays markers for filtered results across all states.
- List uses progressive loading (24 at a time + "Load 24 More" + "Show All").
- Clicking a map marker scrolls the card into view and expands pagination if needed.
- Cards display `City, State` prominently (e.g. `Houston, TX`, `Chicago, IL`).

---

## 11. URL Query State & SEO Safety

- URL query parameters store non-sensitive state: `q`, `state`, `city`, `zip`, `sort`, `openNow`, `verified`, `radius`.
- Coordinates are never placed in URLs.
- Robots.txt and canonical tags prevent query parameter permutations from becoming indexable thin-content doorway pages.
- SEO remains on `/mosques/[state]` and `/mosques/[state]/[city]`.

---

## 12. Testing & Validation Strategy

1. Create `tests/nationwide-finder.test.ts` with >= 20 comprehensive test cases covering:
   - Nationwide search across all 5 enabled states
   - Dormant states excluded
   - State filtering isolation
   - City filtering state-scoped
   - Cross-state duplicate city disambiguation
   - ZIP code search across multiple states
   - Radius filtering with Haversine distance
   - Timezone resolution including El Paso Mountain Time
   - Amenity three-valued logic nationwide
   - Geolocation privacy (no coordinate URL persistence)
   - Zero California-only text regressions
2. Run full suite (`npm test`), `tsc --noEmit`, `next lint`, `npm run build`.
3. Test representative routes on live production server.
