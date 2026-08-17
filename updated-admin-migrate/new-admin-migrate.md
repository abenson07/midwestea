# `/new-admin-migrate`

Working copy of the new admin UI. Wire it to staging here, one section at a time, then cut over into `apps/webapp` `/admin` when it is ready.

`/admin-preview` is frozen. Do not change it. Come back to it later if needed.

Live admin stays at `apps/webapp` (`http://localhost:3002/admin`). That is the source of truth for behavior until cutover. Do not move this fork into the webapp yet (different Next/React/Tailwind stack).

Related: [existing-admin-requirements.md](./existing-admin-requirements.md) (what live admin already does), [migration-guide.md](./migration-guide.md) (demo UI notes).

---

## Done (2026-08-17)

- Forked every `/admin-preview` route to `/new-admin-migrate`. Same pages and components; only the URL prefix is new. Sidebar and in-app links stay on the fork via `useAdminBasePath`.
- Removed **Inbox** from the fork only (nav, home-view option, route). `/admin-preview/inbox` is unchanged.
- Pointed this app at the **same staging Supabase** as `apps/webapp`. Keys live in `updated-admin-migrate/.env.local` (gitignored). Copy from `apps/webapp/.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Added fork-only clients in `src/lib/staging/`. The shared `src/lib/supabaseClient.ts` stays `null` so `/admin-preview` never hits the network.
- Proved the connection: `GET /api/new-admin-migrate/health` returns `{ ok, studentCount }` (count only, no student rows). Last check: 4 students.

### 0. Shared read layer

- Server-only adapters in `src/lib/staging/`: students (identity + auth email), enrollments, classes (id/code/name/dates), transactions (status + due date).
- GET routes: `/api/new-admin-migrate/students`, `/students/[id]`, `/enrollments`, `/classes`, `/transactions`. No admin login gate yet (fork has none; same as health).
- Health now returns counts for all four tables (still no rows).

### 1. Students — identity only

- `/new-admin-migrate/students` lists real staging people (name, email, first enrolled). Classes and payment stay empty / NA.
- Profile + settings show identity fields (name, email, phone, t-shirt, emergency contact, Stripe id). Save / Delete stay demo toasts.
- Current / Past Due stay empty until step 5. No class links, invoice actions, or live prereq review.
- `/admin-preview` still uses mocks.

Students identity is piped in. Other sections still render demo mocks.

Dev: `updated-admin-migrate` on port 3003 → `http://localhost:3003/new-admin-migrate`.

---

## How to work

Do **one section at a time**. Do not write a giant plan for the whole admin.

A section may look unfinished. That is the point. Students, classes, and invoices share the same tables. If you make Students look “done” (Current, Past Due, class links, invoice actions) you have also taken on Classes and Transactions, then those later sections fight over the data layer.

Rules:

- Shared **read** adapters first (real UUIDs from staging). Reuse them; do not rewrite per page.
- Identity before joins. Class names as **text, not links**, until Classes uses the same IDs.
- Current / Past Due / payment status wait until invoices are readable.
- Do not include void-and-reissue, add-to-class, or class detail inside a Students slice.
- `/admin-preview` stays on mocks.

---

## Order

### 0. Shared read layer (before any page looks real) — done

Server reads against staging, same pattern as live admin (service-role API, not the anon browser client — RLS only lets a user read their own student row).

Minimum:

- Students (identity)
- Enrollments
- Classes (id, code, name, dates — enough to label a class)
- Transactions (enough to know paid / pending / past due later)

No UI migration in this step. Health route already proves the DB is reachable.

### 1. Students — identity only — done

Routes: `/new-admin-migrate/students`, `/students/current`, `/students/past-due`, `/students/[id]`.

**In:** list of real people; profile details and settings (name, email, phone, t-shirt, emergency contact, Stripe id).

**Out:** Current / Past Due being accurate; clicking into a class; invoice actions; prereq review as live data.

Current / Past Due can stay empty or keep mock filters until step 5. Class names as text if you show them at all.

### 2. Classes

Roster and class detail use the same enrollments and class rows. Now class IDs are real UUIDs, so links from a student can exist without 404s.

### 3. Transactions

Same invoices the student profile will eventually show. List, status, mark paid / remind can land here — not in the Students slice.

### 4. Programs / courses / settings

Templates, locations, trainers, prerequisites config. After classes so class-from-template links are real.

### 5. Backfill Students

Turn on Current, Past Due, payment status, profile invoices, and class links. Same adapters as steps 1–3. No new data model.

### 6. Cutover into webapp

When the fork is wired and matches [existing-admin-requirements.md](./existing-admin-requirements.md), replace `apps/webapp/app/(platform)/admin`. Not a `/new-admin-migrate` prefix in production.

---

## Data graph (why the order exists)

```
students
  └── enrollments ── classes ── courses / programs
         └── transactions (invoices)
         └── prerequisite submissions
```

The Students list is already a join: who they are + what they’re in + whether they owe money. Treat that join as step 5, not step 1.
