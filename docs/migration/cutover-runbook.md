# Production DNS Cutover Runbook

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

- [ ] **1.1** Lower DNS TTL to **300s** on records you are about to change
- [ ] **1.2** Vercel → Settings → Domains → copy A/CNAME records for `midwestea.com` + `www`
- [ ] **1.3** At domain DNS host, point `midwestea.com` + `www` to Vercel (keep Resend SPF/DKIM/DMARC records)
- [ ] **1.4** Wait for propagation
- [ ] **1.5** Verify: `curl -I https://midwestea.com/` → **200**, Vercel headers
- [ ] **1.6** Verify: `https://www.midwestea.com` works

---

## Phase 2 — Merge + deploy

- [ ] **2.1** Merge `staging` → `main`
- [ ] **2.2** Confirm Production deployment is live on `main`

---

## Phase 3 — Stripe cleanup

- [ ] **3.1** Disable/delete old **Webflow Cloud** webhook endpoint in Stripe

---

## Phase 4 — Supabase auth URLs (after DNS is live)

- [ ] **4.1** Site URL: `https://midwestea.com`
- [ ] **4.2** Redirect URLs: `https://midwestea.com/admin/**`, `http://localhost:3000/admin/**`
- [ ] **4.3** Remove obsolete Webflow Cloud redirect URLs

---

## Phase 5 — Verify

- [ ] **5.1** Homepage on production domain
- [ ] **5.2** `/admin/login` — OTP email delivers
- [ ] **5.3** Live Stripe purchase (small real charge or agreed test)
- [ ] **5.4** Enrollment + transaction rows in Supabase
- [ ] **5.5** Legacy redirects:
  - `/app/*` → new paths
  - `/dashboard/*` → `/admin/*`
  - `/app/checkout/details` → correct destination

---

## Phase 6 — Webflow teardown

- [ ] **6.1** Remove Webflow Cloud app deployments (checkout, webapp, student, instructor)
- [ ] **6.2** Remove Webflow custom code scripts from Designer
- [ ] **6.3** Cancel/downgrade Webflow hosting if marketing is fully on Vercel

---

## Phase 7 — 48h monitoring

- [ ] Vercel logs — no 5xx spike
- [ ] Stripe webhook delivery — 100%
- [ ] Resend delivery healthy
- [ ] Google Search Console — no 404 crawl spike
- [ ] No enrollment failures in Supabase logs

---

## Post-launch (optional)

- [ ] Transfer Resend login to Kyle (email/password in account settings)
- [ ] Plan 12 — confirmation + invoice emails
- [ ] Plan 11 — admin panel redesign

---

## Rollback

If critical issues arise within the cutover window:

1. Revert DNS to Webflow Cloud (TTL is low)
2. Re-enable Webflow Cloud webhook in Stripe temporarily
3. Document incident and fix before re-attempting cutover
