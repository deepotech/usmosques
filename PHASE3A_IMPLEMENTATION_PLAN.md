# Implementation Plan: Phase 3A — Generic Multi-State Data Ingestion Architecture

## 1. Existing Architecture & Scope Boundaries
- **Current State:**
  - The project has a solid data pipeline (validation, normalization, repository, city aggregation, timezone-aware hours, interactive map, progressive loading, and three-valued amenity filtering).
  - However, California (`CA`, `America/Los_Angeles`, `californiaProvider`) was directly wired into the repository, city aggregation, and timezone defaults.
- **Phase 3A Objectives:**
  - Build a generic, state-agnostic ingestion architecture so that future states (Texas, New York, Florida, etc.) can be ingested through configuration and validated pipelines rather than custom code.
  - **CRITICAL SCOPE BOUNDARY:** Do NOT fully ingest Texas or New York. Do NOT publish nationwide routes or thin pages. Only California remains `enabled: true`.

---

## 2. California Coupling Audit
- `src/lib/data/california-provider.ts`: State-specific loader reading `data/raw/california.json`.
- `src/lib/data/mosque-repository.ts`: Direct injection of `californiaProvider`.
- `src/lib/data/city-repository.ts`: Direct injection of `californiaProvider`.
- `src/lib/geo/timezone.ts`: Hardcoded `'America/Los_Angeles'` fallback.
- `src/lib/data/normalization.ts`: Hardcoded `'California'` / `'CA'` address parsing fallbacks.
- `src/app/sitemap.ts`: Directly calls `californiaProvider.getAll()`.

---

## 3. Target Architecture & Components
```
                    ┌────────────────────────┐
                    │  State Registry        │
                    │  (src/lib/config/      │
                    │   state-registry.ts)   │
                    └───────────┬────────────┘
                                │
                    ┌───────────┴────────────┐
                    │ Raw State Dataset      │
                    └───────────┬────────────┘
                                ↓
                    ┌────────────────────────┐
                    │ Schema & Boundary      │
                    │ Validation             │
                    └───────────┬────────────┘
                                ↓
                    ┌────────────────────────┐
                    │ Generic Normalization  │
                    │ Pipeline               │
                    └───────────┬────────────┘
                                ↓
                    ┌────────────────────────┐
                    │ Quality Gate & Metrics │
                    │ Report                 │
                    └───────────┬────────────┘
                                ↓
                    ┌────────────────────────┐
                    │ Generic State Provider │
                    │ (IStateMosqueProvider) │
                    └───────────┬────────────┘
                                ↓
                    ┌────────────────────────┐
                    │ Unified Repository     │
                    │ (IMosqueRepository)    │
                    └───────────┬────────────┘
                                ↓
     ┌──────────────────────────┼─────────────────────────┐
     ↓                          ↓                         ↓
  Finder                   Leaflet Map               City SEO
(Progressive List)     (Shared Normalized)       (State-Agnostic)
```

---

## 4. Key Implementation Steps

### Step 1: Centralized State Registry (`src/lib/config/state-registry.ts`)
- Model `StateConfig`: `code`, `name`, `slug`, `timezone`, `timezones`, `enabled`, `finderEnabled`, `seoEnabled`, `datasetPath`.
- Registered states:
  - `CA`: `enabled: true`
  - `TX`: `enabled: false` (prepared, dormant)
  - `NY`: `enabled: false` (prepared, dormant)
- Safe getters: `getStateConfig(codeOrSlug)`, `getEnabledStates()`, `isStateEnabled(codeOrSlug)`, `getDefaultState()`.

### Step 2: Timezone Architecture (`src/lib/geo/timezone.ts`)
- Decouple generic hours evaluation from `'America/Los_Angeles'`.
- Look up timezone dynamically from `getStateConfig(stateCode)`.
- Support explicit timezone parameters in `getMosqueOpenStatus`.

### Step 3: Generic Provider Abstraction (`src/lib/data/state-provider.ts`)
- Interface `IStateMosqueProvider`:
  - `stateCode: string`, `stateName: string`, `timezone: string`
  - `getAll()`, `getById()`, `getBySlug()`, `getPublishable()`
  - `ingest(rawRecords: unknown[]): StateIngestionResult`
- Generic class `GenericStateProvider`:
  - Pure, memory-safe, immutability-guaranteeing provider.
- Adapt `CaliforniaProvider` to implement `IStateMosqueProvider`.

### Step 4: Generic State Boundary & Quality Gate (`src/lib/data/state-ingestion.ts`)
- Detects if records in dataset belong to another state (boundary mismatch).
- Calculates comprehensive quality metrics: valid GPS %, phone coverage %, website coverage %, hours coverage %, images coverage %, duplicate detection.
- Generates structured `StateIngestionResult`.

### Step 5: Unified Mosque Repository (`src/lib/data/mosque-repository.ts`)
- Upgrade `MosqueRepository` to support multiple registered state providers.
- Default to enabled states (California in Phase 3A).
- Add `getMosquesByState(stateCode)`, `getStateCodes()`, and state-filtered search.

### Step 6: State-Agnostic City Aggregation (`src/lib/data/city-repository.ts`)
- Generalize `CityRepository` to accept `stateCode?: string`.
- Aggregate cities for any state without state-specific code.

### Step 7: Tests & Regression Verification
- Write `tests/state-architecture.test.ts`:
  - State config registry lookup and safety
  - State boundary validation
  - Ingestion result & quality gate
  - Generic normalization with synthetic fixture (fictional test records, never in production data)
  - Multi-state repository isolation (`getMosquesByState('CA')` vs `getMosquesByState('TX')`)
  - Dynamic timezone resolution (CA vs TX vs NY)
  - Sitemap safety (inactive states never in sitemap)
  - Raw immutability verification
- Confirm all 57 existing tests continue to pass.
- Run `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
