# USMosques.com — AdSense Pre-Submission Audit (Phase B)

**Target Website**: [https://usmosques.com/](https://usmosques.com/)  
**Project Directory**: `C:\Users\HP\Desktop\US MOSQUE FINDER`  
**Audit Date**: October 22, 2026  
**Auditor**: Antigravity AI (Senior Web Architect & Compliance Engineer)  
**Overall Verdict**: **`NOT READY — ACTION REQUIRED BEFORE SUBMISSION`**  
*(Code implementation is ready for owner review locally, but blocked from AdSense submission due to unreplaced placeholders, un-deployed live status, and missing mosque-level report links).*

---

## 1. Executive Summary & Verdict

Phase A successfully introduced the technical architecture for `/privacy`, `/terms`, `/contact`, updated `/about` copy, expanded `Footer.tsx`, and updated `sitemap.ts`. The local codebase compiles cleanly, with all **17 test suites (320 tests) passing**, zero TypeScript errors, zero ESLint warnings, and all 2,707 static pages generating without fault.

However, an evidence-based audit reveals that **the site is NOT ready for Google AdSense application submission today**.

### Primary Blockers to Submission:
1. **Unreplaced `[OWNER:` Placeholders**: Six visible placeholder tags remain in `src/app/contact/page.tsx`, `src/app/privacy/page.tsx`, and `src/app/terms/page.tsx`. Submitting a site displaying placeholder strings like `[OWNER: Replace this with your real contact email before going live]` triggers an immediate human reviewer rejection under Google's *"Site under construction / Placeholder content"* policy.
2. **Production Site Out of Sync (Un-deployed)**: Because deployment was strictly prohibited in Phase A, the live website (`https://usmosques.com/`) still returns **HTTP 404** for `/privacy`, `/terms`, and `/contact`, still has the contradictory phrase `"ad-free directory"` on `/about`, and lacks legal links in its footer. AdSense reviewers evaluate the live domain, not local builds.
3. **Missing On-Page Listing Feedback Link**: While `/contact?mosque=` was engineered to pre-fill listing reports, mosque detail pages (`/mosque/[slug]`) currently contain **no link or button** directing visitors to report inaccurate hours, closed facilities, or wrong phone numbers.
4. **"Valuable Inventory: Low-Value Content" Vulnerability**: Across 2,411 verified mosques, 62 listings are "sparse" (zero hours, no website, no amenities). Furthermore, 0% of listings have unique editorial descriptions, and all 13 state pages and 96 eligible city pages rely on uniform programmatic text templates. This pattern frequently triggers Google's automated *"Valuable inventory: Low value content"* filter unless strengthened with contextual guidance and community utility.

---

## 2. Confirmed Blockers

Each blocker below is verified from code and live testing:

### Blocker 1: Six Visible Owner Placeholders
* **File & Lines**:
  * `src/app/contact/page.tsx:68`: `action="mailto:[OWNER: Replace this with your real contact email before going live]"`
  * `src/app/contact/page.tsx:160`: `[OWNER: Insert your contact email here]`
  * `src/app/contact/page.tsx:180`: `[OWNER: Insert your privacy contact email here]`
  * `src/app/privacy/page.tsx:96`: `[OWNER: Insert your privacy contact email address here]`
  * `src/app/terms/page.tsx:85`: `[OWNER: insert contact email or link to /contact page]`
  * `src/app/terms/page.tsx:105`: `[OWNER: These terms were drafted as a starting point and should be reviewed by qualified legal counsel...]`
* **Evidence**: Direct code inspection and search match.
* **Why It Matters**: Google AdSense quality raters perform manual spot-checks on trust pages. Visible placeholder brackets or dummy mailto links indicate an incomplete website.
* **Severity**: `CRITICAL (IMMEDIATE REJECTION)`

### Blocker 2: Live Production Disconnect (Phase A Un-deployed)
* **Evidence**: Live HTTP requests to `https://usmosques.com/`:
  * `https://usmosques.com/privacy` -> **HTTP 404**
  * `https://usmosques.com/terms` -> **HTTP 404**
  * `https://usmosques.com/contact` -> **HTTP 404**
  * `https://usmosques.com/about` -> Contains `"ad-free"` (HTTP 200)
  * `https://usmosques.com/sitemap.xml` -> Excludes legal pages
  * Live Footer -> Has no legal column
* **Why It Matters**: Google verifies the live site, not the git workspace. Applying now means Google evaluates a site with no privacy policy or terms.
* **Severity**: `CRITICAL (IMMEDIATE REJECTION)`

### Blocker 3: Mosque Detail Pages Lack "Report an Error / Suggest Update" Link
* **File**: `src/app/mosque/[slug]/page.tsx`
* **Evidence**: Inspection confirms line 363 shows data transparency status, but provides no link to `/contact?mosque=${encodeURIComponent(mosque.name)}`.
* **Why It Matters**: A key AdSense trust signal for directory websites is demonstrable maintenance and community feedback. The backend pre-fill was built in Phase A, but the user interface link is missing.
* **Severity**: `HIGH`

---

## 3. Owner Actions Requiring Real Information

The following items cannot be invented by AI and must be supplied by the site owner:

| Required Item | Intended Destination | Placeholder Reference | Example / Recommended Format |
|---|---|---|---|
| **Primary Contact Email** | `src/app/contact/page.tsx:68, 160` | `[OWNER: Replace this...]` | `contact@usmosques.com` |
| **Privacy Inquiry Email** | `src/app/privacy/page.tsx:96`, `src/app/contact/page.tsx:180` | `[OWNER: Insert your privacy...]` | `privacy@usmosques.com` or `contact@usmosques.com` |
| **Terms Contact Method** | `src/app/terms/page.tsx:85` | `[OWNER: insert contact...]` | Link to `/contact` or email address |
| **Legal Review / Note Removal** | `src/app/terms/page.tsx:105` | `[OWNER: These terms were drafted...]` | Remove placeholder after legal review |
| **Publisher Identity** | `src/app/about/page.tsx`, `src/app/layout.tsx` | N/A | Clarify the operating individual or organization name |

---

## 4. Live-Site Checks vs. Local-Only Checks

A direct comparison between what is currently live on `https://usmosques.com/` versus what is built in the local workspace:

| Page / Feature | Live Production (`https://usmosques.com/`) | Local Workspace Build (`localhost:3000`) | Discrepancy Cause |
|---|---|---|---|
| **`/privacy`** | `404 Not Found` | `200 OK` (Static SSG, 105 kB) | Phase A changes are committed locally, not deployed |
| **`/terms`** | `404 Not Found` | `200 OK` (Static SSG, 105 kB) | Phase A changes are committed locally, not deployed |
| **`/contact`** | `404 Not Found` | `200 OK` (SSR with pre-fill support) | Phase A changes are committed locally, not deployed |
| **`/about` Copy** | Contains `"ad-free directory"` | Cleaned: `"fast, clean, and trustworthy"` | Phase A local edit pending deployment |
| **Footer Navigation** | 3 columns (States, Cities, Brand) | 4 columns (Includes "About & Legal") | Phase A local edit pending deployment |
| **Sitemap Total URLs** | 2,522 URLs | 2,525 URLs (Includes 3 legal routes) | Phase A local edit pending deployment |
| **Robots.txt** | Allows `/`, disallows `/api/` | Allows `/`, disallows `/api/` | Identical (Fully compliant) |
| **13 States Coverage** | 13 states active | 13 states active | Identical (Fully compliant) |
| **Mosque Details (`/mosque/[slug]`)** | `200 OK` for verified | `200 OK` for verified | Identical (Lacks report link on both) |

---

## 5. Content Value & Scaled-Page Risk

### Sample Evaluation Across States, Cities, and Detail Pages

| Level | Route Sampled | Data Metrics / Content Observed | AdSense Risk Assessment | Recommended Action |
|---|---|---|---|---|
| **State** | `/mosques/california` | 399 mosques, 14 eligible city hubs, factual stats, structured breadcrumbs. | Low-to-Medium risk. Accurate and functional, but introductory paragraph is generic boilerplate. | Add a state-specific FAQ section (e.g. Jumu'ah timing in Pacific Time, major community centers) to elevate editorial value. |
| **State** | `/mosques/texas` | 331 mosques, 16 eligible city hubs, Central/Mountain time awareness. | Low-to-Medium risk. Identical introductory phrasing to CA. | Enhance with regional directory context. |
| **State** | `/mosques/georgia` | 134 mosques, 6 eligible city hubs, Eastern time awareness. | Low-to-Medium risk. High utility, uniform template. | Preserve structure; add visitor etiquette notes. |
| **City** | `/mosques/texas/houston` | 72 mosques (39 with hours, 48 phone, 47 website). Rich city hub. | Low risk. Substantial directory depth and unique local data cards. | Maintain current architecture. |
| **City** | `/mosques/new-york/brooklyn` | 103 mosques (65 with hours, 67 phone, 50 website). Dense urban directory. | Low risk. High real-world utility for local Muslim community. | Maintain current architecture. |
| **City** | `/mosques/california/los-angeles` | 21 mosques (16 with hours, 16 phone, 12 website). | Low risk. Sufficient density. | Maintain current architecture. |
| **City** | `/mosques/georgia/atlanta` | 17 mosques (9 with hours, 12 phone, 11 website). | Low risk. Accurate location data. | Maintain current architecture. |
| **City (Threshold)** | `/mosques/florida/tallahassee` | Exactly 5 mosques (3 with hours, 3 phone, 4 website). Minimum threshold. | Medium risk. 5 listings is on the borderline of perceived "thin content" if evaluated in isolation. | Keep threshold at ≥5; ensure related city links remain prominent. |
| **City (Threshold)** | `/mosques/pennsylvania/mechanicsburg` | Exactly 5 mosques (3 with hours, 4 phone, 4 website). | Medium risk. Minimal standalone text (~400 words). | Do NOT index cities below 5 listings. |
| **Mosque (Rich)** | `/mosque/east-plano-islamic-center` | 7-day hours, phone, website, image, amenities, directions, rating. | Very Low risk. High utility, comprehensive facility profile. | Add listing feedback link. |
| **Mosque (Rich)** | `/mosque/al-farooq-mosque-atlanta-ga` | 7-day hours, phone, website, image, 3 amenities, directions. | Very Low risk. High quality. | Add listing feedback link. |
| **Mosque (Medium)** | `/mosque/masjid-ar-rahman` | No regular hours published, but valid phone, website, address, directions. | Low risk. Graceful "Hours Not Listed" fallback handles missing data honestly. | Add listing feedback link. |
| **Mosque (Sparse)** | `/mosque/daly-city-musalla` | No hours, no website, 0 amenities listed. Address and phone only. | High risk if crawled as standalone page. Minimal text (~320 words). | Ensure clear GPS driving directions, parent city links, and "Suggest hours" prompt are prominent. |
| **Mosque (Sparse)** | `/mosque/al-madina-masjid-mosque` | No hours, no phone, no website, 0 amenities. Physical address and coordinates only. | High risk. Thin content profile. | Add prominent community contribution CTA: "Help update this facility's hours or contact info". |

### Content Quality Analysis:
* **Positive Factor**: USMosques.com does **not** scrape fake reviews, fabricate AI prayer schedules, or inject generic 1,000-word SEO filler articles. Every listing reflects verified public records.
* **Vulnerability Factor**: Google's automated AdSense review bots lack human nuance and often equate structured programmatic directories with "thin content". Out of 2,411 verified mosques, 62 listings lack hours, websites, and amenities. Enhancing these pages with clear community utility (such as reporting updates and distance calculations) mitigates this risk without generating fake text.

---

## 6. SEO & Indexation Safeguards Verification

All established data safeguards remain intact:

| Safeguard | Requirement | Verified Status |
|---|---|---|
| **`needs_review` Records** | Must be marked `noindex, follow` and excluded from `sitemap.xml`. | **PASS**: 176 `needs_review` records are excluded from sitemap and carry `<meta name="robots" content="noindex, follow">`. |
| **`excluded` Records** | Must never appear on public routes. | **PASS**: Filtered out at repository level. |
| **`/mosque-near-me`** | Utility page must remain `noindex, follow` and excluded from sitemap. | **PASS**: Verified in code and production. |
| **City Directory Threshold** | Only cities with ≥5 publishable mosques may have indexable landing pages. | **PASS**: Maintained across all 13 states. Non-eligible cities render within state views without thin standalone URLs. |
| **Shared Address Safeguard** | Co-located entities remain flagged as `needs_review`. | **PASS**: Intact across all ingestion pipelines. |
| **Fresno Override** | Specific scoped entity reconciliation for Masjid Fresno vs outreach hotline. | **PASS**: Unit tests confirm Masjid Fresno is verified and co-located hotline is needs_review. |
| **Canonical URLs** | Strict canonical resolution to `https://usmosques.com`. | **PASS**: Verified across all 2,525 canonical routes. |

---

## 7. Technical Verification Results (Local Workspace)

All four validation commands were executed cleanly:

```bash
# 1. Vitest Suite
npm test
# Result: 17 test files passed (100%), 320 tests passed (100%). Exit Code: 0.

# 2. Typecheck
npm run typecheck
# Result: tsc --noEmit passed with 0 errors. Exit Code: 0.

# 3. Linting
npm run lint
# Result: ESLint passed with 0 warnings and 0 errors. Exit Code: 0.

# 4. Production Build
npm run build
# Result: Next.js 15.5.26 production build generated 2,707 static pages. Exit Code: 0.
```

---

## 8. Prioritized Remediation Plan

### 🔴 Priority 0 (Must Fix Before Submitting Application)
1. **Supply Real Owner Information**:
   - Site owner replaces all 6 `[OWNER:` placeholders in `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, and `src/app/contact/page.tsx` with active email addresses and removes legal drafting notes.
2. **Add "Report an Update / Suggest Edit" Link on Mosque Detail Pages**:
   - In `src/app/mosque/[slug]/page.tsx`, add a clear action button or link in the Data Transparency box:
     ```tsx
     <Link
       href={`/contact?mosque=${encodeURIComponent(mosque.name)}`}
       className="inline-flex items-center text-xs font-semibold text-brand-700 hover:text-brand-800 underline"
     >
       Suggest an update or report closed facility →
     </Link>
     ```
3. **Deploy Phase A & Phase B Fixes to Production**:
   - Commit and push to `main` so that `https://usmosques.com/privacy`, `/terms`, and `/contact` return `200 OK` on the live domain.
   - Verify live `sitemap.xml` includes all 2,525 canonical URLs and footer legal links are visible.

### 🟡 Priority 1 (Important — Mitigating "Low-Value Content" Rejection Risk)
1. **Add Informative State FAQs / Guidance**:
   - On State directory views (`StateDirectoryView.tsx`), add a structured FAQ section answering practical visitor questions (e.g. *When is Jumu'ah prayer held?*, *Are women's prayer facilities available?*, *How are listings verified?*).
   - This adds 250–400 words of genuine, high-value editorial context to state hub pages without inventing facts about individual mosques.
2. **Community Update CTA on Sparse Mosque Pages**:
   - For mosques where hours or phone numbers are unlisted, add a helpful community prompt: *"Are you a representative or regular attendee of this facility? Help our community by submitting official prayer times."*
3. **Set Up Google-Certified Consent Management (CMP)**:
   - When the AdSense account is approved, enable Google's free built-in GDPR/TCF consent banner via the AdSense console under **Privacy & messaging**.

### 🟢 Priority 2 (Post-Approval & Account Setup)
1. **Insert AdSense Verification Code**:
   - Once Google issues the publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`), add the script tag to `src/app/layout.tsx`.
2. **Configure `ads.txt`**:
   - Place `ads.txt` in `public/ads.txt` containing the authorized seller record: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`.
3. **Update Build Date in Sitemap**:
   - Update `BUILD_DATE` in `src/app/sitemap.ts` to reflect the active deployment date.

---

## 9. Official Google Policy References

All recommendations are grounded in official Google Publisher Policies and documentation:

1. **Google Publisher Policies — Valuable Inventory**:
   > *"Google-served ads should only be placed on pages that provide substantial value to users. We do not permit ads on screens without publisher content, or on pages with low-value content, template content, or scraped content that provides no added value."*  
   *Source: [Google Publisher Policies: Valuable Inventory](https://support.google.com/publisherpolicies/answer/10047366)*
2. **Google AdSense Terms of Service — Section 8 (Privacy)**:
   > *"You will have and abide by an appropriate Privacy Policy that clearly discloses that third parties may be placing and reading cookies on your users’ browsers, or using web beacons to collect information as a result of ad serving on your website."*  
   *Source: [Google AdSense Terms of Service](https://www.google.com/adsense/new/localized-terms)*
3. **Google EU User Consent Policy & Certified CMP Requirement**:
   > *"Publishers using Google AdSense, Ad Manager, or AdMob must use a Google-certified Consent Management Platform (CMP) that integrates with the IAB Europe Transparency and Consent Framework (TCF v2.2) when serving ads to users in the European Economic Area (EEA), the UK, or Switzerland."*  
   *Source: [Google EU User Consent Policy Help](https://support.google.com/adsense/answer/13554116)*
4. **Google Search Central — Scaled Content Abuse**:
   > *"Scaled content abuse is when many pages are generated for the primary purpose of manipulating search rankings and not helping users... often with little or no original value."*  
   *Source: [Google Search Essentials: Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content)*

---

## 10. Explicit Limitations & Questions for Site Owner

Before Phase B implementation or submission, the site owner must confirm:

1. **Contact Email**: What email address should receive community listing reports and general inquiries?
2. **Privacy Email**: Should privacy inquiries use the same email or a dedicated address (e.g. `privacy@usmosques.com`)?
3. **Publisher / Operator Entity**: What entity or name should be credited in copyright and legal disclosures (e.g., *"US Mosque Finder Team"*, an individual name, or a registered LLC)?
4. **Geographic Ad Targeting**: Does the owner intend to serve ads to European visitors (requiring a GDPR/TCF consent banner) or restrict monetization primarily to North American traffic?

---

*End of Phase B Pre-Submission Audit Report. All local code and datasets remain stable and unmodified.*
