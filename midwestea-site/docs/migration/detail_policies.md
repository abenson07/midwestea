# - Midwest Emergency Academy

## Source & target
- **Webflow file**: `midwestea.webflow/detail_policies.html`
- **Target route**: `/policies/[slug]`
- **Reference template**: `/policy`
- **Template gap notes**: Dynamic CMS template; export has w-dyn-bind-empty placeholders.

## Page metadata (from `<head>`)
- **title**: - Midwest Emergency Academy
- **description**: Review the Midwest Emergency Academy . This page provides clear, transparent information to help you understand our guidelines, student expectations, and institutional standards.
- **og:title**: - Midwest Emergency Academy
- **og:description**: Review the Midwest Emergency Academy . This page provides clear, transparent information to help you understand our guidelines, student expectations, and institutional standards.

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 360, 361, 435

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `policy-hero` | ~301 | Header 64 | `header-64.tsx` | extend-component |
| 2 | `section_policy-content` | ~330 | Content 7 | `content-7.tsx` | extend-component |

## Section content (verbatim extraction)

### Section 1: `policy-hero`
- **Webflow HTML line**: ~301
- **Webflow classes**: `policy-hero`
- **Component file**: `header-64.tsx`
- **Action**: extend-component
- **Paragraphs**:
  - "Policies Cross-referenced:"
  - "Adopted by"
  - "Ghalib Hajmohammad"
  - "CEO Midwest Emergency Academy"
  - "10/09/2024"
- **Links**:
  - [Contact Us](contact.html)
  - [FAQ](faq.html)
  - [Basic Life Support](basic-life-support.html)
  - [Advanced Cardiovascular Life Support](advanced-cardiovascular-life-support.html)
  - [Active Violence Emergency Response Training](active-shooter-training.html)
  - [Pediatric Advanced Life Support](pediatric-advanced-life-support.html)
  - [CPR/First Aid](cpr-first-aid.html)
  - [Pediatric CPR](pediatric-first-aid-cpr-aed.html)
  - [Child and Babysitting Safety](child-and-babysitting-safety.html)
  - [Use and Administration of Epinephrine](use-and-administration-of-epinephrine-auto-injectors.html)
- **Images** (1):
  - src: `images/MidwestEAlogo_MidwestEA_lockup_white.svg`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 2: `section_policy-content`
- **Webflow HTML line**: ~330
- **Webflow classes**: `section_policy-content`
- **Component file**: `content-7.tsx`
- **Action**: extend-component
- **Paragraphs**:
  - "Adopted by"
  - "Ghalib Hajmohammad"
  - "CEO Midwest Emergency Academy"
  - "10/09/2024"
- **Links**:
  - [Contact Us](contact.html)
  - [FAQ](faq.html)
  - [Basic Life Support](basic-life-support.html)
  - [Advanced Cardiovascular Life Support](advanced-cardiovascular-life-support.html)
  - [Active Violence Emergency Response Training](active-shooter-training.html)
  - [Pediatric Advanced Life Support](pediatric-advanced-life-support.html)
  - [CPR/First Aid](cpr-first-aid.html)
  - [Pediatric CPR](pediatric-first-aid-cpr-aed.html)
  - [Child and Babysitting Safety](child-and-babysitting-safety.html)
  - [Use and Administration of Epinephrine](use-and-administration-of-epinephrine-auto-injectors.html)
- **Images** (1):
  - src: `images/MidwestEAlogo_MidwestEA_lockup_white.svg`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 1 |

## Interactions / JS
- None detected beyond `midwestea.webflow/js/midwestea.js`
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/detail_policies/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Build custom component(s): Header 64, Content 7
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- CMS-bound fields (`w-dyn-bind-empty`) need data source
- Custom components required: Header 64, Content 7
