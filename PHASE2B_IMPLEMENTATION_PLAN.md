# Implementation Plan: Phase 2B — Interactive Mosque Map & Advanced Finder UX

## 1. Context & Objectives
Phase 2B upgrades `/mosque-near-me` from a static card listing into an interactive, high-performance, mobile-first mosque discovery platform.
The map must be tightly synchronized with the search and results list, provide live geolocation and distance calculations, support "Open Now" filtering via California timezone logic, and retain 100% of existing SEO, server components, and accessibility standards.

---

## 2. Existing Architecture & Reuse Points
- **Domain & Normalization**:
  - `Mosque` entity from `src/types/mosque.ts` is the single canonical model.
  - Zero duplicate data pipeline: the map consumes identical normalized entities from `californiaProvider` via `mosqueRepository`.
- **Domain Services**:
  - Distance: `calculateHaversineDistanceMiles` & `formatDistance` in `src/lib/geo/distance.ts`.
  - Hours: `getMosqueOpenStatus` & `getTimezoneForState` in `src/lib/geo/timezone.ts` (California `America/Los_Angeles`).
  - Search: Full-text name, city, ZIP, address search.
- **Card & UI Components**:
  - `MosqueCard`, `MosqueStatusBadge`, `DistanceBadge`, `RatingSummary`, `ActionButtons` in `src/components/mosque/`.
  - `SearchBar`, `LocationButton` in `src/components/search/`.

---

## 3. Technology & Mapping Library Selection
- **Library**: `leaflet` and `@types/leaflet`.
- **Reasoning**:
  - Extremely lightweight (~40KB gzip), zero React 19 peer-dependency conflicts.
  - Full control over map lifecycle, smooth pan/zoom, popups, and marker synchronization.
  - Compliant OpenStreetMap tile server: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`.
  - Attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`.
  - Scalable vector `L.divIcon` pins for markers (no broken external asset paths, retina-ready, fast rendering).
- **Next.js SSR Safety**:
  - Encapsulate map in `DynamicMosqueMap.tsx` using `next/dynamic` with `ssr: false`.
  - Provide accessible `MapPlaceholder.tsx` skeleton for initial load and SSR fallback.
  - Map failure or tile errors do not block the results list or search controls.

---

## 4. Component Structure
```
src/components/
  ├── map/
  │    ├── DynamicMosqueMap.tsx       # Next.js dynamic client boundary (ssr: false)
  │    ├── MosqueMap.tsx              # Leaflet container, markers, popups, view bounds
  │    ├── MapPlaceholder.tsx         # Skeleton & error boundary fallback
  │    └── map-icons.ts               # SVG divIcon definitions (default, selected, user)
  ├── search/
  │    ├── MosqueFinderClient.tsx     # Unified discovery orchestrator (map + list)
  │    ├── FinderHeader.tsx           # Search bar, location CTA, status indicators
  │    ├── FinderFilters.tsx          # Open Now, Verified, Sort (Nearest/Name/Rating)
  │    ├── ViewToggle.tsx             # Mobile List ↔ Map toggle
  │    ├── SearchBar.tsx              # Search input with clear button
  │    └── LocationButton.tsx         # User-initiated geolocation button
  └── mosque/
       └── MosqueCard.tsx             # Enhanced with selection state & scroll anchor
```

---

## 5. State Model & Synchronization
- **Single Source of Truth**:
  - `searchQuery: string`: free text, city, or 5-digit ZIP.
  - `selectedCity: string`: active city filter.
  - `openNowOnly: boolean`: evaluated against America/Los_Angeles timezone.
  - `selectedStatus: 'all' | 'verified'`: listing status filter.
  - `sortBy: 'nearest' | 'name' | 'rating'`: factual sort criteria.
  - `userCoords: { lat: number; lng: number } | null`: client-only user location.
  - `selectedMosqueId: string | null`: currently highlighted/focused mosque.
  - `mobileViewMode: 'list' | 'map'`: active tab on mobile screens.
- **Bi-directional Synchronization**:
  - Card click $\to$ sets `selectedMosqueId`, pans/zooms map to marker, opens marker popup.
  - Marker click $\to$ sets `selectedMosqueId`, highlights card in list, scrolls card into view smoothly on desktop.
  - Filter change $\to$ if `selectedMosqueId` is no longer in filtered results, clear selection safely.
  - Fit Bounds $\to$ automatically fits map bounds to visible results only when search or city filters change, not interrupting manual panning.

---

## 6. Geolocation & Privacy Rules
- **Explicit Permission**: Triggered only upon user clicking "Use my location". Never on mount.
- **Client-Side Only**: Coordinates are never sent to the backend, never put in query params, never stored in localStorage, never sent to analytics.
- **Graceful Error Handling**: Clear messages for denied permissions, timeouts, and unavailable GPS. Manual search remains 100% functional.
- **User Marker**: Distinct blue pulse pin on map, never treated as a mosque entity.

---

## 7. Responsive & Mobile Strategy
- **Desktop ($\ge$ 1024px)**:
  - Sticky interactive map on the right (min-height ~650px).
  - Scrollable list of detailed mosque cards on the left.
- **Mobile (< 1024px)**:
  - Sticky toggle bar: `[ List (N) ]` vs `[ Map ]`.
  - In Map view: full-screen interactive map with floating compact card of the selected mosque + directions/view details buttons.
  - In List view: fast, accessible vertical list of mosque cards with direct link to view on map.

---

## 8. Testing Strategy
- Unit & integration tests in `tests/finder-map.test.ts`:
  - Search by city, ZIP, and name.
  - Open Now filter logic with mocked timezone/hours.
  - Sorting by nearest (Haversine), name, and rating.
  - Geolocation states (granted, denied, unavailable).
  - Selected mosque state synchronization and clearing.
  - Marker coordinate validation and exclusion handling.
  - Duplicate coordinates preservation without dropping entities.
- Regression verification:
  - `tests/data-quality.test.ts` (18 tests) must pass.
  - `tests/city-seo.test.ts` (8 tests) must pass.
  - `npm run typecheck` & `npm run lint` with 0 errors.
  - `npm run build` production build must succeed.
