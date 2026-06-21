# Vercel Staging Setup

Deploy `apps/webapp` to Vercel as the monorepo root with **Root Directory** = `apps/webapp`.

## 1. Link the project

```bash
cd apps/webapp
npx vercel link
```

In the Vercel dashboard: Framework = Next.js, Root Directory = `apps/webapp`.

## 2. Environment variables (Preview / Development)

| Variable | Type | Notes |
|----------|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Plain | Supabase project URL (same DB as live site) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Plain | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server-side only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Plain | `pk_test_...` for staging |
| `STRIPE_SECRET_KEY` | Secret | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret | From Stripe webhook (step 3) |
| `NEXT_PUBLIC_BASE_URL` | Plain | `https://<staging-domain>.vercel.app` |

**Plan 12 (email — deferred):** `RESEND_API_KEY`, `EMAIL_FROM` — not needed for checkout E2E. See [`migration/plan-12-email.md`](migration/plan-12-email.md).

**Plan 10:** Daily-log cron — likely remove when moving to paid Supabase; see [`migration/plan-10-supabase-db.md`](migration/plan-10-supabase-db.md).

Optional QuickBooks vars: see [`quickbooks-oauth-setup.md`](quickbooks-oauth-setup.md).

**Do not set** `WEBFLOW_*` variables.

> **Supabase auth URLs (Site URL / redirects):** Leave unchanged during staging so the live Webflow site keeps working. Update at DNS cutover — see [`migration/plan-13-cutover.md`](migration/plan-13-cutover.md).

## 3. Stripe webhook (staging)

Stripe Dashboard → Developers → Webhooks → **Add endpoint** (keep existing Webflow Cloud webhook):

- **URL:** `https://<staging-domain>/api/webhooks/stripe`
- **Events:** `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.created`, `payout.paid`
- Copy signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel (Preview scope)
- Redeploy after setting the secret

## 4. Deploy

Push to the `staging` branch (Git integration) or:

```bash
cd apps/webapp && npm run build && npx vercel
```

## Smoke tests

```bash
STAGING=https://your-project.vercel.app

curl -s -o /dev/null -w "%{http_code}" $STAGING/
curl -s -o /dev/null -w "%{http_code}" $STAGING/about
curl -s -o /dev/null -w "%{http_code}" $STAGING/courses
curl -s -o /dev/null -w "%{http_code}" $STAGING/admin/login
curl -s -o /dev/null -w "%{http_code}" $STAGING/purchase-confirmation/general
curl -s -o /dev/null -w "%{http_code}" $STAGING/dashboard/login   # expect 308
curl -s -o /dev/null -w "%{http_code}" $STAGING/app/checkout/details  # expect 308
```

Or run the automated script:

```bash
STAGING=https://your-project.vercel.app ./scripts/staging-smoke-test.sh
```

If preview deployments use **Deployment Protection** (all checks return 401), either test in the browser while logged into Vercel, disable protection for Preview, or create an **Automation Bypass Secret** in Vercel → Settings → Deployment Protection and run:

```bash
STAGING=https://your-project.vercel.app \
VERCEL_AUTOMATION_BYPASS_SECRET=your-secret \
./scripts/staging-smoke-test.sh
```
