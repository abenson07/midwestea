# Frequently Asked Questions – Midwest Emergency Academy

## Source & target
- **Webflow file**: `midwestea.webflow/faq.html`
- **Target route**: `/faq`
- **Reference template**: `/faq`
- **Template gap notes**: Reference template uses FAQ 6 only; Webflow uses section_faqs.hero with left nav + grouped FAQs.

## Page metadata (from `<head>`)
- **title**: Frequently Asked Questions – Midwest Emergency Academy
- **description**: Find answers to common questions about enrollment, payment, program requirements, certification courses, scheduling, and student support at Midwest Emergency Academy. Get clear, helpful information to guide your next steps.
- **og:title**: Have a question? We have the answers.
- **og:description**: Find answers to common questions about enrollment, payment, program requirements, certification courses, scheduling, and student support at Midwest Emergency Academy. Get clear, helpful information to guide your next steps.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/692215ea479c8c440dc20f93_avert-threat.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 746, 747, 822

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
  - h2: "Questions?"
  - h2: "Enrollment & Payment"
  - h2: "Course & Program Details"
  - h2: "Certifications & Continuing Education"
- **Paragraphs**:
  - "Looking for something specific?"
  - "Most courses do not require prior medical experience. Some programs—like EMT or Paramedic—have specific prerequisites such as age requirements, BLS certification, or active EMS credentials. Each course lists what you need before signing up."
  - "You can register directly through our website. Some programs require an application or additional documents before acceptance. Your confirmation email includes next steps and any material you’ll need."
  - "Yes. Many programs offer flexible payment options to make training more accessible. Options vary by course and will be shown during checkout or explained during the program application process."
  - "MidwestEA serves the Kansas City metro and surrounding region. While courses are delivered online, our programs and any in-person training designed specifically for students within this service area."
  - "All courses are currently online only. If your group or organization needs in-person instruction, we can accommodate that by request. EMS programs may include blended components with required hands-on skills labs."
  - "Length varies—short certifications take a few hours, while EMS programs may span weeks or months. Each course page lists the estimated time commitment and structure."
  - "Most online courses include everything you need inside the platform. Programs that require skills sessions or clinical components provide a list of required materials or uniforms during enrollment."
  - "Class size varies by course. Online courses allow self-paced learning, while programs with hands-on skills sessions use small instructor-to-student ratios to maintain quality."
  - "In many cases, yes—depending on availability and program policies. Contact student support as early as possible to make changes."
  - _(+1 more paragraphs)_
- **FAQ items** (10):
  - `questions[0].title`: "What do I need before enrolling?"
  - `questions[0].answer`: "Most courses do not require prior medical experience. Some programs—like EMT or Paramedic—have specific prerequisites such as age requirements, BLS certification, or active EMS credentials. Each course lists what you need before signing up."
  - `questions[1].title`: "How do I reserve my seat in a course or program?"
  - `questions[1].answer`: "You can register directly through our website. Some programs require an application or additional documents before acceptance. Your confirmation email includes next steps and any material you’ll need."
  - `questions[2].title`: "Do you offer payment plans?"
  - `questions[2].answer`: "Yes. Many programs offer flexible payment options to make training more accessible. Options vary by course and will be shown during checkout or explained during the program application process."
  - `questions[3].title`: "Do I need to live in the Kansas City area to participate?"
  - `questions[3].answer`: "MidwestEA serves the Kansas City metro and surrounding region. While courses are delivered online, our programs and any in-person training designed specifically for students within this service area."
  - `questions[4].title`: "Are your courses online or in person?"
  - `questions[4].answer`: "All courses are currently online only. If your group or organization needs in-person instruction, we can accommodate that by request. EMS programs may include blended components with required hands-on skills labs."
  - `questions[5].title`: "How long does each course or program take?"
  - `questions[5].answer`: "Length varies—short certifications take a few hours, while EMS programs may span weeks or months. Each course page lists the estimated time commitment and structure."
  - `questions[6].title`: "Do I need to buy any equipment or materials?"
  - `questions[6].answer`: "Most online courses include everything you need inside the platform. Programs that require skills sessions or clinical components provide a list of required materials or uniforms during enrollment."
  - `questions[7].title`: "How many students are in each class?"
  - `questions[7].answer`: "Class size varies by course. Online courses allow self-paced learning, while programs with hands-on skills sessions use small instructor-to-student ratios to maintain quality."
  - `questions[8].title`: "Can I switch course dates after enrolling?"
  - `questions[8].answer`: "In many cases, yes—depending on availability and program policies. Contact student support as early as possible to make changes."
  - `questions[9].title`: "Are your certifications recognized in Missouri, Kansas, and nationally?"
  - `questions[9].answer`: "Yes. MidwestEA provides state-approved training aligned with AHA, NREMT, and national EMS standards. Certifications are designed for students in the Kansas City region, and most are recognized nationally when applicable."
- **Links**:
  - [Still need help?](contact.html)

## Interactions / JS
- None detected beyond `midwestea.webflow/js/midwestea.js`
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/faq/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Build custom component(s): FaqHero
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- Custom components required: FaqHero
- Fix reference template: replace bare FAQ 6 with FaqHero / ContactSection custom components
