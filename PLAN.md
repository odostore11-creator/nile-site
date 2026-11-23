# Nile Therapy public website: rebuild plan (2026-11-23)

Goal: a faster, better-looking niletherapy.org on GitHub Pages, with a booking form that feeds the portal,
WITHOUT losing the #1 Google ranking and WITHOUT deleting the old Hostinger site.

## What the live site is today (inventory/, crawled 2026-11-23)
- Hostinger **Website Builder** (no file access). DNS at Hostinger (ns1/ns2.dns-parking.com).
- Canonical host: `https://www.niletherapy.org` (http and bare domain 301 → www). Arabic is the main language (`/`), English under `/en`.
- 18 URLs in `sitemap.xml` (all saved as HTML in `inventory/pages/`, SEO facts in `inventory/seo.json`):
  `/`, `/en`, `/mn-nhn` (about) ↔ `/en/about`, `/testimonials` ↔ `/en/testimonials`, `/hjz-almwaayd` (booking),
  `/neckpain` (article), `/almqalat`, `/almqalat-altbyh`, `/akhr-alakhbar`, `/online-store` + 3 service pages
  (`/kshf-mnzla-w-jlsh-awla-`, `/jlsat-alalaj-altbyaa-llazam-jrahtha`, `/jlsat-alalaj-altbyaa-lamradh-almkh-w-alaasab-...`),
  `/en/resources` + 2 English template blog posts.
- Google Analytics **G-R0FRHE75S3** on every page. No Google verification record in DNS (Search Console may be verified another way, or not set up).
- **No email records (MX)** on the domain: their email is Gmail (niletherapy.egy@gmail.com), so changing DNS can't break email.
- Current DNS (keep for rollback): `@ A 92.113.16.236, 92.113.23.199` · `@ AAAA 2a02:4780:43:d413:cb31:4ad5:66ca:4477, 2a02:4780:45:bc28:81cc:59dd:19d8:58b5` · `www CNAME www.niletherapy.org.cdn.hstgr.net`.
- Problems worth fixing: the English pages are titled "Dr. Abdelrahman Sameh" (template leftovers) with filler blog posts; several pages have no description; the about page has no h1.

## SEO rules for the rebuild
1. **Same URLs, exactly** (no trailing slash). GitHub Pages serves `neckpain.html` at `/neckpain`, so no redirects are needed.
2. Keep each page's main Arabic text and keywords; improve, don't cut. Keep titles close to today's (add a description where missing).
3. Keep: canonical tags, hreflang ar/en pairs, `sitemap.xml`, `robots.txt`, Analytics G-R0FRHE75S3. Add structured data (MedicalBusiness / physiotherapy, Service, Article), image alt texts, a 404 page.
4. Build on a staging address with `noindex` until launch.
5. Launch = only DNS changes for `@` and `www` (no email records exist). Old Hostinger site stays untouched for rollback.
6. After launch: Search Console → submit sitemap, watch the ranking for 2–4 weeks.

## Steps
1. **Build** (new repo `nile-site`): static HTML/CSS/JS, Arabic first + English, lotus logo (teal/mint/snow), mobile first, very fast.
2. **Staging**: `odostore11-creator.github.io/nile-site/` with `noindex`. Omar + founders review.
3. **Booking form → portal**: new Edge Function `submit-booking` (public; honeypot, rate limit, strict validation) creates a patient request in the portal. The patient can share a map pin ("use my location" / pick on map); without a pin the request goes straight to the founders. Consent line. Founders get the existing red alert.
4. **Launch** (needs Omar's go-ahead, done in Hostinger hPanel → DNS):
   `@ A 185.199.108.153 / .109.153 / .110.153 / .111.153`, `@ AAAA 2606:50c0:8000::153 / 8001 / 8002 / 8003`, `www CNAME odostore11-creator.github.io`;
   set the custom domain `www.niletherapy.org` on the repo + Enforce HTTPS; remove noindex.
   Rollback = put the old records back (listed above).
5. **After launch**: Search Console sitemap, check every old URL returns 200, watch rankings.

## Decisions (Omar, 2026-11-23)
- "Online store" = service pages: patients book online and pay cash at the visit. Rebuild as service pages (same URLs), each with "Book this service" → booking form with the service preselected. No online payment.
- Logo: lotus wave (teal / mint / snow). The portal switches to the same teal palette.
- English pages: keep the URLs, rebrand to Nile Therapy, real content mirroring the Arabic pages (replace the two filler posts' content but keep their URLs).
- Search Console: probably not set up (the builder only has its own SEO checklist). Verify the domain with a DNS TXT record at launch, then submit the sitemap.

## LAUNCHED 2026-11-23
- DNS changed in Hostinger: `www CNAME odostore11-creator.github.io`, `@ A 185.199.108-111.153`, `@ AAAA 2606:50c0:8000-8003::153` (TTL 300). Old ALIAS `@ → niletherapy.org.cdn.hstgr.net` and old `www → www.niletherapy.org.cdn.hstgr.net` = rollback.
- Custom domain set on the repo, certificate approved, HTTPS enforced. All 19 sitemap URLs return 200; bare domain 301 → www; canonical + robots correct, no noindex.
- Next: Google Search Console (DNS TXT verification) → submit sitemap; watch rankings 2–4 weeks; keep the Hostinger site for a few weeks.
- Search Console verified (DNS TXT google-site-verification) and sitemap submitted by Omar, 2026-11-23. http→https redirect confirmed.
