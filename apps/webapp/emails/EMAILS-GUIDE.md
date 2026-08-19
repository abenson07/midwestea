# Transactional emails guide

This is the content guide for the 8 transactional emails built from the `MidwestEA-Final` Figma
file. See `/Users/alexbenson/.claude/plans/great-i-d-like-to-refactored-moler.md` for the original
build plan and design-fidelity notes (flagged color/font discrepancies, etc.).

## System overview

Every email is a React Email component (`@react-email/components`), rendered to an HTML string
at send time via `@react-email/render` and sent through the existing Resend pipeline
(`lib/email.ts` / `lib/react-emails.ts`). Nothing is stored on Resend's servers — templates live
in this directory, in git, like the rest of the codebase.

Preview locally with `npx react-email dev -d ./emails -p 3001` (don't use port 3000, the Next.js
app dev server uses that). Each file's `PreviewProps` export supplies example data for the
preview server.

## Shared components (`components/`)

`EmailLayout`, `Heading`, `BodyText`/`BodyLine`, `PrimaryButton`, `GhostLinkButton`, `HeroImage`,
`DetailItem`/`EyebrowLabel`, `PrerequisiteGrid`, `CourseUpsellGrid`, `OtpCodeDisplay`, and
`constants.ts` (colors/fonts/footer info). Unlike the marketing landing pages
(`app/(marketing)/_landing-pages/`), which deliberately copy section components per-page, these
ARE meant to be shared — the whole point of the email system is that the shell, buttons, and
footer update in lockstep across all 8 emails.

## Per-email dynamic-field table

| Email | File | Trigger today | Key dynamic fields |
|---|---|---|---|
| Enrollment Successful | `enrollment-successful.tsx` | Stripe webhook (`sendCourseEnrollmentEmail`/`sendProgramEnrollmentEmail` in `lib/email.ts`) | studentName, courseCode, courseName, heroImageUrl, startDateLabel, endDateLabel, remainingCost, installments, invoicesUrl, portalLoginUrl, prerequisites (hardcoded placeholder) |
| Waitlist Successful | `waitlist-successful.tsx` | `app/api/waitlist/submit/route.ts` (now wired — previously never sent) | studentName, courseName, heroImageUrl |
| Waitlist Opens | `waitlist-opens.tsx` | **Not wired** — needs a bulk-send helper, see below | studentName, className, startDate, registrationCloseDate, heroImageUrl, registerUrl |
| Waitlist Spot Opens | `waitlist-spot-opens.tsx` | **Not wired** — natural hook is `app/api/enrollments/remove/route.ts` | same shape as Waitlist Opens |
| Completed Class + Followups | `completed-class-followups.tsx` | **Not wired** — blocked on missing "completed" status + certifications data | studentName, className, certificateUrl, suggestedFollowUps[] (pre-filtered by caller), allCoursesUrl |
| Rate Class | `rate-class.tsx` | **Not wired** — admin-initiated, manual send | className, reviewUrl (carries query params) |
| Class Reminder | `class-reminder.tsx` | **Not wired** — needs a 14-day-before-start cron | studentName, className, startDate, heroImageUrl, missingPrerequisites (hardcoded placeholder) |
| OTP / Login code | `otp-login-code.tsx` | Wired manually into `lib/email-templates/admin-otp.html` (Supabase Auth SMTP paste-in, not rendered by app code) | code |

## Content-config pattern (`content/enrollment/`)

Enrollment Successful's narrative copy ("shift friendly Monday/Tuesday classes...") is genuinely
course-specific, not generic. `content/enrollment/index.ts` looks up a `CourseEnrollmentContent`
object by `course_code`, falling back to `default.ts` for any course without bespoke copy yet.
To add content for a new course:

1. Create `content/enrollment/<course-code-lowercase>.ts` exporting a `CourseEnrollmentContent`
   (see `paramedic.ts` for the shape).
2. Register it in `content/enrollment/index.ts`'s `ENROLLMENT_CONTENT_BY_COURSE_CODE` map.

## Known gaps / TODOs (see the build plan for full context)

- **Bulk-send helpers**: Waitlist Opens and Waitlist Spot Opens need a function that, given a
  `course_code`, queries the `waitlist` table and sends to every matching student. Not built —
  only the templates exist.
- **14-day class-reminder cron**: needs a scheduled job (extend `apps/cron-worker` or add a
  Vercel Cron route in `apps/webapp`) that finds classes starting in 14 days and sends
  `class-reminder.tsx` to enrolled students.
- **Completion data**: no `completed` enrollment status or certifications table exists. Completed
  Class + Followups and the "missing prerequisites" logic in Class Reminder both need this before
  they can be triggered automatically — see the pseudocode comments in each file.
- **Prerequisites**: not modeled in the database at all. Every prerequisite list in every email is
  hardcoded to literal Figma placeholder text ("PRERESQUISITE TITLE HERE" / "Details go here") —
  deliberate, per product decision, not a bug. Swap via prompt-edit once real content exists.
- **OTP → Stripe**: no Stripe OTP integration exists anywhere in this codebase or, as far as
  research found, in Stripe's product line. Don't build one without confirming which Stripe
  feature is meant.

## Design-fidelity flags (confirm or correct via prompt-edit)

- Eyebrow label color: picked `#a4610a` — Figma had two close-but-different values.
- Card/detail body-copy color: `#333436` (Figma, as literally specified) rather than the site's
  single `#191920` text token.
- `Oswald` kept for ALL-CAPS mini-headings (Class Details items, prerequisite titles, upsell card
  titles) — consistent across every frame, but not one of the two fonts you named.
- OTP code display font size reduced from Figma's 72px to 44px so an 8-digit spaced code fits the
  472px content column without wrapping.
- Route URLs (`invoicesUrl`, `portalLoginUrl`, `certificateUrl`, `allCoursesUrl`, `registerUrl`)
  are placeholders (`/student`, `/student/invoices`, `/courses`, etc.) — none were confirmed to
  exist; the student portal is a stub today.

## Files

- `components/` — shared building blocks (see above)
- `content/enrollment/` — per-course narrative content for Enrollment Successful
- `*.tsx` (top level) — one file per email, each with a `PreviewProps` export for local preview
