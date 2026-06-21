# Plan 2 — Remove `/app` basePath

**Goal:** App serves at domain root. All API fetches and asset paths work without `/app` prefix.

**Prerequisites:** Plan 1 complete and building.

## Files to change

### Config
- [`apps/webapp/next.config.ts`](apps/webapp/next.config.ts) — remove `basePath` and `assetPrefix` entirely; remove `output: 'standalone'` if only needed for OpenNext (Plan 5)

### Replace `/app` hardcoding (~20 files)

Pattern to eliminate:
```typescript
// BEFORE
const basePath = window.location.pathname.startsWith('/app') ? '/app' : '';
fetch(`${basePath}/api/...`)

// AFTER
fetch('/api/...')
```

**Known files** (grep confirmed):
- [`packages/utils/supabaseClient.ts`](packages/utils/supabaseClient.ts) — `fetchConfig()` basePath logic
- [`apps/webapp/components/Sidebar.tsx`](apps/webapp/components/Sidebar.tsx) — hardcoded `const basePath = '/app'`
- [`apps/webapp/lib/classes.ts`](apps/webapp/lib/classes.ts) (3 occurrences)
- [`apps/webapp/lib/payments.ts`](apps/webapp/lib/payments.ts) (6 occurrences)
- [`apps/webapp/lib/students.ts`](apps/webapp/lib/students.ts) (2 occurrences)
- Checkout pages: `checkout/page.tsx`, `details/page.tsx`, `confirm/page.tsx`, `waitlist/page.tsx`
- Dashboard pages: `courses/[id]`, `programs/[id]`, `classes/[id]`, `students/[id]`, `settings/page.tsx`
- [`apps/webapp/app/api/checkout/create-checkout-session/route.ts`](apps/webapp/app/api/checkout/create-checkout-session/route.ts) — `fullUrl.includes('/app/api')` check
- [`apps/webapp/components/PaymentForm.tsx`](apps/webapp/components/PaymentForm.tsx) — `return_url: .../app/checkout/success`
- [`apps/webapp/public/webflow-class-selector.js`](apps/webapp/public/webflow-class-selector.js) — delete or update (Webflow being dropped)
- [`apps/webapp/app/dashboard/classes/[id]/page.tsx`](apps/webapp/app/dashboard/classes/[id]/page.tsx) — image src `/app/images/Mark_Logo_Blue.svg` → `/images/...`

**Optional helper:** create `lib/apiBase.ts` exporting `''` (empty string) if you want a single place to change later — but prefer plain `/api/...` paths.

### Supabase client simplification

In [`packages/utils/supabaseClient.ts`](packages/utils/supabaseClient.ts):
- Remove runtime `/api/config` fetch workaround if `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are always set on Vercel
- Or keep config route but fetch `/api/config` without basePath prefix

## Testing (Plan 2)

```bash
cd apps/webapp && npm run build && npm run start
# Test against production build, not just dev
```

**Automated:**
- [ ] `npm run build` passes
- [ ] Grep repo for `startsWith('/app')` in apps/webapp + packages/utils → zero results (exclude docs, git history, migration plans)
- [ ] Grep for `basePath: '/app'` → zero in next.config

**Manual (production mode on localhost:3000):**
- [ ] `/` → marketing homepage (NOT redirect to dashboard)
- [ ] `/about`, `/courses` load with correct CSS and images (`/images/...` not `/app/images/...`)
- [ ] `/dashboard/login` → login page, styles intact
- [ ] Open browser DevTools Network tab on dashboard → API calls go to `/api/...` not `/app/api/...`
- [ ] `/checkout/details?classID=<valid-id>` → fetches `/api/classes/by-class-id/...` successfully (with `.env.local` set)
- [ ] Sidebar "Export CSV" hits `/api/export-transactions-csv`

## Done criteria
- No `basePath` in next.config
- All client-side fetches use root-relative `/api/...` paths
- Production build serves all routes at `/`

---
