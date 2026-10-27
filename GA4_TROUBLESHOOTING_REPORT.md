# GA4 Troubleshooting Report — USMosques.com
**Audit Date:** 2026-10-27  
**Auditor:** Antigravity AI  
**Project:** `C:\Users\HP\Desktop\US MOSQUE FINDER`  
**Production URL:** https://usmosques.com/

---

## 1. Overall Diagnosis

> **CONFIRMED ROOT CAUSE — Google Analytics 4 is not installed at all.**

GA4 has never been implemented in this codebase. There is no `gtag.js` script, no `GoogleAnalytics` component, no GTM container, no `G-` Measurement ID, no `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable, and no analytics library in `package.json`. The live production site (`https://usmosques.com/`) confirms this: no GA4 script tag is present anywhere in the rendered HTML.

This is not a configuration error, a broken tag, a consent issue, or a blocked script — **the tracking code simply does not exist**.

---

## 2. Source-Code Inspection Findings

### 2.1 Package Dependencies
**File:** `package.json`

| Finding | Status |
|---|---|
| `@next/third-parties` (Next.js GA4 helper) | Not installed |
| `react-ga4` | Not installed |
| Any other analytics library | None found |

The only Google-related script present is **Google AdSense** (`pagead2.googlesyndication.com`), added directly in `layout.tsx` line 52.

### 2.2 Root Layout
**File:** `src/app/layout.tsx` — 63 lines total

```tsx
// layout.tsx — lines 49–55 (the full <head> content)
<head>
  <script
    async
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6331163447795368"
    crossOrigin="anonymous"
  />
</head>
```

**Finding:** The `<head>` contains only the AdSense script. No `<GoogleAnalytics>` component, no `<Script>` tag loading `gtag.js`, no GTM snippet.

### 2.3 Environment Variables
**Files:** `.env`, `.env.production`

Both files contain exactly **one** variable:
```
NEXT_PUBLIC_SITE_URL=https://usmosques.com
```

There is **no** `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`, or any analytics-related variable. No `.env.example` file exists.

### 2.4 Analytics Component / Hook / Provider Search

A full search of all `.ts`, `.tsx`, `.js`, `.jsx`, and `.mjs` files under `src/` for the following patterns returned **zero matches**:

| Pattern searched | Matches |
|---|---|
| `gtag` | 0 |
| `GoogleAnalytics` | 0 |
| `GoogleTagManager` | 0 |
| `google-analytics` | 0 |
| `googletagmanager.com` | 0 |
| `G-` (Measurement ID prefix) | 0 |
| `GTM-` (GTM container prefix) | 0 |
| `NEXT_PUBLIC_GA` | 0 |
| `send_page_view` | 0 |
| `analytics` (in TS/TSX/JS) | 0 (only a text string in `privacy/page.tsx`) |

### 2.5 Next.js Special Files
- **`middleware.ts`** — Does not exist
- **`instrumentation.ts`** — Does not exist
- **Nested layouts** — None; one root layout only

### 2.6 Content Security Policy
**File:** `next.config.ts`, lines 17–41

The project sets four security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) on all routes. **No `Content-Security-Policy` (CSP) header is configured.** CSP is therefore **not** a blocker.

### 2.7 Privacy Policy Contradiction
**File:** `src/app/privacy/page.tsx`, line 67

```
"We do not use tracking cookies, analytics cookies, or advertising cookies on this site at this time."
```

This statement is currently **accurate** — there is no analytics running. Before implementing GA4, the Privacy Policy must be updated to disclose the use of analytics cookies and Google's data processing.

### 2.8 Git History
```
5dbad07 feat(adsense): add AdSense verification script, ads.txt, trust pages, listing correction links
33170af fix(footer): dynamically render all active states in state directory links
...
854c912 feat(phase-1): Complete Phase 0 audit and Phase 1 foundation for US Mosque Finder
```

No commit in the entire git history mentions `analytics`, `GA4`, `gtag`, or `tracking`. **GA4 was never implemented** — it was not removed by a recent change.

---

## 3. Live-Site Inspection Findings

**URL tested:** `https://usmosques.com/`  
**Date/time:** 2026-10-27T17:44 UTC

| Check | Result |
|---|---|
| HTTP status | 200 OK |
| Hosting platform | Railway (`server: railway-hikari`, `x-railway-request-id`) |
| `gtag.js` present in HTML | NOT PRESENT |
| `googletagmanager.com` present | NOT PRESENT |
| `google-analytics.com` present | NOT PRESENT |
| AdSense script present | PRESENT (`ca-pub-6331163447795368`) |
| `Content-Security-Policy` header | NOT SET (not a blocker) |
| `X-Powered-By` | `Next.js` |

### Script Tags Present on Homepage (complete list)
```html
<script src="/_next/static/chunks/4bd1b696-f785427dddbba9fb.js" async></script>
<script src="/_next/static/chunks/1255-0f12d1d68e0b5948.js" async></script>
<script src="/_next/static/chunks/main-app-05a5fe279f4f6e20.js" async></script>
<script src="/_next/static/chunks/6690-f589614295737e0e.js" async></script>
<script src="/_next/static/chunks/app/layout-c099af485ec465a9.js" async></script>
<script src="/_next/static/chunks/1356-853f784b705afa15.js" async></script>
<script src="/_next/static/chunks/app/page-f84b6d89aec1d359.js" async></script>
<!-- AdSense only — no GA4: -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6331163447795368" crossorigin="anonymous"></script>
<script src="/_next/static/chunks/polyfills-42372ed130431b0a.js" nomodule></script>
```

No GA4 or GTM script is present.

> **Limitation:** Browser console errors, failed network requests, and client-side navigation behaviour could not be verified without real browser automation (Puppeteer/Playwright). The HTML evidence is conclusive on its own: GA4 has zero chance of firing because the script is absent.

---

## 4. Relevant File Paths and Line Numbers

| File | Line(s) | Significance |
|---|---|---|
| `src/app/layout.tsx` | 49–55 | Root `<head>` — GA4 must be added here |
| `src/app/layout.tsx` | 1–4 | Imports — no analytics import |
| `package.json` | 13–21 | Dependencies — no analytics package |
| `.env` | 1 | Only `NEXT_PUBLIC_SITE_URL` defined |
| `.env.production` | 1 | Only `NEXT_PUBLIC_SITE_URL` defined |
| `next.config.ts` | 17–41 | Security headers — no CSP set |
| `src/app/privacy/page.tsx` | 67 | States no tracking cookies — must be updated before GA4 |

---

## 5. Measurement ID Configuration Status

| Item | Status |
|---|---|
| `G-` Measurement ID in source code | NOT FOUND |
| `G-` ID in `.env` or `.env.production` | NOT FOUND |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` variable | DOES NOT EXIST |
| Railway env var (remote) | CANNOT VERIFY — owner must check Railway dashboard |

**Owner action required:** Log into the Railway dashboard → your project → Variables tab. There is almost certainly no `NEXT_PUBLIC_GA_MEASUREMENT_ID` variable set there.

> Do not invent or guess a Measurement ID. Obtain the correct `G-XXXXXXXXXX` from Google Analytics 4 Admin → Data Streams → Web → Measurement ID.

---

## 6. Page-View Event Configuration

| Check | Status |
|---|---|
| Initial page-view on hard load | NO — no script, no event |
| Client-side navigation page-view | NO — no script, no event |
| `gtag('event', 'page_view', ...)` calls | NONE in codebase |
| Route-change listener | NOT IMPLEMENTED |

Because Next.js 15 App Router does **not** automatically send `page_view` hits on client-side navigation, the fix must handle both the initial load and route changes. The `@next/third-parties` package handles this automatically.

---

## 7. Consent Settings and Filters

### Consent Management
- No Consent Management Platform (CMP) is implemented.
- No `gtag('consent', 'default', ...)` call exists.
- No consent banner is present on the site.

This is a potential compliance risk (GDPR/CCPA) once GA4 is added, but it is **not** the cause of missing data today.

### GA4 Data Filters (owner must verify in GA4 dashboard)
- Internal traffic, developer traffic, and "unwanted events" data filters in GA4 can silently drop all data in standard reports. Review under Admin → Data Filters.

---

## 8. Prioritized Fix Plan

### P0 — Confirmed Tracking Failures (must fix to get any data)

**P0.1 — GA4 is not installed**
- Root cause: No `gtag.js` script or analytics component anywhere in the codebase.
- Fix: Add GA4 via `@next/third-parties` (Next.js 15 official method). Handles initial load AND App Router client-side navigation automatically.
- Files to change: `package.json`, `src/app/layout.tsx`

**P0.2 — No Measurement ID is configured**
- Root cause: No `NEXT_PUBLIC_GA_MEASUREMENT_ID` env var exists locally or on Railway.
- Fix: Owner obtains `G-XXXXXXXXXX` from GA4 → adds to `.env`/`.env.production` locally → adds to Railway dashboard Variables → triggers redeploy.

### P1 — Likely Configuration Issues (fix alongside P0)

**P1.1 — Privacy Policy must be updated before GA4 goes live**
- Root cause: `privacy/page.tsx` line 67 states no tracking cookies are used. This will become inaccurate the moment GA4 is deployed.
- Fix: Update privacy policy Section 5 to disclose Google Analytics, cookie types, and opt-out mechanisms.

**P1.2 — Railway environment variable not set**
- Root cause: Production builds on Railway cannot read `.env` files from git. Env vars must be set in the Railway dashboard.
- Fix: Add `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX` in Railway → Variables. Redeploy.

### P2 — Validation and Monitoring (after P0+P1 are deployed)

**P2.1 — Verify with GA4 Realtime report**
- Visit the live site in an Incognito window and check GA4 Realtime within 30 seconds.

**P2.2 — Consider a basic consent banner**
- A cookie-consent notice protects the site legally and allows setting `analytics_storage: 'granted'/'denied'` for GDPR territories.

**P2.3 — No CSP to update**
- The project does not set a CSP header, so no domain allowlisting is needed for GA4 at this time.

**P2.4 — Check for AdSense + GA4 duplication**
- AdSense auto-tagging can inject a lightweight GA signal. Confirm there are no duplicate GA4 signals after deployment.

---

## 9. Owner Checklist — GA4 Dashboard

Verify the following in your Google Analytics account:

- [ ] **1. Correct property selected** — Viewing the GA4 property (not a UA-XXXXXXX Universal Analytics property) for `usmosques.com`.
- [ ] **2. Web data stream URL** — Admin → Data Streams → Web: stream is configured for `https://usmosques.com` (not `http://` or a typo domain).
- [ ] **3. Measurement ID match** — The `G-XXXXXXXXXX` in the Data Stream exactly matches the value deployed in `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
- [ ] **4. Property and stream are active** — Neither is paused, archived, or marked inactive.
- [ ] **5. Realtime report test** — After deploying GA4, open the site in Incognito and check Reports → Realtime within 30 seconds.
- [ ] **6. Reporting date range** — Standard reports can take 24–72 hours to populate. Confirm date ranges cover the post-deployment period.
- [ ] **7. Property timezone** — Admin → Property Settings: timezone matches expected traffic region.
- [ ] **8. Data filters** — Admin → Data Filters: no Internal Traffic or Developer Traffic filter is set to **Active** mode that would silently exclude all visits.
- [ ] **9. Consent settings** — Admin → Data Collection and Modification → Data Collection: Google signals and basic measurement are enabled.
- [ ] **10. DebugView scope** — Only use DebugView during explicit debug sessions (not to confirm production tracking).

---

## 10. Minimum Safe Code Changes Required

> **STOP — Do not implement these without owner approval.**

### Step 1 — Get the Measurement ID
Log into GA4 Admin → Data Streams → Web → copy the `G-XXXXXXXXXX` Measurement ID.

### Step 2 — Add environment variable
```
# Add to .env and .env.production:
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 3 — Install package
```bash
npm install @next/third-parties
```

### Step 4 — Update `src/app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';   // ADD THIS
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

// ... metadata unchanged ...

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6331163447795368"
          crossOrigin="anonymous"
        />
      </head>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 selection:bg-brand-100 selection:text-brand-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />  {/* ADD THIS */}
      </body>
    </html>
  );
}
```

### Step 5 — Update Privacy Policy
Update `src/app/privacy/page.tsx` Section 5 to disclose Google Analytics usage.

### Step 6 — Set Railway environment variable
In Railway dashboard → Project → Variables:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID = G-XXXXXXXXXX
```
Trigger a redeploy.

---

## Appendix — Deployment Platform Details

| Item | Finding |
|---|---|
| Hosting platform | Railway |
| Evidence | `server: railway-hikari`, `x-railway-request-id`, `x-railway-edge: cdg1` in HTTP response headers |
| Deployment config file | None (no `railway.toml`, `Dockerfile`, `nixpacks.toml`) |
| Deployment method | Railway auto-detects Next.js; runs `npm run build` + `npm run start` |
| Branch deployed | `master` (local is up to date with `origin/master`) |
| Env vars in production | Must be set manually in Railway Variables UI — NOT read from committed `.env` files |
| Critical gap | Even if GA4 code is added to source, production build will have a blank Measurement ID until the Railway variable is set |

---

*This report contains only verified findings and clearly labeled hypotheses. No code has been modified. No deployment has been made. Awaiting owner approval to proceed with any fix.*
