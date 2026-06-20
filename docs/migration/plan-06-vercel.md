# Plan 6 — Deploy Vercel staging

**Goal:** Staging environment live on Vercel with env vars and Stripe webhook. **Supabase auth URL changes are deferred to Plan 9** so the live Webflow site keeps working.

**Prerequisites:** Plans 1–5 complete.

## Step-by-step

### 6.1 Create Vercel project

```bash
cd apps/webapp
npx vercel link
# Root Directory: apps/webapp
# Framework: Next.js
```

Or via Vercel dashboard: monorepo root = repo root, **Root Directory** = `apps/webapp`.

### 6.2 Environment variables (staging)

Set in Vercel project → Settings → Environment Variables (Preview/Development):

| Variable | Type | Notes |
|----------|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain | |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Plain | `pk_test_...` for staging |
| `STRIPE_SECRET_KEY` | Secret | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret | From Stripe webhook config (step 6.3) |
| `NEXT_PUBLIC_BASE_URL` | Plain | `https://<staging-domain>.vercel.app` |

`RESEND_API_KEY` and `EMAIL_FROM` — **not required for staging deploy.** Deferred to [Plan 8.6](plan-08-e2e.md#86-email-env-vars-deferred--finish-with-invoice-work) (likely with invoice email work; need Resend account access via Kyle or a new free account).

Daily-log cron — deferred to [Plan 10](plan-10-supabase-db.md) (likely unnecessary on paid Supabase).

QuickBooks vars if reconcile feature needed on staging: `QUICKBOOKS_*` per [`docs/quickbooks-oauth-setup.md`](docs/quickbooks-oauth-setup.md)

**Do NOT set** `WEBFLOW_*` vars.

> **Supabase auth (Site URL / redirect URLs):** Do **not** change during staging. The shared Supabase project still serves the live site. Auth URL updates happen in [Plan 9](plan-09-cutover.md) at DNS cutover.

### 6.3 Stripe webhook (staging)

Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://<staging-domain>/api/webhooks/stripe`
- Events: `checkout.session.completed` (and any others your handler expects — check [`apps/webapp/app/api/webhooks/stripe/route.ts`](apps/webapp/app/api/webhooks/stripe/route.ts))
- Copy signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel
- Redeploy after setting secret

### 6.4 Deploy

```bash
cd apps/webapp && npx vercel --prebuilt  # after local build
# or push to staging branch with Vercel Git integration
```

## Testing (Plan 6)

**Automated (CI/local):**
- [ ] `cd apps/webapp && npm run build` passes locally before deploy

**Post-deploy smoke tests:**

```bash
STAGING=https://your-project.vercel.app

# Marketing
curl -s -o /dev/null -w "%{http_code}" $STAGING/           # 200
curl -s -o /dev/null -w "%{http_code}" $STAGING/about      # 200
curl -s -o /dev/null -w "%{http_code}" $STAGING/courses    # 200

# Platform
curl -s -o /dev/null -w "%{http_code}" $STAGING/admin/login # 200
curl -s -o /dev/null -w "%{http_code}" $STAGING/checkout/details # 200 (may need query params)

# API health
curl -s $STAGING/api/health/resend   # check response shape
curl -s $STAGING/api/config          # returns supabase url if still used

# Redirects
curl -s -o /dev/null -w "%{http_code}" $STAGING/dashboard/login  # 308
curl -s -o /dev/null -w "%{http_code}" $STAGING/app/checkout/details # 308

# Purchase confirmation
curl -s -o /dev/null -w "%{http_code}" $STAGING/purchase-confirmation/general # 200
```

**Manual in browser:**
- [ ] Homepage loads with fonts/images on staging domain
- [ ] Admin login page loads (full OTP login deferred until Plan 9 Supabase auth URLs)
- [ ] No mixed-content or 404 on `/_next/static/...` assets
- [ ] Vercel deployment logs show no env var errors

## Done criteria
- Staging URL accessible with all three surfaces: `/`, `/checkout`, `/admin`
- Env vars set; Stripe webhook registered for staging
- Supabase **database** keys in Vercel (unchanged shared project); auth URL cutover in Plan 9

---
