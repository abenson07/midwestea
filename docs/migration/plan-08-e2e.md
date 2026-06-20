# Plan 8 — E2E checkout test

**Goal:** Full purchase flow verified on staging: checkout → Stripe → webhook → enrollment → email → confirmation page.

**Prerequisites:** Plans 6 + 7 complete.

Follow [`END_TO_END_TESTING.md`](END_TO_END_TESTING.md) and [`TESTING_CHECKOUT_FLOW.md`](TESTING_CHECKOUT_FLOW.md) updated for new URLs.

## 8.0 Email env vars (before testing confirmation emails)

Add in Vercel (Preview/staging scope):

| Variable | Sensitive | Notes |
|----------|-----------|-------|
| `RESEND_API_KEY` | Yes | From Resend dashboard |
| `EMAIL_FROM` | No | e.g. `noreply@midwestea.com` (must be a verified sender domain in Resend) |

Redeploy after setting. Verify with `GET /api/health/resend` on staging.

## Test matrix

### Test 1: Course purchase (Stripe Checkout Session)

1. Navigate to `/checkout/details?classID=<course-class-id>`
2. Enter test email + name → Continue to Payment
3. Stripe Checkout with card `4242 4242 4242 4242`
4. Redirect to `/purchase-confirmation/general`
5. Verify DB:
```sql
SELECT * FROM enrollments WHERE ...;
SELECT * FROM transactions WHERE ...;
```
6. Verify confirmation email received (Resend dashboard)

### Test 2: Program purchase (payment schedule if applicable)

Same flow with a program-type class (has `class_start_date`, multiple payment phases).

### Test 3: Waitlist flow

1. Navigate to `/checkout/waitlist?courseCode=<code>`
2. Submit waitlist form
3. Verify `waitlist` table entry

### Test 4: Webhook idempotency

- Replay same Stripe event via Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger checkout.session.completed
```
- Confirm no duplicate enrollments

### Test 5: Admin verification

- Log into `/admin`
- Confirm new student appears in `/admin/students`
- Confirm transaction in `/admin/payments`
- Confirm enrollment linked on student detail page

## Stripe CLI (local debugging)

```bash
stripe login
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
# Copy whsec_... to STRIPE_WEBHOOK_SECRET
```

## Testing checklist (mark in migration-plan.md)

- [ ] Course checkout completes on staging
- [ ] Program checkout completes on staging
- [ ] Success page renders (Plan 4)
- [ ] Enrollment row created
- [ ] Transaction row created
- [ ] Confirmation email sent
- [ ] Admin shows new student + transaction
- [ ] Waitlist submission works
- [ ] Webhook signature validation passes (reject unsigned POST)
- [ ] Failed payment does not create enrollment

## Done criteria
- Documented test run on staging with date + class IDs used
- All checklist items pass
- No webhook errors in Vercel function logs

---
