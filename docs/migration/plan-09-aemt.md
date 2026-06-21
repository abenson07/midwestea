# Plan 9 — Add AEMT program + class

**Status:** `done`

**Goal:** Add Advanced Emergency Medical Technician (AEMT) to the marketing site and wire it to Supabase like the existing EMT program. Duplicate the EMT program page content and structure; swap in AEMT-specific copy, assets, and Supabase records.

**Prerequisites:** Plan 8 E2E complete on staging.

> **Checkout testing not required for this plan.** Existing checkout/webhook flow is proven in Plan 8. This is a new program + class row + marketing page only.

## Who does what

| Step | What | Who | Status |
|------|------|-----|--------|
| **9.1** | Create AEMT **program** + **class** rows in Supabase | Agent | Done |
| **9.2** | Provide updated AEMT **hero image/video** assets | You | Pending |
| **9.3** | Duplicate EMT marketing page → AEMT route + content file | Agent | Done |
| **9.4** | Wire program gallery, nav, sitemap, metadata | Agent | Done (no sitemap route in app) |
| **9.5** | Verify register/waitlist CTAs from Supabase active class | You | Pending (checkout test on hold) |

## 9.1 Supabase — done

**Program** (`AEMT`): type `program`, Hybrid, $5,600 tuition / $100 registration fee.

**Class** (`AEMT-001`):

| Field | Value |
|-------|--------|
| Location | Topeka, Kansas |
| Orientation | 2026-08-19 |
| Enrollment | Open through 2026-07-29 |
| Stripe product | `prod_UkK3r0Ebcrkcl7` |
| Stripe price | `price_1TkpPFEOeSayLzNmKWZIYhaW` ($100 registration fee) |

## 9.2 Assets (you)

Provide hero media for AEMT (replace EMT placeholders):

- Video: poster + mp4 + webm (or static hero image if video deferred)
- Optional: Open Graph / meta image

Place under `apps/webapp/public/` following EMT naming (e.g. `/videos/aemt-hero-*`, `/images/aemt-hero.avif`).

Current page still uses EMT hero video and gallery image as placeholders.

## 9.3 Marketing page — done

| EMT (reference) | AEMT (new) |
|-----------------|------------|
| `/emergency-medical-technician` | `/advanced-emergency-medical-technician` |
| `emergency-medical-technician-content.ts` | `advanced-emergency-medical-technician-content.ts` |
| `programs-gallery-data.ts` entry | AEMT gallery card |
| `site-config` / nav / footer / redirects | Wired |

Register CTAs use existing Supabase enrichment (`enrich-page-checkout`).

## 9.4 Verification

- [x] AEMT page loads locally (register shows $100 / $5,600 from Supabase)
- [x] Program appears on `/programs` gallery
- [x] With active class: Register → checkout URL with `classID=AEMT-001`
- [ ] With no active class: waitlist URL (not re-tested)
- [x] Admin shows AEMT program + class rows
- [ ] Stripe checkout E2E on hold

## Done criteria

- [x] AEMT program + class exist in Supabase
- [ ] AEMT marketing page with **your** hero media (placeholders today)
- [x] Gallery + navigation updated
- [x] Register CTAs behave like EMT (verified locally; payment test deferred)
