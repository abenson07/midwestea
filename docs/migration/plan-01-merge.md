# Plan 1 — Merge into one Next.js app

**Goal:** Single deployable Next.js app in [`apps/webapp`](apps/webapp) with marketing routes at `/`, platform routes unchanged for now.

**Prerequisites:** None. Both apps build independently today.

## Architecture after merge

```
apps/webapp/
  app/
    (marketing)/          ← NEW route group from midwestea-site
      layout.tsx          ← Navigation + Footer + Relume fonts/globals
      page.tsx            ← homepage (replaces webapp redirect-to-dashboard)
      about/page.tsx
      basic-life-support/page.tsx
      ... (36 marketing routes)
    (platform)/           ← NEW route group (optional wrapper, no chrome)
      dashboard/          ← unchanged path for now (Plan 3 renames)
      checkout/
      student/
      instructor/
    api/                  ← unchanged
    layout.tsx            ← minimal root shell (html/body only)
    globals.css           ← merge both globals carefully
  components/
    marketing/            ← move midwestea-site/components/* here
    ... (existing webapp components)
  lib/
    marketing/            ← move midwestea-site/lib/* here
    ... (existing webapp lib)
  public/
    images/               ← merge midwestea-site/public/* (large asset tree)
```

Use `@/` path alias for both; update imports when moving files.

## Step-by-step

### 1.1 Add marketing dependencies to webapp

From [`midwestea-site/package.json`](midwestea-site/package.json), add to [`apps/webapp/package.json`](apps/webapp/package.json):
- `@relume_io/relume-ui`, `@relume_io/relume-tailwind`
- `clsx`, `framer-motion`, `gsap`, `react-icons`, `split-type`

Run `npm install` from repo root.

### 1.2 Merge Tailwind configs

Extend [`apps/webapp/tailwind.config.ts`](apps/webapp/tailwind.config.ts) with Relume preset + MEA tokens from [`midwestea-site/tailwind.config.ts`](midwestea-site/tailwind.config.ts):
- Add `presets: [relumeTailwindPreset]`
- Add `content` paths for `components/marketing/**`, `lib/marketing/**`, Relume UI dist
- Copy `theme.extend` (fonts, colors, borderRadius tokens)

Keep platform pages on plain Tailwind — route-group layouts isolate styles.

### 1.3 Move source files

| From | To |
|------|-----|
| `midwestea-site/app/**/page.tsx` (except root layout/globals) | `apps/webapp/app/(marketing)/**` |
| `midwestea-site/app/**/layout.tsx` (per-route layouts) | same path under `(marketing)/` |
| `midwestea-site/components/*` | `apps/webapp/components/marketing/*` |
| `midwestea-site/lib/*` | `apps/webapp/lib/marketing/*` |
| `midwestea-site/hooks/*` | `apps/webapp/hooks/marketing/*` |
| `midwestea-site/public/*` | `apps/webapp/public/*` (merge, dedupe) |
| `midwestea-site/middleware.ts` | **Do not move yet** (contains debug code; handle in Plan 5) |
| `midwestea-site/lib/redirects.mjs` | `apps/webapp/lib/marketing/redirects.mjs` |

Update all `@/components/...` imports in moved files → `@/components/marketing/...`
Update all `@/lib/...` → `@/lib/marketing/...`

### 1.4 Create route-group layouts

**Root layout** [`apps/webapp/app/layout.tsx`](apps/webapp/app/layout.tsx): strip to bare `<html><body>{children}</body></html>`.

**Marketing layout** `app/(marketing)/layout.tsx`: port from [`midwestea-site/app/layout.tsx`](midwestea-site/app/layout.tsx) — fonts, Navigation, Footer. **Omit `DebugRuntimeProbe`** (Plan 5).

**Platform layout** `app/(platform)/layout.tsx`: passthrough `{children}` only.

Move existing routes:
- `app/dashboard/` → `app/(platform)/dashboard/`
- `app/checkout/` → `app/(platform)/checkout/`
- `app/student/`, `app/instructor/` → `app/(platform)/...`
- Delete `app/page.tsx` redirect stub — marketing homepage takes `/`

### 1.5 Merge next.config

Port redirects from [`midwestea-site/next.config.mjs`](midwestea-site/next.config.mjs) into [`apps/webapp/next.config.ts`](apps/webapp/next.config.ts):

```typescript
async redirects() {
  return [
    ...programRedirects, // from lib/marketing/redirects.mjs
    { source: '/course-gallery', destination: '/courses', permanent: true },
    // etc.
  ];
}
```

Keep `basePath: '/app'` **unchanged for now** — Plan 2 removes it. Merge first so Plan 2 has one config to edit.

### 1.6 Fix tsconfig paths

Ensure [`apps/webapp/tsconfig.json`](apps/webapp/tsconfig.json) `@/*` resolves new marketing paths.

### 1.7 Retire midwestea-site folder

After merge verified: add README pointer in `midwestea-site/README.md` ("merged into apps/webapp") or delete folder in Plan 5. Do **not** delete until build passes.

## Testing (Plan 1)

```bash
# From repo root
cd apps/webapp && npm run build
```

**Automated checks:**
- [ ] `npm run build` exits 0
- [ ] Build output lists marketing routes (`/`, `/about`, `/basic-life-support`, etc.)
- [ ] Build output still lists `/dashboard/*`, `/checkout/*`, `/api/*`

**Manual dev-server checks** (`npm run dev`):
- [ ] `http://localhost:3000/app/` → marketing homepage (basePath still active)
- [ ] `http://localhost:3000/app/about` → about page with nav/footer
- [ ] `http://localhost:3000/app/dashboard/login` → admin login still loads
- [ ] `http://localhost:3000/app/checkout/details?classID=TEST` → checkout page loads (may fail API until env set — OK)
- [ ] Spot-check 3 course pages + `/programs` + `/policies`
- [ ] Verify Relume styles render (fonts, MEA red, layout spacing)
- [ ] Verify admin pages do NOT show marketing nav/footer

**Regression:** Compare 2 pages side-by-side with standalone `midwestea-site` dev server before deleting.

## Done criteria
- Single `apps/webapp` build includes all 36 marketing routes + platform routes
- No import errors; assets load from `/app/images/...` (basePath still on)
- `midwestea-site/` no longer required to run the site

---
