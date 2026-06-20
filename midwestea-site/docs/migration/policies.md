# Policies

## Source & target
- **Webflow file**: `midwestea.webflow/policies.html`
- **Target route**: `/policies`
- **Reference template**: `/policies-list`
- **Template gap notes**: Reference template uses FAQ 6 only; Webflow uses section_faqs.hero with policy CMS list.

## Page metadata (from `<head>`)
- **title**: Policies
- **og:title**: Policies

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 339, 340, 415

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `section_faqs` | ~297 | FaqHero | `components/faq-hero.tsx (NEW)` | build-custom |

## Section content (verbatim extraction)

### Section 1: `section_faqs`
- **Webflow HTML line**: ~297
- **Webflow classes**: `section_faqs hero`
- **Component file**: `components/faq-hero.tsx (NEW)`
- **Action**: build-custom
- **Headings**:
  - h2: "Policies"
- **Paragraphs**:
  - "Need clarification?"
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
- [ ] Create route `app/policies/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Build custom component(s): FaqHero
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- CMS-bound fields (`w-dyn-bind-empty`) need data source
- Custom components required: FaqHero
- Fix reference template: replace bare FAQ 6 with FaqHero / ContactSection custom components
