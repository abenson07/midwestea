# Webhook Debug Summary

## Status Report: What Worked / What Failed

### ✅ PASSED

1. **Create Stripe Customer** ✅
   - Customer created: `cus_Tj2S6NvDgLpnE0`
   - Email: `payloadtest@test.com`

2. **Create Checkout Session** ✅
   - Session created: `cs_test_a1bgcKKse79FK5Y0AqJTvdrmuM0A4DCaTjCQelhZaqWdI5dPO34B9kxNkl`
   - API returned 200
   - Redirect URL generated correctly

3. **Extract Metadata** ✅
   - `class_id`: `"PARA-002"` ✅
   - `full_name`: `"payload test"` ✅
   - `payment_intent`: `pi_3SlaOJEOeSayLzNm1HLqbuMi` ✅

### ❌ FAILED

4. **Find Class in Database** ❌
   - Error: `"Failed to create placeholder class: null value in column \"course_uuid\" of relation \"classes\" violates not-null constraint"`
   - **Root Cause**: The error message suggests old code is still running OR the class lookup is failing
   - **Likely Issue**: Class `PARA-002` either:
     - Doesn't exist in database
     - Exists but `course_uuid` is NULL
     - `class_id` field doesn't match exactly (case-sensitive)

5. **Create Student** ⚠️ (Didn't reach this step)
6. **Create Enrollment** ❌ (Didn't reach this step)
7. **Create Transactions** ❌ (Didn't reach this step)

## Issues Identified

### Issue 1: Duplicate Webhook Events
**Problem**: Two `checkout.session.completed` events firing
**Cause**: Stripe retries failed webhooks (normal behavior)
**Solution**: ✅ Fixed - Added idempotency check by `payment_intent_id`

### Issue 2: Payment Intent Handlers
**Problem**: `payment_intent.created` and `payment_intent.succeeded` handlers still active
**Solution**: ✅ Fixed - Removed handlers, now return early with "ignored" message

### Issue 3: Class Lookup Failure
**Problem**: Error about "placeholder class" suggests old code OR class lookup failing
**Root Cause**: Need to verify:
1. Does class `PARA-002` exist in database?
2. Does it have `course_uuid` set?
3. Is `class_id` field matching exactly?

## What to Check Next

### 1. Verify Class Exists

Run this SQL query:

```sql
SELECT 
  id,
  class_id,
  course_uuid,
  class_name,
  stripe_price_id
FROM classes
WHERE class_id = 'PARA-002';
```

**Expected**: Should return 1 row with:
- `course_uuid` NOT NULL
- `stripe_price_id` NOT NULL

### 2. Check Course Relationship

```sql
SELECT 
  c.id as course_id,
  c.type as course_type,
  cl.class_id,
  cl.course_uuid
FROM classes cl
LEFT JOIN courses c ON cl.course_uuid = c.id
WHERE cl.class_id = 'PARA-002';
```

**Expected**: Should return 1 row with `course_type` = 'course' or 'program'

### 3. Test Class Lookup Function

The error suggests `findClassWithCourse('PARA-002')` is failing. Check:
- Is the class in the database?
- Does it have `course_uuid` set?
- Is the `class_id` field exactly `'PARA-002'` (case-sensitive)?

## Fixes Applied

1. ✅ Removed `payment_intent.created` and `payment_intent.succeeded` handlers
2. ✅ Improved idempotency check (checks by `payment_intent_id`)
3. ✅ Better error handling in `findClassWithCourse`:
   - Validates `course_uuid` exists
   - Better error messages
   - Uses `maybeSingle()` instead of `single()` for safer queries

## Next Steps

1. **Verify Database**: Check that class `PARA-002` exists and has required fields
2. **Test Again**: Retry the checkout flow
3. **Check Logs**: Look for `[webhook]` log messages to see exactly where it's failing
4. **If Class Missing**: Create the class or update existing class with proper `course_uuid`

## Code Changes Made

### `apps/webapp/app/api/webhooks/stripe/route.ts`
- Removed `payment_intent.*` handlers
- Improved idempotency check
- Better error logging

### `apps/webapp/lib/enrollments.ts`
- Improved `findClassWithCourse` error handling
- Validates `course_uuid` exists before proceeding
- Better error messages

