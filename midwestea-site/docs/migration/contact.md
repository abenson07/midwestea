# Contact Midwest Emergency Academy

## Source & target
- **Webflow file**: `midwestea.webflow/contact.html`
- **Target route**: `/contact`
- **Reference template**: `/contact`
- **Template gap notes**: Reference template uses FAQ 6 only; Webflow uses contact_component + FAQ accordions.

## Page metadata (from `<head>`)
- **title**: Contact Midwest Emergency Academy
- **description**: Get in touch with Midwest Emergency Academy. Whether you have questions about enrollment, programs, schedules, or certification courses, our team is here to help. Reach out for support and guidance.
- **og:title**: Contact Midwest Emergency Academy
- **og:description**: Get in touch with Midwest Emergency Academy. Whether you have questions about enrollment, programs, schedules, or certification courses, our team is here to help. Reach out for support and guidance.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c619e3ead5c44aaff28_cp-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 419, 420, 495

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `section_faqs` | ~303 | FaqHero | `components/faq-hero.tsx (NEW)` | build-custom |

## Section content (verbatim extraction)

### Section 1: `section_faqs`
- **Webflow HTML line**: ~303
- **Webflow classes**: `section_faqs hero`
- **Component file**: `components/faq-hero.tsx (NEW)`
- **Action**: build-custom
- **Headings**:
  - h2: "Contact us"
  - h2: "Most common questions"
- **Paragraphs**:
  - "Got a specific question?"
  - "Step up and train"
  - "While most courses do not require previous medical experience, some advanced programs do have prerequisites such as age requirements, BLS certification, or active EMS credentials."
  - "Yes. MidwestEA provides state-approved training aligned with NREMT, AHA, and national EMS standards. Our courses are built for students in the Kansas City metro and the wider regional area we serve. Certification validity depends on the course (most are 2 years), and advanced programs list state-specific and national acceptance clearly."
  - "Course length varies by program. Short courses may take a few hours, while larger programs like EMT or Paramedic span weeks. Each course and program page includes a clear breakdown of total hours and delivery format."
  - "We offer a variety of training formats to fit your needs. While our certification courses are delivered online for convenience, our EMR and EMS training programs include required hands-on components to ensure you build real, job-ready skills. Our team can accommodate special in-person requests when possible."
  - "Upon successful completion, you’ll receive a certification or completion record that meets state and national requirements for that course. For EMS programs (EMT, Paramedic, CCP), you’ll also receive instructions on next steps such as testing, licensure, or continuing education."
- **FAQ items** (5):
  - `questions[0].title`: "Do I need any experience before taking a course?"
  - `questions[0].answer`: "While most courses do not require previous medical experience, some advanced programs do have prerequisites such as age requirements, BLS certification, or active EMS credentials."
  - `questions[1].title`: "Are your certifications accepted in Missouri, Kansas, and nationally?"
  - `questions[1].answer`: "Yes. MidwestEA provides state-approved training aligned with NREMT, AHA, and national EMS standards. Our courses are built for students in the Kansas City metro and the wider regional area we serve. Certification validity depends on the course (most are 2 years), and advanced programs list state-spe…"
  - `questions[2].title`: "How long does it take to complete a course?"
  - `questions[2].answer`: "Course length varies by program. Short courses may take a few hours, while larger programs like EMT or Paramedic span weeks. Each course and program page includes a clear breakdown of total hours and delivery format."
  - `questions[3].title`: "Are courses and programs offered online, in person, or hybrid?"
  - `questions[3].answer`: "We offer a variety of training formats to fit your needs. While our certification courses are delivered online for convenience, our EMR and EMS training programs include required hands-on components to ensure you build real, job-ready skills. Our team can accommodate special in-person requests when …"
  - `questions[4].title`: "What happens after I complete the course?"
  - `questions[4].answer`: "Upon successful completion, you’ll receive a certification or completion record that meets state and national requirements for that course. For EMS programs (EMT, Paramedic, CCP), you’ll also receive instructions on next steps such as testing, licensure, or continuing education."
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

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 1 |

## Interactions / JS
- None detected beyond `midwestea.webflow/js/midwestea.js`
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/contact/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Build custom component(s): FaqHero
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- Custom components required: FaqHero
- Fix reference template: replace bare FAQ 6 with FaqHero / ContactSection custom components
