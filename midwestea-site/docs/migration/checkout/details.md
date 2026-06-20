# Details

## Source & target
- **Webflow file**: `midwestea.webflow/checkout/details.html`
- **Target route**: `/checkout/details`
- **Reference template**: `NEW TEMPLATE REQUIRED`

## Page metadata (from `<head>`)
- **title**: Details
- **og:title**: Details

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `checkout-section` | ~208 | CheckoutDetails | `components/checkout-details.tsx (NEW)` | build-custom |

## Section content (verbatim extraction)

### Section 1: `checkout-section`
- **Webflow HTML line**: ~208
- **Webflow classes**: `checkout-section`
- **Component file**: `components/checkout-details.tsx (NEW)`
- **Action**: build-custom
- **Headings**:
  - h1: "Basic Life Support Course"
  - h2: "$49.99"
- **Images** (2):
  - src: `https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg`
  - src: `../images/Company-Logo.svg`

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `https://d3e54v103j8qbb.cloudfront.net/plugins/Basic/assets/placeholder.60f9b1840c.svg` | — | 1 |
| `../images/Company-Logo.svg` | — | 1 |

## Interactions / JS
- None detected beyond `midwestea.webflow/js/midwestea.js`
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/checkout/details/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Build custom component(s): CheckoutDetails
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- Custom components required: CheckoutDetails
