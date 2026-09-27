# Implementation Plan: US Mosque Finder (Phase 0 & Phase 1)

## 1. Repository Audit Summary (Phase 0)
- **Initial State**:
  - The repository was not a git repository and lacked any framework configuration or source files.
  - It contained 8 raw JSON dataset files across various US states:
    - `California – over 400 mosques.json` (3,921,441 bytes, 401 records)
    - `Connecticut – over 62 mosques.json` (619,899 bytes)
    - `Florida – about 200 mosques.json` (330,478 bytes)
    - `Illinois – approximately 180 mosques.json` (1,856,954 bytes)
    - `Indiana – around 57 mosques.json` (539,687 bytes)
    - `New York – more than 340 mosques.json` (620,814 bytes)
    - `South Carolina – at least 30 mosques.json` (288,545 bytes)
    - `Texas – about 332 mosques.json` (3,397,041 bytes)
  - No existing package.json, TypeScript config, Tailwind config, or tests existed.
  - Node.js v22.15.0 and npm 11.5.1 are available in the Windows environment.

- **California Dataset Inspection Findings**:
  - Total records: **401**
  - Unique CIDs: **401** (100% unique)
  - Unique PlaceIDs: **401** (100% unique)
  - GPS coordinates: **401** (100% valid latitude/longitude)
  - Phone numbers: **313** (78.1%)
  - Websites: **308** (76.8%)
  - Images: **393** (98.0%)
  - Opening hours: **218** (54.4%)
  - Reviews count: **380** (94.8%)
  - Additional Info (Amenities & Accessibility): **389** (97.0%)
  - Missing City / State in raw fields: **2 records** (Bakersfield and Downey, extractable from address string).
  - Duplicate addresses: **11 instances** (e.g. shared building facilities / centers).
  - Duplicate coordinates: **1 instance** (`37.509334, -121.971816` - Albrae Street Mosque & Islamic Center of Fremont).
  - Non-mosque / ambiguous category records: **12 records** (e.g., Caterer: Fresh Kabab, Clothing Store: Maqbool Islamic Clothing, pure schools/foundations).
  - Opening hours formats: 166 distinct strings, including complex ranges (`4:30 to 6:30 AM, 12:30 to 10 PM`, `Open 24 hours`, `Closed`, and narrow windows).

---

## 2. Architecture & Data Flow (Phase 1)
```
Raw Dataset (data/raw/california.json) [UNTOUCHED]
             ↓
Zod Raw Schema Validation (lib/data/validation.ts)
             ↓
Normalization Engine (lib/data/normalization.ts)
  - Cleans fields, standardizes phone/website/address
  - Derives status: 'verified' | 'needs_review' | 'excluded'
  - Extracts fallback city/state/postalCode
  - Computes rating summary from actual review items
  - Parses structured opening hours
             ↓
Mosque Repository / Provider (lib/data/mosque-repository.ts)
  - Abstract data provider interface
  - CaliforniaProvider implementation
  - Search, filter, sorting, and pagination
             ↓
Domain / Utility Services
  - Geo & Haversine distance (`lib/geo/distance.ts`)
  - Timezone & Open-Now calculation (`lib/geo/timezone.ts`)
  - Structured Data / JSON-LD generator (`lib/seo/schema.ts`)
             ↓
Presentation Layer (Next.js App Router)
  - `/`: Modern, community-focused homepage
  - `/mosque-near-me`: Primary utility search & geolocation experience
  - `/mosque/[slug]`: Canonical mosque detail page
  - Component library (`src/components/*`)
```

---

## 3. Strict Rules & Constraints
1. **Never Invent Data**: Missing fields remain missing. No fake reviews, ratings, prayer times, or hours.
2. **Immutable Raw Data**: Raw JSON files are untouched sources of truth.
3. **Status Classification**:
   - `verified`: Clear primary category as Mosque or verified Islamic Center with prayer facilities.
   - `needs_review`: Cultural centers, foundations, schools, or shared addresses.
   - `excluded`: Explicit commercial/caterer/retail entities with no primary mosque facilities.
4. **Timezone Awareness**: Calculate "Open Now" only when opening hours exist, respecting local timezone. If hours are missing, state "Hours not listed" rather than "Closed".
5. **No Blind Geolocation**: Browser location is only requested upon explicit user click on "[ Use My Location ]".

---

## 4. Work Breakdown for Phase 1
- [x] Scaffolding: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide icons, Vitest.
- [ ] Raw data copy to `data/raw/california.json` (leaving original file intact).
- [ ] Zod schema definition & validation utility (`lib/data/validation.ts`).
- [ ] Normalization engine (`lib/data/normalization.ts`).
- [ ] Mosque repository and California provider (`lib/data/mosque-repository.ts`).
- [ ] Haversine distance & geolocation helpers (`lib/geo/distance.ts`).
- [ ] Timezone & opening status engine (`lib/geo/timezone.ts`).
- [ ] SEO, JSON-LD, Robots, and Sitemap generation (`lib/seo/`, `app/sitemap.ts`, `app/robots.ts`).
- [ ] Design System & Reusable Components (`src/components/ui/`, `src/components/mosque/`).
- [ ] Homepage (`/`) with Hero search, geolocation CTA, actual CA top cities, sample verified mosques, trust/transparency section.
- [ ] Mosque Finder (`/mosque-near-me`) with client geolocation, name/city/ZIP search, distance calculation, nearest sorting, and responsive cards.
- [ ] Mosque Detail Page (`/mosque/[slug]`) with full data breakdown, directions, hours, amenities, and structured schema.
- [ ] Automated Test Suite: Data validation, normalization, non-mutation, distance, sorting, URL cleaning, hours parser.
- [ ] Typecheck, Lint, Test execution, Production Build verification.
- [ ] Generation of `DATA_QUALITY_REPORT.md` and `PHASE1_REPORT.md`.
