# Emergency Medical Technician

## Source & target
- **Webflow file**: `midwestea.webflow/emergency-medical-technician.html`
- **Target route**: `/emergency-medical-technician`
- **Reference template**: `/program-template`
- **Template gap notes**: Webflow omits section_layout54 on this page. Reference /program-template omits section_trainers.

## Page metadata (from `<head>`)
- **title**: Emergency Medical Technician
- **description**: Become a trusted Emergency Medical Responder with state-approved training from MidwestEA. Learn essential life-saving skills from real EMS professionals through hands-on, practical instruction in Kansas City.
- **og:title**: Emergency Medical Technician
- **og:description**: Become a trusted Emergency Medical Responder with state-approved training from MidwestEA. Learn essential life-saving skills from real EMS professionals through hands-on, practical instruction in Kansas City.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c615f562e6c280cf3e8_emt-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 757, 758, 992

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `hero-track` | ~306 | ProgramHero | `components/program-hero.tsx (NEW)` | build-custom |
| 2 | `section-feature-grid` | ~421 | Layout 520 | `layout-520.tsx` | update-content |
| 3 | `section_layout349` | ~444 | Layout 349 | `layout-349.tsx` | update-content |
| 4 | `section_trainers` | ~509 | Trainers | `components/trainers.tsx (NEW)` | build-custom |
| 5 | `section_layout493` | ~545 | Layout 493 | `layout-493.tsx` | update-content |
| 6 | `section_faqs` | ~618 | FAQ 6 | `faq-6.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `hero-track`
- **Webflow HTML line**: ~306
- **Webflow classes**: `hero-track`
- **Component file**: `components/program-hero.tsx (NEW)`
- **Action**: build-custom
- **Headings**:
  - h4: "Next class starts"
  - h4: "lawrence, KS jun 6th / Raytownn , MO July 11th"
  - h1: "Emergency Medical Technician"
  - h4: "Next class starts"
  - h4: "lawrence, KS jun 6th / Raytownn , MO July 11th"
  - h2: "Be the first to provide care"
  - h2: "Build your foundation"
  - h2: "Airway & breathing Management"
  - h2: "Cardiac & emergency response"
- **Paragraphs**:
  - "Train to assess, stabilize, and care for patients during emergencies. Our state-approved EMT program blends online learning with in-person skills days so you can learn with confidence and at a pace that supports your schedule."
  - "This state-approved EMT program helps you earn your certification in just 14 weeks — all for $2150"
  - "Register now for just"
  - "Coming soon"
  - "EMTs are the first clinical providers at the scene of an emergency. This course prepares you for that responsibility with the skills, judgment, and real-world practice you need to care for patients in their most critical moments. You’ll learn from experienced instructors, work through hands-on scenarios, and complete clinical experience that helps you grow comfortable making decisions in the field."
  - "Develop the core abilities every EMT depends on. Learn how to perform complete patient assessments, gather vital signs, manage traumatic injuries, and respond to common medical problems with confidence and accuracy."
  - "Learn how to recognize airway problems and support breathing using proven BLS-level skills. You’ll practice airway positioning, suctioning, oxygen delivery, and effective bag-mask ventilation."
  - "Master the principles of cardiac arrest care, shock management, and time-sensitive medical emergencies. Practice high-quality CPR, AED use, and the assessment strategies EMTs rely on during fast-moving calls."
- **Images** (9):
  - src: `images/paramedic-1.avif`
  - src: `images/buddy-care-3.avif`
  - src: `images/oxygen.avif`
  - src: `images/clsas.avif`
  - src: `images/airway.avif`
  - src: `images/aed.avif`
  - src: `images/clsas.avif`
  - src: `images/airway.avif`
  - _(+1 more images)_
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 2: `section-feature-grid`
- **Webflow HTML line**: ~421
- **Webflow classes**: `section-feature-grid`
- **Component file**: `layout-520.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Be the first to provide care"
  - h2: "Build your foundation"
  - h2: "Airway & breathing Management"
  - h2: "Cardiac & emergency response"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
  - h3: "Complete Testing & Earn Your Credentials"
- **Paragraphs**:
  - "EMTs are the first clinical providers at the scene of an emergency. This course prepares you for that responsibility with the skills, judgment, and real-world practice you need to care for patients in their most critical moments. You’ll learn from experienced instructors, work through hands-on scenarios, and complete clinical experience that helps you grow comfortable making decisions in the field."
  - "Develop the core abilities every EMT depends on. Learn how to perform complete patient assessments, gather vital signs, manage traumatic injuries, and respond to common medical problems with confidence and accuracy."
  - "Learn how to recognize airway problems and support breathing using proven BLS-level skills. You’ll practice airway positioning, suctioning, oxygen delivery, and effective bag-mask ventilation."
  - "Master the principles of cardiac arrest care, shock management, and time-sensitive medical emergencies. Practice high-quality CPR, AED use, and the assessment strategies EMTs rely on during fast-moving calls."
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed."
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official credentials so you can move forward in your EMS career."
- **Tabs** (4):
  - `tabs[0].title`: "Apply & Get Prepared"
  - `tabs[0].description`: "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - `tabs[1].title`: "Learn From Expert Instructors"
  - `tabs[1].description`: "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - `tabs[2].title`: "Build Skills Through Training & Evaluations"
  - `tabs[2].description`: "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - `tabs[3].title`: "Complete Testing & Earn Your Credentials"
  - `tabs[3].description`: "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official crede…"
- **Images** (14):
  - src: `images/paramedic-1.avif`
  - src: `images/buddy-care-3.avif`
  - src: `images/oxygen.avif`
  - src: `images/clsas.avif`
  - src: `images/airway.avif`
  - src: `images/aed.avif`
  - src: `images/clsas.avif`
  - src: `images/airway.avif`
  - _(+6 more images)_
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 3: `section_layout349`
- **Webflow HTML line**: ~444
- **Webflow classes**: `section_layout349`
- **Component file**: `layout-349.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Build your foundation"
  - h2: "Airway & breathing Management"
  - h2: "Cardiac & emergency response"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
  - h3: "Complete Testing & Earn Your Credentials"
  - h2: "Questions?"
- **Paragraphs**:
  - "Develop the core abilities every EMT depends on. Learn how to perform complete patient assessments, gather vital signs, manage traumatic injuries, and respond to common medical problems with confidence and accuracy."
  - "Learn how to recognize airway problems and support breathing using proven BLS-level skills. You’ll practice airway positioning, suctioning, oxygen delivery, and effective bag-mask ventilation."
  - "Master the principles of cardiac arrest care, shock management, and time-sensitive medical emergencies. Practice high-quality CPR, AED use, and the assessment strategies EMTs rely on during fast-moving calls."
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed."
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official credentials so you can move forward in your EMS career."
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
- **Tabs** (4):
  - `tabs[0].title`: "Apply & Get Prepared"
  - `tabs[0].description`: "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - `tabs[1].title`: "Learn From Expert Instructors"
  - `tabs[1].description`: "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - `tabs[2].title`: "Build Skills Through Training & Evaluations"
  - `tabs[2].description`: "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - `tabs[3].title`: "Complete Testing & Earn Your Credentials"
  - `tabs[3].description`: "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official crede…"
- **Links**:
  - [See all FAQs](faq.html)
- **Images** (11):
  - src: `images/clsas.avif`
  - src: `images/airway.avif`
  - src: `images/aed.avif`
  - src: `images/clsas.avif`
  - src: `images/airway.avif`
  - src: `images/aed.avif`
  - src: `images/courses-header.avif`
  - src: `images/student-studying.png`
  - _(+3 more images)_
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 4: `section_trainers`
- **Webflow HTML line**: ~509
- **Webflow classes**: `section_trainers`
- **Component file**: `components/trainers.tsx (NEW)`
- **Action**: build-custom
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
  - h3: "Complete Testing & Earn Your Credentials"
  - h2: "Questions?"
- **Paragraphs**:
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed."
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official credentials so you can move forward in your EMS career."
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "No. This course is beginner-friendly, and our instructors teach each skill step by step."
  - "Yes, but if you don’t have BLS yet, we provide the certification during the program."
  - "EMT licenses are valid for five years, and NREMT certification is valid for two years."
  - _(+1 more paragraphs)_
- **FAQ items** (4):
  - `questions[0].title`: "Do I need medical experience before starting EMT training?"
  - `questions[0].answer`: "No. This course is beginner-friendly, and our instructors teach each skill step by step."
  - `questions[1].title`: "Is BLS required before the first EMT class?"
  - `questions[1].answer`: "Yes, but if you don’t have BLS yet, we provide the certification during the program."
  - `questions[2].title`: "How long is EMT certification valid?"
  - `questions[2].answer`: "EMT licenses are valid for five years, and NREMT certification is valid for two years."
  - `questions[3].title`: "How long is the program?"
  - `questions[3].answer`: "Twelve weeks, with a mix of online and in-person sessions."
- **Tabs** (4):
  - `tabs[0].title`: "Apply & Get Prepared"
  - `tabs[0].description`: "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - `tabs[1].title`: "Learn From Expert Instructors"
  - `tabs[1].description`: "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - `tabs[2].title`: "Build Skills Through Training & Evaluations"
  - `tabs[2].description`: "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - `tabs[3].title`: "Complete Testing & Earn Your Credentials"
  - `tabs[3].description`: "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official crede…"
- **Links**:
  - [See all FAQs](faq.html)
- **Images** (5):
  - src: `images/courses-header.avif`
  - src: `images/student-studying.png`
  - src: `images/student.avif`
  - src: `images/cpr3.avif`
  - src: `images/emt-compressions.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 5: `section_layout493`
- **Webflow HTML line**: ~545
- **Webflow classes**: `section_layout493`
- **Component file**: `layout-493.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
  - h3: "Complete Testing & Earn Your Credentials"
  - h2: "Questions?"
- **Paragraphs**:
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed."
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official credentials so you can move forward in your EMS career."
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "No. This course is beginner-friendly, and our instructors teach each skill step by step."
  - "Yes, but if you don’t have BLS yet, we provide the certification during the program."
  - "EMT licenses are valid for five years, and NREMT certification is valid for two years."
  - "Twelve weeks, with a mix of online and in-person sessions."
  - _(+3 more paragraphs)_
- **FAQ items** (7):
  - `questions[0].title`: "Do I need medical experience before starting EMT training?"
  - `questions[0].answer`: "No. This course is beginner-friendly, and our instructors teach each skill step by step."
  - `questions[1].title`: "Is BLS required before the first EMT class?"
  - `questions[1].answer`: "Yes, but if you don’t have BLS yet, we provide the certification during the program."
  - `questions[2].title`: "How long is EMT certification valid?"
  - `questions[2].answer`: "EMT licenses are valid for five years, and NREMT certification is valid for two years."
  - `questions[3].title`: "How long is the program?"
  - `questions[3].answer`: "Twelve weeks, with a mix of online and in-person sessions."
  - `questions[4].title`: "Is this program state-approved?"
  - `questions[4].answer`: "Yes. Completing this course meets state requirements for EMT certification."
  - `questions[5].title`: "What happens after I finish the program?"
  - `questions[5].answer`: "You’ll take the NREMT exam, and once passed, you can apply for your state EMT license."
  - `questions[6].title`: "Will I get clinical experience?"
  - `questions[6].answer`: "Yes. Students participate in clinical and field experiences as available through our EMS partners."
- **Tabs** (4):
  - `tabs[0].title`: "Apply & Get Prepared"
  - `tabs[0].description`: "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - `tabs[1].title`: "Learn From Expert Instructors"
  - `tabs[1].description`: "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - `tabs[2].title`: "Build Skills Through Training & Evaluations"
  - `tabs[2].description`: "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - `tabs[3].title`: "Complete Testing & Earn Your Credentials"
  - `tabs[3].description`: "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official crede…"
- **Links**:
  - [See all FAQs](faq.html)
- **Images** (4):
  - src: `images/student-studying.png`
  - src: `images/student.avif`
  - src: `images/cpr3.avif`
  - src: `images/emt-compressions.avif`

### Section 6: `section_faqs`
- **Webflow HTML line**: ~618
- **Webflow classes**: `section_faqs`
- **Component file**: `faq-6.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "No. This course is beginner-friendly, and our instructors teach each skill step by step."
  - "Yes, but if you don’t have BLS yet, we provide the certification during the program."
  - "EMT licenses are valid for five years, and NREMT certification is valid for two years."
  - "Twelve weeks, with a mix of online and in-person sessions."
  - "Yes. Completing this course meets state requirements for EMT certification."
  - "You’ll take the NREMT exam, and once passed, you can apply for your state EMT license."
  - "Yes. Students participate in clinical and field experiences as available through our EMS partners."
- **FAQ items** (7):
  - `questions[0].title`: "Do I need medical experience before starting EMT training?"
  - `questions[0].answer`: "No. This course is beginner-friendly, and our instructors teach each skill step by step."
  - `questions[1].title`: "Is BLS required before the first EMT class?"
  - `questions[1].answer`: "Yes, but if you don’t have BLS yet, we provide the certification during the program."
  - `questions[2].title`: "How long is EMT certification valid?"
  - `questions[2].answer`: "EMT licenses are valid for five years, and NREMT certification is valid for two years."
  - `questions[3].title`: "How long is the program?"
  - `questions[3].answer`: "Twelve weeks, with a mix of online and in-person sessions."
  - `questions[4].title`: "Is this program state-approved?"
  - `questions[4].answer`: "Yes. Completing this course meets state requirements for EMT certification."
  - `questions[5].title`: "What happens after I finish the program?"
  - `questions[5].answer`: "You’ll take the NREMT exam, and once passed, you can apply for your state EMT license."
  - `questions[6].title`: "Will I get clinical experience?"
  - `questions[6].answer`: "Yes. Students participate in clinical and field experiences as available through our EMS partners."
- **Links**:
  - [See all FAQs](faq.html)
  - [Contact Us](contact.html)
  - [FAQ](faq.html)
  - [Basic Life Support](basic-life-support.html)
  - [Advanced Cardiovascular Life Support](advanced-cardiovascular-life-support.html)
  - [Active Violence Emergency Response Training](active-shooter-training.html)
  - [Pediatric Advanced Life Support](pediatric-advanced-life-support.html)
  - [CPR/First Aid](cpr-first-aid.html)
  - [Pediatric CPR](pediatric-first-aid-cpr-aed.html)
  - [Child and Babysitting Safety](child-and-babysitting-safety.html)
- **Images** (1):
  - src: `images/MidwestEAlogo_MidwestEA_lockup_white.svg`

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `images/paramedic-1.avif` | — | 1 |
| `images/buddy-care-3.avif` | — | 1 |
| `images/oxygen.avif` | — | 1 |
| `images/clsas.avif` | — | 1 |
| `images/airway.avif` | — | 1 |
| `images/aed.avif` | — | 1 |
| `images/courses-header.avif` | — | 2 |
| `images/student-studying.png` | — | 2 |
| `images/student.avif` | — | 2 |
| `images/cpr3.avif` | — | 2 |
| `images/emt-compressions.avif` | — | 2 |
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 6 |

## Interactions / JS
- GSAP
- ScrollTrigger
- GSAP Observer
- Stripe checkout links
- Inline hero-track scroll script
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/emergency-medical-technician/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Build custom component(s): ProgramHero, Trainers
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- CMS-bound fields (`w-dyn-bind-empty`) need data source
- Custom components required: ProgramHero, Trainers
- Fix `/program-template` in site-config: add Trainers section between Layout 54 and Layout 493
- Cross-reference [emergency-medical-responder.md](emergency-medical-responder.md) for full template structure
