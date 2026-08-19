# Weekend Plan — Aug 19, 2026 status

Rewritten to show only what's left. Everything previously listed as done (`staging` reset, `685-tiered-enrollment` merge, `invoicing-work` merge, `external-learning-links` rebase/merge/renumber, the BEN-1517 admin cutover) has been verified merged into `origin/staging` and is dropped from this list — see git/GitHub verification below each remaining item and Section 2 for full project state.

---

## 1. Do this, in this order

**1. Finish the E2E test checklist on `685-tiered-enrollment`** (Linear: BEN-1283–1394). Covers Enrollment Prerequisites, Invoicing, and Student Accounts at once.
   - Current count: **112 tickets — 68 Done, 5 Ready to Review, 10 Todo, 29 Backlog.** 44 remaining.

**2. Merge `landing-pages` → `staging`**, if you want those 4 pages (Continuing Education, Career Changer, Station Chief, Student Success Story) live this weekend.
   - Confirmed not yet merged: `landing-pages` is 10 commits ahead of `staging`, no PR ever opened. No migration overlap with anything else, should merge clean.

**3. Smoke-test `staging` end to end.**
   - Should include the admin cutover (BEN-1517, merged via PR #16 on Aug 19) since it hasn't had a full pass yet — the doc's original click-through only covered Overview, Students, Transactions, Classes, Settings.

**4. Open one PR: `staging` → `main`.** Once merged, apply migrations 16 through 32 to production Supabase manually.
   - Confirmed no PR exists yet (checked `gh pr list --base main`, none open or ever opened from `staging`).
   - Migrations 33–36 (PR #15, admin auth-gap fixes) already merged straight to `main` and are live on production — not part of this batch.
   - Migration 37 (BEN-1516, below) isn't built yet — will need its own manual apply after step 5.

**5. Build BEN-1516 — pay full tuition + registration fee at registration.** Fully planned (exact files, decisions, test plan, done checklist written into the ticket). **Not built yet** — Linear still shows Todo.
   - Migration slot is **37**. Depends on the dynamic-price checkout code already in `staging` (confirmed present).

**6. Build BEN-1515 — student dashboard redesign.** Fully planned, 7 build-ordered sub-issues, each with its own written plan. All still **Backlog/Todo** in Linear — nothing built. Build in this exact order:
   `BEN-1521 → 1522 → 1523 → 1524 → 1525 → 1526 → 1527`
   (1521 is foundational — nothing else can mount the real site navbar into the student area until sign-out lives there instead of the old sidebar. 1522 is the big one: rebuilding the shell itself.)

**7. Close out your two personal certificate tickets:** BEN-1156 (hook up class closing/certificate issuing) and BEN-1155 (use real certificate data). Both still **Backlog**. These are the only genuinely unfinished pieces of Student Accounts & Login outside the dashboard redesign.

**8. Decide what to do with BEN-1518/1519/1520.** These described follow-on work for the original rebase-based admin plan (`admin-layout-migration` → finish component migration → redesign pass → PR/merge). That branch was abandoned and BEN-1517 shipped instead via a from-scratch rebuild (`updated-admin-migrate`) cut over directly into `apps/webapp/app/(platform)/admin`. All three are still sitting in **Backlog**, unchanged — they need a deliberate call (retitle/rescope against the real admin, or cancel) rather than being built as originally written.

**Explicitly out of scope this weekend** (no code exists, don't expect to start): Transactional Emails project entirely (0%, unchanged); the reminder/upsell automation half of Re-engagement & Marketing (BEN-820–830, BEN-692/693); the national-certification-results half of External Integrations (BEN-1080/1081/671, all still Todo/Backlog).

---

## 2. Appendix: what's in each project (current status)

### Enrollment Prerequisites System (Linear: 71.1%, up from 54%)
- **Branch:** `685-tiered-enrollment`, merged into `staging` via step 3 of the prior plan — confirmed: `staging` contains its tip.
- Epics BEN-683, 684, 686, 687 are **Ready to Review**; BEN-685 itself is **Done**.
- Remaining work here is entirely the E2E checklist (Section 1, step 1) — no unbuilt code.

### Invoicing & Registration (Linear: 96.7%, down slightly from 98% — BEN-1516 added new scope)
- **Branch:** `invoicing-work`, merged (no-op, already a strict subset of `685-tiered-enrollment`) into `staging`.
- **BEN-1516** (pay full tuition + fee at registration) is the only unbuilt piece — see Section 1, step 5.
- BEN-1232 (`transactions.invoice_number` generation fix) still shows **Backlog** in Linear, but the fix already shipped as part of `685-tiered-enrollment`'s merge — ticket just needs its status updated, no code to write.
- Closed PR #6 (refund handling) still notes a migration needing manual application before that feature works end-to-end — reread that PR body before touching refunds.

### Student Accounts & Login (Linear: 61.5%, down from 89% — BEN-1515's 7 sub-issues were added as new scope, diluting the %)
- **Branch:** `student-accounts-login`, fully contained inside `685-tiered-enrollment`, already in `staging`.
- Passwordless OTP login, profile self-editing, certificate download — all shipped.
- Remaining: **BEN-1156, BEN-1155** (Section 1, step 7) and all of **BEN-1515/1521–1527** (Section 1, step 6), all still Backlog/Todo.

### External Integrations — Platinum ED & JB Learning (Linear: 52.5%, unchanged)
- **Branch:** `external-learning-links`, merged into `staging` (renumbered migrations 20/21 → 31/32).
- BEN-1190 **Done**. BEN-1189 still **Ready to Review** (not yet actually verified/closed). BEN-1193 (validate links across two class enrollments) still **Todo** — outstanding QA, not code.
- BEN-1080/1081/671 (national cert exam results) — still Todo/Backlog, no branch, out of scope this weekend (unchanged).

### Re-engagement & Marketing Campaigns (Linear: 5.9%, unchanged)
- **Branch:** `landing-pages` — 10 commits ahead of `staging`, not yet merged, no PR opened. See Section 1, step 2.
- Everything else (expiration reminders, post-completion upsell — BEN-820–830, BEN-692/693) still Backlog, no code, out of scope this weekend.

### Admin UI Migration (Linear: 25%, up from 0% — BEN-1517 landed)
- **BEN-1517 is Done** (Aug 19). The original rebase plan (`admin-layout-migration` onto `staging`) was abandoned; a fresh admin UI was built from scratch (`updated-admin-migrate`), wired section-by-section to real staging data, then cut over into `apps/webapp/app/(platform)/admin`, replacing the old admin entirely. Merged via [PR #16](https://github.com/abenson07/midwestea/pull/16) (`1517-admin-cutover` → `staging`), Aug 19.
- Old branches cleaned up: `admin-layout-migration` deleted (local + origin, never merged anywhere). `updated-admin-migrate/`, `apps/admin-preview/`, `demo-export/` deleted as dead weight once copied in. `new-admin-migrate` kept permanently as a recovery checkpoint.
- Follow-up fixes landed on top before merge: Settings > Profile was showing hardcoded demo data instead of the real admin (fixed), two type errors that were breaking the production build (fixed).
- **BEN-1518/1519/1520 remain Backlog, unchanged** — see Section 1, step 8 for why they need a decision rather than direct execution.

### Transactional Emails (Linear: 0%, unchanged)
- No branch, no code anywhere in the repo. Out of scope this weekend.

---

## 3. Appendix: migration number map

| Range | Owner | Status |
|---|---|---|
| 00–15 | already on `main` | shipped |
| 16–19 | certificates / student portal | in `staging`, not yet on `main` |
| 20–23 | refund columns, Stripe invoice columns, discounts, invoice-number fix | in `staging`, not yet on `main` |
| 24–29 | prerequisite catalog, templates, class snapshots, student credentials | in `staging`, not yet on `main` |
| 30 | `allow_prerequisite_review_log_actions` (BEN-868) | in `staging`, not yet on `main` |
| 31–32 | external learning link columns (renumbered from 20/21) | in `staging`, not yet on `main` |
| 33–36 | admin auth-gap RLS fixes (PR #15, `fix/admin-auth-gap`) | **already merged straight to `main` and live on production** |
| 37 | `charge_full_amount_at_registration` on `classes` (BEN-1516) | not built yet — Section 1, step 5 |

Apply 16–32 to production Supabase manually after the `staging` → `main` PR merges (Section 1, step 4). Migration 37 applies once BEN-1516 is built.

---

## 4. Appendix: Linear items from the original planning pass

| ID | Title | Project | Status |
|---|---|---|---|
| BEN-1515 | Redesign student dashboard: 1-column nav + 4-column content grid | Student Accounts & Login | Backlog |
| BEN-1516 | Add class setting to collect full tuition + registration fee at registration | Invoicing & Registration | Todo |
| BEN-1517 | Reconcile admin-layout-migration branch with main line of work | Admin UI Migration | **Done** |
| BEN-1518 | Finish migrating remaining admin pages onto Linear Kit components | Admin UI Migration | Backlog — needs rescope decision |
| BEN-1519 | Redesign outstanding admin pages on the new Linear Kit layout | Admin UI Migration | Backlog — needs rescope decision |
| BEN-1520 | Open PR and merge admin-layout-migration into main | Admin UI Migration | Backlog — needs rescope decision |
| BEN-1521 | Add account avatar + sign-out menu to the site navbar | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1522 | Rebuild student shell: site navbar + breadcrumb + 6-column inset grid | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1523 | Migrate Account Overview into the new shell | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1524 | Migrate Profile into the new shell | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1525 | Migrate Certificates into the new shell | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1526 | Migrate Billing into the new shell | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1527 | Reconcile mobile navigation under the new shell | Student Accounts & Login (sub of 1515) | Todo |

BEN-1516 and BEN-1521–1527 each still carry their full implementation plans (exact files, decisions, test plan, done checklist) written directly into the ticket.

This document was regenerated by checking live git/GitHub state (`gh pr list`, `git merge-base`, branch diffs) and live Linear ticket/project status — not by re-reading the prior version's claims.
