# General

## Source & target
- **Webflow file**: `midwestea.webflow/purchase-confirmation/general.html`
- **Target route**: `/purchase-confirmation/general`
- **Reference template**: `/order-confirmation`
- **Template gap notes**: Reference template uses CustomPlaceholder Confirmation only.

## Page metadata (from `<head>`)
- **title**: General
- **og:title**: General
- **robots**: noindex, nofollow, nosnippet, noarchive

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 314, 315, 412

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `content-hero` | ~297 | Header 64 | `header-64.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `content-hero`
- **Webflow HTML line**: ~297
- **Webflow classes**: `content-hero fill-space`
- **Component file**: `header-64.tsx`
- **Action**: update-content
- **Headings**:
  - h1: "Order confrimed"
- **Paragraphs**:
  - "We've received your order. We'll be in touch with next steps. If you do not hear from us within 2 business days, please reach out to us at kbrower@midwestea.com."
- **Links**:
  - [Contact Us](../contact.html)
  - [FAQ](../faq.html)
  - [Basic Life Support](../basic-life-support.html)
  - [Advanced Cardiovascular Life Support](../advanced-cardiovascular-life-support.html)
  - [Active Violence Emergency Response Training](../active-shooter-training.html)
  - [Pediatric Advanced Life Support](../pediatric-advanced-life-support.html)
  - [CPR/First Aid](../cpr-first-aid.html)
  - [Pediatric CPR](../pediatric-first-aid-cpr-aed.html)
  - [Child and Babysitting Safety](../child-and-babysitting-safety.html)
  - [Use and Administration of Epinephrine](../use-and-administration-of-epinephrine-auto-injectors.html)
- **Images** (1):
  - src: `../images/MidwestEAlogo_MidwestEA_lockup_white.svg`

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `../images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 1 |

## Interactions / JS
- None detected beyond `midwestea.webflow/js/midwestea.js`
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/purchase-confirmation/general/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
