# Weekend Plan — Aug 14, 2026

Almost none of this summer's work has actually reached `main`. It's all sitting, finished or nearly finished, on separate long-lived branches that were never opened as PRs against `main`. This doc is the working order to fix that and land the three new pieces of work on top. Section 1 is the actual sequence — work top to bottom. Section 2 is reference material (what's in each project/branch) — read it when a step in Section 1 needs more context, not in order.

---

## 1. Do this, in this order

**1. Finish the E2E test checklist on `685-tiered-enrollment`** (Linear: BEN-1283–1394, mostly still Backlog/Todo). This one branch covers Enrollment Prerequisites, Invoicing, and Student Accounts, so this test pass validates all three at once before anything merges.

*(Aug 15 update: `685-tiered-enrollment` — not the unnumbered `tiered-enrollment` — is now the confirmed canonical branch. Verified via full content diff, not just ancestor checks: it's a strict superset of `683-`, `684-`, `686-`, `687-tiered-enrollment`, and the unnumbered `tiered-enrollment`. See `README.md` at the repo root. The other five branches are being kept alive deliberately for now as a safety net, not deleted. Everywhere below that says `tiered-enrollment`, read it as `685-tiered-enrollment`.)*

**2. Reset `staging` to current `main`'s tip.** It's 50 commits behind `main` and tracking nothing real — don't build on top of it as-is.

**3. Merge `685-tiered-enrollment` → `staging`.**
   - This will conflict on `apps/webapp/lib/stripe.ts` and `apps/webapp/app/api/checkout/create-checkout-session/route.ts`. `main` already has commit `2c80a2d` (charges the live `registration_fee` dynamically); `685-tiered-enrollment` was forked before that fix and still has the old stale-`stripe_price_id` version (confirmed directly — this bug was hit live during testing).
   - **Resolve by keeping `staging`'s (the `2c80a2d`/dynamic-price) version.** This matters beyond just this merge — BEN-1516 (step 6) is planned as a direct extension of the dynamic-price code, so getting this backwards breaks that plan too.

**4. Merge `invoicing-work` → `staging`.** This is a no-op — `685-tiered-enrollment` is already a strict superset of it (confirmed: identical content on every shared file). Kept as a step purely for the paper trail.

**5. Rebase `external-learning-links` onto `staging`, renumber its migrations `20`/`21` → `30`/`31`, then merge it in.**
   - Its migrations collide with invoicing's: both branches independently created `20_...sql`/`21_...sql` with different content. Renumbering during the rebase is what avoids a silent collision in production.
   - Do this rebase now, not earlier — you need `staging`'s actual state (post steps 3–4) to know which numbers are free.

**6. Build BEN-1516 — pay full tuition + registration fee at registration.** Fully planned already (full implementation plan is written into the ticket: exact files, decisions, test plan, done checklist).
   - Its plan assumed migration `30` was free; step 5 just claimed `30`/`31`. **Bump BEN-1516's migration to `32`** before writing that SQL file.
   - Depends on step 3's conflict having been resolved correctly (needs the dynamic-price checkout code in place).

**7. Build BEN-1515 — student dashboard redesign.** Also fully planned, broken into 7 build-ordered sub-issues, each with its own written plan. Build in this exact order:
   `BEN-1521 → 1522 → 1523 → 1524 → 1525 → 1526 → 1527`
   (1521 is foundational — nothing else can mount the real site navbar into the student area until sign-out lives there instead of the old sidebar. 1522 is the big one: rebuilding the shell itself.)

**8. Close out your two personal certificate tickets:** BEN-1156 (hook up class closing/certificate issuing) and BEN-1155 (use real certificate data). These are the only genuinely unfinished pieces of Student Accounts & Login.

**9. Merge `landing-pages` → `staging`**, if you want those 4 pages (Continuing Education, Career Changer, Station Chief, Student Success Story) live this weekend. No migration overlap with anything above, should merge clean.

**10. Smoke-test `staging` end to end.**

**11. Open one PR: `staging` → `main`.** Once merged, apply migrations 16 through 32 to production Supabase manually.

**12. Start the admin UI migration reconciliation (BEN-1517).** Rebase `admin-layout-migration` onto `staging` now that it's current. This is a bigger lift than everything else here — treat it as "start this weekend, finish later," not something to close out by Sunday. BEN-1518 (finish component migration) → BEN-1519 (redesign pass) → BEN-1520 (PR + merge) follow after, later.

**Explicitly out of scope this weekend** (no code exists, don't expect to start): Transactional Emails project entirely; the reminder/upsell automation half of Re-engagement & Marketing (BEN-820–830, BEN-692/693); the national-certification-results half of External Integrations (BEN-1080/1081/671).

---

## 2. Appendix: what's in each project

### Enrollment Prerequisites System (Linear: 54% shown, code further along than that)
- **Branch:** `685-tiered-enrollment` — this is the actual canonical branch (corrected Aug 15; the original version of this doc had it backwards). `683-` and `687-tiered-enrollment` are literal git ancestors of it. `684-`, `686-tiered-enrollment`, and the unnumbered `tiered-enrollment` were checked via full content diff and confirmed to have nothing `685-tiered-enrollment` lacks. All five non-`685` branches in this family are being kept alive for now as a safety net rather than deleted — see `README.md`.
- 91 files, ~11,500 lines vs. `main`. Adds migrations 24–29 (prerequisite catalog, template assignment, class snapshots, student credentials).
- BEN-683 through BEN-687 (the five feature epics) are all **Ready to Review**, most sub-tasks Done. BEN-1441 ("post-payment prerequisite flow redesign") has a matching commit (Aug 6) but its Linear status was never updated — code exists, ticket just wasn't moved.

### Invoicing & Registration (Linear: 98%)
- **Branch:** `invoicing-work` — superseded by six individual PRs (#1–#6) that were opened against `invoicing-work` itself (not `main`), then closed once folded in. That's why GitHub shows them "closed, not merged" — not a red flag.
- 56 files vs. `main`. Adds migrations 20–23 (refund columns, Stripe invoice columns, discounts, invoice-number sequence fix).
- BEN-1232 ("fix `transactions.invoice_number` generation") shows Backlog in Linear but the fix already exists — found in a local-only, never-pushed branch (`tiered-invoicing`) and it's already folded into `685-tiered-enrollment`. Not yet in `invoicing-work` itself, but irrelevant once `685-tiered-enrollment` merges.
- Closed PR #6 (refund handling) notes a migration needs manual application before that feature works end-to-end — worth rereading that PR body once you're in this territory.
- **BEN-1516** (new, fully planned) lives here — see Section 1, step 6.

### Student Accounts & Login (Linear: 89%)
- **Branch:** `student-accounts-login` — fully contained inside `685-tiered-enrollment`, so merging `685-tiered-enrollment` covers this too.
- Adds passwordless OTP login, student profile self-editing, certificate download, migrations 16–19.
- BEN-1156 and BEN-1155 (yours — see Section 1, step 8) are the only real gaps.
- **BEN-1515** (new, fully planned, 7 sub-issues) lives here — see Section 1, step 7. The one architectural catch it surfaced: the public site navbar and the student portal's nav are currently two disconnected systems (the portal is its own full-height sidebar shell). Getting "one navbar everywhere" means relocating some shared CSS (fonts, nav height variable) out of the marketing-only section so both areas can reach it — called out explicitly in BEN-1522 so it doesn't get missed mid-build.

### External Integrations — Platinum ED & JB Learning (Linear: 52.5%)
- **Branch:** `external-learning-links`, built on `1190-external-learning-links` (which *is* merged, but only into `external-learning-links`, not `main`).
- Adds admin-managed external learning links per course/class, migrations 20–21 — renumbered to 30–31 in Section 1, step 5.
- BEN-1190 Done, BEN-1189 Ready to Review, BEN-1193 ("validate links across two class enrollments") Todo — outstanding QA.
- BEN-1080/1081/671 (recording/submitting national cert exam results) — Todo/Backlog, no branch found. Not started; out of scope this weekend (see Section 1 footer).

### Re-engagement & Marketing Campaigns (Linear: 6%)
- **Branch:** `landing-pages` — 143 files, mostly new landing-page template components. Covers the 4 "Ready to Review" tickets (Continuing Education, Career Changer, Station Chief, Student Success Story).
- Everything else in this project (expiration reminders, post-completion upsell — BEN-820–830, BEN-692/693) is all Backlog with no code anywhere. Genuinely early; out of scope this weekend.

### Admin UI Migration (new Linear project, created this pass)
- **Branch:** `admin-layout-migration` — real work existed with zero Linear tracking before this weekend. Now tracked with BEN-1517–1520.
- A real-data build of a new admin UI on the "Linear Kit" design system: new sidebar, grouped-table, dropdown, icon-button components, mock data, an `admin-migrate` route. 408 files, ~32,600 lines vs. `main`. Last commit **July 30** — three weeks stale, forked from an old point in the invoicing work (13 commits behind `685-tiered-enrollment`).
- Order once you get to it: BEN-1517 (reconcile/rebase) → BEN-1518 (finish component migration) → BEN-1519 (redesign pass) → BEN-1520 (PR + merge). No PR has ever existed for this branch.

### Transactional Emails (Linear: 0%)
- No branch, no code anywhere in the repo. Two tickets already Canceled (password reset question, cross-project ownership question) — some scoping happened, no build. Out of scope this weekend.

---

## 3. Appendix: migration number map

| Range | Owner | Status |
|---|---|---|
| 00–15 | already on `main` | shipped |
| 16–19 | certificates / student portal (identical across `685-tiered-enrollment`, `invoicing-work`, `student-accounts-login`, `external-learning-links`) | lands with `685-tiered-enrollment` merge (step 3) |
| 20–23 | refund columns, Stripe invoice columns, discounts, invoice-number fix (`invoicing-work` / `685-tiered-enrollment`) | lands with `685-tiered-enrollment` merge (step 3) |
| 20–21 *(original)* → **30–31** | external learning link columns (`external-learning-links`) | renumbered + merged in step 5 — **do not apply the original 20/21 files from this branch, only the renumbered ones** |
| 24–29 | prerequisite catalog, templates, class snapshots, student credentials (`685-tiered-enrollment`) | lands with `685-tiered-enrollment` merge (step 3) |
| **32** | `charge_full_amount_at_registration` on `classes` (BEN-1516) | build in step 6 |

Apply 16–32 to production Supabase manually after the `staging` → `main` PR merges (step 11).

---

## 4. Appendix: new Linear items this pass

| ID | Title | Project | Status |
|---|---|---|---|
| BEN-1515 | Redesign student dashboard: 1-column nav + 4-column content grid | Student Accounts & Login | L1, split into BEN-1521–1527 |
| BEN-1516 | Add class setting to collect full tuition + registration fee at registration | Invoicing & Registration | Fully planned |
| BEN-1517 | Reconcile admin-layout-migration branch with main line of work | Admin UI Migration *(new)* | Backlog |
| BEN-1518 | Finish migrating remaining admin pages onto Linear Kit components | Admin UI Migration | Backlog |
| BEN-1519 | Redesign outstanding admin pages on the new Linear Kit layout | Admin UI Migration | Backlog |
| BEN-1520 | Open PR and merge admin-layout-migration into main | Admin UI Migration | Backlog |
| BEN-1521 | Add account avatar + sign-out menu to the site navbar | Student Accounts & Login (sub of 1515) | Fully planned |
| BEN-1522 | Rebuild student shell: site navbar + breadcrumb + 6-column inset grid | Student Accounts & Login (sub of 1515) | Fully planned |
| BEN-1523 | Migrate Account Overview into the new shell | Student Accounts & Login (sub of 1515) | Fully planned |
| BEN-1524 | Migrate Profile into the new shell | Student Accounts & Login (sub of 1515) | Fully planned |
| BEN-1525 | Migrate Certificates into the new shell | Student Accounts & Login (sub of 1515) | Fully planned |
| BEN-1526 | Migrate Billing into the new shell | Student Accounts & Login (sub of 1515) | Fully planned |
| BEN-1527 | Reconcile mobile navigation under the new shell | Student Accounts & Login (sub of 1515) | Fully planned |

BEN-1516 and BEN-1521–1527 each carry a full implementation plan (exact files, decisions, test plan, done checklist) written directly into the ticket — not just a title. No code has been written for any of them yet.

No code was changed to produce this document.
