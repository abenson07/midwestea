# End-to-End Purchase Flow Testing Guide

This guide walks you through testing the complete purchase flow from checkout page through payment to confirmation email.

## Prerequisites

### 1. Environment Variables

Ensure these are set in your `.env.local` (in the project root):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (use TEST keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Will be provided by Stripe CLI

# Resend (for email sending)
RESEND_API_KEY=re_...  # Your Resend API key
```

### 2. Database Setup

Ensure you have:
- A class in the `classes` table with:
  - `class_id` (text field, e.g., "test-course-001")
  - `stripe_price_id` (Stripe price ID, e.g., "price_1234567890")
  - `course_uuid` (UUID linking to courses table)
  - `class_start_date` (for program testing)
- A course in the `courses` table with:
  - `id` matching the class's `course_uuid`
  - `type` field set to either "course" or "program"

### 3. Stripe CLI Setup

Install Stripe CLI if you haven't already:

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Login to Stripe CLI:

```bash
stripe login
```

## Step-by-Step Testing Process

### Step 1: Start the Development Servers

You'll need to run both the checkout app and the webapp (for webhook handling):

**Terminal 1 - Checkout App:**
```bash
cd apps/checkout
npm install  # if needed
npm run dev
```

The checkout app will run on `http://localhost:3000` (or next available port).

**Terminal 2 - Webapp (for webhooks):**
```bash
cd apps/webapp
npm install  # if needed
npm run dev
```

The webapp will run on a different port (e.g., `http://localhost:3001`). Note the port number.

### Step 2: Set Up Stripe Webhook Forwarding

**Terminal 3 - Stripe CLI:**
```bash
# Forward webhooks to your webapp webhook endpoint
# Replace PORT with the port your webapp is running on (e.g., 3001)
stripe listen --forward-to localhost:PORT/app/api/webhooks/stripe
```

**Important:** The Stripe CLI will output a webhook signing secret that starts with `whsec_`. Copy this value.

**Update your `.env.local`:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_...  # Paste the secret from Stripe CLI
```

**Restart your webapp** (Terminal 2) so it picks up the new webhook secret.

### Step 3: Navigate to Checkout Page

Open your browser and navigate to:

```
http://localhost:3000/?productId=YOUR_PRODUCT_ID&classId=YOUR_CLASS_ID
```

Replace:
- `YOUR_PRODUCT_ID` with a Stripe product ID (e.g., `prod_...`)
- `YOUR_CLASS_ID` with a class_id from your database (e.g., `test-course-001`)

**Example:**
```
http://localhost:3000/?productId=prod_abc123&classId=test-course-001
```

### Step 4: Fill Out Payment Form

1. **Email Address:** Enter your real email address (where you want to receive the confirmation email)
2. **Name on Card:** Enter your name
3. **Country:** Leave as "United States" or change if needed
4. **ZIP Code:** Enter any valid ZIP code (e.g., `97712`)

### Step 5: Complete Payment with Test Card

Use Stripe's test card:
- **Card Number:** `4242 4242 4242 4242`
- **Expiry Date:** Any future date (e.g., `12/34`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP Code:** Any 5 digits (e.g., `12345`)

Click "Pay [Amount]" button.

### Step 6: Verify Payment Success

You should be redirected to the success page at:
```
http://localhost:3000/success
```

### Step 7: Check Webhook Processing

**Check Terminal 2 (webapp)** for webhook logs. You should see:
```
[webhook] Processing payment_intent.succeeded: pi_...
[webhook] Student found/created: ...
[webhook] Class found: ...
[webhook] Enrollment created: ...
[webhook] Created course/program transaction: ...
[webhook] Sending enrollment confirmation email: ...
[webhook] Course/Program enrollment email sent successfully: ...
```

**Check Terminal 3 (Stripe CLI)** for webhook events:
```
2024-01-15 10:30:45   --> payment_intent.succeeded [evt_...]
2024-01-15 10:30:45  <--  [200] POST http://localhost:3001/app/api/webhooks/stripe [evt_...]
```

### Step 8: Verify Email Received

Check your email inbox (and spam folder) for the enrollment confirmation email. The email should include:
- Your name
- Course/Program name
- Payment details (amount, invoice number, payment date)
- For programs: Outstanding invoices table

### Step 9: Verify Database Records

Run these SQL queries in your Supabase SQL editor to verify everything was created:

```sql
-- Check student was created/updated
SELECT * FROM students 
WHERE email = 'your-email@example.com';

-- Check enrollment was created
SELECT 
  e.id,
  e.student_id,
  e.class_id,
  s.first_name,
  s.email,
  c.class_name
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN classes c ON e.class_id = c.id
WHERE s.email = 'your-email@example.com'
ORDER BY e.created_at DESC
LIMIT 1;

-- Check transactions were created
SELECT 
  t.id,
  t.transaction_type,
  t.transaction_status,
  t.quantity,
  t.amount_due,
  t.amount_paid,
  t.invoice_number,
  t.due_date,
  t.payment_date,
  t.stripe_payment_intent_id,
  c.class_name
FROM transactions t
JOIN enrollments e ON t.enrollment_id = e.id
JOIN students s ON e.student_id = s.id
JOIN classes c ON t.class_id = c.id
WHERE s.email = 'your-email@example.com'
ORDER BY t.created_at DESC;

-- Check email was logged
SELECT 
  el.id,
  el.enrollment_id,
  el.email_type,
  el.success,
  el.error_message,
  el.created_at
FROM email_logs el
JOIN enrollments e ON el.enrollment_id = e.id
JOIN students s ON e.student_id = s.id
WHERE s.email = 'your-email@example.com'
ORDER BY el.created_at DESC;
```

## Testing Different Scenarios

### Scenario 1: Course Enrollment

**Setup:**
- Use a class linked to a course with `type = 'course'`

**Expected Result:**
- 1 transaction created: `registration_fee` (status: `paid`)
- Course enrollment email sent

### Scenario 2: Program Enrollment

**Setup:**
- Use a class linked to a course with `type = 'program'`
- Ensure class has `class_start_date` set

**Expected Result:**
- 3 transactions created:
  1. `registration_fee` (status: `paid`)
  2. `tuition_a` (status: `pending`, due 3 weeks before start)
  3. `tuition_b` (status: `pending`, due 1 week after start)
- Program enrollment email sent with outstanding invoices table

### Scenario 3: Duplicate Payment Prevention

**Test:**
1. Complete a payment
2. Manually trigger the same webhook event again (using Stripe CLI)

**Expected Result:**
- First webhook: Creates transactions and sends email
- Second webhook: Returns success but doesn't create duplicates (idempotency check)

## Troubleshooting

### Payment Intent Not Processing

**Symptoms:** Payment succeeds but no enrollment/transaction created

**Check:**
1. Is the webhook secret correct in `.env.local`?
2. Are webhooks being forwarded correctly? (Check Stripe CLI terminal)
3. Check webapp logs for errors
4. Verify the webhook endpoint is accessible: `http://localhost:PORT/app/api/webhooks/stripe`

### Email Not Received

**Symptoms:** Payment processed but no email

**Check:**
1. Check `email_logs` table for errors
2. Verify `RESEND_API_KEY` is set correctly
3. Check webapp logs for email sending errors
4. Check spam folder
5. Verify email address is correct

### Missing Metadata Errors

**Symptoms:** Webhook logs show "Could not extract classId/email"

**Check:**
1. Verify `classId` is passed in URL query parameter
2. Verify email is filled in payment form
3. Check payment intent metadata in Stripe Dashboard

### Class Not Found Errors

**Symptoms:** Webhook logs show "Class not found"

**Check:**
1. Verify `class_id` in database matches exactly (case-sensitive)
2. Verify class exists and has required fields
3. Check `course_uuid` links to valid course

## Stripe Test Cards

Use these test card numbers:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

Expiry: Any future date (e.g., `12/34`)
CVC: Any 3 digits (e.g., `123`)

## Quick Test Checklist

- [ ] Both servers running (checkout + webapp)
- [ ] Stripe CLI forwarding webhooks
- [ ] Webhook secret updated in `.env.local`
- [ ] Navigate to checkout page with valid productId and classId
- [ ] Fill out payment form with your email
- [ ] Complete payment with test card `4242 4242 4242 4242`
- [ ] Redirected to success page
- [ ] Webhook logs show successful processing
- [ ] Email received in inbox
- [ ] Database records created (student, enrollment, transactions)
- [ ] Email logged in `email_logs` table

## Next Steps After Testing

Once you've verified the end-to-end flow works:

1. ✅ Test with different course/program types
2. ✅ Test error scenarios (declined cards, missing data)
3. ✅ Verify email templates render correctly
4. ✅ Test on different devices/browsers
5. ✅ Verify idempotency (duplicate webhook handling)
6. ✅ Check database constraints and data integrity

