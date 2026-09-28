# Invoicing & Registration — Local Testing Guide

Covers BEN-1175, 1176, 1177, 1178, 1179, 1180, 1181 — the full Program invoicing lifecycle, built across 7 stacked branches. Goal: walk each one from **Ready to Review → Done** by actually exercising it locally, in order, against an isolated Stripe test sandbox and an isolated Supabase database. Nothing here gets pushed; everything runs on `localhost`.

No code changes. This is a test pass only.

## 1. The shape of the work

Each Linear L1 lives on its own branch, stacked on the previous one — `1176-invoicing-work` contains everything in `invoicing-work` (the branch you're on now) plus its own commits, `1177-invoicing-work` contains everything in `1176-invoicing-work` plus its own, and so on. `1181-invoicing-work` has all of it. Since you're testing in order and reusing the same database throughout, state accumulates naturally as you move from branch to branch — you don't reset anything between steps.

| Issue | Branch | Depends on | Builds |
|---|---|---|---|
| [BEN-1175](https://linear.app/midwestern/issue/BEN-1175) | `invoicing-work` (current) | — | Registration creates the tuition invoice rows |
| [BEN-1176](https://linear.app/midwestern/issue/BEN-1176) | `1176-invoicing-work` | 1175 | Student billing view + pay one / pay all remaining |
| [BEN-1177](https://linear.app/midwestern/issue/BEN-1177) | `1177-invoicing-work` | 1176 | Tuition reminder send endpoint |
| [BEN-1178](https://linear.app/midwestern/issue/BEN-1178) | `1178-invoicing-work` | 1177 | Admin invoice visibility (student profile + class detail) |
| [BEN-1179](https://linear.app/midwestern/issue/BEN-1179) | `1179-invoicing-work` | 1178 | Admin standard-path actions: due date, reminder button, discount |
| [BEN-1180](https://linear.app/midwestern/issue/BEN-1180) | `1180-invoicing-work` | 1179 | Exception path: void + reissue the invoice set, pay-in-full |
| [BEN-1181](https://linear.app/midwestern/issue/BEN-1181) | `1181-invoicing-work` | 1180 | Admin removal + manual refund percentage |

**Facts worth knowing before you start** (so the checks below make sense):

- **Updated:** `tuition_a`/`tuition_b` are now real Stripe Invoice objects (`collection_method: send_invoice`, due-dated, finalized at creation with a hosted payment page) — created at registration time, and voided + replaced whenever an admin action changes one. `registration_fee` is unchanged: still a plain one-time Checkout Session payment, never a Stripe Invoice. Each tuition row's Stripe side is tracked via two new columns, `transactions.stripe_invoice_id` and `transactions.stripe_hosted_invoice_url`.
- Auth is email OTP (6-digit code) for both `/admin/login` and `/student/login` — no passwords. Admin login additionally checks the email against the `admins` table before it'll even send a code.
- Payment collection is Stripe-hosted throughout, never Stripe Elements/Payment Element embedded in the app — but which *kind* of hosted page depends on the flow: registration and pay-all-remaining redirect to a **Checkout Session**; paying a single tuition invoice redirects to that invoice's own **hosted invoice page** instead. One webhook route, `apps/webapp/app/api/webhooks/stripe/route.ts`, handles all of it — `checkout.session.completed` (branching internally on `session.metadata.payment_purpose`) for the first two, `invoice.paid` for the third.
- Due-date math (from `createInvoiceSchedule` in `apps/webapp/lib/enrollments.ts`): `tuition_a.due_date = class_start_date - 21 days`, `tuition_b.due_date = class_start_date + 7 days`.
- On `transactions`, `amount_due` holds the *full* price and `quantity` is `0.5` for tuition rows — the actual payable/paid amount is always `amount_due × quantity`. Don't be thrown by a tuition row showing the full program price in `amount_due`.
- Display status (Paid / Past due / Pending / Cancelled / Refunded) is derived, not stored: `transaction_status = 'pending'` **and** `due_date < now()` renders as "Past due". This is why several checks below just move a date around in SQL rather than waiting for a real date to pass — per your note, the important thing is that the right data comes through when a date hits, not that we simulate a cron firing at the exact minute.
- Two migrations, two different timings: `21_add_stripe_invoice_columns_to_transactions.sql` (adds `stripe_invoice_id`, `stripe_hosted_invoice_url`) is needed from the start — apply it during setup (§2.3), before testing BEN-1175 at all. `20_add_refund_columns_to_transactions.sql` (adds `refund_percentage`, `refund_amount`) is still only needed starting at BEN-1181, same as before.

---

## 2. One-time environment setup

### 2.1 Prerequisites

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

You'll also want the Supabase dashboard open in a browser (no CLI needed for this — see §2.3).

### 2.2 Stripe test sandbox

1. In the [Stripe Dashboard](https://dashboard.stripe.com), toggle to **Test mode** (top right).
2. Developers → API keys → copy the test **Secret key** (`sk_test_...`) and **Publishable key** (`pk_test_...`). Paste them into `apps/webapp/.env.local` now as `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — they're two of the "Remaining env vars" listed in §2.4, no need to wait until you get there.
3. Product catalog → create one test Product with one Price (any amount, e.g. $100.00, one-time) — this stands in for a Program's registration fee. Copy the **Price ID** (`price_...`); you'll assign it to a test class in §2.6 (nothing to paste into `.env.local` for this one).
4. Leave the Stripe CLI ready — you'll start `stripe listen` in §2.5 and it'll hand you `STRIPE_WEBHOOK_SECRET`, the third Stripe var in §2.4.

### 2.3 An isolated Supabase "branch" (no push, fully local)

Checked what's currently in `apps/webapp/.env.local`: `NEXT_PUBLIC_SUPABASE_URL` and `MIGRATION_NEXT_PUBLIC_SUPABASE_URL` already point at the **same** project (`qtnjpgcftchxmyblsuqf`) — the Plan 10 cutover already happened, so the project your app currently talks to is the one live project, not a disposable dev copy. Testing invoicing flows directly against it would create fake students/enrollments/payments alongside real data. So: a real, separate Supabase project, cloned from current schema+data, used only from your local `npm run dev`.

This repo already has the exact tooling for this — built for the Plan 10 migration, repurposed here as "clone live → test project":

1. **Create a new Supabase project** in the dashboard (any name, e.g. `midwestea-invoicing-test`). Free tier is fine. From its Settings → API, grab the Project URL, `anon` key, and `service_role` key.

2. **Back up your env file**, then temporarily repoint the `MIGRATION_*` vars at the new empty project (these become your "target"; the unprefixed vars stay as-is and become the "source" — i.e. your current live project, read-only for this step):

   ```bash
   cp apps/webapp/.env.local apps/webapp/.env.local.backup
   ```

   Edit `apps/webapp/.env.local` and set:
   ```
   MIGRATION_NEXT_PUBLIC_SUPABASE_URL=<new project URL>
   MIGRATION_NEXT_PUBLIC_SUPABASE_ANON_KEY=<new project anon key>
   MIGRATION_SUPABASE_SERVICE_ROLE_KEY=<new project service_role key>
   ```

3. **Verify the two projects are actually different, and reachable:**
   ```bash
   npm run migration:check-env
   ```
   Should print `✅ Ready for migration scripts.` If it says source and target are the same ref, the edit above didn't take.

4. **Generate a full schema+data snapshot** (read-only against the live project — this only writes local files):
   ```bash
   npm run migration:generate-sql
   ```
   This writes numbered `.sql` files to `docs/migration/generated-sql/` — `00-setup-enums.sql`, `01-auth-users.sql`, `02-courses.sql`, `03-locations.sql`, `04-classes.sql`, `05-students.sql`, `06-enrollments.sql`, `07-transactions.sql`, `08-waitlist.sql`, `09-payments.sql`, `10-admins.sql`, `11-logs.sql`, `12-invoices_to_import.sql`, `13-email_logs.sql` — each with the live `CREATE TABLE` (+ indexes + RLS) and every current row. Read `docs/migration/generated-sql/README.md` for the authoritative run order it generates for you.

   > **Heads up:** this copies real student names/emails/payment history into the new project. It's the same Supabase org/account you already control, so this is a judgment call, not a hard blocker — but it's real PII, so make that call deliberately rather than by default.

5. **Run each file, in the printed order, in the new project's SQL Editor** (Supabase Dashboard → SQL Editor → paste → Run), starting with `00-setup-enums.sql` through `13-email_logs.sql`. They're wrapped in `BEGIN`/`COMMIT` and use `ON CONFLICT (id) DO NOTHING`, so they're safe to re-run if one fails partway.

6. **Apply the Stripe Invoice columns migration** — needed before any registration in this test project will work, since registration now creates real Stripe Invoices for tuition rows:
   ```sql
   -- supabase/migrations/21_add_stripe_invoice_columns_to_transactions.sql
   ALTER TABLE transactions ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;
   ALTER TABLE transactions ADD COLUMN IF NOT EXISTS stripe_hosted_invoice_url TEXT;
   CREATE INDEX IF NOT EXISTS idx_transactions_stripe_invoice_id ON transactions(stripe_invoice_id);
   ```

7. **Point the app at the test project.** This is the part that actually matters — `npm run dev` reads the *unprefixed* vars, not `MIGRATION_*`. Edit `apps/webapp/.env.local` again:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<new project URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<new project anon key>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<new project anon/publishable key>
   SUPABASE_SERVICE_ROLE_KEY=<new project service_role key>
   SUPABASE_URL=<new project URL>
   ```
   (You can put the `MIGRATION_*` vars back to what they were, or leave them — they're not read by the running app.)

8. **Auth email delivery on the new project.** OTP codes send through Supabase Auth's own mailer, not Resend — and a brand-new project's default mailer is low-rate-limited. Two ways around it while testing:
   - Dashboard → Authentication → Logs on the new project shows each OTP as it's issued, even if the email itself is slow/throttled — you can read the code from there.
   - Or configure custom SMTP (Authentication → Settings → SMTP) using the Resend key you set up in §2.4 anyway.

9. **Confirm you can actually log in as admin.** The cloned `admins` table carries over real rows. Find one you have inbox access to:
   ```sql
   select email, display_name from admins where deleted_at is null;
   ```
   If none of those are yours, add yourself (needs an `auth.users` row first — easiest via Dashboard → Authentication → Users → Add user, then):
   ```sql
   insert into admins (id, display_name, email)
   values ('<the auth user id you just created>', 'Test Admin', '<your email>');
   ```

### 2.4 Remaining env vars

In `apps/webapp/.env.local`, also set:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=<from stripe listen, see §2.5>
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@midwestea.com
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

`RESEND_API_KEY` is required, not optional — enrollment-confirmation and tuition-reminder emails throw if it's missing (`apps/webapp/lib/email.ts`), which will fail the BEN-1177 checklist ("confirm a 200 response and a new `email_logs` row"). Grab any working Resend key (test or real).

### 2.5 Start everything

```bash
npm install   # only if node_modules is stale
npm run dev
```

In a second terminal:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the `whsec_...` it prints into `STRIPE_WEBHOOK_SECRET` in `.env.local`, then restart `npm run dev`. Leave `stripe listen` running for the entire test pass — every payment flow below (new registration, single-invoice pay, pay-all-remaining) goes through this same webhook route, branching internally on metadata.

**Heads up:** tuition payments now primarily flow through `invoice.paid` events (fired when a student pays via a hosted invoice page, or when a payment gets reconciled out-of-band), not just `checkout.session.completed`. If §4's "pay one" step doesn't flip a row to "Paid" locally after a real payment, check the `stripe listen` terminal for whether `invoice.paid` is actually being forwarded — if not, restart it with event types listed explicitly:
```bash
stripe listen --events checkout.session.completed,invoice.paid,payout.paid --forward-to localhost:3000/api/webhooks/stripe
```

### 2.6 Pick your test class

Rather than fabricating one from scratch (and guessing at NOT NULL columns), reuse a real Program class from the cloned data and just retarget it at your test Stripe Price. In the test project's SQL Editor:

```sql
select c.class_id, c.class_name, c.class_start_date, c.stripe_price_id, c.price, c.registration_fee
from classes c
join courses co on co.course_code = c.course_code
where co.type = 'program'
order by c.class_start_date desc
limit 5;
```

Pick one, then point it at your test-mode Price and give it a start date that puts both tuition due dates in the near future (so everything starts out "Pending" and you control when things become "Past due" via SQL later):

```sql
update classes
set stripe_price_id = '<price_... from §2.2>',
    class_start_date = (current_date + interval '30 days')::date
where class_id = '<PROGRAM_CLASS_ID>';
```
With a 30-day-out start date: `tuition_a` due ≈ today+9d, `tuition_b` due ≈ today+37d — both open at registration.

If you'd rather build a throwaway class from scratch, check `docs/migration/generated-sql/04-classes.sql` and `02-courses.sql` from §2.3 for the exact current column list before writing the `INSERT` — the column set in this repo's committed `schemas/*.json` snapshots is stale (missing `stripe_price_id`, among others) and shouldn't be trusted over the generated file.

### 2.7 Two test students

You'll run two registrations through the funnel:

- **Student A** — the throughline. Carries a still-open `tuition_b` all the way through BEN-1177 → 1181, so every admin action downstream has something real to act on.
- **Student B** — used once, in BEN-1176 only, to prove the pay-all-remaining collapse (needs *two* open tuition rows at the same time, which Student A won't have once you start paying things off individually).

If your own inbox is Gmail, `+` aliasing works for both and for the OTP student-login flow:
- Student A: `alexbensonux+invA@gmail.com`
- Student B: `alexbensonux+invB@gmail.com`

---

## 3. BEN-1175 — Program registration creates tuition invoice rows

**Branch:** stay on `invoicing-work` (current). No new migration.

### Walkthrough

1. Go to `http://localhost:3000/checkout/details?classID=<PROGRAM_CLASS_ID>`.
2. Fill in Student A's email and full name → **Continue to Payment**. This redirects to a Stripe-hosted Checkout page (test mode).
3. Pay with `4242 4242 4242 4242`, any future expiry, any CVC/ZIP.
4. You'll land on `/purchase-confirmation/general`. Watch the `npm run dev` terminal for the `[webhook] ...` log lines through `Invoice schedule created`.

### Verify in SQL (test project)

```sql
select s.id as student_id, s.full_name from students s
join auth.users u on u.id = s.id
where u.email = 'alexbensonux+invA@gmail.com';

-- using that student_id:
select e.id as enrollment_id from enrollments e where e.student_id = '<student_id>';

-- using that enrollment_id:
select transaction_type, invoice_number, due_date, amount_due, quantity, transaction_status,
       stripe_payment_intent_id, stripe_invoice_id, stripe_hosted_invoice_url
from transactions
where enrollment_id = '<enrollment_id>'
order by transaction_type;
```
Expect exactly 3 rows, all sharing `enrollment_id`:
- `registration_fee` — paid, non-null `invoice_number` and `stripe_payment_intent_id`, `stripe_invoice_id` **null** (this one's still a plain payment, never a Stripe Invoice).
- `tuition_a` / `tuition_b` — pending, due ≈ start−21d / start+7d, both with a non-null `stripe_invoice_id` and `stripe_hosted_invoice_url`.

Cross-check in Stripe Dashboard (test mode):
- **Payments** → find the PaymentIntent matching `registration_fee`'s `stripe_payment_intent_id`, confirm the charged amount.
- **Invoices** (a separate tab) → you should see two open invoices for this customer, matching `tuition_a`/`tuition_b`'s `stripe_invoice_id`s, each with the right amount and due date. Open `stripe_hosted_invoice_url` directly to confirm it's a real, payable invoice page.

### Idempotency check

The dedup guard in `createInvoiceSchedule` (`apps/webapp/lib/enrollments.ts`) keys off "does a transaction row of this type already exist for this `enrollment_id`" — it isn't keyed on the Stripe event ID. So the reliable, fully-real way to exercise it locally is to just repeat the registration itself. (I looked at using `stripe events resend`/the Dashboard "Resend" button to replay the exact original event instead, but that path is a known rough edge in the Stripe CLI when paired with `listen --forward-to` — see [stripe-cli#1206](https://github.com/stripe/stripe-cli/issues/1206) — so it's not worth building this check on top of it.)

Repeat step 1–3 above exactly — same class, **same Student A email**. `findOrCreateStudent` and `createEnrollment` both resolve to the same existing rows, and `createInvoiceSchedule` sees all 3 transaction types already present, so it creates nothing new (the test card gets charged again in Stripe test mode — harmless, just ignore the extra test PaymentIntent). Re-run the `select ... from transactions` query from above — still exactly 3 rows, same `id`s as before, nothing duplicated.

Then prove partial-repair:
```sql
delete from transactions where enrollment_id = '<enrollment_id>' and transaction_type = 'tuition_b';
```
Repeat the checkout a third time, same email. This time `missingTypes` is just `['tuition_b']`, so only that row gets recreated. Re-query — `tuition_b` is back (new `id`, correct due date, a fresh `stripe_invoice_id`), `registration_fee`/`tuition_a` untouched.

(Repeats that create nothing in the DB, per the guard above, don't touch Stripe either — only the first run and the third-run repair actually create a Stripe Invoice, so you won't accumulate orphaned test invoices just from re-running the full checkout a few times.)

**Pass criteria:** 3 rows, correct due dates, shared `enrollment_id`, resend-safe, repair-on-delete works, and you only exercised the Program path (no Course-type class touched). → mark [BEN-1175](https://linear.app/midwestern/issue/BEN-1175) Done.

---

## 4. BEN-1176 — Student billing view and pay flow

```bash
git checkout 1176-invoicing-work
```
No new migration.

### Student A — pay one invoice

**Updated mechanics:** "Pay" no longer builds a fresh Checkout Session — it hands back the `stripe_hosted_invoice_url` already sitting on the row from registration (§3), and payment is captured via the `invoice.paid` webhook, not `checkout.session.completed`. If that doesn't seem to be arriving, see the note in §2.5.

1. `http://localhost:3000/student/login` → OTP with `alexbensonux+invA@gmail.com` → check inbox (or Supabase Auth logs) for the code.
2. Go to **Billing** (`/student/billing`). Confirm you see one card for the class, with `tuition_a` and `tuition_b` each showing type/amount/due date and a status badge (both "Pending").
3. Click **Pay** on `tuition_a`'s row → you land on **Stripe's hosted invoice page** (not a fresh Checkout Session — it's the same `stripe_hosted_invoice_url` you already saw in §3's verify step). Pay with `4242...`.
4. Confirm `tuition_a`'s badge is now "Paid" back on `/student/billing`.

```sql
select transaction_type, transaction_status, amount_paid, stripe_payment_intent_id, stripe_invoice_id
from transactions where enrollment_id = '<enrollment_id>' order by transaction_type;
```
`tuition_a`: `paid`, `amount_paid` = its `amount_due × 0.5`, `stripe_payment_intent_id` now populated (by the `invoice.paid` handler). `tuition_b` still `pending`. Cross-check in Stripe Dashboard → Invoices: `tuition_a`'s invoice now shows **Paid**.

Resend-safety here is best proven by what you *can't* do: the "Pay" control disappears once a row is `paid` (the route 400s on anything not `pending`), so there's no live way to trigger a second `invoice.paid` for this row through the UI. The shared guard behind it (`applyPaidUpdate` in `lib/invoice-payments.ts`, used by every paid-marking path) gets a real, live proof just below anyway — pay-all-remaining's out-of-band reconciliation deliberately re-fires `invoice.paid` for rows already marked paid, through that exact same function. If you want to prove *this* row's guard directly instead of relying on that, the signed-replay script in the Appendix still works — just note it now exercises the `existing_invoice` webhook branch, which real traffic can no longer reach (nothing in the app builds that kind of Checkout Session anymore, so this is testing the guard in isolation, not a path a real student could hit):
```bash
REPLAY_PURPOSE=existing_invoice REPLAY_TRANSACTION_ID=<tuition_a_id> \
  npx tsx /tmp/replay-webhook-event.ts
```
Re-run the `select` above — unchanged, response comes back `alreadyProcessed: true`.

**Leave `tuition_b` open** — it's the throughline for §5–§9.

### Student B — pay all remaining

1. Register Student B the same way as §3 (fresh `/checkout/details?classID=...` run, different email), so they land with `tuition_a` + `tuition_b` both `pending`.
2. Log in as Student B at `/student/login`, go to Billing.
3. Click **Pay All Remaining** on the class card. On the Stripe Checkout page, confirm there's **one** line item — "Remaining Tuition Balance" — for the summed amount, not two.
4. Pay with `4242...`, land back on `/student/billing?paid=1`.

```sql
select transaction_type, transaction_status, amount_paid, stripe_payment_intent_id, stripe_invoice_id
from transactions where enrollment_id = '<student_b_enrollment_id>' order by transaction_type;
```
Both tuition rows now `paid`, each keeping its own `amount_paid`, both sharing the same `stripe_payment_intent_id` (from the combined Checkout Session). Cross-check in Stripe Dashboard → Invoices: **both** of Student B's tuition invoices should also show **Paid** — that's the `paid_out_of_band` reconciliation firing after the combined session completed, not either invoice being paid on its own page. If one still shows "Open," check the `npm run dev` terminal for `Failed to reconcile Stripe invoice out-of-band` — that step logs-and-continues rather than failing the webhook, so the DB can be correctly `paid` while Stripe is momentarily out of sync if it hit an error.

Same idea for the collapsed path's *database* idempotency — replay it and confirm no duplicate processing (`markTransactionsPaidFromCollapsedCheckout`'s guard):
```bash
REPLAY_PURPOSE=pay_remaining REPLAY_TRANSACTION_IDS=<tuition_a_id>,<tuition_b_id> \
  npx tsx /tmp/replay-webhook-event.ts
```
Re-query — unchanged, `alreadyProcessedCount: 2`.

**Pass criteria:** single-invoice pay and pay-all-remaining both reflect correctly, both idempotent. → mark [BEN-1176](https://linear.app/midwestern/issue/BEN-1176) Done.

---

## 5. BEN-1177 — Invoice send and reminder testing

```bash
git checkout 1177-invoicing-work
```
No new migration. Explicitly out of scope here: automated scheduling/cron — just the send endpoint itself, manually triggered.

### Get an admin bearer token (you'll reuse this through BEN-1181)

1. `http://localhost:3000/admin/login` → OTP with an email from the `admins` table (§2.3 step 9).
2. Once logged in, open browser DevTools → Application → Local Storage → `http://localhost:3000` → find the key starting `sb-...-auth-token` → copy its `access_token` value.
3. In your terminal:
   ```bash
   export ADMIN_TOKEN="<access_token>"
   export BASE_URL="http://localhost:3000"
   ```

(curl examples below pipe to `jq` for readability — `brew install jq`, or just drop `| jq` for raw output.)

### Trigger a reminder for Student A's open `tuition_b`

```sql
select id from transactions where enrollment_id = '<student_a_enrollment_id>' and transaction_type = 'tuition_b';
```

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/admin/transactions/<tuition_b_id>/send-reminder | jq
```
Expect `{"success": true, "emailId": "...", "dueDateSent": "..."}` (200). Confirm:
```sql
select * from email_logs where email_type = 'tuition_reminder' order by created_at desc limit 1;
```

Reject-on-closed check — this should 400, proving it only acts on the given open transaction:
```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  $BASE_URL/api/admin/transactions/<student_a_paid_tuition_a_id>/send-reminder | jq
```

### Freshness check (BEN-1186's own script)

```bash
SUPABASE_URL=<test project url> SUPABASE_SERVICE_ROLE_KEY=<test project service role key> \
TRANSACTION_ID=<tuition_b_id> ADMIN_TOKEN=$ADMIN_TOKEN BASE_URL=$BASE_URL \
npm run test:reminder-freshness
```
This sends a reminder, directly updates `due_date` in Supabase, sends again, and asserts the second send reflects the new date (never `lib/enrollments.ts`'s 5-minute in-memory `getOutstandingInvoices()` cache). Expect `PASS` on stdout.

**Pass criteria:** 200 + `email_logs` row on valid open invoice, 400 on a non-pending one, freshness script passes. → mark [BEN-1177](https://linear.app/midwestern/issue/BEN-1177) Done.

---

## 6. BEN-1178 — Admin invoice visibility and detail inspection

```bash
git checkout 1178-invoicing-work
```
No new migration. Inspection only — no edit controls should appear yet.

### Walkthrough

1. `/admin/students/<student_a_id>` → **Invoices by Class** section → confirm Student A's 3 rows show, grouped by class.
2. `/admin/classes/<class_id>` (the class from §2.6) → confirm the same student's rows are visible via the **Invoice Status** column / per-student sidebar.
3. Compare status badges across `/admin/payments`, the student-profile sidebar, and the class-detail sidebar for the same `tuition_b` row — all three should show the 3-state treatment (Paid / Past due / Pending), not just Paid/Pending. To actually see "Past due" rendered, backdate it first:
   ```sql
   update transactions set due_date = now() - interval '2 days'
   where id = '<tuition_b_id>';
   ```
   Reload all three views — badge should flip to "Past due" everywhere. Put it back afterward if you want a clean "Pending" state heading into §7:
   ```sql
   update transactions set due_date = now() + interval '9 days' where id = '<tuition_b_id>';
   ```
4. Click the card in **Invoices by Class** (student profile) → confirm the full payment-detail sidebar opens.
5. Click the **Invoice Status** cell in the class-detail view for the same student → confirm the same detail sidebar opens (same `EnrollmentPaymentDetail` component both places — content should be identical either way in).
6. Confirm neither surface has a due-date/amount/status edit control yet (that's next).

**Pass criteria:** same rows, same 3-state status, same detail component from both entry points; no edit affordances. → mark [BEN-1178](https://linear.app/midwestern/issue/BEN-1178) Done.

---

## 7. BEN-1179 — Admin invoice management in the standard path

```bash
git checkout 1179-invoicing-work
```
No new migration. **Updated mechanics:** due-date and amount edits used to be plain Supabase writes; they now also go through new admin routes (`/api/admin/transactions/[id]/due-date` and `.../amount`) that keep `tuition_b`'s linked Stripe Invoice in sync. Same buttons, same sidebar, and the `transactions` row still updates in place either way — no new/voided rows *at the database level*. Underneath, both actions **always** void the existing Stripe Invoice and issue a replacement — per Stripe's own "Manage invoices" docs, a finalized invoice's due date is just as locked as its amount, no direct-update path exists for either, so there's nothing conditional to watch for here (an earlier version of this code tried a direct update first; that's gone now that Stripe's docs confirm it would never have succeeded).

```sql
select count(*) from transactions where enrollment_id = '<student_a_enrollment_id>';
select id, stripe_invoice_id from transactions where id = '<tuition_b_id>';
```
Note the count (should be 3) and `tuition_b`'s current `stripe_invoice_id` — re-check both after each action below.

### Walkthrough (`/admin/payments`, click the `tuition_b` pending row to open its sidebar)

1. **Edit Due Date** → push it out a few days → Save. Reload → row's due date and badge reflect it.
   ```sql
   select due_date, stripe_invoice_id from transactions where id = '<tuition_b_id>';
   ```
   `stripe_invoice_id` should have changed from what you noted above — the old one shows **Void** in Stripe Dashboard → Invoices, the new one shows the new due date.
2. **Send Reminder** (same sidebar button) → confirm success. This calls the identical `/api/admin/transactions/[id]/send-reminder` endpoint you already curl'd directly in §5 — same `email_logs` check applies, unaffected by any of this.
3. **Apply Discount** / **Set Amount** → change the amount → Save.
   ```sql
   select amount_due, stripe_invoice_id from transactions where id = '<tuition_b_id>';
   ```
   Same mechanism as step 1: `stripe_invoice_id` changes again, the just-issued invoice from step 1 now shows **Void**, the newest one shows the new amount. Confirm the database side changed in place — still one row, same transaction `id`, just a new linked invoice each time.
4. Re-check the count query from the top of this section — still 3 transaction rows. Nothing was voided, cancelled, or replaced *in the `transactions` table* — only the Stripe Invoice underneath `tuition_b` changed, twice now.

**Pass criteria:** due date, reminder, and discount all land on the live `tuition_b` row with no `transactions`-table schedule-shape change, and each void+reissue leaves Stripe's own records accurate — old invoice void, new one live with the right amount/due date. → mark [BEN-1179](https://linear.app/midwestern/issue/BEN-1179) Done.

---

## 8. BEN-1180 — Exception path: replace the invoice set on an enrollment

```bash
git checkout 1180-invoicing-work
```
No new migration. **Updated mechanics:** void now voids the real Stripe Invoice behind each row before cancelling it in the DB, and reissue creates a real Stripe Invoice per replacement row (same `createAndFinalizeStripeInvoice` helper registration time uses) — this is the first branch-testable endpoint without an obvious UI trigger in the checklist — test via curl using the same `$ADMIN_TOKEN` from §5 (grab a fresh one via the browser if it's expired).

Endpoint: `POST /api/admin/enrollments/<enrollmentId>/void-and-reissue`
Body: `{ "replacementInvoices": [{ "amountCents": <int>, "dueDate": "<ISO date>" }, ...], "payInFull": <bool> }`

### Step 1 — replace with two custom rows

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  $BASE_URL/api/admin/enrollments/<student_a_enrollment_id>/void-and-reissue \
  -d '{
    "replacementInvoices": [
      { "amountCents": 15000, "dueDate": "'"$(date -u -v+10d +%Y-%m-%dT00:00:00Z)"'" },
      { "amountCents": 15000, "dueDate": "'"$(date -u -v+40d +%Y-%m-%dT00:00:00Z)"'" }
    ],
    "payInFull": false
  }' | jq
```
(On Linux, swap `date -v+10d` for `date -d "+10 days"`.)

```sql
select transaction_type, transaction_status, amount_due, due_date, stripe_invoice_id from transactions
where enrollment_id = '<student_a_enrollment_id>' order by created_at;
```
Original `tuition_b` is now `cancelled` (voided, not deleted — full history preserved), and its `stripe_invoice_id` should show **Void** in Stripe Dashboard → Invoices. Two new `custom` rows, `pending`, tied to the same `enrollment_id`, each with its own new `stripe_invoice_id` — open both in Stripe Dashboard and confirm the amounts/due dates match what you sent in the request body.

### Step 2 — repeat with a different row count, then pay-in-full

Void-and-reissue again, this time with a single row and `payInFull: true` (the two `custom` rows from step 1 are still open, so this call voids those and reissues one):

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  $BASE_URL/api/admin/enrollments/<student_a_enrollment_id>/void-and-reissue \
  -d '{
    "replacementInvoices": [
      { "amountCents": 30000, "dueDate": "'"$(date -u -v+10d +%Y-%m-%dT00:00:00Z)"'" }
    ],
    "payInFull": true
  }' | jq
```
Re-run the same `select` — the two `custom` rows are now `cancelled` (their Stripe Invoices voided too), and there's one new `pay_in_full` row, `pending`, with its own live Stripe Invoice for the full $300. All prior rows (including the very first `tuition_b`) are still there as `cancelled` history, nothing deleted — every one of them that ever had a Stripe Invoice should show **Void** in Stripe Dashboard except the one still `pending`.

**Pass criteria:** old rows voided not removed, new rows correctly tied to the same enrollment, repeatable with varying row counts, pay-in-full collapses correctly. → mark [BEN-1180](https://linear.app/midwestern/issue/BEN-1180) Done.

---

## 9. BEN-1181 — Admin removal and refund handling

```bash
git checkout 1181-invoicing-work
```

**Apply the refund-columns migration first** (`21_add_stripe_invoice_columns_to_transactions.sql` should already be in place from setup, §2.3 — this is the *other* one, still specific to this branch). In the test project's SQL Editor:
```sql
-- supabase/migrations/20_add_refund_columns_to_transactions.sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS refund_percentage NUMERIC(5, 2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS refund_amount INTEGER;
```
Removal-with-refund will fail server-side until this runs.

### Walkthrough

Student A has payment history at this point: `registration_fee` (paid), `tuition_a` (paid, from §4), plus voided history and one open `pay_in_full` row (from §8). That's exactly the "enrollment with visible, understandable payment history" this checklist wants. Refund handling itself is unaffected by everything above — it's still a manual `refund_percentage`/`refund_amount` stamp in the database, with no real Stripe refund or credit note issued, even though the rows being refunded now happen to be backed by real (already-paid, already-closed) Stripe Invoices.

1. Open Student A's enrollment for this class (`/admin/students/<student_a_id>` or `/admin/classes/<class_id>`) → start the **remove student** flow.
2. Since paid rows exist, enter a manual refund percentage (e.g. `50`) → complete removal.

Or via curl, exercising the same endpoint directly:
```bash
curl -s -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  $BASE_URL/api/enrollments/remove \
  -d '{ "student_id": "<student_a_id>", "class_id": "<class_uuid>", "refund_percentage": 50 }' | jq
```

### Verify

```sql
select enrollment_status from enrollments where id = '<student_a_enrollment_id>';
-- expect: removed

select transaction_type, transaction_status, amount_paid, refund_percentage, refund_amount
from transactions
where enrollment_id = '<student_a_enrollment_id>' and transaction_status in ('paid','refunded')
order by transaction_type;
```
`registration_fee` and `tuition_a` (the only ever-`paid` rows) should now be `refunded`, with `refund_percentage = 50` and `refund_amount = round(amount_paid * 0.5)` each. The still-`pending`/`cancelled` rows are untouched — refund only ever touches rows that were actually `paid`.

**Pass criteria:** enrollment marked removed, only paid rows get the refund stamp, math checks out, history stays intact. → mark [BEN-1181](https://linear.app/midwestern/issue/BEN-1181) Done.

---

## 10. Cleanup

- Restore your real env file when you're done testing locally: `cp apps/webapp/.env.local.backup apps/webapp/.env.local`.
- Stop `stripe listen` and `npm run dev`.
- The test Supabase project can just sit there for next time, or be deleted from the dashboard — it was never wired into anything shared.
- Nothing here was pushed; branch checkouts were local only. Merging the stack is a separate step once all seven are marked Done.

## Appendix — replaying a webhook event exactly

Used in §4 for the two payment-idempotency checks that have no natural "click it twice" path through the UI. This hand-signs a `checkout.session.completed` payload with your real `STRIPE_WEBHOOK_SECRET` (via the Node `stripe` SDK's `webhooks.generateTestHeaderString`, confirmed present in this repo's installed `stripe` package) and posts it straight to your local webhook route — no dependency on Stripe CLI's event-resend behavior. Requires `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` to already be in `apps/webapp/.env.local` (§2.4).

```bash
cat > /tmp/replay-webhook-event.ts <<'EOF'
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/alexbenson/Repos/midwestea/apps/webapp/.env.local' });

const secret = process.env.STRIPE_WEBHOOK_SECRET!;
const purpose = process.env.REPLAY_PURPOSE; // 'existing_invoice' | 'pay_remaining'
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

const metadata: Record<string, string> =
  purpose === 'existing_invoice'
    ? { payment_purpose: 'existing_invoice', transaction_id: process.env.REPLAY_TRANSACTION_ID! }
    : { payment_purpose: 'pay_remaining', transaction_ids: process.env.REPLAY_TRANSACTION_IDS! };

const payload = JSON.stringify({
  id: `evt_test_replay_${Date.now()}`,
  object: 'event',
  type: 'checkout.session.completed',
  data: {
    object: {
      id: `cs_test_replay_${Date.now()}`,
      object: 'checkout.session',
      payment_intent: `pi_test_replay_${Date.now()}`,
      amount_total: 10000,
      customer: null,
      metadata,
    },
  },
});

const signature = Stripe.webhooks.generateTestHeaderString({ payload, secret });

fetch(`${baseUrl}/api/webhooks/stripe`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'stripe-signature': signature },
  body: payload,
}).then(async (res) => console.log(res.status, await res.text()));
EOF
```

Run it (from the repo root, with `apps/webapp/node_modules` on the path — easiest via `npx tsx` from inside `apps/webapp`, or add `-r dotenv/config` and adjust the path resolution above to match wherever you saved it):

```bash
cd apps/webapp
REPLAY_PURPOSE=existing_invoice REPLAY_TRANSACTION_ID=<transaction_id> npx tsx /tmp/replay-webhook-event.ts
REPLAY_PURPOSE=pay_remaining REPLAY_TRANSACTION_IDS=<id1>,<id2> npx tsx /tmp/replay-webhook-event.ts
```

## Appendix — quick lookup SQL

```sql
-- student -> id
select s.id, s.full_name from students s join auth.users u on u.id = s.id where u.email = '<email>';

-- student -> enrollment for this class
select e.id, e.enrollment_status from enrollments e
join classes c on c.id = e.class_id
where e.student_id = '<student_id>' and c.class_id = '<PROGRAM_CLASS_ID>';

-- full invoice schedule for an enrollment
select transaction_type, transaction_status, invoice_number, due_date, amount_due, quantity, amount_paid,
       refund_percentage, refund_amount, stripe_payment_intent_id, stripe_invoice_id, stripe_hosted_invoice_url, created_at
from transactions where enrollment_id = '<enrollment_id>' order by created_at;

-- push a due date into the past (Pending -> Past due) or future (undo it)
update transactions set due_date = now() - interval '2 days' where id = '<transaction_id>';
update transactions set due_date = now() + interval '9 days' where id = '<transaction_id>';

-- admins you can log in as
select email, display_name from admins where deleted_at is null;
```
