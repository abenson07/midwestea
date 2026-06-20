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
| `RESEND_API_KEY` | Secret | Transactional email (optional until email testing) |
| `EMAIL_FROM` | Plain | e.g. `noreply@midwestea.com` |
| `NEXT_PUBLIC_BASE_URL` | Plain | `https://<staging-domain>.vercel.app` |
| `CRON_SECRET` | Secret | Random string; Vercel cron auth (optional) |

Optional QuickBooks vars: see [`quickbooks-oauth-setup.md`](quickbooks-oauth-setup.md).

**Do not set** `WEBFLOW_*` variables.

> **Supabase auth URLs (Site URL / redirects):** Leave unchanged during staging so the live Webflow site keeps working. Update at DNS cutover — see [`migration/plan-09-cutover.md`](migration/plan-09-cutover.md).

## 3. Stripe webhook (staging)

Stripe Dashboard → Developers → Webhooks → **Add endpoint** (keep existing Webflow Cloud webhook):

- **URL:** `https://<staging-domain>/api/webhooks/stripe`
- **Events:** `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.created`, `payout.paid`
- Copy signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel (Preview scope)
- Redeploy after setting the secret

## 4. Cron job (optional)

`vercel.json` schedules `/api/cron/daily-log` daily at midnight UTC. Set `CRON_SECRET` in Vercel; the route validates `Authorization: Bearer <CRON_SECRET>`.

## 5. Deploy

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
