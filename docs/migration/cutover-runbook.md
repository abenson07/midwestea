# Production DNS Cutover Runbook

**Status:** Cutover complete — Jun 2026.

**Prerequisites:** Plans 9–10 complete. Plan 11 (admin redesign) and Plan 12 (confirmation/invoice email) are post-launch.

See [plan-13-cutover.md](plan-13-cutover.md) for full detail.

---

## Done (pre-cutover)

- [x] **Resend** — `midwestea.com` verified in existing account
- [x] **Resend** — `RESEND_API_KEY` + `EMAIL_FROM` on Vercel Production
- [x] **Resend** — Supabase Auth SMTP configured (same API key)
- [x] **Vercel** — Production env vars set (Supabase, Stripe live keys, `STRIPE_WEBHOOK_SECRET`, Resend)
- [x] **Vercel** — `midwestea.com` + `www.midwestea.com` added in Settings → Domains
- [x] **Stripe** — Live webhook endpoint added: `https://midwestea.com/api/webhooks/stripe`

---

## Phase 1 — DNS cutover

- [x] **1.1** Lower DNS TTL to **300s** on records you are about to change
- [x] **1.2** Vercel → Settings → Domains → copy A/CNAME records for `midwestea.com` + `www`
- [x] **1.3** At domain DNS host, point `midwestea.com` + `www` to Vercel (keep Resend SPF/DKIM/DMARC records)
- [x] **1.4** Wait for propagation
- [x] **1.5** Verify: `curl -I https://midwestea.com/` → **200**, Vercel headers
- [x] **1.6** Verify: `https://www.midwestea.com` works

---

## Phase 2 — Merge + deploy

- [x] **2.1** Merge `staging` → `main`
- [x] **2.2** Confirm Production deployment is live on `main`

---

## Phase 3 — Stripe cleanup

- [x] **3.1** Disable/delete old **Webflow Cloud** webhook endpoint in Stripe

---

## Phase 4 — Supabase auth URLs (after DNS is live)

- [x] **4.1** Site URL: `https://midwestea.com`
- [x] **4.2** Redirect URLs: `https://midwestea.com/admin/**`, `http://localhost:3000/admin/**`
- [x] **4.3** Remove obsolete Webflow Cloud redirect URLs

---

## Phase 5 — Verify

- [x] **5.1** Homepage on production domain
- [x] **5.2** `/admin/login` — OTP email delivers
- [x] **5.3** Live Stripe purchase (small real charge or agreed test)
- [x] **5.4** Enrollment + transaction rows in Supabase
- [x] **5.5** Legacy redirects:
  - `/app/*` → new paths
  - `/dashboard/*` → `/admin/*`
  - `/app/checkout/details` → correct destination

---

## Phase 6 — Webflow teardown

- [x] **6.1** Remove Webflow Cloud app deployments (checkout, webapp, student, instructor)
- [x] **6.2** Remove Webflow custom code scripts from Designer
- [x] **6.3** Cancel/downgrade Webflow hosting if marketing is fully on Vercel

---

## Phase 7 — 48h monitoring

- [x] Vercel logs — no 5xx spike
- [x] Stripe webhook delivery — 100%
- [x] Resend delivery healthy
- [x] Google Search Console — no 404 crawl spike
- [x] No enrollment failures in Supabase logs

---

## Post-launch backlog

- [ ] Transfer Resend login to Kyle (email/password in account settings)
- [ ] Plan 12 — confirmation + invoice emails
- [ ] Plan 11 — admin panel redesign

---

## Rollback

If critical issues arise within the cutover window:

1. Revert DNS to Webflow Cloud (TTL is low)
2. Re-enable Webflow Cloud webhook in Stripe temporarily
3. Document incident and fix before re-attempting cutover
