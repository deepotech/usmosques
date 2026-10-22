# USMosques.com — Production Deployment Checklist (Phase B)

**Target Domain**: [https://usmosques.com/](https://usmosques.com/)  
**Document Type**: Pre-Deployment & Post-Deployment Checklist (Planning Only — No Automated Deployment)  
**Date**: October 22, 2026

---

> [!IMPORTANT]
> **OPERATIONAL GUARD**: This document is an actionable checklist for the site owner. Do **NOT** execute Git push, Git commit, or deployment commands automatically. Deployment must be triggered intentionally by the authorized site operator.

---

## Pre-Deployment Verification Checklist

Before pushing any changes to production, complete each of the following manual confirmations:

### 1. Owner Review of Legal & Contact Copy
- [ ] Review `/privacy` content locally (`http://localhost:3000/privacy`) to confirm data handling disclosures are acceptable.
- [ ] Review `/terms` content locally (`http://localhost:3000/terms`) to confirm directory disclaimers and limitation of liability.
- [ ] Review `/contact` content locally (`http://localhost:3000/contact`) to confirm contact channels and mailto explanation.
- [ ] Verify that the contact email `dounia.elmarradi@gmail.com` is active, accessible, and monitored for incoming listing reports.

### 2. Local Quality & Build Verification
Execute all four verification commands locally to ensure zero build regressions:
- [ ] **Unit & Integration Tests**:
  ```bash
  npm test
  # Expected: 18 test files passed (100%), 331 tests passed (100%), Exit Code: 0
  ```
- [ ] **TypeScript Typecheck**:
  ```bash
  npm run typecheck
  # Expected: tsc --noEmit completes with 0 errors, Exit Code: 0
  ```
- [ ] **ESLint Code Quality**:
  ```bash
  npm run lint
  # Expected: No ESLint warnings or errors, Exit Code: 0
  ```
- [ ] **Production Next.js Build**:
  ```bash
  npm run build
  # Expected: All 2,707 static pages compile successfully, Exit Code: 0
  ```

### 3. File Diff Inspection
- [ ] Run `git status` and `git diff` to verify only authorized trust, footer, sitemap, and test files are staged:
  * Modified:
    * `src/app/about/page.tsx` (Removed "ad-free directory")
    * `src/app/sitemap.ts` (Added 3 legal routes)
    * `src/components/layout/Footer.tsx` (Added About & Legal column)
    * `src/app/mosque/[slug]/page.tsx` (Added listing correction link)
    * `src/components/state/StateDirectoryView.tsx` (Added state-level correction link)
    * `src/components/state/StateCityView.tsx` (Added city-level correction link)
    * `src/lib/data/normalization.ts` (Added safe `sanitizeMosqueName`)
    * `tests/domain-migration.test.ts` (Updated sitemap invariant to 2,525)
    * `tests/phase6-state-activation.test.ts` (Updated sitemap invariant to 2,525)
  * New:
    * `src/app/privacy/page.tsx`
    * `src/app/terms/page.tsx`
    * `src/app/contact/page.tsx`
    * `tests/phase-a-trust-pages.test.ts`
    * `tests/phase-b-trust-improvements.test.ts`
- [ ] Confirm that raw datasets in `data/raw/` and root `.json` files remain completely untouched.

---

## Deployment Execution (To Be Performed by Site Owner)

The deployment pipeline uses GitHub integration linked to the Railway hosting edge:
* Remote repository: `https://github.com/deepotech/usmosques.git`
* Deployment branch: `main` (Railway automatically triggers a production build upon receiving commits on `main`).

When the owner is ready to deploy, run:

```bash
# 1. Stage the authorized changes
git add src/ tests/

# 2. Commit with standard semantic message
git commit -m "feat(adsense): implement trust pages, footer navigation, and listing correction links"

# 3. Synchronize both master and main branches to trigger Railway deployment
git push origin master
git push origin master:main
```

---

## Post-Deployment Live Verification (HTTP Checks)

After the Railway edge build completes (~2–3 minutes), perform live HTTP checks against the production domain `https://usmosques.com/`:

### 1. Route Status & Content Checks
- [ ] **`https://usmosques.com/privacy`**:
  - Must return `HTTP 200 OK`.
  - Must display title: *"Privacy Policy | US Mosque Finder"*.
  - Must display contact email: `dounia.elmarradi@gmail.com`.
  - Must NOT contain any `[OWNER:` tags.
- [ ] **`https://usmosques.com/terms`**:
  - Must return `HTTP 200 OK`.
  - Must display title: *"Terms of Use | US Mosque Finder"*.
  - Must link to `/contact` and `dounia.elmarradi@gmail.com`.
  - Must NOT contain any `[OWNER:` tags.
- [ ] **`https://usmosques.com/contact`**:
  - Must return `HTTP 200 OK`.
  - Form action must point to `mailto:dounia.elmarradi@gmail.com`.
  - Must display clear notice that submission uses local email client.
  - Test prefill: `https://usmosques.com/contact?mosque=Daly%20City%20Musalla` must pre-populate the Mosque Name input.
- [ ] **`https://usmosques.com/about`**:
  - Must return `HTTP 200 OK`.
  - Must NOT contain the phrase *"ad-free directory"*.
- [ ] **Global Footer on Homepage (`https://usmosques.com/`)**:
  - Must render 4 columns, including "About & Legal".
  - Links to `/about`, `/contact`, `/privacy`, and `/terms` must all be functional.
- [ ] **Mosque Detail Page (`https://usmosques.com/mosque/east-plano-islamic-center`)**:
  - In the "Listing Data Transparency" box, verify the link *"Suggest an update or report closed facility"* appears and correctly links to `/contact?mosque=...`.
- [ ] **Sitemap (`https://usmosques.com/sitemap.xml`)**:
  - Must return `HTTP 200 OK`.
  - Must contain `<loc>https://usmosques.com/privacy</loc>`.
  - Must contain `<loc>https://usmosques.com/terms</loc>`.
  - Must contain `<loc>https://usmosques.com/contact</loc>`.
  - Total URLs must match **2,525**.
- [ ] **Robots Rules (`https://usmosques.com/robots.txt`)**:
  - Must allow root `/` and point to `https://usmosques.com/sitemap.xml`.
  - `/mosque-near-me` must return `<meta name="robots" content="noindex, follow">`.

---

## Google Search Console & AdSense Submission Checklist

After live verification is confirmed:

1. **Google Search Console**:
   - Submit `https://usmosques.com/sitemap.xml` in Search Console to trigger re-crawling of the new legal and trust URLs.
   - Inspect URL `/privacy`, `/terms`, and `/contact` using the URL Inspection tool to confirm Googlebot can fetch and render them with no errors.
2. **Google AdSense Dashboard**:
   - Log into [Google AdSense](https://adsense.google.com/).
   - Add site: `https://usmosques.com`.
   - Obtain publisher code snippet (`ca-pub-XXXXXXXXXXXXXXXX`).
   - Add verification script to `src/app/layout.tsx`.
   - In AdSense console, navigate to **Privacy & messaging > GDPR** and enable Google's certified consent message for European visitors.
   - Submit site for review.

> [!NOTE]
> **AdSense Acceptance Reminder**: Passing this deployment checklist resolves all technical and policy blockers identified in audits. However, final AdSense approval is determined independently by Google's automated systems and human reviewers based on overall traffic quality, organic search footprint, and inventory value.
