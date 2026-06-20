# Courses How it Works

## Source & target
- **Webflow file**: `midwestea.webflow/how-it-works/couress.html`
- **Target route**: `/how-it-works/couress`
- **Reference template**: `partial Layout 493`

## Page metadata (from `<head>`)
- **title**: Courses How it Works
- **og:title**: Courses How it Works
- **robots**: noindex, nofollow, nosnippet, noarchive

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 361, 362, 459

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `content-hero` | ~297 | Header 64 | `header-64.tsx` | update-content |
| 2 | `section_layout493` | ~298 | Layout 493 | `layout-493.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `content-hero`
- **Webflow HTML line**: ~297
- **Webflow classes**: `content-hero`
- **Component file**: `header-64.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Get started today"
  - h3: "Register & Get Started"
  - h3: "Take the Test"
  - h3: "Get certified"
- **Paragraphs**:
  - "Getting your certification has never been easier."
  - "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
  - "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards."
- **Tabs** (3):
  - `tabs[0].title`: "Register & Get Started"
  - `tabs[0].description`: "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - `tabs[1].title`: "Take the Test"
  - `tabs[1].description`: "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
  - `tabs[2].title`: "Get certified"
  - `tabs[2].description`: "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards."
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
- **Images** (4):
  - src: `../images/online2.avif`
  - src: `../images/online.avif`
  - src: `../images/firefigther-prep.png`
  - src: `../images/MidwestEAlogo_MidwestEA_lockup_white.svg`

### Section 2: `section_layout493`
- **Webflow HTML line**: ~298
- **Webflow classes**: `section_layout493`
- **Component file**: `layout-493.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Get started today"
  - h3: "Register & Get Started"
  - h3: "Take the Test"
  - h3: "Get certified"
- **Paragraphs**:
  - "Getting your certification has never been easier."
  - "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
  - "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards."
- **Tabs** (3):
  - `tabs[0].title`: "Register & Get Started"
  - `tabs[0].description`: "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - `tabs[1].title`: "Take the Test"
  - `tabs[1].description`: "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
  - `tabs[2].title`: "Get certified"
  - `tabs[2].description`: "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards."
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
- **Images** (4):
  - src: `../images/online2.avif`
  - src: `../images/online.avif`
  - src: `../images/firefigther-prep.png`
  - src: `../images/MidwestEAlogo_MidwestEA_lockup_white.svg`

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `../images/online2.avif` | — | 1 |
| `../images/online.avif` | — | 1 |
| `../images/firefigther-prep.png` | — | 1 |
| `../images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 1 |

## Interactions / JS
- None detected beyond `midwestea.webflow/js/midwestea.js`
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/how-it-works/couress/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
