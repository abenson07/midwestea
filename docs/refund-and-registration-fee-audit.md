# Refund language and registration fee audit: midwestea.com

**Date checked:** October 16, 2026
**Method:** Searched all marketing-site source code (`apps/webapp/app/(marketing)`, `components/marketing`, `lib/marketing`, the policies data and the checkout pages) for "refund", "non-refundable" and every place a registration fee is shown. Then loaded the live pages on https://www.midwestea.com to confirm what students actually see.

## Summary

- **"Non-refundable" shows up in exactly one place on the site:** the payment breakdown on the **Paramedic** program page.
- Refunds in general come up on one other page, the **Terms of Service** (sections 4 and 5). It says refund rules "vary by course or program" and are "provided on each course or program page."
- The registration fee appears in **7 places**. Only **1 of the 7** has a non-refundable statement next to it.
- **Checkout does not mention refunds at all.** That covers the details page, the confirmation page, the Stripe payment session and the enrollment emails. Students also don't have to agree to the Terms before paying.

## 1. Every mention of refunds / "non-refundable"

| # | Page | Exact wording | Source |
|---|------|---------------|--------|
| 1 | `/paramedic`, "Three easy payments" section | "Due Today: $300 registration fee. **Due right now at enrollment, non-refundable**" | `components/marketing/paramedic-pricing.tsx:136` |
| 2 | `/terms-of-service`, §4 Course Enrollment & Payment | "By enrolling, you agree to: … Follow the refund and withdrawal policies stated on the course or program page" | `lib/marketing/pages/terms-of-service-content.tsx:69` |
| 3 | `/terms-of-service`, §5 Refunds & Cancellations | "Refund eligibility varies by course or program. Refunds are not guaranteed and may be subject to administrative fees. Details are provided on each course or program page." | `lib/marketing/pages/terms-of-service-content.tsx:77-86` |
| 4 | `/terms-of-service`, page meta description (search results only, not on the page) | "…payment terms, refund policies…" | `app/(marketing)/terms-of-service/page.tsx:8` |

Not found on: the FAQ (its "Enrollment & Payment" section covers payment plans but not refunds), the Student Policies pages (`/policies/*`), any program page other than Paramedic, any course page, How It Works, the home page, or the landing pages.

## 2. Every place the registration fee is shown

The fee amount comes from the class's `registration_fee` in the database. The site fills it into these spots when the page loads (`lib/marketing/enrich-page-checkout.ts`).

| # | Page / location | What the student sees (live, Oct 16 2026) | Labeled "registration fee"? | Non-refundable statement? |
|---|-----------------|--------------------------------------------|-----------------------------|---------------------------|
| 1 | `/paramedic`, hero button | "Register now for just $300.00" | No | **No** |
| 2 | `/paramedic`, "Three easy payments" section | "Due Today: $300 registration fee. Due right now at enrollment, non-refundable" | Yes | **Yes** |
| 3 | `/paramedic`, sticky enrollment bar | "Get certified today for just $300.00 · $8800 · Register" | No | **No** |
| 4 | `/emergency-medical-technician`, sticky enrollment bar (waitlist mode) | "Get certified today for just $100.00 · Join waitlist" | No | **No** |
| 5 | `/advanced-emergency-medical-technician`, sticky enrollment bar (waitlist mode) | "Get certified today for just $100.00 · Join waitlist" | No | **No** |
| 6 | Checkout, details page (`/checkout/details`) | "PAYMENT DETAILS: $300.00 registration fee. Due today. The remainder of your tuition will be $8,800.00…" (Paramedic shown as example) | Yes | **No** |
| 7 | Checkout, confirm page (`/checkout/confirm`) | Same payment schedule component as #6 | Yes | **No** |

Notes:
- When a class is open for registration, EMT and AEMT also show the fee on the hero button ("Register now for just $X") and the enrollment bar. Neither has refund wording. Right now both are in waitlist mode, so only the enrollment bar shows the price.
- Short courses (BLS, CPR/First Aid, etc.) show "Register for $X" and "Get certified today for just $X." That's the full course price, not a registration fee, and none of it has refund wording.
- The enrollment email template (`lib/email-templates/program-enrollment.html`) lists "Registration Fee:" with no refund wording.
- The Stripe payment session (`app/api/checkout/create-checkout-session/route.ts`) adds no custom text and doesn't ask the student to accept terms.

## 3. Related issue found during the audit

The Paramedic page's "Three easy payments" section doesn't match checkout:

- **Marketing page:** $300 today, then "Payment 1: $1,000, due 3 days before class starts" and "Payment 2: $1,000, due 2 weeks after class starts." These two amounts are hard-coded in `components/marketing/paramedic-pricing.tsx:139-147`.
- **Checkout:** $300 today, then $4,400 due 01/04/2027 and $4,400 due 02/01/2027.

## Which program was the student in?

- **Paramedic:** the site says "non-refundable" right next to the fee in the payment section. It doesn't say it on the hero button, the enrollment bar or at checkout.
- **EMT or AEMT:** the site never says the registration fee is non-refundable. The only refund language these students could have seen is the general Terms of Service, which points back to the program page for details, and the program page has none.
