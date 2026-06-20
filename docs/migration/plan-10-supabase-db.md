# Plan 10 — Migrate Supabase to new project (paid)

**Status:** Placeholder — detailed plan TBD after Plans 1–9 are complete.

**Goal:** Move from the current shared Supabase project (used by live Webflow + staging Vercel) to a **new paid Supabase project** with a clean production boundary.

## Why (draft)

- Staging and production today share one database — test checkouts can write real rows.
- Moving to paid removes free-tier pause/keepalive concerns.
- Cutover is a chance to separate “legacy Webflow era” data from the new Vercel-only stack.

## Likely scope (to be planned later)

- [ ] Provision new Supabase project (paid tier)
- [ ] Export / migrate schema (`supabase/migrations/`) and data (classes, students, enrollments, transactions, etc.)
- [ ] Update Vercel env vars (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`) for Preview + Production
- [ ] Update Supabase Auth URL config on the **new** project (Site URL + redirects)
- [ ] Point Stripe webhooks / Resend / any other integrations at the new stack
- [ ] Validation window on staging against new DB before switching production DNS
- [ ] Decommission or archive old Supabase project after cutover

## Cron / daily-log keepalive

The Vercel cron at `/api/cron/daily-log` (and legacy `apps/cron-worker/`) exists only to ping the DB so **free-tier** projects stay active. On a **paid** plan this is **probably unnecessary** — Plan 10 should decide whether to remove `vercel.json` crons and delete the cron route/worker.

## Prerequisites

- Plans 1–9 complete (or production cutover done on current DB, then migrate as a follow-up — **decision TBD**)

## Done criteria

_TBD when this plan is written in full._

---
