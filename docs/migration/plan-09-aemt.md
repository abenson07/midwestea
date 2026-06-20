# Plan 9 — Add AEMT program + class

**Status:** `pending`

**Goal:** Add Advanced Emergency Medical Technician (AEMT) to the marketing site and wire it to Supabase like the existing EMT program. Duplicate the EMT program page content and structure; swap in AEMT-specific copy, assets, and Supabase records.

**Prerequisites:** Plan 8 E2E complete on staging.

> **Checkout testing not required for this plan.** Existing checkout/webhook flow is proven in Plan 8. This is a new program + class row + marketing page only.

## Who does what

| Step | What | Who |
|------|------|-----|
| **9.1** | Create AEMT **program** + **class** rows in Supabase | Agent (via workspace Supabase MCP) |
| **9.2** | Provide updated AEMT **hero image/video** assets | You |
| **9.3** | Duplicate EMT marketing page → AEMT route + content file | Agent |
| **9.4** | Wire program gallery, nav, sitemap, metadata | Agent |
| **9.5** | Verify register/waitlist CTAs from Supabase active class | You (smoke test) |

## 9.1 Supabase (agent + you)

**Workspace MCP:** `.cursor/mcp.json` → `supabase-midwestea` (project `rvhwgvzueoefemchvbcs`). First use opens Supabase OAuth in the browser.

Create records mirroring EMT structure:

- **Program** row (course type `program`, course code e.g. `AEMT`)
- **Class** row linked to program (e.g. `AEMT-001`) with:
  - `class_start_date`, pricing fields, `stripe_price_id` (live price when ready)
  - `is_active` / registration flags consistent with other programs

Reference existing EMT program + class rows when duplicating field values.

## 9.2 Assets (you)

Provide hero media for AEMT (replace EMT placeholders):

- Video: poster + mp4 + webm (or static hero image if video deferred)
- Optional: Open Graph / meta image

Place under `apps/webapp/public/` following EMT naming (e.g. `/videos/aemt-hero-*`, `/images/aemt-hero.avif`).

## 9.3 Marketing page (agent)

Duplicate EMT implementation:

| EMT (reference) | AEMT (new) |
|-----------------|------------|
| `/emergency-medical-technician` | TBD route (e.g. `/advanced-emergency-medical-technician`) |
| `emergency-medical-technician-content.ts` | `advanced-emergency-medical-technician-content.ts` (or agreed slug) |
| `programs-gallery-data.ts` entry | New AEMT gallery card |
| `site-config` / nav links | Add AEMT where EMT appears |

Copy all EMT sections (hero, enrollment bar, Layout blocks, FAQ, team, etc.) and update titles/copy for AEMT. Register CTAs use existing Supabase enrichment (`enrich-page-checkout`) — no checkout code changes expected.

## 9.4 Verification (smoke test)

- [ ] AEMT page loads on staging
- [ ] Program appears on `/programs` gallery
- [ ] With active class: Register → checkout URL with correct `classID`
- [ ] With no active class: Coming soon → waitlist URL with correct `courseCode`
- [ ] Admin shows new program + class rows

**Not in scope:** Full Stripe checkout E2E (already covered by Plan 8).

## Done criteria

- AEMT program + class exist in Supabase
- AEMT marketing page live on staging with your hero media
- Gallery + navigation updated
- Register/waitlist CTAs behave like EMT
