# PHASE 5 — PRODUCTION LAUNCH CHECKLIST (UPDATED POST DOMAIN MIGRATION)
## US Mosques Directory (usmosques.com)

This checklist is for the human operator / DevOps engineer deploying US Mosques to production following the domain migration from `usmosquefinder.com` to `usmosques.com`.

---

### 1. Pre-Deployment Build Verification
- [x] All automated tests pass (`npm test` -> 257/257 PASS)
- [x] TypeScript compiler passes (`npm run typecheck` -> 0 errors)
- [x] ESLint passes (`npm run lint` -> 0 errors, 0 warnings)
- [x] Production build passes (`npm run build` -> 1,548 static pages)
- [x] Raw datasets untouched (`data/raw/*` intact, SHA256 verified)

---

### 2. Hosting & Environment Variables
- [x] Set `NEXT_PUBLIC_SITE_URL` to `https://usmosques.com` (no trailing slash).
- [ ] Set Node.js runtime version to 18.x, 20.x, or 22.x LTS on production hosting platform.
- [ ] Verify build command is set to `npm run build`.
- [ ] Verify start command is set to `npm run start`.

---

### 3. DNS, SSL & Legacy Domain Redirections
- [ ] Confirm valid SSL/TLS certificate installed for `usmosques.com` and `www.usmosques.com` (HTTPS enforced).
- [ ] Configure automatic HTTP to HTTPS 301 redirection at edge / Cloudflare / CDN.
- [ ] Configure canonical domain redirection (`https://www.usmosques.com/*` -> `https://usmosques.com/*` with HTTP 301).
- [ ] Point legacy DNS for `usmosquefinder.com` and `www.usmosquefinder.com` to production edge / Next.js app.
- [ ] Verify Next.js host-based 301 redirects preserve full paths and query strings:
  - `https://usmosquefinder.com/` -> 301 -> `https://usmosques.com/`
  - `https://usmosquefinder.com/mosques/:state` -> 301 -> `https://usmosques.com/mosques/:state`
  - `https://usmosquefinder.com/mosques/:state/:city` -> 301 -> `https://usmosques.com/mosques/:state/:city`
  - `https://usmosquefinder.com/mosque/:slug` -> 301 -> `https://usmosques.com/mosque/:slug`
- [ ] Verify security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).

---

### 4. Post-Deployment Verification (Smoke Tests on New Domain)
- [ ] Check `https://usmosques.com/` returns HTTP 200 and loads verified counts (1,379 verified).
- [ ] Check `https://usmosques.com/robots.txt` returns HTTP 200 with sitemap pointing to `https://usmosques.com/sitemap.xml`.
- [ ] Check `https://usmosques.com/sitemap.xml` returns valid XML with exactly 1,438 canonical URLs.
- [ ] Check `https://usmosques.com/mosque-near-me` has `noindex, follow` meta tag and is absent from sitemap.
- [ ] Check state pages (e.g. `/mosques/california`, `/mosques/texas`) load directory and city cards.
- [ ] Check city pages (e.g. `/mosques/texas/houston`, `/mosques/california/los-angeles`) load mosques and valid schema.
- [ ] Check mosque entity pages (e.g. `/mosque/east-plano-islamic-center`) display verified details and canonical tag pointing to `https://usmosques.com/mosque/east-plano-islamic-center`.
- [ ] Test legacy redirect: `curl -I https://usmosquefinder.com/mosques/texas/houston` returns HTTP 301 to `https://usmosques.com/mosques/texas/houston`.
- [ ] Test mobile menu and location search on a mobile device.

---

### 5. Google Search Console & Domain Cutover
- [ ] Add and verify property for `https://usmosques.com` in Google Search Console (via DNS TXT record).
- [ ] In Google Search Console for the old domain (`https://usmosquefinder.com`), use the "Change of Address" tool to submit the migration to `https://usmosques.com`.
- [ ] Submit new sitemap URL: `https://usmosques.com/sitemap.xml`.
- [ ] Perform URL Inspection on `https://usmosques.com/` and representative URLs, then request indexing.
- [ ] Monitor Search Console Coverage report, Indexing report, and Crawl Stats over the first 30 days for seamless transfer of rankings and signals.
