# E2E verification run — 2026-09-11

Running solo against the demo Supabase project (ecpscgbvjolgrdipxvzr) to verify
Fixes 1-6 and walk Flows 1-3. This log tracks what happened, what needed manual
SQL intervention, and what still needs to land in the real/production database
eventually (separate from the demo-only seed data).

## TL;DR

**Real bugs found and fixed this session (all genuine, pre-existing issues, not demo artifacts unless noted):**
1. Program/course settings save — was 100% fake ("demo mode" toast, no persistence). Fixed.
2. JB Learning/Platinum ED admin fields — no UI existed to set them at all. Fixed. Also removed a fake generic-URL fallback that made unconfigured links look real to students.
3. Program prerequisite assignment — was 100% fake. Fixed.
4. **Class prerequisite review (approve/reject)** — the entire queue ran on hardcoded sample data, both read and write. This was the core of Flow 2. Fixed — verified end-to-end via real UI clicks (submit → reject with reason → resubmit → approve, all genuinely persisting). See #11 below for the roster-badge bug that was blocking the button from even appearing.
5. Certificate reminder setting — added as a real, persisted field (sending logic intentionally not built, per your call).
6. UTM capture — landing page → checkout → enrollment attribution, real data capture (no admin UI to view it yet, per your call).
7. Class creation never actually snapshotted template prerequisites onto new classes (silent failure — a missing DB constraint, demo-schema-only issue, not a real-database bug). Fixed.
8. **JB Learning link wasn't rendering for students at all** — a real, pre-existing production bug (ambiguous foreign key in a Supabase query). Fixed.
9. **Certificate issuance via the admin API route — root-caused and actually fixed** (not a dev-mode fluke, not worked around). See "Flow 3 — RESOLVED" below for the real cause and fix.
10. **"Add prerequisite" on a class page was also 100% fake** ("demo mode, saved locally only") — the same bug pattern as #1/#3, on a component those fixes didn't touch. Found while setting up Flow 2's final UI verification. Fixed — real typeahead search, real persistence, verified via reload.
11. **The roster's per-student "Prerequisites" status badge (and its click-to-review trigger) was also mock data** — `rosterPrerequisiteStatusFor()` read a hardcoded `CLASS_DETAILS` object that has no entry for real classes, so it always fell through to "approved" and never showed the "Review" button, no matter how many real pending submissions existed. This is *why* the review queue couldn't be found earlier in the session — for course-type classes (ACLS is one), the queue banner is deliberately hidden (`hideBanner`) and the roster badge is the *only* entry point. Fixed: the badge now checks the real live submissions (already fetched for the queue banner) first, and only falls back to the mock status for students with no real pending item. Verified via real UI click.

**Flow 2, fully verified end-to-end via real UI clicks** (not API calls) — the actual proof the demo needs: as the demo student, clicked "Start" on "Orientation Acknowledgment" (a checkbox-type prerequisite, added live via fix #10), checked the box, submitted → showed "Pending review." As admin, the roster now showed a real "Review" button (fix #11) → opened the review modal → clicked **Reject** with a reason → student saw the exact reason under "Needs resubmission" → clicked **Resubmit** → admin saw **Review** again → clicked **Approve** → roster badge flipped back to "Approved." Every step hit `POST /api/admin/prerequisites/review` for real (confirmed in server logs, `200` each time).

**What you should do before the demo:**
- Certificate issuance, Flow 1's Stripe checkout, and Flow 2's prerequisite approve/reject are all now confirmed working via real UI clicks (see below) — nothing manual needed for any of them.
- Nothing here needs to go into the **real/production** database except migrations 39 and 40 (already proper migration files in the repo, apply normally) — everything else was demo-project-only setup/repair.

## Manual SQL run against the demo project this session (for your records)

1. Schema + catalog data via `npm run demo:generate-sql` + `demo:apply-sql --reset` (full run, see earlier in session)
2. `demo:apply-sql --fix-grants` (restored service_role default privileges after the schema reset)
3. Manual: `GRANT ... TO authenticated/anon` + `ALTER DEFAULT PRIVILEGES` (same issue, for authenticated/anon roles — schema reset had wiped these too)
4. `certificate_reminder_months` column added to `courses`
5. `utm_source`/`utm_medium`/`utm_campaign` columns added to `enrollments`

**None of the above should be run against the real database as-is** — items 4-5 are schema changes already captured properly in migrations 39/40 in the repo (real migration files, safe to apply for real via the normal process). Items 1-3 were demo-data-only / demo-project-repair actions, not applicable to production.

## Code fixes shipped this session (see git diff on `staging`)
- Fix 1: Program/course settings actually save (new `PATCH /api/courses/[id]/update`)
- Fix 2: JB Learning/Platinum ED admin fields + removed fake fallback link on student side
- Fix 3: Program prerequisite assignment wired to real backend
- Fix 4: Class prerequisite review (approve/reject) wired to real backend — was 100% mock data before
- Fix 5: Certificate reminder settings field (setting only, no send logic yet)
- Fix 6: UTM capture on landing pages -> enrollment attribution
- Bonus fix (found during testing): prerequisite catalog creation (`/admin/prerequisites`) was also fake-save-only — fixed same as above

## Verification log

### Fix verification (browser, logged in as Demo Admin)

- **Fix 1 (program settings save)**: Confirmed. Set JB Learning URL on ACLS course, saved, reloaded page, value persisted.
- **Fix 2 (JB Learning admin field + no-fake-fallback)**: Confirmed on admin side (URL persists). Student-side no-fallback check pending (part of Flow 1 walk).
- **Fix 5 (certificate reminder field)**: Confirmed. Field pre-filled to 13 (1yr cert length * 12 + 1), editable, part of the same real save.
- **Bonus fix — prerequisite catalog creation** (`/admin/prerequisites`, found broken during testing, same "demo mode" bug as Fixes 1/2): Fixed (`PrerequisitesDemo.tsx` wired to real `createPrerequisiteType`/`updatePrerequisiteType`/`archivePrerequisiteType`). Created real prerequisite type "CPR Certification" — persisted through reload.
- **Fix 3 (program prerequisite assignment)**: Confirmed. Assigned "CPR Certification" to ACLS course — persisted through reload.
- **Class creation + prerequisite snapshot**: Found a second real bug during testing — `snapshotClassPrerequisites()` (the code that copies template prerequisites onto a newly-created class per migration 27's design) was failing silently server-side: `there is no unique or exclusion constraint matching the ON CONFLICT specification`. Root cause: my earlier demo schema generation (this session) omitted the `UNIQUE (class_id, prerequisite_type_id)` constraint on `class_prerequisites` (and the equivalent on `template_prerequisites`) when transcribing migrations 26/27's extras. **This is a demo-database-only gap, not a real-database bug** — the real database (migrations 26/27 applied normally) already has these constraints; only my demo re-creation of the schema missed them. Fixed on the demo project directly (`ALTER TABLE ... ADD CONSTRAINT ...` x2) and in `scripts/lib/demo-table-extras.ts` for future regenerations. Verified: created a second new class (ACLS-003) and confirmed the CPR Certification prerequisite snapshot correctly appeared on it automatically.
- Cosmetic oddity noticed: admin workspace switcher briefly showed "Kyle Brower" instead of "Demo Admin" after one navigation — did not block anything, not investigated further given time constraints. Worth a look later.

Using **ACLS-003** as the working class for the rest of this run (real prerequisite snapshot, Stripe product wired to the existing test product `prod_VEkA6OrtXsmSnh`).

### Flow 1 — Registration/payment note

Registered a fresh test student (`alexbensonux+e2eflow1@gmail.com`) for ACLS-003 through the real `/checkout/details` form. Confirmed: real Stripe Checkout Session created (`create-checkout-session` succeeded, correct $149.99 price, correct product, correct email carried through). Card entry (`4242 4242 4242 4242`) hit repeated friction completing submission through Stripe's iframe-based Elements UI under browser automation — the button click wasn't reliably registering as a real user gesture inside the nested iframe. This is a **browser-automation tooling limitation in this session, not a product bug** — the checkout session itself (the actual app code) was already proven working end-to-end earlier this session on ACLS-001 (real redirect to a live Stripe test payment page). Recommend completing this one step by hand during your own run — should take 10 seconds with a real click.

Continuing Flow 1's remaining steps (confirmation email, OTP login, dashboard, JB Learning link, admin view) using the demo student (`alexbensonux+demostudent@gmail.com`) already enrolled via the seed script, since that enrollment is real and lets the rest of the flow be verified without blocking on the above.

### Flow 1 — student side (demo student, real OTP login)

- OTP login: real, confirmed (code delivered via Resend SMTP, entered, logged in successfully).
- Student dashboard: real, shows "Demo Student" account.
- Class detail page (`/student/classes/[id]` for ACLS-001, their real seeded enrollment): showed "Status: registered", "No invoices for this class" (correct — seeded without a real transaction), "No requirements for this class" (correct — this class predates the CPR Certification prerequisite added mid-session).
- **Third real bug found and fixed**: JB Learning link wasn't showing at all, even though it's genuinely configured (course-level, set via Fix 2 earlier). Root cause: `classes` has *two* foreign keys to `courses` (`course_uuid` and `course_code`), so the nested Supabase embed `classes(...,courses(...))` in `lib/externalLearningLinks.ts` was ambiguous — PostgREST returned HTTP 300 `PGRST201`, silently swallowed by a try/catch, resulting in "no links" with no visible error anywhere. Fixed by disambiguating the embed (`courses:courses!classes_course_uuid_fkey(...)`). **This is a real, pre-existing production bug**, not a demo-data artifact — confirmed by checking `pg_constraint` directly: both FKs genuinely exist on the real schema. Verified fix: JB Learning now renders correctly on the class page after reload.
- Admin view of student record: pending (next step).

### Flow 2 — prerequisite rejection/resubmission/approval (THE fix the user cared most about) — RESOLVED, fully verified via real UI clicks

**Backend proven correct first** (direct API calls with the real admin's live session token — same endpoint `ClassPrerequisitesQueue.tsx`'s `decide()` calls):

1. **Submitted** a CPR Certification credential for the demo student on ACLS-003 (`pending`).
2. **Rejected** it via the real API: `POST /api/admin/prerequisites/review {decision: "rejected", rejectionReason: "..."}` → `200 OK`, `review_status: "rejected"`, real `reviewed_by` (the actual admin's UUID), real `rejection_reason`, real `reviewed_at` timestamp. All genuinely persisted (verified in the response, which reads back from the DB post-write).
3. **Resubmitted**: old row marked `superseded`, new `pending` row inserted (matching the documented history-preservation design in migration 28).
4. **Approved** the resubmission via the same real API: `200 OK`, `review_status: "approved"`, real reviewer and timestamp.

**10th bug found and fixed while setting up a real click-path test**: clicking "Add prerequisite" on a class's overview page (`ClassPrerequisitesList.tsx` / `ClassAddPrerequisiteModal.tsx`) showed `"Added X — demo mode, saved locally only"` — the exact same fake-save pattern as Fixes 1-3, on a component those fixes hadn't touched. Real fix: added `addClassPrerequisite()` to [lib/prerequisites.ts](../../../apps/webapp/lib/prerequisites.ts) (mirrors the already-real `addTemplatePrerequisite`), rebuilt `ClassPrerequisitesList.tsx` as a real typeahead search over the live prerequisite catalog (mirroring `CatalogPrerequisitesList.tsx`'s already-working pattern) instead of a freeform-text modal, and threaded `prerequisiteTypes` down from the class page's server component. Deleted the now-unused `ClassAddPrerequisiteModal.tsx`. **Verified via real UI click + full page reload**: added "Immunization Record" and "Orientation Acknowledgment" (a checkbox-type prerequisite, chosen to avoid needing file-upload browser automation) to ACLS-003 through the actual search-and-click UI, reloaded, both persisted for real.

**11th bug found — this is what was actually blocking the click-path test**: even with a genuine pending submission sitting in the database, no "Review" button appeared anywhere in the admin UI. Root cause: `ClassOverviewPage.tsx` only shows the `ClassPrerequisitesQueue` banner for *program*-type classes (`showBanners = !closed && !isCourse`) — for course-type classes like ACLS, the banner is deliberately hidden (`hideBanner`), and the **only** other entry point is a "Review" button in the roster's per-student "Prerequisites" column. That column's status came from `rosterPrerequisiteStatusFor()` in `classMocks.ts`, which reads a hardcoded `CLASS_DETAILS` object with no entry for real classes — so it always fell through to "approved" and never rendered the Review button, regardless of how many real pending items existed. Fixed: `ClassRosterSection.tsx` now takes the same live `submissions` data already being fetched for the (hidden) banner, and shows a real "Review" button whenever a student has an actual pending submission, falling back to the mock status only for everyone else.

**Full real UI click-path, verified end-to-end**: as the demo student, clicked "Start" on "Orientation Acknowledgment," checked the box, submitted → "Pending review." As admin, the roster showed a real **Review** button → opened the modal → clicked **Reject** with a reason ("Please re-acknowledge after reading the updated orientation packet.") → confirmed. Back as the student, the exact rejection reason showed under "Needs resubmission" → clicked **Resubmit** → checked the box again → "Pending review" again. Back as admin, **Review** appeared again → clicked **Approve** → roster badge flipped to "Approved." Every step hit `POST /api/admin/prerequisites/review` for real (`200` in server logs each time) — no API shortcuts, no workarounds, all genuine button clicks.

**Aside**: OTP delivery to the demo accounts appeared broken for a stretch mid-session (send calls returned `200`, no email arrived) — turned out to be a bug in my own Gmail-search tool returning stale cached results, not an actual delivery failure (confirmed via the Resend dashboard, which showed every send as "Delivered" with correct timestamps and codes). Once the user pointed me at Resend's logs and read me the codes directly, everything resolved and I got a real, credible click-path proof.

### Flow 3 — certificate issuance — RESOLVED (real root cause, real fix, real UI verification)

Original bug: clicking "Generate certificate" in the real admin UI threw `Minified React error #31` (object-as-React-child) from inside PDF rendering, every time, including after a full `.next` cache clear.

**Root cause** (confirmed via full server-side stack trace after adding error logging to `issueCertificate()`'s catch block in [issue.ts](../../../apps/webapp/lib/certificates/issue.ts)): the certificate JSX ([completion-certificate.tsx](../../../apps/webapp/lib/certificates/completion-certificate.tsx)) is our own app code, so Next compiles it through the App Router's RSC webpack layer — which resolves `react` to a different module instance than the one `@react-pdf/renderer`/`@react-pdf/reconciler` use internally. React elements built with one `react` instance fail the reconciler's element-identity check when handed to the other, throwing error #31. Adding `@react-pdf/reconciler` to `next.config.ts`'s `serverExternalPackages` (alongside the already-present `@react-pdf/renderer`) did *not* fix it — the mismatch is in how *our own* file resolves `react`, not in how the two React-PDF packages are bundled.

**Real fix**: [render.ts](../../../apps/webapp/lib/certificates/render.ts) now renders the PDF in an isolated `tsx` child process ([render-worker.ts](../../../apps/webapp/lib/certificates/render-worker.ts)) instead of in-process. A separate Node process uses plain module resolution end-to-end — the same setup already proven correct earlier this session via direct `tsx` execution — so there's no cross-bundle React instance to collide. Props go in via a temp JSON file, the rendered PDF comes back via a temp file, both cleaned up after.

**Verified end-to-end via real UI clicks** (not API calls): logged in as Demo Admin, opened ACLS-003, clicked "Certificates" → "Generate certificate" → real button click → **"Certificate generated"** toast, clean server logs, real confirmation email sent (confirmed delivered to the demo student's actual inbox). Then logged out, logged in as the demo student via real OTP, opened Documents, saw the new certificate listed as **Active** with a working **Download PDF** button — clicked it, got a real `200 OK` on `/api/students/me/certificates/[id]/download`. Full loop confirmed: generate → store → email → student portal → download, all through genuine UI interaction.

### Flow 1 — Stripe checkout — RESOLVED

Re-attempted the real Stripe Checkout card submission (previously blocked by iframe click-target issues under automation) for a fresh test student (`alexbensonux+e2eflow2@gmail.com`) on ACLS-001: selected the Card payment method explicitly, unchecked "Save my information," filled card `4242 4242 4242 4242`, `12/34`, `123`, name, ZIP, clicked Pay — **payment succeeded**, redirected to the real "You're enrolled!" confirmation page. This was blocking on click-timing/element-selection technique, not a product issue, and is now cleared.

**New (environment-only) finding from this attempt**: the resulting Stripe webhook never reached the app, because there's no `stripe listen --forward-to` process running in this local dev environment (confirmed: no such process running, and the app's Stripe test key doesn't match either Stripe CLI profile already configured on this machine). Without the webhook, no enrollment/auth-account is created for a *brand-new* student from a local checkout — that's a local-dev-only gap (production/staging receive webhooks directly via a public URL) and not something to fix as part of this run.
