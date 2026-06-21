# Plan 10 — Migrate to paid Supabase project

**Status:** `in_progress`

**Goal:** Move from the current shared Supabase project (live Webflow + staging Vercel) to a **new paid Supabase project**. Confirm Stripe, Vercel, webhooks, and admin still work end-to-end against the new database.

**Prerequisites:** Plan 9 (AEMT) complete.

## Why

- Staging and production today share one database — test rows mix with live data.
- Paid tier removes free-tier pause / keepalive concerns.
- Clean boundary before cutover (Plan 13).

## Env vars (dual-project workflow)

During Plan 10 the app keeps using **unprefixed** Supabase vars (old project). Migration scripts use **`MIGRATION_`** prefixed vars for the new project.

Copy template from [`apps/webapp/.env.example`](../../apps/webapp/.env.example):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Old project (source) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Old project |
| `SUPABASE_SERVICE_ROLE_KEY` | Old project |
| `MIGRATION_NEXT_PUBLIC_SUPABASE_URL` | New paid project (target) |
| `MIGRATION_NEXT_PUBLIC_SUPABASE_ANON_KEY` | New paid project |
| `MIGRATION_SUPABASE_SERVICE_ROLE_KEY` | New paid project |
| `MIGRATION_SUPABASE_ACCESS_TOKEN` | New project — Management API (optional but recommended) |

Put the same Supabase blocks in **both**:

- `apps/webapp/.env.local` — Next.js dev
- `.env.local` (repo root) — `npm run` migration scripts

Validate before migration work:

```bash
npm run migration:check-env
```

## Scope

- [x] Provision new Supabase project (paid tier)
- [x] Apply schema to new project (full backup/restore from old)
- [x] Migrate data: programs, classes, students, enrollments, transactions, waitlist, admins, auth.users
- [ ] Configure new project Auth redirect URLs (staging + localhost only — not production Site URL until Plan 13)
- [ ] Validation on **staging** against new DB (local first, then Vercel Preview)
- [ ] **End of Plan 10:** switch Vercel **Preview** env vars to new Supabase keys (Production stays on old DB until Plan 13)
- [ ] Remove daily-log cron (`vercel.json` + route) — not needed on paid tier
- [ ] Document rollback plan (keep old project read-only until cutover)

## Migration order

1. Fill `MIGRATION_*` vars in `.env.local` (both locations) → `npm run migration:check-env`
2. **Schema + data:** Supabase Dashboard backup from old project → restore into new (simplest path to match exactly). Repo `supabase/migrations/` only covers incremental tables (logs, admins, email_logs, etc.) — not the core courses/classes schema.
3. Run repo migrations against **target:** temporarily point unprefixed vars at new project, or use Management API with `MIGRATION_*` URL + token
4. Recreate admin Auth users on new project if not included in restore
5. Smoke test locally (still on old vars for app, or swap unprefixed for full local test)
6. Switch Vercel Preview `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY` to new project values
7. Redeploy staging → run Plan 8-style checklist (admin, register buttons, checkout, webhook 200)

## Stripe

Webhook URL stays the same on staging. No Stripe key changes — only DB writes go to the new project after env swap.

## Cron / daily-log keepalive

`/api/cron/daily-log` exists to ping the DB on **free-tier** projects. On paid Supabase, **remove** `vercel.json` crons and the cron route/worker during this plan.

## Done criteria

- Staging (Vercel Preview) runs fully on new paid Supabase project
- Stripe webhook + checkout verified against new DB
- Old project archived or kept read-only until Plan 13
- Production env vars documented for Plan 13 (swap unprefixed keys on cutover day)

## Deferred to Plan 13

- Production Vercel env vars → new Supabase
- Supabase Site URL → `https://midwestea.com`
- Retire old Supabase project
