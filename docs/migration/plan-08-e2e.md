# Plan 8 — E2E checkout test

**Goal:** Full purchase flow verified on staging: checkout → Stripe → webhook → enrollment → transaction → confirmation page → admin.

**Prerequisites:** Plans 6 + 7 complete.

Follow [`END_TO_END_TESTING.md`](END_TO_END_TESTING.md) and [`TESTING_CHECKOUT_FLOW.md`](TESTING_CHECKOUT_FLOW.md) updated for new URLs.

> **Email is optional for now.** Confirmation email runs async in the Stripe webhook and does **not** block checkout, enrollment, or transactions. You can complete Tests 1–5 without Resend configured. Finish email in **8.6** (or alongside invoice email work — see note there).

## Steps

| Step | What | Who |
|------|------|-----|
| **8.0** | Confirm Stripe webhook points at staging (`/api/webhooks/stripe`) | You (may already be done from Plan 6) |
| **8.1** | **Test 1:** Course purchase (BLS) with card `4242…` | You click, agent can help debug |
| **8.2** | **Test 2:** Program purchase (EMT or Paramedic) | You |
| **8.3** | **Test 3:** Waitlist form | You |
| **8.4** | **Test 4:** Webhook idempotency (optional, Stripe CLI) | You or agent |
| **8.5** | **Test 5:** Check `/admin` for student + transaction | You |
| **8.6** | **Email:** Resend env vars + confirmation email (deferred) | You + Kyle |

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

## 8.6 Email env vars (deferred — finish with invoice work)

> **Account access:** Resend is not configured in this repo or on Vercel yet. Before adding env vars, either **create a new Resend account** or **get access to the existing account with Kyle** so we stay on the free tier and avoid duplicate paid accounts.
>
> Likely finish this alongside other **invoice / transactional email** integration — same API key, same verified sender domain (`noreply@midwestea.com`).

When ready, add in Vercel (Preview/staging scope):

| Variable | Sensitive | Notes |
|----------|-----------|-------|
| `RESEND_API_KEY` | Yes | From Resend dashboard |
| `EMAIL_FROM` | No | e.g. `noreply@midwestea.com` (must be a verified sender domain in Resend) |

Redeploy after setting. Verify with `GET /api/health/resend` on staging, then re-run one test purchase and confirm:

- Confirmation email received (inbox + Resend dashboard)
- `email_logs` row with `success: true` for the enrollment

See also [`docs/resend-smtp-setup.md`](../resend-smtp-setup.md) (Supabase Auth SMTP may already use the same key in the Supabase dashboard — not stored in this codebase).

## Stripe CLI (local debugging)

```bash
stripe login
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
# Copy whsec_... to STRIPE_WEBHOOK_SECRET
```

## Testing checklist (mark in migration-plan.md)

**Core E2E (required for Plan 8):**

- [ ] Course checkout completes on staging
- [ ] Program checkout completes on staging
- [ ] Success page renders (Plan 4)
- [ ] Enrollment row created
- [ ] Transaction row created
- [ ] Admin shows new student + transaction
- [ ] Waitlist submission works
- [ ] Webhook signature validation passes (reject unsigned POST)
- [ ] Failed payment does not create enrollment

**Email (deferred — 8.6):**

- [ ] Resend account accessible (new account or Kyle’s existing account)
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` on Vercel staging
- [ ] Confirmation email sent on test purchase

## Done criteria

- Documented test run on staging with date + class IDs used
- All **core E2E** checklist items pass
- No webhook errors in Vercel function logs (email failures without Resend configured are expected until 8.6)
- Email checklist can be completed later with invoice email work

---
