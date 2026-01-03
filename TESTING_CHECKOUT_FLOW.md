# Testing Guide: Checkout Flow Overhaul

This guide covers how to test the new Stripe Checkout Session flow.

## Prerequisites

### 1. Environment Variables

Ensure these are set in your `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (use TEST keys)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # For webhook testing
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

## Testing Methods

### Method 1: Manual End-to-End Testing (Recommended)

#### Step 1: Start Your Development Server

```bash
# For webapp
cd apps/webapp
npm run dev

# Or for checkout app
cd apps/checkout
npm run dev
```

#### Step 2: Navigate to Checkout Page

1. Open `http://localhost:3000/app/checkout/details?classID=YOUR_CLASS_ID`
2. Fill in:
   - Email: `test@example.com`
   - Full Name: `Test User`
3. Click "Continue to Payment"

#### Step 3: Complete Stripe Checkout

1. You'll be redirected to Stripe Checkout
2. Use Stripe test card: `4242 4242 4242 4242`
3. Any future expiry date (e.g., `12/34`)
4. Any CVC (e.g., `123`)
5. Complete the payment

#### Step 4: Verify Results

Check your database:

```sql
-- Check student was created/updated
SELECT * FROM students WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'test@example.com'
);

-- Check enrollment was created
SELECT * FROM enrollments 
WHERE student_id IN (
  SELECT id FROM auth.users WHERE email = 'test@example.com'
);

-- Check transactions were created
SELECT * FROM transactions 
WHERE enrollment_id IN (
  SELECT id FROM enrollments 
  WHERE student_id IN (
    SELECT id FROM auth.users WHERE email = 'test@example.com'
  )
);
```

### Method 2: API Endpoint Testing

#### Test Checkout Session Creation

```bash
curl -X POST http://localhost:3000/app/api/checkout/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "classId": "YOUR_CLASS_ID"
  }'
```

Expected response:
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/..."
}
```

### Method 3: Webhook Testing with Stripe CLI

#### Step 1: Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

#### Step 2: Login to Stripe CLI

```bash
stripe login
```

#### Step 3: Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3000/app/api/webhooks/stripe
```

This will output a webhook signing secret (starts with `whsec_`). Add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

#### Step 4: Trigger Test Webhook

In another terminal:

```bash
# Trigger checkout.session.completed event
stripe trigger checkout.session.completed
```

**Note**: This creates a generic test event. For a realistic test, you'll need to:

1. Create a checkout session via your API
2. Complete it manually in Stripe Dashboard
3. Or use Stripe's test mode to simulate completion

#### Step 5: Create Realistic Test Webhook

Create a test checkout session first, then trigger webhook:

```bash
# 1. Create checkout session (get session ID from response)
curl -X POST http://localhost:3000/app/api/checkout/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "classId": "YOUR_CLASS_ID"
  }'

# 2. In Stripe Dashboard, mark the session as completed
# Or use Stripe API to complete it programmatically
```

### Method 4: Unit Testing Helper Functions

Create a test file to test individual functions:

```typescript
// test-enrollments.ts
import { 
  findClassWithCourse, 
  getClassType,
  createTransaction,
  isPaymentIntentProcessed 
} from './apps/webapp/lib/enrollments';

async function testFindClassWithCourse() {
  try {
    const result = await findClassWithCourse('YOUR_CLASS_ID');
    console.log('Class found:', result.class.id);
    console.log('Course type:', result.courseType);
    console.log('Start date:', result.classStartDate);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function testCreateTransaction() {
  // You'll need valid enrollment_id, student_id, class_id
  try {
    const transaction = await createTransaction({
      enrollmentId: 'ENROLLMENT_UUID',
      studentId: 'STUDENT_UUID',
      classId: 'CLASS_UUID',
      classType: 'course',
      transactionType: 'registration_fee',
      quantity: 1,
      stripePaymentIntentId: 'pi_test_123',
      transactionStatus: 'paid',
      paymentDate: new Date().toISOString(),
      dueDate: new Date().toISOString(),
    });
    console.log('Transaction created:', transaction.id);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Testing Scenarios

### Scenario 1: Course Enrollment (Single Transaction)

**Setup:**
- Create a class with `course_uuid` pointing to a course with `type = 'course'`
- Ensure class has `stripe_price_id` set

**Expected Result:**
- 1 transaction created:
  - `transaction_type`: `'registration_fee'`
  - `transaction_status`: `'paid'`
  - `quantity`: `1`
  - `class_type`: `'course'`

### Scenario 2: Program Enrollment (Three Transactions)

**Setup:**
- Create a class with `course_uuid` pointing to a course with `type = 'program'`
- Ensure class has `stripe_price_id` set
- Set `class_start_date` to a future date (e.g., 4 weeks from now)

**Expected Result:**
- 3 transactions created:
  1. Registration Fee:
     - `transaction_type`: `'registration_fee'`
     - `transaction_status`: `'paid'`
     - `quantity`: `1`
  2. Tuition A:
     - `transaction_type`: `'tuition_a'`
     - `transaction_status`: `'pending'`
     - `quantity`: `0.5`
     - `due_date`: 3 weeks before `class_start_date`
  3. Tuition B:
     - `transaction_type`: `'tuition_b'`
     - `transaction_status`: `'pending'`
     - `quantity`: `0.5`
     - `due_date`: 1 week after `class_start_date`

### Scenario 3: Duplicate Payment Prevention

**Test:**
1. Process a payment (complete checkout)
2. Try to process the same payment intent again (resend webhook)

**Expected Result:**
- First webhook: Creates transactions
- Second webhook: Returns success but doesn't create duplicate transactions

### Scenario 4: Student Name Update

**Test:**
1. Create a student with email `test@example.com` and name `"John Doe"`
2. Complete checkout with same email but name `"John Smith"`

**Expected Result:**
- Student's `first_name` field updated to `"John Smith"`

## Debugging Tips

### Check Webhook Logs

The webhook handler logs extensively. Check your server console for:
- `[webhook] Extracted data: ...`
- `[webhook] Student found/created: ...`
- `[webhook] Class found: ...`
- `[webhook] Created course/program transaction: ...`

### Common Issues

1. **"Class not found"**
   - Verify `class_id` matches exactly (case-sensitive)
   - Check the class exists in database

2. **"stripe_price_id not configured"**
   - Ensure class has `stripe_price_id` set
   - Verify the price ID exists in Stripe

3. **"Could not extract metadata"**
   - Check checkout session was created with metadata
   - Verify `full_name` and `class_id` in metadata

4. **Webhook signature verification fails**
   - Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe CLI output
   - For local testing, use Stripe CLI's webhook secret

5. **Transaction creation fails**
   - Check transaction schema constraints
   - Verify `enrollment_id`, `student_id`, `class_id` are valid UUIDs
   - Ensure `quantity` is 1 or 0.5
   - Verify `transaction_type` matches allowed values

### Database Queries for Verification

```sql
-- Check recent enrollments
SELECT 
  e.id,
  e.student_id,
  e.class_id,
  s.first_name,
  c.class_name,
  c.class_id as class_text_id
FROM enrollments e
JOIN students s ON e.student_id = s.id
JOIN classes c ON e.class_id = c.id
ORDER BY e.created_at DESC
LIMIT 10;

-- Check recent transactions
SELECT 
  t.id,
  t.transaction_type,
  t.transaction_status,
  t.quantity,
  t.due_date,
  t.payment_date,
  t.stripe_payment_intent_id,
  c.class_name,
  s.first_name
FROM transactions t
JOIN enrollments e ON t.enrollment_id = e.id
JOIN classes c ON t.class_id = c.id
JOIN students s ON t.student_id = s.id
ORDER BY t.created_at DESC
LIMIT 20;

-- Verify no duplicate payment intents
SELECT 
  stripe_payment_intent_id,
  COUNT(*) as count
FROM transactions
WHERE stripe_payment_intent_id IS NOT NULL
GROUP BY stripe_payment_intent_id
HAVING COUNT(*) > 1;
```

## Stripe Test Cards

Use these test card numbers in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Expiry: Any future date (e.g., `12/34`)
CVC: Any 3 digits (e.g., `123`)

## Next Steps

After testing:

1. ✅ Verify transactions are created correctly
2. ✅ Check due dates for program tuition transactions
3. ✅ Confirm no duplicate processing
4. ✅ Test with both course and program classes
5. ✅ Verify student name updates work
6. ✅ Test error handling (missing metadata, invalid class, etc.)

