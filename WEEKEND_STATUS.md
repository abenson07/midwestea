# Weekend Plan — Aug 19, 2026 status (v3)

Reordered around actual dependencies and rescoped based on the admin cutover having already changed the ground under a couple of these (BEN-1516, BEN-1515). Emails turned out to already exist — found on `landing-pages`, not previously tracked. BEN-1518/1519/1520 are dropped as moot. No code was touched to produce this revision — planning only.

---

## 1. Do this, in this order

**1. Find, confirm, and merge the transactional + re-engagement emails into `staging`. Mark them, and marketing emails, as done.**
   - Source: `landing-pages` branch, commit `9d6f1cf` — "Build 8 transactional emails from Figma as React Email components." New `apps/webapp/emails/` directory: 8 email components plus shared building blocks (`EmailLayout`, buttons, prerequisite/upsell grids), replacing the old flat-HTML approach.
   - **Transactional** — `enrollment-successful.tsx` (class registration confirmed), `waitlist-successful.tsx` (waitlist), `otp-login-code.tsx` (login OTP). "Missing prerequisites" emails are a separate, older system already on `staging` and already merged (`prerequisite-pending-review.html` / `prerequisite-rejected.html`, BEN-865/866) — nothing to do there, just confirm they still read right next to the new set.
   - **Re-engagement / marketing** — `class-reminder.tsx`, `completed-class-followups.tsx`, `rate-class.tsx`, `waitlist-opens.tsx`, `waitlist-spot-opens.tsx`. This is the templates side of the "reminder/upsell automation" work the doc previously called 0%/out of scope — confirm whether any send-trigger automation (cron/scheduling) exists anywhere, or only the templates.
   - **Not a clean merge:** `apps/webapp/emails/` doesn't exist on `staging` at all yet, and `staging`'s old email system has moved on independently since `landing-pages` forked (BEN-865/866, invoice due-date fixes, the tuition `amount_due`/quantity refactor). Expect real reconciliation, not a no-op.
   - Marketing landing pages (the actual web pages, same branch) are **not** part of this step — kept separate, see step 2.

**2. Merge `landing-pages` (the marketing pages only) → `staging`.**
   - 7 pages confirmed, not 4 as previously written: Continuing Education, Career Changer/Adult Learner, Station Chief, Student Success Story (generic) + 3 program-specific variants (EMT, EMR, AEMT).
   - All currently routable only under `/preview-landing-pages/*`. The real content lives in `app/(marketing)/_landing-pages/*`, but the underscore prefix excludes it from Next.js routing — nothing wires these to production URLs yet. Merging gets working preview routes, not live public pages; someone needs to pick real URLs and add nav/routing before this is customer-facing.
   - No migration overlap, should merge clean.

**3. Build BEN-1516 — pay full tuition + registration fee at registration.**
   - **Re-scope before building:** the original plan targeted the old admin UI. The setting lives in class setup/detail, which is now the new Linear Kit admin (BEN-1517 cutover) — confirm exactly where it belongs in the new UI before implementing, don't build against the old layout the ticket describes.
   - Behavior to build and verify: when the setting is on, checkout shows the full amount (tuition + registration fee) and no separate invoice is created. This is also a required test case in step 6.
   - Migration slot **37**, depends on the dynamic-price checkout code already in `staging`. PR into `staging`.

**4. Build BEN-1515 — student dashboard redesign**, all 7 sub-issues, PR into `staging`.
   `BEN-1521 → 1522 → 1523 → 1524 → 1525 → 1526 → 1527`
   - **Design constraint:** this is a separate surface from the new Admin and must NOT follow the new Admin's Linear Kit design system — it's its own look, already discussed separately from this doc. Nail down the actual intended design (check BEN-1521/1522's written plans and whatever design reference exists) before starting.
   - Make sure external-learning-links surface correctly per class in the new shell, and anywhere else they're expected.
   - A better IA scope for this whole redesign is coming shortly — treat the current 1521–1527 plans as provisional until that lands, not final.

**5. Certificates — build the PDF, then close it out (BEN-1156, BEN-1155).**
   - Use `example-certificate.pdf` (repo root) as the design reference. Build on-demand PDF generation as a reusable template, then test generating a few.
   - Once generation works: BEN-1156 (hook up class-closing → certificate-issuing flow) and BEN-1155 (use real certificate data instead of placeholder). Both still Backlog — both close out in this same step, since it's all one "certificates and closing a class" unit of work.

**6. Full end-to-end test in a new test environment.**
   - Runs against a fresh test Supabase database — 6–7 user flows covering everything built across this entire body of work, not a repeat of the old `staging` click-through.
   - Explicitly include: the BEN-1516 checkout behavior from step 3 (full amount, no invoice created); the admin cutover (BEN-1517) end to end — it's only had an Overview/Students/Transactions/Classes/Settings click-through so far, not full flows; the remaining BEN-1283–1394 checklist (44 of 112 still open: 29 Backlog, 10 Todo, 5 Ready to Review) folded in here rather than worked ticket-by-ticket separately.

**7. Open one PR: `staging` → `main`.** The last thing. Once merged, apply migrations 16 through 32 to production Supabase manually.
   - Migrations 33–36 (PR #15) already shipped straight to `main` separately — not part of this batch.
   - Migration 37 (BEN-1516) applies once step 3 is built and tested.

**Dropped from this list:** BEN-1518/1519/1520 (finish/redesign/PR-merge the old `admin-layout-migration`). That plan is moot — the admin migration those tickets describe already happened, just via a different path (from-scratch rebuild + cutover, not the rebase they describe). Worth closing them out in Linear when convenient — not done here, since Linear itself isn't being touched by this doc update.

**Out of scope this weekend:** the national-certification-results half of External Integrations (BEN-1080/1081/671, still Todo/Backlog, no branch).

---

## 2. Appendix: what's in each project (current status)

### Enrollment Prerequisites System (Linear: 71.1%, up from 54%)
- **Branch:** `685-tiered-enrollment`, merged into `staging`.
- Epics BEN-683, 684, 686, 687 are **Ready to Review**; BEN-685 itself is **Done**.
- Remaining work here is entirely the E2E checklist, now folded into Section 1, step 6.

### Invoicing & Registration (Linear: 96.7%, down slightly from 98% — BEN-1516 added new scope)
- **Branch:** `invoicing-work`, merged (no-op, already a strict subset of `685-tiered-enrollment`) into `staging`.
- **BEN-1516** (pay full tuition + fee at registration) is the only unbuilt piece — see Section 1, step 3. Needs re-scoping against the new admin UI, not just building as originally written.
- BEN-1232 (`transactions.invoice_number` generation fix) still shows **Backlog** in Linear, but the fix already shipped as part of `685-tiered-enrollment`'s merge — ticket just needs its status updated, no code to write.
- Closed PR #6 (refund handling) still notes a migration needing manual application before that feature works end-to-end — reread that PR body before touching refunds.

### Student Accounts & Login (Linear: 61.5%, down from 89% — BEN-1515's 7 sub-issues were added as new scope, diluting the %)
- **Branch:** `student-accounts-login`, fully contained inside `685-tiered-enrollment`, already in `staging`.
- Passwordless OTP login, profile self-editing, certificate download — all shipped.
- Remaining: certificates (Section 1, step 5) and the dashboard redesign (Section 1, step 4) — both still Backlog/Todo in Linear.

### External Integrations — Platinum ED & JB Learning (Linear: 52.5%, unchanged)
- **Branch:** `external-learning-links`, merged into `staging` (renumbered migrations 20/21 → 31/32).
- BEN-1190 **Done**. BEN-1189 still **Ready to Review** (not yet actually verified/closed). BEN-1193 (validate links across two class enrollments) still **Todo** — outstanding QA, not code.
- BEN-1080/1081/671 (national cert exam results) — still Todo/Backlog, no branch, out of scope this weekend (unchanged).

### Re-engagement & Marketing Campaigns (Linear: 5.9%, stale — code found this pass)
- **Branch:** `landing-pages` — carries both the marketing pages (Section 1, step 2) and, from the same commit (`9d6f1cf`), the re-engagement email templates (`class-reminder.tsx`, `completed-class-followups.tsx`, `rate-class.tsx`, `waitlist-opens.tsx`, `waitlist-spot-opens.tsx`) covering the reminder/upsell automation this project previously showed as 0% code. Emails merge in step 1; landing pages merge separately in step 2.
- Linear's 5.9% doesn't reflect this — worth a status check once the emails are confirmed and merged, though ticket updates aren't part of this pass.

### Admin UI Migration (Linear: 25%, up from 0% — BEN-1517 landed)
- **BEN-1517 is Done** (Aug 19). The original rebase plan (`admin-layout-migration` onto `staging`) was abandoned; a fresh admin UI was built from scratch (`updated-admin-migrate`), wired section-by-section to real staging data, then cut over into `apps/webapp/app/(platform)/admin`, replacing the old admin entirely. Merged via [PR #16](https://github.com/abenson07/midwestea/pull/16) (`1517-admin-cutover` → `staging`), Aug 19.
- Old branches cleaned up: `admin-layout-migration` deleted (local + origin, never merged anywhere). `updated-admin-migrate/`, `apps/admin-preview/`, `demo-export/` deleted as dead weight once copied in. `new-admin-migrate` kept permanently as a recovery checkpoint.
- Follow-up fixes landed on top before merge: Settings > Profile was showing hardcoded demo data instead of the real admin (fixed), two type errors that were breaking the production build (fixed).
- **BEN-1518/1519/1520 are moot**, not just backlogged — see Section 1's "Dropped from this list." What they describe already happened via the cutover; they weren't updated to reflect that.

### Transactional Emails (Linear: 0%, stale — code found this pass)
- Not actually empty: the same `landing-pages` commit (`9d6f1cf`) that has the marketing pages and re-engagement emails also has 3 transactional email components — `enrollment-successful.tsx`, `waitlist-successful.tsx`, `otp-login-code.tsx`. See Section 1, step 1.
- Not yet on `staging`. Linear's 0% doesn't reflect this — same caveat as Re-engagement & Marketing above.

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
| 37 | `charge_full_amount_at_registration` on `classes` (BEN-1516) | not built yet — Section 1, step 3 |

Apply 16–32 to production Supabase manually after the `staging` → `main` PR merges (Section 1, step 7). Migration 37 applies once BEN-1516 is built.

---

## 4. Appendix: Linear items from the original planning pass

Left as-is — Linear itself isn't being touched by this update, this table is just a reference snapshot.

| ID | Title | Project | Status |
|---|---|---|---|
| BEN-1515 | Redesign student dashboard: 1-column nav + 4-column content grid | Student Accounts & Login | Backlog |
| BEN-1516 | Add class setting to collect full tuition + registration fee at registration | Invoicing & Registration | Todo |
| BEN-1517 | Reconcile admin-layout-migration branch with main line of work | Admin UI Migration | **Done** |
| BEN-1518 | Finish migrating remaining admin pages onto Linear Kit components | Admin UI Migration | Backlog — moot, see Section 1 |
| BEN-1519 | Redesign outstanding admin pages on the new Linear Kit layout | Admin UI Migration | Backlog — moot, see Section 1 |
| BEN-1520 | Open PR and merge admin-layout-migration into main | Admin UI Migration | Backlog — moot, see Section 1 |
| BEN-1521 | Add account avatar + sign-out menu to the site navbar | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1522 | Rebuild student shell: site navbar + breadcrumb + 6-column inset grid | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1523 | Migrate Account Overview into the new shell | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1524 | Migrate Profile into the new shell | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1525 | Migrate Certificates into the new shell | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1526 | Migrate Billing into the new shell | Student Accounts & Login (sub of 1515) | Todo |
| BEN-1527 | Reconcile mobile navigation under the new shell | Student Accounts & Login (sub of 1515) | Todo |

BEN-1516 and BEN-1521–1527 each still carry their full implementation plans (exact files, decisions, test plan, done checklist) written directly into the ticket — both need a re-scoping pass per Section 1, steps 3 and 4, before being built as originally written.
