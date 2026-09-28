# Tuition Amount/Quantity Refactor — Local Testing Guide

Follow-up to the [invoicing test pass](INVOICING_TESTING_GUIDE.md) (BEN-1175–1181). Not a new Linear L1 — a targeted fix for a display/data-shape issue found while doing that pass. Goal: confirm the two things that actually changed, not a full re-run of the seven-ticket stack.

No new migration, no schema change — this only changes what *values* the app writes into the existing `transactions.amount_due`/`quantity` columns, and how a couple of UI surfaces read them. Same isolated Stripe sandbox and Supabase test project from the invoicing pass — reuse them, don't set up fresh ones.

## 1. What changed, and why this test is narrow

- **Before:** `createInvoiceSchedule` wrote `tuition_a`/`tuition_b` rows with `amount_due` = the *full* program price and `quantity = 0.5` — the real payable amount was always `amount_due × quantity`, never `amount_due` alone. This is what made the old admin "Adjust Amount" sidebar show `Current: $8,800.00` for a $4,400 invoice.
- **After:** new registrations write `amount_due` = the real half-price amount and `quantity = 1`. `amount_due × quantity` still gives the right answer for both old and new rows — nothing that already multiplied correctly needed to change.
- **The actual Stripe invoice amount sent at registration was never wrong** — `Math.round(price * 0.5)` was already correct before this refactor. Only the *local* bookkeeping columns changed. That's most of why this test is narrow: the money-movement code at registration time isn't part of what changed.
- **The one place real Stripe amounts *are* affected by this refactor** is the admin "Adjust Amount" sidebar (discount %/set amount) on `/admin/payments` — its input seeding, discount math, and submit conversion were rewritten to stay correct for both old (`quantity = 0.5`) and new (`quantity = 1`) rows. This is the one flow worth actually clicking through.
- Two known display bugs were fixed alongside this (same root cause — reading `amount_due` without the `× quantity`): the `EnrollmentPaymentDetail` sidebar (student profile / class detail) and the tuition reminder email. Worth a glance, not a deep test — pure display, no money involved.

---

## 2. Setup

Reuse everything from the invoicing guide's [§2](INVOICING_TESTING_GUIDE.md#2-one-time-environment-setup) — same test Supabase project, same Stripe sandbox, same `stripe listen`, same `npm run dev`. If your test project's `.env.local` is still pointed correctly and your dev server/`stripe listen` are already running from the last pass, skip straight to §3.

**New test student** — don't reuse Student A/B, their history is a tangle of void/reissue/refund test data from the last pass. Use a clean alias:

```
alexbensonux+refA@gmail.com
```

Pick a class with `enrollment_start`/`enrollment_close` open (same PARA-002 fix from the invoicing pass if it's closed again by now — see [INVOICING_TESTING_GUIDE.md §2.6](INVOICING_TESTING_GUIDE.md)).

---

## 3. Fresh registration — confirm the new data shape

### Walkthrough

1. `http://localhost:3000/checkout/details?classID=PARA-002` (or your open class).
2. Fill in Student Ref A's email/name → **Continue to Payment** → pay with `4242 4242 4242 4242`.
3. Watch the `npm run dev` terminal through `Invoice schedule created`, same as the original BEN-1175 check.

### Verify in SQL

```sql
select t.transaction_type, t.amount_due, t.quantity, t.amount_due * t.quantity as payable, t.stripe_invoice_id
from transactions t
join enrollments e on e.id = t.enrollment_id
join students s on s.id = e.student_id
join auth.users u on u.id = s.id
where u.email ilike 'alexbensonux+refA@gmail.com'
order by t.transaction_type;
```

**Expect:** `tuition_a`/`tuition_b` each have `quantity = 1` and `amount_due` = the real half-price dollar amount (not the full program price) — `payable` should equal `amount_due` exactly, since quantity is 1. `registration_fee` is unaffected (was always `quantity = 1`).

### Verify against Stripe

Open both tuition invoices in Stripe Dashboard → Invoices. Confirm the invoice amount matches `amount_due` from the query above — this is the "did we accidentally change what gets charged" check, and it shouldn't have, since the Stripe-side amount math didn't change.

### Verify the two display fixes (quick glance, not a deep test)

- `/admin/students/<student_id>` → **Invoices by Class** → click the card → confirm the sidebar's "Amount Due" for `tuition_a`/`tuition_b` matches the SQL `payable` value above (not double it).
- Trigger a reminder on the open `tuition_b` (same curl from the invoicing guide's §5) → confirm the email's amount matches too.

---

## 4. Admin "Adjust Amount" — confirm the money math on both row shapes

This is the one flow that actually changed real calculation logic, so it's worth testing on *both* an old-shape row and a new-shape row.

### 4a. New-shape row (quantity = 1) — from the registration you just did

1. `/admin/payments` → click Student Ref A's open `tuition_b` row.
2. Confirm **Current** shows the same `payable` amount from §3's SQL query — not double, not half.
3. **Apply Discount** → enter `50` → Save.
4. Re-run the SQL from §3, filtered to `tuition_b` — expect `amount_due` to have halved, `quantity` still `1`, `stripe_invoice_id` changed (old one **Void** in Stripe Dashboard, new one live at the discounted amount).
5. Confirm the *new* Stripe invoice's actual amount matches what you'd expect from a 50% discount off the pre-discount `payable` value — this is the actual regression check.

### 4b. Old-shape row (quantity = 0.5) — reuse Student A or B from the invoicing pass

If either still has an open tuition row with `quantity = 0.5` left over from BEN-1179/1180 testing:

1. Same sidebar, same **Current** check — should still show the correct real payable amount (not the full program price), proving the display fix handles old rows too.
2. **Set Amount** → type a specific dollar figure (e.g. `100.00`) → Save.
3. Check the resulting Stripe invoice amount is exactly $100 — **this is the critical check**: before this refactor's fix, typing a direct dollar amount into this field on an old-shape row would have set `amount_due` to that literal figure while `quantity` stayed `0.5`, actually charging *half* of what was typed. Confirming it now charges exactly what was typed is the whole point of this section.

If neither Student A nor B has an open tuition row left (everything from the last pass ended up paid/cancelled/refunded), skip 4b — there's no old-shape row left to test against, and that's fine; 4a already covers the code path that matters going forward.

---

## 5. Pass criteria

- New registrations write `tuition_a`/`tuition_b` with `quantity = 1` and `amount_due` = the real payable amount.
- Stripe invoice amounts at registration are unchanged (still correct).
- `/admin/payments`'s "Adjust Amount" sidebar shows the correct **Current** amount and produces the correct Stripe invoice amount after Apply Discount / Set Amount, on both a new-shape row and (if available) an old-shape row.
- The `EnrollmentPaymentDetail` sidebar and reminder email show the correct (non-doubled) amount.

If all of that holds, this is done — no need to re-run the full BEN-1175–1181 walkthrough, since nothing about enrollment creation, payment webhooks, reminders, void-and-reissue, or removal/refund logic itself changed in this pass, only the amount/quantity values those flows read and display.

## 6. Cleanup

Same as the invoicing guide's [§10](INVOICING_TESTING_GUIDE.md#10-cleanup) — restore your real `.env.local`, stop `stripe listen`/`npm run dev`. The test Supabase project can be trashed once you're satisfied; nothing here required a real migration, so there's nothing to reconcile against the live database.
