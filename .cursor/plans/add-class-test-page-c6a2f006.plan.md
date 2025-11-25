<!-- c6a2f006-974d-46c0-90f6-0405027bb080 06b274a5-be8a-4c47-8e96-75c51e81ef01 -->
# Update Class Form with Course Field Copying

## Overview

When a course is selected in the class creation form, automatically copy specific fields from the courses table to populate the new class. Also handle the product_id foreign key relationship.

## Files to Modify

### 1. Update Course Interface and getCourses Function

- **File**: `apps/admin/lib/classes.ts`
- Expand `Course` interface to include:
  - `length_of_class: string | null`
  - `certification_length: number | null`
  - `graduation_rate: number | null`
  - `registration_limit: number | null`
  - `price: number | null`
  - `registration_fee: number | null`
  - `stripe_product_id: string | null` (for product_id FK)
- Update `getCourses()` to fetch all these fields

### 2. Update createClass Function

- **File**: `apps/admin/lib/classes.ts`
- Add parameters for all copied fields:
  - `lengthOfClass`
  - `certificationLength`
  - `graduationRate`
  - `registrationLimit`
  - `price`
  - `registrationFee`
  - `productId` (from stripe_product_id)
- Update the insert statement to include all these fields

### 3. Update Add Class Form

- **File**: `apps/admin/app/add_class_test/page.tsx`
- Add state variables for all copied fields
- When a course is selected, auto-populate these fields from the selected course
- Display these fields in the form (as read-only or editable - need to clarify)
- Pass all fields to createClass when saving

## Implementation Details

### Field Mapping

- `course_name` → `class_name` (already handled)
- `length_of_class` → `length_of_class` (copy)
- `certification_length` → `certification_length` (copy)
- `graduation_rate` → `graduation_rate` (copy)
- `registration_limit` → `registration_limit` (copy)
- `price` → `price` (copy)
- `registration_fee` → `registration_fee` (copy)
- `stripe_product_id` → `product_id` (FK copy)

### Form Behavior

- When user selects a course from dropdown, automatically populate all the above fields
- Fields can be displayed as read-only (showing they're copied) or editable (allowing overrides)
- All fields must be included in the createClass call

### Foreign Keys

- `course_uuid` → already set from selected course `id`
- `course_code` → already set from selected course `course_code`
- `product_id` → set from selected course `stripe_product_id`