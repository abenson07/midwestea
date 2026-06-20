# Plan 10 — Migrate to paid Supabase project

**Status:** `pending`

**Goal:** Move from the current shared Supabase project (live Webflow + staging Vercel) to a **new paid Supabase project**. Confirm Stripe, Vercel, webhooks, and admin still work end-to-end against the new database.

**Prerequisites:** Plan 9 (AEMT) complete.

## Why

- Staging and production today share one database — test rows mix with live data.
- Paid tier removes free-tier pause / keepalive concerns.
- Clean boundary before cutover (Plan 13).

## Scope

- [ ] Provision new Supabase project (paid tier)
- [ ] Apply schema (`supabase/migrations/`) to new project
- [ ] Migrate data: programs, classes, students, enrollments, transactions, waitlist, admins, etc.
- [ ] Update Vercel env vars (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`) for Preview + Production
- [ ] Update Stripe webhook destination unchanged (URL stays same; DB writes go to new project)
- [ ] Re-point any other integrations (Resend logs, cron, etc.)
- [ ] Validation on **staging** against new DB:
  - [ ] Admin login
  - [ ] Active class lookup / register buttons
  - [ ] One test checkout (course or program) → enrollment + transactions
  - [ ] Webhook delivery 200
- [ ] Document rollback plan (keep old project read-only until cutover)

## Cron / daily-log keepalive

`/api/cron/daily-log` exists to ping the DB on **free-tier** projects. On paid Supabase, **likely remove** `vercel.json` crons and the cron route/worker during this plan.

## Done criteria

- Staging runs fully on new paid Supabase project
- Stripe webhook + checkout verified against new DB
- Old project archived or kept read-only until Plan 13
- Env vars documented for Production (Plan 13)
