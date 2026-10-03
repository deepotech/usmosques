# Phase 4C Preflight
## Entity URL & SEO Integrity Audit

### 1. Executive Summary

This preflight audit examined the entity URL architecture, slug generation mechanics, route resolution, and SEO integrity across all 5 currently active states (California, Texas, New York, Florida, Illinois).

**Findings:**
The current entity URL architecture **has true entity URL collisions**.

Because slug normalization operates in state-level isolation (`normalizeMosqueDataset` runs per state dataset without global awareness), generic facility titles produce identical slugs across different states. Specifically:
- **30 duplicate slug values** exist across the 5 active states.
- **67 total records** are affected.
- **27 duplicate groups** involve collisions between multiple **verified** listings (affecting **60 verified facilities**).
- **3 duplicate groups** involve collisions between a **verified** listing and a **needs_review** listing (affecting 7 records: 3 verified and 4 needs_review).
- In the current route resolver (`mosqueRepository.findBySlug`), providers are queried in Map insertion order (`CA → TX → NY → FL → IL`). The first state provider that matches the slug returns its record, causing subsequent facilities in later states to be **completely masked and unreachable** on `/mosque/[slug]`.
- Directory cards for those masked facilities link to `/mosque/[slug]`, which displays an out-of-state facility instead of the clicked mosque.
- Furthermore, **60 verified physical entities share only 27 canonical URLs** (`NON-UNIQUE ENTITY CANONICAL`).

This audit confirms that a URL architecture fix is strictly required prior to proceeding with Phase 4C National SEO Expansion.

---

### 2. Current Data Metrics

| Metric | Actual |
|---|---:|
| Total records | 1,486 |
| Verified | 1,379 |
| Needs Review | 104 |
| Excluded | 3 |
| Public records | 1,483 |
| Unique slugs | 1,449 |
| Duplicate slug values | 30 |
| Records affected | 67 |

*Note: All 3 excluded records have unique slugs and are not part of any duplicate group.*

---

### 3. Duplicate Slug Groups

| Slug | Records | States | Cities | Verified | Needs Review |
|---|---:|---|---|---:|---:|
| `masjid` | 4 | CA, TX, NY, IL | Arcata, Marble Falls, Queens, Mt Prospect | 3 | 1 |
| `al-ansar-mosque` | 4 | CA, NY, FL, IL | San Diego, Brooklyn, Miami, Chicago | 4 | 0 |
| `masjid-abu-bakr` | 3 | CA, TX, FL | Oakland, Houston, Tampa | 3 | 0 |
| `masjid-al-huda` | 3 | CA, TX, NY | Union City, Manor, Bronx | 3 | 0 |
| `makki-masjid` | 3 | CA, TX, IL | San Bernardino, Houston, Chicago | 3 | 0 |
| `masjid-al-noor` | 2 | CA, FL | Santa Clara, Tallahassee | 1 | 1 |
| `islamic-center` | 2 | CA, NY | Fresno, Bronx | 2 | 0 |
| `al-islam-mosque` | 2 | CA, IL | Chatsworth, Bolingbrook | 2 | 0 |
| `ar-rahman-islamic-center` | 2 | CA, FL | Fontana, Estero | 2 | 0 |
| `masjid-hamza` | 2 | CA, FL | Stockton, Largo | 2 | 0 |
| `muhammad-mosque` | 2 | CA, TX | Oakland, Dallas | 2 | 0 |
| `masjid-usman` | 2 | CA, TX | Lemon Grove, Spring | 2 | 0 |
| `al-noor-mosque` | 2 | CA, TX | Westminster, Houston | 2 | 0 |
| `islamic-center-of-quad-cities` | 2 | TX, IL | Frisco, Moline | 2 | 0 |
| `ahmadiyya-movement-in-islam` | 2 | TX, NY | Allen, Hollis | 2 | 0 |
| `masjid-ibrahim` | 2 | TX, FL | Austin, Lutz | 1 | 1 |
| `masjid-al-ikhlas` | 2 | TX, NY | San Antonio, Astoria | 2 | 0 |
| `masjid-al-ihsan` | 2 | TX, IL | Houston, Chicago | 2 | 0 |
| `musalla` | 2 | TX, IL | Clute, Chicago | 2 | 0 |
| `mosque` | 2 | TX, NY | Houston, Brooklyn | 2 | 0 |
| `masjid-abu-huraira` | 2 | TX, NY | The Woodlands, East Elmhurst | 2 | 0 |
| `al-rahma-mosque` | 2 | TX, FL | El Paso, Thonotosassa | 2 | 0 |
| `al-farooq-mosque` | 2 | NY, IL | Brooklyn, Chicago | 2 | 0 |
| `masjid-al-ihsaan` | 2 | NY, FL | Brooklyn, Orlando | 2 | 0 |
| `umar-mosque` | 2 | NY, FL | Brooklyn, Tampa | 1 | 1 |
| `al-ihsaan-mosque` | 2 | NY, FL | Brooklyn, Miami | 2 | 0 |
| `albanian-american-islamic-center` | 2 | NY, IL | Glendale, Berkeley | 2 | 0 |
| `al-iman-mosque` | 2 | NY, FL | Brooklyn, Belle Glade | 2 | 0 |
| `masjid-salam` | 2 | NY, IL | New York, Elgin | 2 | 0 |
| `masjid-al-rahman` | 2 | FL, IL | Orlando, Chicago | 2 | 0 |

#### Detailed Examination of Representative Collision Groups

**1. SLUG: `al-ansar-mosque` (4 Verified Entities Colliding)**
- **Record 1 (CA):** "Al-Ansar Mosque" | 7724 Convoy Ct, San Diego, CA 92111 | Status: verified
- **Record 2 (NY):** "Al-Ansar Mosque" | 7701 4th Ave, Brooklyn, NY 11209 | Status: verified
- **Record 3 (FL):** "Al-Ansar Mosque" | 5245 NW 7th Ave, Miami, FL 33127 | Status: verified
- **Record 4 (IL):** "Al-Ansar Mosque" | 2447 W Division St, Chicago, IL 60622 | Status: verified
- *Current Outcome:* Visiting `/mosque/al-ansar-mosque` **always** loads the San Diego, CA facility. The Brooklyn, Miami, and Chicago facilities are 100% inaccessible on detail routes.

**2. SLUG: `masjid-abu-bakr` (3 Verified Entities Colliding)**
- **Record 1 (CA):** "Masjid Abu Bakr" | 3824 Martin Luther King Jr Way, Oakland, CA 94609 | Status: verified
- **Record 2 (TX):** "Masjid Abu Bakr" | 8830 Old Galveston Rd, Houston, TX 77034 | Status: verified
- **Record 3 (FL):** "Masjid Abu Bakr" | 8824 N 56th St, Tampa, FL 33617 | Status: verified
- *Current Outcome:* Visiting `/mosque/masjid-abu-bakr` **always** loads Oakland, CA. The Houston and Tampa facilities cannot be viewed.

**3. SLUG: `masjid` (4 Public Entities Colliding: 3 Verified, 1 Needs Review)**
- **Record 1 (CA):** "Masjid" | 1175 G St, Arcata, CA 95521 | Status: verified
- **Record 2 (TX):** "Masjid" | 200 Main St, Marble Falls, TX 78654 | Status: verified
- **Record 3 (NY):** "Masjid" | 87-24 169th St, Queens, NY 11432 | Status: verified
- **Record 4 (IL):** "Masjid" | 1800 E Kensington Rd, Mt Prospect, IL 60056 | Status: needs_review
- *Current Outcome:* Resolves only to Arcata, CA. Marble Falls (TX), Queens (NY), and Mt Prospect (IL) are masked.

---

### 4. Route Resolution

Route resolution for `/mosque/[slug]` is implemented in `src/lib/data/mosque-repository.ts`:

```typescript
async findBySlug(slug: string, stateCode?: string): Promise<Mosque | null> {
  if (stateCode) {
    const provider = this.getProvider(stateCode);
    if (provider) {
      const found = await provider.getBySlug(slug);
      return found ?? null;
    }
    return null;
  }

  for (const provider of this.providers.values()) {
    const found = await provider.getBySlug(slug);
    if (found) return found;
  }
  return null;
}
```

Answers to key architectural questions:
1. **Does the route lookup by slug return only one record?**
   Yes. `findBySlug` stops at the first matching provider and returns a single `Mosque | null`.
2. **If multiple records share the slug, which record is returned?**
   The record belonging to whichever provider appears earlier in `this.providers.values()`.
3. **Is the result deterministic?**
   Yes, but **arbitrarily** deterministic. It depends strictly on provider registration order.
4. **Is the result dependent on array/map ordering?**
   Yes. `MosqueRepository` registers providers in the constructor in this order:
   `CA (California) → TX (Texas) → NY (New York) → FL (Florida) → IL (Illinois)`.
   Therefore, California records always shadow Texas, New York, Florida, and Illinois records with the same slug.
5. **Can a user reach each duplicate entity through a unique URL?**
   **No.** Any facility appearing after the first registered state with that slug is unreachable.

---

### 5. generateStaticParams Analysis

- **Implementation in `src/app/mosque/[slug]/page.tsx`:**
  There is **no `generateStaticParams()`** function in `src/app/mosque/[slug]/page.tsx`.
- **Next.js Route Mode:**
  The Next.js production build output explicitly classifies this route as dynamic on-demand:
  ```
  ├ ƒ /mosque/[slug]    209 B    113 kB    (Dynamic: server-rendered on demand)
  ```
- **Consequences:**
  - Build does not fail due to duplicate parameter collisions because static generation is not attempted for individual mosque slugs.
  - However, at runtime, dynamic SSR always resolves via `findBySlug(slug)`, reproducing the provider-order shadow bug on every request.

---

### 6. Sitemap Analysis

- **Total Sitemap URLs:** 1,405
- **Static URLs:** 2 (`/`, `/about`)
- **State Directory URLs:** 5
- **City Directory URLs:** 52
- **Mosque Detail URLs:** 1,346
- **Total Verified Mosque Records:** 1,379
- **Verified Mosque URLs in Sitemap:** 1,346
- **Needs Review URLs in Sitemap:** 0 (strictly excluded)
- **Excluded URLs in Sitemap:** 0 (strictly excluded)
- **Duplicate URLs in Sitemap:** 0 (deduplicated by `seenUrls` Set)

**Evaluation of Sitemap Deduplication:**
`src/app/sitemap.ts` generates mosque URLs by looping over verified records per enabled state. When it encounters the second verified record with slug `al-ansar-mosque` (e.g. in NY), the URL `https://usmosquefinder.com/mosque/al-ansar-mosque` is already present in `seenUrls` and is filtered out.
- Consequently, **33 verified mosque listings are dropped completely from the sitemap**.
- Crawlers are never informed that verified mosques in NY, FL, and IL with that name exist.
- Sitemap deduplication does **not** represent a safe architecture; rather, it masks the underlying missing entity URLs.

---

### 7. Canonical Analysis

In `src/app/mosque/[slug]/page.tsx`:
```typescript
canonical: `/mosque/${mosque.slug}`
```

Because `mosque.slug` is the sole identifier in the URL:
- Record A ("Al-Ansar Mosque", San Diego, CA) has canonical: `https://usmosquefinder.com/mosque/al-ansar-mosque`
- Record B ("Al-Ansar Mosque", Brooklyn, NY) has canonical: `https://usmosquefinder.com/mosque/al-ansar-mosque`
- Record C ("Al-Ansar Mosque", Miami, FL) has canonical: `https://usmosquefinder.com/mosque/al-ansar-mosque`
- Record D ("Al-Ansar Mosque", Chicago, IL) has canonical: `https://usmosquefinder.com/mosque/al-ansar-mosque`

**Classification: `NON-UNIQUE ENTITY CANONICAL`**
Every duplicate verified group collapses distinct physical entities into an identical canonical URL. In total, **60 verified facilities** share only **27 canonical URLs**.

---

### 8. Breadcrumb Analysis

Breadcrumbs on the detail page are derived from the resolved mosque object:
```typescript
const stateConfig = getStateConfig(mosque.stateCode);
const stateSlug = stateConfig?.slug ?? mosque.stateCode.toLowerCase();
const citySlug = slugify(mosque.city);
```

When a user in Chicago clicks "Al-Ansar Mosque" on the Chicago directory page:
- The URL opened is `/mosque/al-ansar-mosque`.
- The resolver loads the San Diego, CA entity.
- The visual and JSON-LD breadcrumb generated is:
  `Home → California → San Diego → Al-Ansar Mosque`
- The user expecting a Chicago mosque is presented with California state and city breadcrumbs.
- The detail page **cannot** represent both entities independently under the `/mosque/[slug]` route pattern.

---

### 9. Structured Data Analysis

On `/mosque/[slug]`, the page injects `generateMosqueSchema(mosque)`.
For any duplicate slug:
- `@type`: `['Mosque', 'PlaceOfWorship']`
- `@id`: `https://usmosquefinder.com/mosque/{slug}#place`
- `name`: Name of the first provider's entity (e.g. San Diego)
- `address`: Street, City, State, ZIP of the first provider's entity
- `geo`: Latitude/Longitude of the first provider's entity

The other physical entities have **no structured data presence** anywhere on the domain. Search engines cannot index their geographic coordinates, addresses, or service hours.

---

### 10. Internal Link Analysis

In `src/components/mosque/MosqueCard.tsx`:
```tsx
<Link href={`/mosque/${mosque.slug}`}>
```

Because mosque cards use `mosque.slug`:
- Card on `/mosques/california/san-diego` links to `/mosque/al-ansar-mosque` → Displays San Diego mosque ✅
- Card on `/mosques/new-york/brooklyn` links to `/mosque/al-ansar-mosque` → Displays San Diego mosque ❌ (Collision)
- Card on `/mosques/florida/miami` links to `/mosque/al-ansar-mosque` → Displays San Diego mosque ❌ (Collision)
- Card on `/mosques/illinois/chicago` links to `/mosque/al-ansar-mosque` → Displays San Diego mosque ❌ (Collision)

**Classification: Internal-Link Entity Collision**
Directory pages for 3 major US cities (Brooklyn, Miami, Chicago) link their users to a California facility.

---

### 11. Severity Classification

**Rating: CRITICAL**

**Factual Reasons:**
1. **Entity Masking:** 33 verified mosque listings are completely inaccessible to users and crawlers because an earlier registered state shadows their slug.
2. **Non-Unique Canonical URLs:** 60 verified entities share 27 canonical URLs, violating search engine entity identity guidelines.
3. **Internal Linking Confusion:** City directory pages link to out-of-state mosque detail pages.
4. **Sitemap Drop-off:** 33 verified facilities are silently dropped from sitemap indexation.
5. **No Route-Level Disambiguation:** `/mosque/[slug]` currently lacks state or city context in the URL to route requests to the correct state provider.

---

### 12. Affected Records

The 30 collision groups encompass 67 public records across all 5 active states:

- **California (CA):** 13 records affected (`al-ansar-mosque`, `al-islam-mosque`, `al-noor-mosque`, `ar-rahman-islamic-center`, `islamic-center`, `makki-masjid`, `masjid`, `masjid-abu-bakr`, `masjid-al-huda`, `masjid-al-noor`, `masjid-hamza`, `masjid-usman`, `muhammad-mosque`)
- **Texas (TX):** 16 records affected (`ahmadiyya-movement-in-islam`, `al-noor-mosque`, `al-rahma-mosque`, `islamic-center-of-quad-cities`, `makki-masjid`, `masjid`, `masjid-abu-bakr`, `masjid-abu-huraira`, `masjid-al-huda`, `masjid-al-ihsan`, `masjid-al-ikhlas`, `masjid-ibrahim`, `masjid-usman`, `mosque`, `muhammad-mosque`, `musalla`)
- **New York (NY):** 15 records affected (`ahmadiyya-movement-in-islam`, `al-ansar-mosque`, `al-farooq-mosque`, `al-ihsaan-mosque`, `al-iman-mosque`, `albanian-american-islamic-center`, `islamic-center`, `masjid`, `masjid-abu-huraira`, `masjid-al-huda`, `masjid-al-ihsaan`, `masjid-al-ikhlas`, `masjid-salam`, `mosque`, `umar-mosque`)
- **Florida (FL):** 11 records affected (`al-ansar-mosque`, `al-ihsaan-mosque`, `al-iman-mosque`, `al-rahma-mosque`, `ar-rahman-islamic-center`, `masjid-abu-bakr`, `masjid-al-ihsaan`, `masjid-al-noor`, `masjid-al-rahman`, `masjid-hamza`, `masjid-ibrahim`, `umar-mosque`)
- **Illinois (IL):** 12 records affected (`al-ansar-mosque`, `al-farooq-mosque`, `al-islam-mosque`, `albanian-american-islamic-center`, `islamic-center-of-quad-cities`, `makki-masjid`, `masjid`, `masjid-al-ihsan`, `masjid-al-rahman`, `masjid-salam`, `musalla`, `masjid` [Mt Prospect])

*Note: All 30 duplicate groups are cross-state collisions. Within individual state datasets, duplicate slug counts are 0, confirming that `normalizeMosqueDataset`'s city/ID suffix logic worked as intended within each single state file.*

---

### 13. Future Remediation Options

Without selecting or implementing any option in this audit phase, the following technical patterns represent viable remediation paths for Phase 4C:

#### Option A: State-Scoped or City-Scoped Entity Route (Hierarchical URL)
- Route pattern: `/mosques/[state]/[city]/[slug]` or `/mosque/[state]/[slug]`
- *Pros:* Fully aligned with the `State → City → Mosque` SEO topical hierarchy. Guarantees geographic context in the route params, allowing `findBySlug(slug, stateCode)` to directly target the correct provider.
- *Considerations:* Requires updating route folder structure and implementing 301 redirects for any already-indexed `/mosque/[slug]` URLs.

#### Option B: Global Slug Normalization at Data Ingestion
- Ensure slugs are unique across the entire national repository by passing a shared global `existingSlugs` set during provider registration, or automatically appending state code to all slugs: `masjid-abu-bakr-oakland-ca` vs `masjid-abu-bakr-houston-tx`.
- *Pros:* Preserves the flat `/mosque/[slug]` URL structure.
- *Considerations:* Changes slug values for colliding entities, requiring 301 redirect mappings for previously generated slugs.

#### Option C: Systematic City & State Suffix Normalization
- Enforce that entity slugs always incorporate city and state: `[name]-[city]-[stateCode]` (e.g. `al-ansar-mosque-brooklyn-ny`).
- *Pros:* Clean, highly descriptive for SEO and users, eliminates ambiguity permanently even as dozens of new states are added.
- *Considerations:* Requires updating the `slugify` logic in `src/lib/data/normalization.ts` and establishing a slug migration strategy.

---

### 14. Validation

The audit performed full regression checks on the unmodified codebase:

- **Tests:** 158 / 158 passed (10 test suites)
- **TypeScript:** PASS (0 errors)
- **ESLint:** PASS (0 warnings)
- **Build:** PASS (65/65 static pages generated successfully)

No production code or dataset files were altered during this audit.

---

### 15. Final Recommendation

**`REQUIRES URL ARCHITECTURE FIX BEFORE PHASE 4C`**

Expanding into national SEO (Phase 4C) with the current entity URL architecture would amplify the collision problem across 50 states, causing hundreds of physical facilities to be overshadowed and dropped from search engines. Resolving entity slug uniqueness is a critical prerequisite for Phase 4C.

---

### 16. Files Changed

- `PHASE4C_PREFLIGHT.md` (Created — Audit Report)
