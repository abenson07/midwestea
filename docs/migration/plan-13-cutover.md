# Plan 13 — DNS cutover + go live

**Goal:** Production domain points to Vercel. Push staging to `main`, configure production, switch DNS, decommission Webflow Cloud.

**Prerequisites:** Plans 9, 10, and 12 complete (or explicitly waived items documented). Plan 11 (admin redesign) is post-launch.

> **This is the last pre-launch plan.** Cutover happens after AEMT, paid Supabase migration, and email work. The existing `/admin` panel ships as-is; the new admin design (Plan 11) follows launch.

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

### 13.4 Resend — client account at cutover {#138-resend--client-account-at-cutover}

Pre-cutover email uses a **personal** Resend account (Plan 12). At cutover, move to the **client Midwest EA** Resend account:

1. **Client account:** Create or access the Midwest EA Resend account (Kyle / client billing).
2. **Remove domain from personal account** (or accept that only one account can verify `midwestea.com`).
3. **Add domain in client Resend** → Domains → `midwestea.com`.
4. **Update DNS** at the domain host with the **new** records from the client account (DKIM host/value will differ from the personal account):
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DKIM: copy from client Resend dashboard
   - DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@midwestea.com` (unchanged unless client prefers stricter policy)
5. Wait for **Verified** in client Resend dashboard.
6. **Rotate keys everywhere:**
   - New API key in **Vercel** → `RESEND_API_KEY` (Production + Preview if used)
   - Same key in **Supabase** → Authentication → SMTP password
   - Revoke old personal-account API key
7. Smoke-test: admin OTP, confirmation email, Resend delivery logs.

See [`docs/resend-smtp-setup.md`](../resend-smtp-setup.md) and [Plan 12](plan-12-email.md).

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

**Pre-cutover:**
- [ ] Final smoke pass on staging (checkout, admin, AEMT page)

**Cutover window:**
- [ ] `curl -I https://midwestea.com/` → 200, served by Vercel
- [ ] Client Resend account: domain verified, keys rotated (Vercel + Supabase SMTP)
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
