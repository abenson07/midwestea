# Class Creation & Stripe Price ID Flow

## Summary

When a new class is created, **the only Stripe-related value passed is `course.stripe_product_id`** (or `program.stripe_product_id` for programs). This is stored in the class as `product_id`. **Checkout expects `stripe_price_id`** on the class—a Stripe **price** ID (`price_xxx`), not a product ID (`prod_xxx`). If the course/program has test-mode Stripe IDs configured, new classes will inherit those and produce test-mode checkout URLs.

---

## 1. Class creation flow – where the ID comes from

### Entry points (all pass `stripe_product_id` from course/program)

| Location | File | What's passed |
|----------|------|----------------|
| Course detail page (add class) | `apps/webapp/app/dashboard/courses/[id]/page.tsx` | `selectedCourse.stripe_product_id \|\| null` |
| Program detail page (add class) | `apps/webapp/app/dashboard/programs/[id]/page.tsx` | `selectedProgram.stripe_product_id \|\| null` |
| Add class page | `apps/webapp/app/dashboard/classes/add/page.tsx` | `courseToUse.stripe_product_id \|\| null` |
| Add class test page | `apps/webapp/app/dashboard/add_class_test/page.tsx` | `selectedCourse.stripe_product_id \|\| null` |
| Classes page (bulk add) | `apps/webapp/app/dashboard/classes/page.tsx` | `selectedCourse.stripe_product_id \|\| null` |

### API behavior

**`apps/webapp/app/api/classes/create/route.ts`**

- Receives `productId` in the request body.
- Inserts into `classes` with `product_id: productId || null`.
- **Does not set `stripe_price_id`** at all.

So new classes get `product_id` set from the course’s `stripe_product_id`; `stripe_price_id` is never written during creation.

---

## 2. Where `stripe_price_id` is used

**`apps/webapp/app/api/checkout/create-checkout-session/route.ts`**

- Fetches the class and reads `stripe_price_id`.
- If `stripe_price_id` is null, returns 400: “Class is missing price configuration.”
- Passes `stripe_price_id` to Stripe when creating the checkout session.

Checkout therefore relies on `stripe_price_id` being populated on the class, but creation only sets `product_id`.

---

## 3. Source of truth: courses and programs

### Courses (`courses` table)

- `stripe_product_id`: Stripe product or price ID stored on the course.
- Updated via:
  - Course edit form in dashboard
  - Admin course edit

### Programs (`courses` table with `program_type = 'program'`)

- Same `stripe_product_id` field.
- Updated via program edit in dashboard.

---

## 4. What to fix for production/live Stripe

To avoid test-mode URLs on new classes, ensure:

1. **Courses** (`courses.stripe_product_id`): configured with live-mode Stripe IDs (no `_test_` in IDs).
2. **Programs**: same `stripe_product_id` field, must use live IDs.
3. **Classes**:
   - Creation sets `product_id` from course/program `stripe_product_id`.
   - Checkout expects `stripe_price_id`. If your DB uses the same column for both, or `stripe_price_id` is populated from `product_id` elsewhere, that pipeline must also use live-mode IDs.

---

## 5. Things to verify

1. **Courses/programs**  
   For each course/program used for class creation, confirm `stripe_product_id` in the DB is a live-mode Stripe ID (or live price ID if that’s what you use).

2. **Product vs price**  
   - Stripe **product** IDs: `prod_xxx`  
   - Stripe **price** IDs: `price_xxx`  
   Checkout sessions require a price ID. If `stripe_product_id` holds `prod_xxx`, there must be logic (or manual setup) to get the corresponding `price_xxx` for `stripe_price_id`. Otherwise, the field may actually be storing price IDs despite the name.

3. **Where `stripe_price_id` is set**  
   It is not set during class creation. It may be:
   - Populated by a script or migration,
   - Set manually,
   - Or the same as `product_id` (or sourced from it). Check your DB schema and any sync scripts.

---

## 6. Quick reference – course codes and Stripe

From `add_stripe_payment_links.sql` (payment links by course code):

- PALS, EPI, ATCC, CCT, EMT, EMR, PARA, BLS, AVERT, ACLS, PATH, CABS, CPR, OXY, PEDS

For each course you use to create classes, ensure the corresponding `stripe_product_id` (and any derived `stripe_price_id`) uses live-mode Stripe IDs.
