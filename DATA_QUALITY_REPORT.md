# Data Quality Report: California Mosque Dataset

**Dataset File:** `California – over 400 mosques.json` (also cloned cleanly to `data/raw/california.json`)  
**Audit Date:** 2026-09-27  
**Engine:** Zod runtime validation & Normalization Pipeline (`src/lib/data/validation.ts`, `src/lib/data/normalization.ts`)

---

## 1. Executive Summary

The California mosque dataset was audited against strict validation rules prior to ingestion. The raw dataset remains 100% untouched and preserved as the source of truth. A pure normalization pipeline transforms the raw records into an immutable, validated domain model.

| Metric | Count | Percentage |
| :--- | :--- | :--- |
| **Total Raw Records** | 401 | 100.0% |
| **Valid Schema Records** | 401 | 100.0% |
| **Invalid Schema Records** | 0 | 0.0% |
| **Valid GPS Coordinates** | 401 | 100.0% |
| **Unique Google CIDs** | 401 | 100.0% |
| **Unique Google Place IDs** | 401 | 100.0% |
| **Records with Image URLs** | 393 | 98.0% |
| **Records with Reviews Count** | 380 | 94.8% |
| **Records with Phone Numbers** | 313 | 78.1% |
| **Records with Official Websites** | 308 | 76.8% |
| **Records with Opening Hours** | 218 | 54.4% |
| **Records with Amenities/Accessibility**| 389 | 97.0% |

---

## 2. Ingestion & Validation Status Breakdown

To prevent publishing non-mosque entities or low-confidence listings, every record is assigned a `dataStatus`:

| Data Status | Count | Description / Policy |
| :--- | :--- | :--- |
| **`verified`** | 368 | Standard recognized mosques and Islamic centers with dedicated prayer facilities and validated locations. |
| **`needs_review`** | 31 | Facilities that share addresses with other organizations (11 addresses), or are primarily cultural foundations / schools requiring manual prayer hall verification. |
| **`excluded`** | 2 | Commercial retail or catering businesses mistakenly categorized with "Mosque" in Google Places (e.g. *Fresh Kabab*, *Maqbool Islamic Clothing*). |

---

## 3. Critical Findings & Normalization Resolutions

### A. Missing City and State (2 Records)
* **Entities:**
  1. `Dawoodi Bohra Al Masjid Al Fakhri, Anjuman-e-Hakimi Bakersfield` (`3852 Akers Rd, Bakersfield, CA 93309`)
  2. `Islamic Society of Downey` (`11022 Old River School Rd, Downey, CA 90241`)
* **Finding:** The raw JSON fields `city`, `state`, and `postalCode` were set to `null`.
* **Resolution:** The normalization layer implemented an automated regex address fallback parser (`parseAddressFallback`) that successfully extracted city, state code (`CA`), and 5-digit ZIP codes without modifying the raw JSON.

### B. Duplicate Coordinates (1 Pair)
* **Coordinates:** `37.509334, -121.971816`
* **Entities:**
  1. `Albrae Street Mosque`
  2. `Islamic Center of Fremont (ICF-Albrae)`
* **Finding:** Both represent the same facility under alternate names.
* **Resolution:** Kept as distinct records with unique URL slugs (`albrae-street-mosque` and `islamic-center-of-fremont-icf-albrae`), flagged for editorial review rather than destructive merging.

### C. Duplicate / Shared Addresses (11 Instances)
* **Notable Clusters:**
  - `1717 S Brookhurst St, Anaheim, CA 92804`: Houses *Masjid Al-Ansar*, *West Coast Islamic Society*, *Alansar Education Center*, and the excluded *Fresh Kabab*.
  - `2111 E Shaw Ave, Fresno, CA 93710`: Houses *Masjid Fresno مسجد Islamic Center* and *Info 2 Islam*.
  - `1755 Catherine St, Santa Clara, CA 95050`: Houses *Masjid Al-Noor* and *Muslim Community Association*.
* **Resolution:** Shared buildings are legitimate in community centers. Entities are maintained individually, with non-mosque businesses excluded and shared facilities marked `needs_review` for clarity.

### D. Complex Opening Hours (166 Distinct Formats)
* **Finding:** Opening hours vary from single windows, split shifts (e.g., `4:30 to 6:30 AM, 12:30 to 10 PM`), 24-hour schedules, to completely missing hours.
* **Resolution:** Implemented multi-slot time parser in `src/lib/geo/timezone.ts`. When hours are missing (45.6% of records), the UI explicitly renders **"Hours not listed"** and never falsely claims "Closed".

### E. Rating & Review Data Integrity
* **Finding:** The raw dataset lacked an aggregate `totalScore` field, but 380 records contained authentic review arrays with individual `stars` ratings.
* **Resolution:** In strict accordance with data rules, ratings are only computed if real stars are present in the review objects. When no reviews exist, ratings remain `undefined` and are omitted from UI and schema. No fake reviews or ratings are generated.
