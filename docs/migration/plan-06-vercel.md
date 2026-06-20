# Plan 6 — Deploy Vercel staging

**Goal:** Staging environment live on Vercel with all env vars, Stripe webhook, Supabase auth redirects.

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
| `STRIPE_WEBHOOK_SECRET` | Secret | From Stripe webhook config (step 6.4) |
| `RESEND_API_KEY` | Secret | |
| `EMAIL_FROM` | Plain | e.g. `noreply@midwestea.com` |
| `NEXT_PUBLIC_BASE_URL` | Plain | `https://<staging-domain>.vercel.app` |

QuickBooks vars if reconcile feature needed on staging: `QUICKBOOKS_*` per [`docs/quickbooks-oauth-setup.md`](docs/quickbooks-oauth-setup.md)

**Do NOT set** `WEBFLOW_*` vars.

### 6.3 Supabase auth configuration

In Supabase dashboard → Authentication → URL Configuration:
- Site URL: `https://<staging-domain>`
- Redirect URLs: `https://<staging-domain>/admin/**`, `http://localhost:3000/admin/**`

### 6.4 Stripe webhook (staging)

Stripe Dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://<staging-domain>/api/webhooks/stripe`
- Events: `checkout.session.completed` (and any others your handler expects — check [`apps/webapp/app/api/webhooks/stripe/route.ts`](apps/webapp/app/api/webhooks/stripe/route.ts))
- Copy signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel
- Redeploy after setting secret

### 6.5 Cron worker migration (optional for staging)

Port [`apps/cron-worker/src/index.ts`](apps/cron-worker/src/index.ts) to:
- `apps/webapp/app/api/cron/daily-log/route.ts`
- Protect with `CRON_SECRET` header
- Add `vercel.json`:

```json
{
  "crons": [{ "path": "/api/cron/daily-log", "schedule": "0 0 * * *" }]
}
```

Can defer to post-staging if daily logs not critical.

### 6.6 Deploy

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
- [ ] Admin OTP login works end-to-end on staging
- [ ] No mixed-content or 404 on `/_next/static/...` assets
- [ ] Vercel deployment logs show no env var errors

## Done criteria
- Staging URL accessible with all three surfaces: `/`, `/checkout`, `/admin`
- Env vars set; Stripe webhook registered
- Supabase auth works on staging domain

---
