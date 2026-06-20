# EMS Programs - EMR, EMT, Paramedic & Advanced Training | MidwestEA

## Source & target
- **Webflow file**: `midwestea.webflow/programs.html`
- **Target route**: `/programs`
- **Reference template**: `/program-gallery`

## Page metadata (from `<head>`)
- **title**: EMS Programs - EMR, EMT, Paramedic & Advanced Training | MidwestEA
- **description**: Explore all Midwest Emergency Academy programs, including EMR, EMT, Paramedic, Critical Care Transport, Community Paramedic, and Advanced Tactical Casualty Care. State-approved, expert-led training with flexible learning formats in the Kansas City area.
- **og:title**: Answer the Call with MidwestEA
- **og:description**: Explore all Midwest Emergency Academy programs, including EMR, EMT, Paramedic, Critical Care Transport, Community Paramedic, and Advanced Tactical Casualty Care. State-approved, expert-led training with flexible learning formats in the Kansas City area.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61c257d57b2e3f74d6_ccp-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 436, 437, 511

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `section-program-hero` | ~303 | ProgramGalleryHero | `components/program-gallery-hero.tsx (NEW)` | build-custom |
| 2 | `programs-scroller` | ~322 | ProgramsScroller | `components/programs-scroller.tsx (NEW)` | build-custom |

## Section content (verbatim extraction)

### Section 1: `section-program-hero`
- **Webflow HTML line**: ~303
- **Webflow classes**: `section-program-hero`
- **Component file**: `components/program-gallery-hero.tsx (NEW)`
- **Action**: build-custom
- **Tagline(s)**:
  - "Career programs"
- **Headings**:
  - h1: "Answer the call"
  - h1: "Emergency Medical Responder"
  - h4: "Classes"
  - h4: "Coming soon"
  - h1: "Emergency Medical Techinician"
  - h4: "Next class starts"
  - h4: "January 17th"
  - h1: "paramedic"
  - h4: "Next class starts"
  - h4: "January 12/13"
  - h1: "community paramedic"
  - h4: "Classes"
  - h4: "Coming soon"
  - h1: "Critical care paramedic"
  - h4: "classes"
  - _(+4 more headings)_
- **Paragraphs**:
  - "Join the ranks of those who run towards the disaster. Arm yourself with the skills you need to help those who need it most."
  - "Learn the lifesaving skills trusted responders rely on when every second counts. The EMR course gives you hands-on training to recognize emergencies, take decisive action, and provide critical care until EMS arrives."
  - "This state-approved EMR program helps you earn your certification in under 14 weeks — all for $750."
  - "Train to assess, stabilize, and care for patients during emergencies. Our state-approved EMT program blends online learning with in-person skills days so you can learn with confidence and at a pace that supports your schedule."
  - "This state-approved EMT program helps you earn your certification in just 12 weeks — all for $1,850."
  - "Take the next step in your EMS career with a state-approved Paramedic program designed for working EMTs. Learn advanced assessment, cardiology, pharmacology, airway management, and hands-on ALS care in a supportive, structured environment."
  - "This 12-month, state-approved Paramedic program helps you earn advanced certification on a shift-friendly schedule — all for $8,800."
  - "Learn to deliver comprehensive healthcare services in community settings, focusing on preventive care and chronic disease management."
  - "Gain the skills you need to provide crucial, basic life support to sick and injured patients in emergency situations"
  - "Learn to deliver comprehensive healthcare services in community settings, focusing on preventive care and chronic disease management."
  - _(+3 more paragraphs)_
- **Links**:
  - [Learn more](emergency-medical-responder.html)
  - [Learn more](emergency-medical-technician.html)
  - [Learn more](paramedic.html)
  - [Learn more](community-paramedic.html)
  - [Learn more](critical-care-transport.html)
  - [Learn more](advanced-tactical-casualty-care.html)
  - [Contact Us](contact.html)
  - [FAQ](faq.html)
  - [Basic Life Support](basic-life-support.html)
  - [Advanced Cardiovascular Life Support](advanced-cardiovascular-life-support.html)
- **Images** (7):
  - src: `images/emr-hero.avif`
  - src: `images/emt-hero.avif`
  - src: `images/paramedic-hero-vid.avif`
  - src: `images/cp-hero.avif`
  - src: `images/ccp.avif`
  - src: `images/atcc.avif`
  - src: `images/MidwestEAlogo_MidwestEA_lockup_white.svg`

### Section 2: `programs-scroller`
- **Webflow HTML line**: ~322
- **Webflow classes**: `programs-scroller`
- **Component file**: `components/programs-scroller.tsx (NEW)`
- **Action**: build-custom
- **Headings**:
  - h1: "Emergency Medical Responder"
  - h4: "Classes"
  - h4: "Coming soon"
  - h1: "Emergency Medical Techinician"
  - h4: "Next class starts"
  - h4: "January 17th"
  - h1: "paramedic"
  - h4: "Next class starts"
  - h4: "January 12/13"
  - h1: "community paramedic"
  - h4: "Classes"
  - h4: "Coming soon"
  - h1: "Critical care paramedic"
  - h4: "classes"
  - h4: "coming soon"
  - _(+3 more headings)_
- **Paragraphs**:
  - "Learn the lifesaving skills trusted responders rely on when every second counts. The EMR course gives you hands-on training to recognize emergencies, take decisive action, and provide critical care until EMS arrives."
  - "This state-approved EMR program helps you earn your certification in under 14 weeks — all for $750."
  - "Train to assess, stabilize, and care for patients during emergencies. Our state-approved EMT program blends online learning with in-person skills days so you can learn with confidence and at a pace that supports your schedule."
  - "This state-approved EMT program helps you earn your certification in just 12 weeks — all for $1,850."
  - "Take the next step in your EMS career with a state-approved Paramedic program designed for working EMTs. Learn advanced assessment, cardiology, pharmacology, airway management, and hands-on ALS care in a supportive, structured environment."
  - "This 12-month, state-approved Paramedic program helps you earn advanced certification on a shift-friendly schedule — all for $8,800."
  - "Learn to deliver comprehensive healthcare services in community settings, focusing on preventive care and chronic disease management."
  - "Gain the skills you need to provide crucial, basic life support to sick and injured patients in emergency situations"
  - "Learn to deliver comprehensive healthcare services in community settings, focusing on preventive care and chronic disease management."
  - "Gain the skills you need to provide crucial, basic life support to sick and injured patients in emergency situations"
  - _(+2 more paragraphs)_
- **Links**:
  - [Learn more](emergency-medical-responder.html)
  - [Learn more](emergency-medical-technician.html)
  - [Learn more](paramedic.html)
  - [Learn more](community-paramedic.html)
  - [Learn more](critical-care-transport.html)
  - [Learn more](advanced-tactical-casualty-care.html)
  - [Contact Us](contact.html)
  - [FAQ](faq.html)
  - [Basic Life Support](basic-life-support.html)
  - [Advanced Cardiovascular Life Support](advanced-cardiovascular-life-support.html)
- **Images** (7):
  - src: `images/emr-hero.avif`
  - src: `images/emt-hero.avif`
  - src: `images/paramedic-hero-vid.avif`
  - src: `images/cp-hero.avif`
  - src: `images/ccp.avif`
  - src: `images/atcc.avif`
  - src: `images/MidwestEAlogo_MidwestEA_lockup_white.svg`

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `images/emr-hero.avif` | — | 1 |
| `images/emt-hero.avif` | — | 1 |
| `images/paramedic-hero-vid.avif` | — | 1 |
| `images/cp-hero.avif` | — | 1 |
| `images/ccp.avif` | — | 1 |
| `images/atcc.avif` | — | 1 |
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 1 |

## Interactions / JS
- GSAP
- ScrollTrigger
- Inline programs-scroller script
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/programs/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Build custom component(s): ProgramGalleryHero, ProgramsScroller
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- Custom components required: ProgramGalleryHero, ProgramsScroller
