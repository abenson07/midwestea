# Plan 9 — DNS cutover + decommission Webflow Cloud

**Goal:** Production domain points to Vercel. Webflow Cloud mounts retired.

**Prerequisites:** Plan 8 E2E passed on staging.

## Step-by-step

### 9.1 Production Vercel environment

- Promote staging config to Production in Vercel
- Set production env vars (`pk_live_`, `sk_live_`, production Supabase if separate)
- Add production domain in Vercel → Settings → Domains

### 9.2 DNS

- Point `midwestea.com` (and `www`) to Vercel per Vercel DNS instructions
- Keep TTL low (300s) during cutover window

### 9.3 Production Stripe webhook

- New endpoint: `https://midwestea.com/api/webhooks/stripe`
- Use **live** signing secret in production env
- Disable/delete old Webflow Cloud webhook endpoint

### 9.4 Supabase auth URLs (final step — do not change during staging)

The live site and staging share one Supabase project. **Do not change Site URL or remove old redirect URLs until cutover**, or admin login on the live site can break.

At cutover (after DNS points to Vercel):

1. **Site URL:** `https://midwestea.com`
2. **Redirect URLs** — set to production (add, then remove old Webflow Cloud URLs after verifying):
   - `https://midwestea.com/admin/**`
   - `http://localhost:3000/admin/**` (local dev)
3. **Optional:** Add staging preview URL before cutover only if you need OTP login on staging earlier:
   - `https://<staging-domain>.vercel.app/admin/**`
   - Do **not** change Site URL away from the live domain until cutover day.

### 9.5 Legacy URL redirects (next.config or Vercel)

Ensure these work on production:
- `/app/*` → new paths
- `/dashboard/*` → `/admin/*`
- Old Webflow paths if any differ (audit Webflow sitemap vs Next.js redirects)

### 9.6 Decommission Webflow Cloud

- Remove Webflow Cloud app deployments (checkout, webapp, student, instructor mounts)
- Cancel or downgrade Webflow hosting if marketing fully replaced
- Remove Webflow custom code scripts from Designer (already obsolete)

### 9.7 Post-cutover monitoring (48 hours)

- Vercel Analytics / Logs — 5xx errors
- Stripe webhook delivery dashboard — 100% success
- Resend email delivery
- Spot-check 10 marketing pages + checkout + admin login

## Testing (Plan 9)

**Pre-cutover (staging final):**
- [ ] Full Plan 8 matrix passes one more time on staging

**Cutover window:**
- [ ] `curl -I https://midwestea.com/` → 200, served by Vercel (check headers)
- [ ] `/admin/login` works on production domain
- [ ] Test purchase with live Stripe (small real charge or live test mode decision)
- [ ] Old `/app/checkout/details` redirects correctly

**Post-cutover (24–48h):**
- [ ] Google Search Console — no crawl spike of 404s
- [ ] Stripe webhook delivery 100%
- [ ] No enrollment failures in Supabase logs

## Done criteria
- Production domain on Vercel
- Webflow Cloud fully decommissioned
- Legacy redirects working
- 48h clean monitoring period documented
