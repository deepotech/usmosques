# Phase 2B Implementation Report: Interactive Mosque Map & Advanced Finder UX

**Date:** 2026-09-28  
**Status:** Completed successfully & verified  
**Scope:** Phase 2B (Interactive Map + Advanced Discovery UX for `/mosque-near-me`)  
**Engine:** Next.js 15 (App Router), React 19, TypeScript (Strict), Tailwind CSS, Leaflet, Vitest  

---

## 1. Executive Summary
Phase 2B elevates `/mosque-near-me` from a static card listing into a synchronized, high-performance, mobile-first discovery application. Users can now search California mosques by city, ZIP code, or facility name, view results simultaneously on an interactive OpenStreetMap Leaflet map, use browser geolocation for distance calculation and nearest-distance sorting, filter by real-time timezone-aware "Open Now" status, and seamlessly interact between map markers and list cards across both desktop and mobile screens.

All existing SEO assets (canonical URLs, OpenGraph metadata, structured JSON-LD schemas, city landing pages, and sitemaps) remain strictly intact.

---

## 2. Existing Architecture Reused
- **Canonical Model:** The `Mosque` entity (`src/types/mosque.ts`) remains the single source of truth across the application. No duplicate data pipeline or competing models were created.
- **Repository & Data Flow:** Normalized California mosque records from `californiaProvider` continue to power search, filtering, and map markers through `mosqueRepository.search()`.
- **Domain Services:**
  - `src/lib/geo/distance.ts`: `calculateHaversineDistanceMiles` and `formatDistanceMiles` provide consistent distance calculation in miles.
  - `src/lib/geo/timezone.ts`: `getMosqueOpenStatus` and `getTimezoneForState` (`America/Los_Angeles`) provide timezone-accurate opening hours evaluation. Missing hours remain classified as "Hours not listed" and are never assumed open or closed.
- **Components:** `MosqueCard`, `MosqueStatusBadge`, `DistanceBadge`, `RatingSummary`, `ActionButtons`, `SearchBar`, and `LocationButton`.

---

## 3. Map Library Chosen & Rationale
- **Library:** `leaflet` (`^1.9.4`) with `@types/leaflet`.
- **Why It Was Chosen:**
  1. **Lightweight & High Performance:** Minimal bundle impact (~40 kB gzip), avoiding heavyweight commercial map platform dependencies.
  2. **React 19 Compatibility:** Direct integration via custom React hooks and references without peer-dependency friction.
  3. **Zero Proprietary API Keys Required:** Runs directly on standard OpenStreetMap tiles with no API keys exposed on client browsers.
  4. **Vector `L.divIcon` Markers:** SVG-based markers eliminate bundler static PNG path issues, load instantaneously, and render razor-sharp on retina displays.
  5. **Resilience & Fallback:** Isolated within client boundaries; map failure or network drops never prevent users from browsing or searching the directory list.

---

## 4. Map Tile Provider & Attribution Policy
- **Tile Provider:** OpenStreetMap Standard Tile Layer
- **Tile URL:** `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Attribution Displayed:** `&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors`
- **Max Zoom:** 19
- **Compliance:** Standard web caching headers respected; no aggressive tile polling or scraping.

---

## 5. New & Modified Components
1. `src/components/map/map-icons.ts`: Vector SVG `L.divIcon` marker factory for mosques (unselected vs. selected with glowing amber ring) and user location (pulsing blue dot).
2. `src/components/map/MapPlaceholder.tsx`: Accessible skeleton loader with pulsing indicator and error fallback UI.
3. `src/components/map/MosqueMap.tsx`: Client-side Leaflet container with synchronized markers, popups, pan/zoom transitions, fit-bounds controls, and locate-me shortcut.
4. `src/components/map/DynamicMosqueMap.tsx`: SSR-safe dynamic wrapper with `ssr: false` to eliminate hydration mismatch and server-side `window`/`document` access errors.
5. `src/components/search/ViewToggle.tsx`: Accessible mobile switcher toggle between `List (N)` and `Map View`.
6. `src/components/search/FinderFilters.tsx`: Controls for "Open Now", "Verified Only", Sort dropdown ("Nearest", "Highest Rating", "Alphabetical"), and popular California city pills.
7. `src/components/search/MosqueFinderClient.tsx`: Upgraded discovery orchestrator coordinating search, filters, user location, active count, and map-list selection.
8. `src/components/mosque/MosqueCard.tsx`: Enhanced with `isSelected` styling, `onSelect` callback, smooth scroll anchor `id="mosque-card-${id}"`, and "Selected on map" indicator.

---

## 6. Finder UX & Discovery Flow
- **Header:** Focused utility layout featuring search bar, user geolocation button, and active filters.
- **Search Capabilities:**
  - 5-digit ZIP code: Prefix matching on postal code.
  - City name: Normalized case-insensitive matching.
  - Facility name / Keywords: Full-text search across name, address, and categories.
- **Sorting Options:**
  - `Nearest`: Active and defaulted whenever user location is available.
  - `Highest Rating`: Factual review count and rating sort.
  - `Alphabetical (A-Z)`: Name sorting.
- **Open Now Filter:** Evaluates current timestamp against California timezone (`America/Los_Angeles`). If hours are unlisted, the mosque is excluded from "Open Now" without guessing.
- **Results Count:** Contextual and factual:
  - e.g., *"14 mosques nearest to you"* (with user location).
  - e.g., *"27 mosques in Sacramento, California"*.
  - e.g., *"401 mosques in California"*.

---

## 7. Map / List Synchronization
- **Card $\to$ Map:** Clicking any mosque card highlights the card, pans the map smoothly to the marker coordinates, and opens the marker popup preview.
- **Map $\to$ List:** Clicking a map marker sets `selectedMosqueId`, highlights the card, and smoothly scrolls the corresponding card into view on desktop screens.
- **Mobile Mode:** On small screens, selecting a marker displays a compact preview card floating over the map with direct buttons to "View Details" and "Directions". Cards in list mode offer a "Show on map" button that switches tabs and centers the marker.
- **Stability:** Selection state is tracked strictly by unique canonical `mosque.id` (never array indices). If active filters cause the selected mosque to drop out of results, the selection resets safely without errors.

---

## 8. Geolocation & Privacy Handling
- **Strictly User-Initiated:** Geolocation is triggered exclusively upon clicking the "Use my location" button. Never requested on page load or map initialization.
- **Client-Side Privacy:** User coordinates remain in transient React state. They are never sent to a server, never stored in cookies or `localStorage`, never included in URLs, and never transmitted to analytics.
- **Graceful Error States:** Clear human-friendly messages for denied permissions (code 1), unavailable GPS (code 2), or timeouts (code 3). Search by city or ZIP remains 100% operational when location is disabled.

---

## 9. Mobile & Responsive Layout
- **Desktop ($\ge$ 1024px):** 2-column layout with scrollable mosque card list on the left (col-span 7) and a sticky interactive Leaflet map on the right (col-span 5, min-height 580px).
- **Mobile (< 1024px):** Dedicated view switcher (`List` vs `Map`).
  - `List`: High-density touch-friendly card list.
  - `Map`: Full-screen map view with floating selected mosque preview card.
  - Zero horizontal overflow across 375px, 390px, 414px, 768px, and desktop viewports.

---

## 10. Accessibility (a11y)
- Semantic HTML tags (`<nav>`, `<article>`, `<button>`, `<select>`).
- Explicit ARIA attributes (`aria-pressed`, `aria-label`, `role="tablist"`, `role="tab"`, `role="region"`).
- Keyboard-accessible controls with visible `:focus-visible` rings.
- Map markers include title attributes and accessible popup navigation buttons.
- Directory listing and all information remain accessible even if JavaScript fails to load the map.

---

## 11. SEO & Crawl Integrity
- Canonical route `/mosque-near-me` remains server-rendered with complete metadata.
- Internal links to `/mosque/[slug]` and `/mosques/california/[city]` remain standard crawlable HTML anchor tags (`<Link href="...">`).
- Interactive client state does not create crawl traps or low-value doorway URLs.
- Dynamic sitemap (`sitemap.xml`) and crawler rules (`robots.txt`) remain fully intact.

---

## 12. Automated Test Results
Vitest automated test suite executed **44 tests** across 3 test files with **100% pass rate**:

1. `tests/finder-map.test.ts` (**18 tests - NEW**):
   - Search by city, ZIP, and facility name.
   - Open Now timezone filter verification.
   - Sorting by nearest (Haversine), rating, and alphabetical name.
   - Haversine distance accuracy and badge formatting.
   - Geolocation reducer state handling (granted, denied, unavailable, timeout).
   - Selection synchronization and filter-reset logic.
   - Marker coordinates validation (filtering NaNs and out-of-bounds).
   - Duplicate coordinates retention (preserving multiple entities sharing locations).
   - Data integrity (exclusion of non-mosque entities).
2. `tests/city-seo.test.ts` (**8 tests**): All California city aggregations, eligibility checks, and collection schemas passed.
3. `tests/data-quality.test.ts` (**18 tests**): All raw data validation, non-mutation, and normalization tests passed.

---

## 13. Build, Lint & Typecheck Verification
- `npm run typecheck`: **0 errors**.
- `npm run lint`: **0 errors, 0 warnings**.
- `npm run build`: Production build completed successfully in 7.6s.
  - `/mosque-near-me`: 11.1 kB (124 kB first-load JS).
  - All other routes (`/`, `/about`, `/mosque/[slug]`, `/mosques/california`, `/mosques/california/[city]`) remain uninflated at ~113-115 kB first-load JS due to code-split dynamic import of Leaflet.

---

## 14. Known Limitations & Production Considerations
- **Tile Usage:** Uses public OpenStreetMap tile servers, which have rate limits for heavy commercial production traffic. For large-scale production, switching to self-hosted vector tiles (e.g. Protomaps / MapLibre) or a managed tile proxy is recommended.
- **Clustering:** Current marker rendering performs smoothly for California's ~400 mosques without lag. If expanding nationwide to thousands of markers in a single viewport, marker clustering (e.g., `leaflet.markercluster`) may be considered.

---

## 15. Recommended Next Phase (Phase 2C)
1. **Amenity & Accessibility Filters:** Activate factual UI toggles for verified amenities (e.g. wheelchair accessibility, women's prayer area, parking) present in the California dataset.
2. **State Ingestion Pipeline:** Extend the proven normalization and repository pattern to ingest Texas (332 mosques) and New York (340+ mosques).
