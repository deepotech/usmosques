# PHASE 3B IMPLEMENTATION PLAN
# Activate Texas and New York

## 1. Existing Architecture

### State Registry
- CA: enabled, `data/raw/california.json`
- TX, NY, FL, IL, CT, IN, SC: dormant

### Core Pipeline (generic, already exists)
- `state-registry.ts` — StateConfig, bounds, enabled flag
- `state-ingestion.ts` — `ingestStateDataset()` pure function
- `state-provider.ts` — `GenericStateProvider`
- `mosque-repository.ts` — multi-provider registry
- `city-repository.ts` — multi-state aware
- `normalization.ts` — `normalizeMosqueRecord(raw, idx, slugs, addrs, stateCode, stateName)`

### Current Routes
- `/` home
- `/mosque-near-me` finder
- `/mosques/california` — state directory (California-hardcoded page)
- `/mosques/california/[city]` — city SEO (California-hardcoded)
- `/mosque/[slug]` — individual mosque

### Tests
- 75 tests passing across 5 suites

---

## 2. Dataset Locations

### Texas
- File: `Texas – about 332 mosques.json` (root)
- Target: `data/raw/texas.json`
- Records: 332
- GPS: 100% (lat range 25.95–35.21, lng range -106.51 to -93.94) ✅ within TX bounds
- Schema: matches RawMosqueRecordSchema (passthrough)
- Key note: uses `website` field for actual websites, `url` for Google Maps links
- Suspicious: 1 "Paint store" (PPG Paints, Conroe), 2 "Religious school", 1 "Education center" → to be filtered

### New York
- File: `New York – more than 340 mosques.json` (root)
- Target: `data/raw/new-york.json`
- Records: 374
- GPS: 100% (lat 40.53–40.89, lng -74.22 to -73.73) — NYC metro ✅
- Schema: matches (has `cid`, `website`, `placeId`)
- Note: GPS bounds narrower than registered (40.4–45.1) — data is NYC-focused
- Suspicious: 1 "Community center" → needs review; 1 "Place of worship" → OK

---

## 3. Texas Activation Plan

1. Copy `Texas – about 332 mosques.json` → `data/raw/texas.json`
2. Update state-registry.ts: `TX.enabled = true`, `TX.datasetPath = 'data/raw/texas.json'`
3. Create `TexasProvider extends GenericStateProvider`
4. Register in `mosqueRepository`
5. Create `/mosques/texas/page.tsx` using shared `StateDirectoryPage` component
6. Create `/mosques/texas/[city]/page.tsx` using shared `StateCityPage` component

---

## 4. New York Activation Plan

1. Copy `New York – more than 340 mosques.json` → `data/raw/new-york.json`
2. Update state-registry.ts: `NY.enabled = true`, `NY.datasetPath = 'data/raw/new-york.json'`
3. Create `NewYorkProvider extends GenericStateProvider`
4. Register in `mosqueRepository`
5. Create `/mosques/new-york/page.tsx`
6. Create `/mosques/new-york/[city]/page.tsx`

---

## 5. Quality Gates

| Metric | Threshold | TX | NY |
|--------|-----------|----|----|
| GPS coverage | ≥ 95% | 100% ✅ | 100% ✅ |
| Schema errors | 0 | TBD | TBD |
| Boundary validation | 0 out-of-bounds | TBD | TBD |

---

## 6. State Route Plan

Strategy: Create shared generic components to avoid duplication.

```
src/
  components/
    state/
      StateDirectoryPage.tsx   ← server component, accepts StateConfig + data
      StateCityPage.tsx        ← server component
  app/
    mosques/
      california/page.tsx      ← thin wrapper → StateDirectoryPage
      california/[city]/page.tsx
      texas/page.tsx           ← thin wrapper → StateDirectoryPage
      texas/[city]/page.tsx
      new-york/page.tsx        ← thin wrapper → StateDirectoryPage
      new-york/[city]/page.tsx
```

---

## 7. City SEO Plan

- Reuse existing `CitySummary`, `CityRepository`, eligibility threshold
- `CityRepository.getEligibleCities(stateCode)` — already state-aware
- `CityRepository.getCityBySlug(slug, true, stateCode)` — scoped per state

### Expected eligible cities (≥5 mosques)
**TX**: Houston (70), Sugar Land (14), Dallas (10), Fort Worth (9), Arlington (9), San Antonio (9), Irving (8), Richardson (8), Plano (7), Spring (7), Austin (7), Katy (6), Carrollton (5), Garland (5), Richmond (5), Cypress (5) → ~16 cities
**NY**: Brooklyn (103), Bronx (87), Jamaica (44), New York (35), Staten Island (13), Flushing (12), Astoria (9), Woodside (8), Jackson Heights (8), Ozone Park (6), Queens Village (6), Long Island City (6), Richmond Hill (5) → ~13 cities

---

## 8. Sitemap Plan

Already generic via `getEnabledStates()`. Enabling TX + NY automatically adds their routes.

---

## 9. Test Plan

Create `tests/state-activation.test.ts` with 20 test cases covering:
- State enablement state
- Data isolation
- Boundary validation
- Quality gates
- City eligibility
- Sitemap safety
- Amenity compatibility
- Timezone resolution
- No CA regression

---

## 10. Rollback Strategy

If TX or NY fails quality gate:
1. Keep `enabled: false` in registry
2. Do not create public routes
3. Report exact failure metrics
4. Source files remain untouched

Rollback is simply: set `enabled: false` + unregister provider.
