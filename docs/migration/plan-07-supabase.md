# Plan 7 — Wire register buttons + course gallery to Supabase

**Goal:** Marketing CTAs route to dynamic checkout instead of static `buy.stripe.com` links. Course gallery shows live class data.

**Prerequisites:** Plan 6 staging deployed (or local with `.env.local` + test class in Supabase).

## 7.1 Create checkout URL helper

`apps/webapp/lib/marketing/checkout-url.ts`:

```typescript
export function checkoutDetailsUrl(classId: string, courseCode?: string): string {
  const params = new URLSearchParams({ classID: classId });
  if (courseCode) params.set('course_code', courseCode);
  return `/checkout/details?${params.toString()}`;
}
```

Matches existing checkout param convention: `classID` (capital ID) per [`checkout/details/page.tsx`](apps/webapp/app/checkout/details/page.tsx).

## 7.2 Wire course detail register buttons

Update content files in `lib/marketing/pages/` (~15 files with `registerUrl` / `registerHref`):

**Approach A (simple, staging-ready):** Map each course/program to a known default `class_id` from Supabase (hardcoded per course_code in a lookup table).

**Approach B (dynamic):** Server Component fetches active class by `course_code` from `/api/classes/by-course-code/[code]` at render time.

Recommend **Approach B** for course pages:

```typescript
// In course page server component or content loader
const { classes } = await fetch(`${baseUrl}/api/classes/by-course-code/bls`).then(r => r.json());
const registerUrl = classes?.[0] ? checkoutDetailsUrl(classes[0].classId) : '#';
```

**Files to update:**
- All `*-content.ts` with `registerUrl` / `registerHref` (grep: `buy.stripe.com`)
- [`components/marketing/enrollment-bar.tsx`](midwestea-site/components/enrollment-bar.tsx)
- [`components/marketing/product-header-6.tsx`](midwestea-site/components/product-header-6.tsx)
- [`components/marketing/program-hero.tsx`](midwestea-site/components/program-hero.tsx)
- [`lib/marketing/course-enrollment-bar.ts`](midwestea-site/lib/course-enrollment-bar.ts)

## 7.3 Wire course gallery (`/courses`)

Replace static list in [`course-gallery-content.ts`](midwestea-site/lib/pages/course-gallery-content.ts) with server-fetched data:

- Fetch `/api/classes/active` or query Supabase directly in Server Component
- Map to `Product1` props: name, price (from class record), image, url → course detail page with `?classID=` or hash params

Reference old Webflow behavior in [`webflow-scripts/course-detail-button-updater.js`](webflow-scripts/course-detail-button-updater.js) for URL param conventions.

## 7.4 Ensure test data exists

Per [`TESTING_CHECKOUT_FLOW.md`](TESTING_CHECKOUT_FLOW.md), each wired course needs a `classes` row with:
- `class_id`, `stripe_price_id`, `course_uuid`, `course_code`

Run verification:
```bash
npm run test:supabase  # from root
# or scripts/list-tables.ts
```

## Testing (Plan 7)

**Per-course manual matrix** (minimum 3 courses + 1 program):

| Page | Register button href | Expected |
|------|---------------------|----------|
| `/basic-life-support` | `/checkout/details?classID=...` | Loads checkout with correct class |
| `/paramedic` | same pattern | program class data |
| `/courses` gallery card | detail page or direct checkout | price matches Supabase |

**Automated where possible:**
- [ ] Grep `buy.stripe.com` in `apps/webapp/lib/marketing` → zero (except docs)
- [ ] Script: fetch `/api/classes/active` → returns array with expected course_codes

**Manual E2E (local or staging):**
- [ ] Click register on BLS page → checkout details shows correct class name/price
- [ ] `/courses` gallery shows prices matching Supabase (not hardcoded `$49.99` unless DB matches)
- [ ] Switch class on checkout details (if multiple classes per course) still works

## Done criteria
- No static Stripe payment links on production course/program pages
- Gallery and register buttons use Supabase class data
- At least 3 courses + 1 program verified end-to-end to checkout details

---
