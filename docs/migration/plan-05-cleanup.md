# Plan 5 — Strip debug, test routes, Cloudflare/OpenNext, dead apps

**Goal:** Production-safe codebase. Remove Webflow Cloud deployment artifacts and obsolete apps.

**Prerequisites:** Plans 1–4 complete and building.

## 5.1 Remove debug/agent logging

Delete `#region agent log` blocks and `fetch('http://127.0.0.1:...')` from:
- `apps/webapp/app/api/checkout/create-checkout-session/route.ts`
- `apps/webapp/app/api/checkout/create-invoice/route.ts`
- `apps/webapp/app/api/webhooks/stripe/route.ts`
- `apps/webapp/app/api/test-invoice/route.ts`
- `apps/webapp/lib/quickbooks.ts`
- `apps/webapp/lib/invoices.ts`
- Any moved marketing middleware (if ported — otherwise skip)

Remove from marketing:
- `components/marketing/debug-runtime-probe.tsx`
- Remove import from marketing layout

## 5.2 Remove test/debug API routes

Delete directories:
- `apps/webapp/app/api/test-stripe-fetch/`
- `apps/webapp/app/api/test-stripe-query/`
- `apps/webapp/app/api/test-invoice/`
- `apps/webapp/app/api/test-invoice-query/`
- `apps/webapp/app/api/test-invoice-insert/`
- `apps/webapp/app/api/debug/`
- `apps/webapp/app/api/email-preview/` (unless used for dev tooling — move to script-only)
- `apps/webapp/app/api/webhooks/stripe/test/` (keep main webhook)

Delete admin test pages:
- `admin/add_class_test/`
- `admin/modal-styling/`
- `admin/test/`

## 5.3 Remove Cloudflare / OpenNext / Webflow Cloud artifacts

Delete files:
- `apps/webapp/wrangler.jsonc`, `open-next.config.ts`
- `apps/webapp/scripts/fix-manifest.js`
- `apps/webapp/webflow.json`
- Same for `apps/checkout`, `apps/student`, `apps/instructor` if not deleting whole apps

Remove from [`apps/webapp/package.json`](apps/webapp/package.json):
- `@opennextjs/cloudflare`, `wrangler`, `@webflow/webflow-cli`
- Scripts: `preview`, `webflow:*`
- Remove `&& node scripts/fix-manifest.js` from build script

Remove from root [`package.json`](package.json): `webflow:*` scripts and `@webflow/webflow-cli`

## 5.4 Drop Webflow CMS sync

Remove or stub:
- [`apps/webapp/lib/webflow.ts`](apps/webapp/lib/webflow.ts) — delete
- [`apps/webapp/lib/webflowFieldMappings.ts`](apps/webapp/lib/webflowFieldMappings.ts) — delete
- `webflow-api` dependency
- Sync calls in:
  - `app/api/classes/create/route.ts`
  - `app/api/classes/[id]/update/route.ts`
  - `app/api/classes/[id]/delete/route.ts`
  - `app/api/classes/[id]/sync-webflow/route.ts` — delete entire route
  - `admin/classes/[id]/page.tsx` — remove "Sync to Webflow" button
- Scripts: `apps/webapp/scripts/check-webflow-fields.ts`, `compare-webflow-fields.ts`, `create-classes-collection.ts`, `check-classes-collection-fields.ts`
- `apps/webapp/public/webflow-class-selector.js`
- [`webflow-scripts/`](webflow-scripts/) directory

Remove `WEBFLOW_*` from env docs; ensure [`.env`](apps/webapp/.env) secrets are in `.gitignore` (never commit tokens).

## 5.5 Delete obsolete apps

Remove entire directories (after confirming nothing imports from them):
- [`apps/checkout/`](apps/checkout/)
- [`apps/admin/`](apps/admin/)
- [`apps/student/`](apps/instructor/)
- [`apps/instructor/`](apps/instructor/)
- [`midwestea-site/`](midwestea-site/) (merged in Plan 1)

Update root workspaces if needed; run `npm install` to clean lockfile.

## 5.6 Remove repo cruft (optional but recommended)

- Root `invoices_export_*.csv`
- `add_stripe_payment_links.sql`, `update_classes_stripe_payment_links.sql` → move to `supabase/` or `scripts/`
- `.DS_Store` entries in gitignore (already there)

## 5.7 Add `not-found.tsx`

Create `apps/webapp/app/(marketing)/not-found.tsx` — port from migration doc [`404.md`](midwestea-site/docs/migration/404.md) or simple branded 404.

## 5.8 Redirect template routes

Add to next.config redirects (production only):
- `/course-template` → `/courses`
- `/program-template` → `/programs`
- `/program-gallery` → `/programs`
- `/order-confirmation` → `/purchase-confirmation/general` (if order-confirmation was dev template)

## Testing (Plan 5)

**Automated:**
- [ ] `npm run build` passes without `fix-manifest.js`
- [ ] Grep for `127.0.0.1:7244`, `127.0.0.1:7574` → zero in apps/
- [ ] Grep for `opennextjs`, `wrangler`, `WEBFLOW_API` in apps/webapp source → zero (except migration docs)
- [ ] `npm run build` in deleted apps should fail (dirs gone)

**Manual:**
- [ ] Create class in admin → succeeds without Webflow sync error
- [ ] `/api/test-stripe-fetch` → 404
- [ ] Random URL `/foo-bar` → custom 404 page
- [ ] `/course-template` redirects to `/courses`

## Done criteria
- Clean production build with no debug telemetry
- No Webflow/Cloudflare deploy deps
- Obsolete apps removed from repo

---
