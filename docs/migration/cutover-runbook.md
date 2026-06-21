# Production DNS Cutover Runbook

**Prerequisites:** Plans 9, 10, and 12 complete. Plan 8 E2E passed on staging. Plan 11 (admin redesign) is post-launch.

See [plan-13-cutover.md](plan-13-cutover.md) for full detail.

## Pre-cutover

- [ ] Plans 9, 10, and 12 done (AEMT, paid Supabase, email)
- [ ] Final smoke pass on staging
- [ ] Merge `staging` → `main`
- [ ] Production env vars prepared (`pk_live_`, `sk_live_`, production Supabase if separate)
- [ ] TTL lowered on DNS records (300s) for cutover window

## 1. Production Vercel environment

- Promote staging config to Production in Vercel
- Set production environment variables
- Add `midwestea.com` and `www.midwestea.com` in Vercel → Settings → Domains

## 2. DNS

- Point `midwestea.com` and `www` to Vercel per Vercel DNS instructions
- Verify propagation: `curl -I https://midwestea.com/` returns 200 with Vercel headers

## 3. Production Stripe webhook

- Add endpoint: `https://midwestea.com/api/webhooks/stripe`
- Use **live** signing secret in production `STRIPE_WEBHOOK_SECRET`
- Disable/delete old Webflow Cloud webhook endpoint

## 4. Resend — move to client account

Pre-cutover: personal Resend account + DNS for `midwestea.com` (Plan 12).

At cutover:

1. Add `midwestea.com` in the **client** Midwest EA Resend account (remove from personal account if needed).
2. Update DNS with **new DKIM** (and any other records) from the client Resend dashboard.
3. Create new API key → update **Vercel** `RESEND_API_KEY` and **Supabase** SMTP password.
4. Revoke personal-account key; test admin OTP + confirmation email.

Full steps: [plan-13-cutover.md §13.4](plan-13-cutover.md#138-resend--client-account-at-cutover).

## 5. Supabase auth (final step — cutover day only)

**While staging runs in parallel with Webflow, leave Supabase auth URLs as-is.**

At cutover:

1. **Site URL:** `https://midwestea.com`
2. **Redirect URLs:** `https://midwestea.com/admin/**`, `http://localhost:3000/admin/**`
3. Remove old Webflow Cloud admin redirect URLs once production admin login is verified
4. (Optional, pre-cutover) Add `https://<staging-domain>.vercel.app/admin/**` only if testing admin OTP on staging — never change Site URL until cutover

## 6. Legacy redirects

Verify on production:

- `/app/*` → new paths (no basePath)
- `/dashboard/*` → `/admin/*`
- `/course-template` → `/courses`
- `/program-template`, `/program-gallery` → `/programs`

## 7. Decommission Webflow Cloud

- Remove Webflow Cloud app deployments (checkout, webapp, student, instructor mounts)
- Cancel or downgrade Webflow hosting if marketing is fully replaced
- Remove Webflow custom code scripts from Designer

## Cutover window checks

- [ ] `curl -I https://midwestea.com/` → 200, served by Vercel
- [ ] `/admin/login` works on production domain
- [ ] Test purchase with live Stripe (small real charge or agreed test approach)
- [ ] Old `/app/checkout/details` redirects correctly

## Post-cutover monitoring (48 hours)

- [ ] Vercel logs — no spike in 5xx errors
- [ ] Stripe webhook delivery dashboard — 100% success
- [ ] Resend email delivery healthy
- [ ] Spot-check 10 marketing pages + checkout + admin login
- [ ] Google Search Console — no crawl spike of 404s
- [ ] No enrollment failures in Supabase logs

## Rollback

If critical issues arise within the cutover window:

1. Revert DNS to Webflow Cloud (keep TTL low)
2. Re-enable Webflow Cloud webhook in Stripe temporarily
3. Document incident and fix before re-attempting cutover
