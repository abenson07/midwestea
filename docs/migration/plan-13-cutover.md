# Plan 13 — DNS cutover + go live

**Goal:** Production domain points to Vercel. Push staging to `main`, configure production, switch DNS, decommission Webflow Cloud.

**Prerequisites:** Plans 9–10 complete. Plan 11 (admin redesign) and Plan 12 (confirmation/invoice email) are post-launch.

> **This is the only pre-launch plan left.** Keep the existing Resend account; transfer login to Kyle post-cutover if needed. The existing `/admin` panel ships as-is.

## Step-by-step

### 13.1 Merge to main + production Vercel

- Merge `staging` → `main` (or promote tested staging deployment)
- Set **Production** env vars (`pk_live_`, `sk_live_`, production Supabase keys, live webhook secret, Resend, etc.)
- Add production domain in Vercel → Settings → Domains

### 13.2 DNS (inside Vercel)

- Point `midwestea.com` (and `www`) to Vercel per Vercel DNS instructions
- Keep TTL low (300s) during cutover window

### 13.3 Production Stripe webhook

- Endpoint: `https://midwestea.com/api/webhooks/stripe`
- **Live** signing secret in production `STRIPE_WEBHOOK_SECRET`
- Disable/delete old Webflow Cloud webhook endpoint

### 13.4 Resend (existing account)

Keep the **current Resend account** (domain + API key already configured). No account migration at cutover.

**Before DNS cutover:**

1. Confirm `midwestea.com` shows **Verified** in Resend (SPF/DKIM/DMARC already in DNS).
2. Confirm `RESEND_API_KEY` + `EMAIL_FROM` on Vercel Production.
3. Confirm Supabase Auth custom SMTP uses the same API key (`smtp.resend.com`, sender `noreply@midwestea.com`).

**After cutover (optional, not blocking):** Transfer Resend login to Kyle (change account email/password in Resend settings). No DNS or key rotation required unless you choose to rotate keys.

See [`docs/resend-smtp-setup.md`](../resend-smtp-setup.md).

### 13.5 Supabase auth URLs (cutover day only)

Shared DB note: **do not change Site URL until cutover**, or live admin on Webflow era can break.

At cutover (after DNS points to Vercel):

1. **Site URL:** `https://midwestea.com`
2. **Redirect URLs:**
   - `https://midwestea.com/admin/**`
   - `http://localhost:3000/admin/**`
   - Staging preview URL if still needed for OTP testing
3. Remove obsolete Webflow Cloud redirect URLs after verifying production admin login

### 13.6 Legacy URL redirects

Ensure on production:
- `/app/*` → new paths
- `/dashboard/*` → `/admin/*`
- Audit Webflow sitemap vs Next.js redirects

### 13.7 Decommission Webflow Cloud

- Remove Webflow Cloud app deployments (checkout, webapp, student, instructor mounts)
- Cancel or downgrade Webflow hosting if marketing fully replaced
- Remove Webflow custom code scripts from Designer

### 13.8 Post-cutover monitoring (48 hours)

- Vercel Analytics / Logs — 5xx errors
- Stripe webhook delivery — 100% success
- Resend email delivery
- Spot-check marketing pages + checkout + admin login

## Testing

**Cutover window:**
- [ ] `curl -I https://midwestea.com/` → 200, served by Vercel
- [ ] Resend domain verified; `RESEND_API_KEY` on Vercel + Supabase SMTP configured
- [ ] `/admin/login` on production domain (OTP email delivers)
- [ ] Live Stripe purchase (small real charge or agreed approach)
- [ ] Legacy `/app/checkout/details` redirects

**Post-cutover (24–48h):**
- [ ] Google Search Console — no crawl spike of 404s
- [ ] Stripe webhook delivery 100%
- [ ] No enrollment failures in Supabase logs

## Rollback

1. Revert DNS to Webflow Cloud (keep TTL low)
2. Re-enable Webflow Cloud Stripe webhook temporarily
3. Fix and re-attempt cutover

## Done criteria

- Production domain on Vercel (`main` deployed)
- Webflow Cloud decommissioned
- Legacy redirects working
- 48h clean monitoring documented

See also [`cutover-runbook.md`](cutover-runbook.md).
