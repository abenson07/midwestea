# Critical Care Transport Program | Advanced Critical Care Training in Kansas City

## Source & target
- **Webflow file**: `midwestea.webflow/critical-care-transport.html`
- **Target route**: `/critical-care-transport`
- **Reference template**: `/program-template`
- **Template gap notes**: Reference /program-template omits section_trainers (present in Webflow between Layout 54 and Layout 493).

## Page metadata (from `<head>`)
- **title**: Critical Care Transport Program | Advanced Critical Care Training in Kansas City
- **description**: Train for high-acuity ground and air transport. MidwestEA’s Critical Care Transport program prepares Paramedics, Nurses, and medical professionals to manage critically ill and injured patients during interfacility and emergency transport. State-approved, hands-on, and expert-led.
- **og:title**: Critical Care Transport Program | Advanced Critical Care Training in Kansas City
- **og:description**: Train for high-acuity ground and air transport. MidwestEA’s Critical Care Transport program prepares Paramedics, Nurses, and medical professionals to manage critically ill and injured patients during interfacility and emergency transport. State-approved, hands-on, and expert-led.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61c257d57b2e3f74d6_ccp-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 797, 798, 1032

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `hero-track` | ~306 | ProgramHero | `components/program-hero.tsx (NEW)` | build-custom |
| 2 | `section-feature-grid` | ~420 | Layout 520 | `layout-520.tsx` | update-content |
| 3 | `section_layout349` | ~443 | Layout 349 | `layout-349.tsx` | update-content |
| 4 | `section_layout54` | ~508 | Layout 54 | `layout-54.tsx` | update-content |
| 5 | `section_trainers` | ~565 | Trainers | `components/trainers.tsx (NEW)` | build-custom |
| 6 | `section_layout493` | ~601 | Layout 493 | `layout-493.tsx` | update-content |
| 7 | `section_faqs` | ~674 | FAQ 6 | `faq-6.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `hero-track`
- **Webflow HTML line**: ~306
- **Webflow classes**: `hero-track`
- **Component file**: `components/program-hero.tsx (NEW)`
- **Action**: build-custom
- **Headings**:
  - h4: "Next class starts"
  - h4: "April"
  - h1: "Critical Care Transport"
  - h4: "Coming soon"
  - h2: "Advance your transport skills"
  - h2: "Advanced airway and ventilation"
  - h2: "Critical care"
  - h2: "Trauma and transport"
- **Paragraphs**:
  - "Critical Care Transport gives experienced Paramedics, Nurses, and other medical professionals the advanced training needed to care for the sickest patients during ground or air transport. We guide you through every step with clear instruction, hands-on practice, and real-world preparation."
  - "This Critical Care Transport program delivers classroom, simulation, and clinical training, all designed for paramedics, nurses, and medical professionals advancing into critical care transport. $1650"
  - "Register now for just"
  - "Coming soon"
  - "The Critical Care Transport program is an advanced course designed for clinicians responsible for managing high-acuity patients during interfacility or emergency transport. The curriculum builds on ALS foundations and prepares you for complex airway, cardiovascular, respiratory, neurological, trauma, neonatal, and pharmacological management. Training blends classroom instruction, simulation, and clinical experiences to mirror the demands of real critical care transport environments, whether in a…"
  - "Learn advanced airway procedures, medication-assisted interventions, and ventilator setup used during critical transports. Training focuses on managing complex respiratory cases and keeping patients stable throughout movement."
  - "Strengthen your ability to care for cardiac, neurological, and multi-system emergencies with critical care–level interventions. You’ll study hemodynamics, shock management, and the medications used to stabilize high-acuity patients."
  - "Develop the skills to manage severe trauma, control bleeding, and prepare patients for long or high-risk transports. Scenarios focus on packaging, reassessment, and maintaining stability in dynamic ground or air environments."
- **Links**:
  - [Register now for just $](https://buy.stripe.com/5kQcN54B17ppejX4Yi6Vq0z)
- **Images** (9):
  - src: `images/icu.avif`
  - src: `images/helicoptor.avif`
  - src: `images/fixed-wing.avif`
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
  - src: `images/icu.avif`
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
  - _(+1 more images)_
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 2: `section-feature-grid`
- **Webflow HTML line**: ~420
- **Webflow classes**: `section-feature-grid`
- **Component file**: `layout-520.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Advance your transport skills"
  - h2: "Advanced airway and ventilation"
  - h2: "Critical care"
  - h2: "Trauma and transport"
  - h2: "Who it's for"
  - h3: "Experienced paramedics"
  - h3: "Flight and transport clinicians"
  - h3: "Hospital-based EMS teams"
  - h3: "Special operations responders"
  - h3: "Career-advancing providers"
  - h3: "Rural and frontier providers"
  - h2: "Learn from real responders"
  - h2: "Get started today"
- **Paragraphs**:
  - "The Critical Care Transport program is an advanced course designed for clinicians responsible for managing high-acuity patients during interfacility or emergency transport. The curriculum builds on ALS foundations and prepares you for complex airway, cardiovascular, respiratory, neurological, trauma, neonatal, and pharmacological management. Training blends classroom instruction, simulation, and clinical experiences to mirror the demands of real critical care transport environments, whether in a…"
  - "Learn advanced airway procedures, medication-assisted interventions, and ventilator setup used during critical transports. Training focuses on managing complex respiratory cases and keeping patients stable throughout movement."
  - "Strengthen your ability to care for cardiac, neurological, and multi-system emergencies with critical care–level interventions. You’ll study hemodynamics, shock management, and the medications used to stabilize high-acuity patients."
  - "Develop the skills to manage severe trauma, control bleeding, and prepare patients for long or high-risk transports. Scenarios focus on packaging, reassessment, and maintaining stability in dynamic ground or air environments."
  - "The Critical Care Transport program is designed for experienced professionals who want to manage high-acuity patients, perform advanced interventions, and work confidently in critical care or specialized transport settings."
  - "For Paramedics ready to expand their clinical scope and handle complex patient presentations."
  - "Ideal for those pursuing or working in air medical, MICU, or interfacility transport roles."
  - "For Paramedics supporting emergency departments, ICUs, and rapid response teams."
  - "A strong fit for responders involved in rescue, tactical, or specialized medical operations."
  - "For Paramedics seeking advanced credentials that open doors to critical care, leadership, or specialized EMS roles."
  - _(+3 more paragraphs)_
- **Images** (10):
  - src: `images/icu.avif`
  - src: `images/helicoptor.avif`
  - src: `images/fixed-wing.avif`
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
  - src: `images/icu.avif`
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
  - _(+2 more images)_
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 3: `section_layout349`
- **Webflow HTML line**: ~443
- **Webflow classes**: `section_layout349`
- **Component file**: `layout-349.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Advanced airway and ventilation"
  - h2: "Critical care"
  - h2: "Trauma and transport"
  - h2: "Who it's for"
  - h3: "Experienced paramedics"
  - h3: "Flight and transport clinicians"
  - h3: "Hospital-based EMS teams"
  - h3: "Special operations responders"
  - h3: "Career-advancing providers"
  - h3: "Rural and frontier providers"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
- **Paragraphs**:
  - "Learn advanced airway procedures, medication-assisted interventions, and ventilator setup used during critical transports. Training focuses on managing complex respiratory cases and keeping patients stable throughout movement."
  - "Strengthen your ability to care for cardiac, neurological, and multi-system emergencies with critical care–level interventions. You’ll study hemodynamics, shock management, and the medications used to stabilize high-acuity patients."
  - "Develop the skills to manage severe trauma, control bleeding, and prepare patients for long or high-risk transports. Scenarios focus on packaging, reassessment, and maintaining stability in dynamic ground or air environments."
  - "The Critical Care Transport program is designed for experienced professionals who want to manage high-acuity patients, perform advanced interventions, and work confidently in critical care or specialized transport settings."
  - "For Paramedics ready to expand their clinical scope and handle complex patient presentations."
  - "Ideal for those pursuing or working in air medical, MICU, or interfacility transport roles."
  - "For Paramedics supporting emergency departments, ICUs, and rapid response teams."
  - "A strong fit for responders involved in rescue, tactical, or specialized medical operations."
  - "For Paramedics seeking advanced credentials that open doors to critical care, leadership, or specialized EMS roles."
  - "Built for Paramedics who manage long transports and need advanced stabilization skills."
  - _(+5 more paragraphs)_
- **Tabs** (3):
  - `tabs[0].title`: "Apply & Get Prepared"
  - `tabs[0].description`: "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - `tabs[1].title`: "Learn From Expert Instructors"
  - `tabs[1].description`: "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - `tabs[2].title`: "Build Skills Through Training & Evaluations"
  - `tabs[2].description`: "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
- **Images** (7):
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
  - src: `images/icu.avif`
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
  - src: `images/icu.avif`
  - src: `images/courses-header.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 4: `section_layout54`
- **Webflow HTML line**: ~508
- **Webflow classes**: `section_layout54`
- **Component file**: `layout-54.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Who it's for"
  - h3: "Experienced paramedics"
  - h3: "Flight and transport clinicians"
  - h3: "Hospital-based EMS teams"
  - h3: "Special operations responders"
  - h3: "Career-advancing providers"
  - h3: "Rural and frontier providers"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
  - h3: "Complete Testing & Earn Your Credentials"
  - h2: "Questions?"
- **Paragraphs**:
  - "The Critical Care Transport program is designed for experienced professionals who want to manage high-acuity patients, perform advanced interventions, and work confidently in critical care or specialized transport settings."
  - "For Paramedics ready to expand their clinical scope and handle complex patient presentations."
  - "Ideal for those pursuing or working in air medical, MICU, or interfacility transport roles."
  - "For Paramedics supporting emergency departments, ICUs, and rapid response teams."
  - "A strong fit for responders involved in rescue, tactical, or specialized medical operations."
  - "For Paramedics seeking advanced credentials that open doors to critical care, leadership, or specialized EMS roles."
  - "Built for Paramedics who manage long transports and need advanced stabilization skills."
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed.efault text value"
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - _(+5 more paragraphs)_
- **FAQ items** (1):
  - `questions[0].title`: "Do I need to be a Paramedic to enroll?"
  - `questions[0].answer`: "No. Paramedics, nurses, respiratory therapists, and other licensed medical professionals can enroll."
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
  - src: `images/online2.avif`
  - src: `images/clsas.avif`
  - src: `images/kid-rythms.avif`
  - src: `images/icu.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 5: `section_trainers`
- **Webflow HTML line**: ~565
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
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed.efault text value"
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official credentials so you can move forward in your EMS career."
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "No. Paramedics, nurses, respiratory therapists, and other licensed medical professionals can enroll."
  - "Between 120 hours, depending on clinical and simulation availability."
  - "Yes. It prepares you for high-acuity ground and air transport environments."
  - _(+1 more paragraphs)_
- **FAQ items** (4):
  - `questions[0].title`: "Do I need to be a Paramedic to enroll?"
  - `questions[0].answer`: "No. Paramedics, nurses, respiratory therapists, and other licensed medical professionals can enroll."
  - `questions[1].title`: "How long is the program?"
  - `questions[1].answer`: "Between 120 hours, depending on clinical and simulation availability."
  - `questions[2].title`: "Is this course focused on transport?"
  - `questions[2].answer`: "Yes. It prepares you for high-acuity ground and air transport environments."
  - `questions[3].title`: "Will I learn ventilator management?"
  - `questions[3].answer`: "Yes. Ventilator and advanced airway training are core components."
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
  - src: `images/online2.avif`
  - src: `images/clsas.avif`
  - src: `images/kid-rythms.avif`
  - src: `images/icu.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 6: `section_layout493`
- **Webflow HTML line**: ~601
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
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed.efault text value"
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official credentials so you can move forward in your EMS career."
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "No. Paramedics, nurses, respiratory therapists, and other licensed medical professionals can enroll."
  - "Between 120 hours, depending on clinical and simulation availability."
  - "Yes. It prepares you for high-acuity ground and air transport environments."
  - "Yes. Ventilator and advanced airway training are core components."
  - _(+2 more paragraphs)_
- **FAQ items** (6):
  - `questions[0].title`: "Do I need to be a Paramedic to enroll?"
  - `questions[0].answer`: "No. Paramedics, nurses, respiratory therapists, and other licensed medical professionals can enroll."
  - `questions[1].title`: "How long is the program?"
  - `questions[1].answer`: "Between 120 hours, depending on clinical and simulation availability."
  - `questions[2].title`: "Is this course focused on transport?"
  - `questions[2].answer`: "Yes. It prepares you for high-acuity ground and air transport environments."
  - `questions[3].title`: "Will I learn ventilator management?"
  - `questions[3].answer`: "Yes. Ventilator and advanced airway training are core components."
  - `questions[4].title`: "Is this course hands-on?"
  - `questions[4].answer`: "Yes. You’ll complete skills labs, simulations, and clinical or field rotations."
  - `questions[5].title`: "Is this recognized for advancement?"
  - `questions[5].answer`: "Yes. Critical Care Transport (CCT) certification is widely recognized for transport, flight, and advanced EMS roles."
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
  - src: `images/online2.avif`
  - src: `images/clsas.avif`
  - src: `images/kid-rythms.avif`
  - src: `images/icu.avif`

### Section 7: `section_faqs`
- **Webflow HTML line**: ~674
- **Webflow classes**: `section_faqs`
- **Component file**: `faq-6.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "No. Paramedics, nurses, respiratory therapists, and other licensed medical professionals can enroll."
  - "Between 120 hours, depending on clinical and simulation availability."
  - "Yes. It prepares you for high-acuity ground and air transport environments."
  - "Yes. Ventilator and advanced airway training are core components."
  - "Yes. You’ll complete skills labs, simulations, and clinical or field rotations."
  - "Yes. Critical Care Transport (CCT) certification is widely recognized for transport, flight, and advanced EMS roles."
- **FAQ items** (6):
  - `questions[0].title`: "Do I need to be a Paramedic to enroll?"
  - `questions[0].answer`: "No. Paramedics, nurses, respiratory therapists, and other licensed medical professionals can enroll."
  - `questions[1].title`: "How long is the program?"
  - `questions[1].answer`: "Between 120 hours, depending on clinical and simulation availability."
  - `questions[2].title`: "Is this course focused on transport?"
  - `questions[2].answer`: "Yes. It prepares you for high-acuity ground and air transport environments."
  - `questions[3].title`: "Will I learn ventilator management?"
  - `questions[3].answer`: "Yes. Ventilator and advanced airway training are core components."
  - `questions[4].title`: "Is this course hands-on?"
  - `questions[4].answer`: "Yes. You’ll complete skills labs, simulations, and clinical or field rotations."
  - `questions[5].title`: "Is this recognized for advancement?"
  - `questions[5].answer`: "Yes. Critical Care Transport (CCT) certification is widely recognized for transport, flight, and advanced EMS roles."
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
| `images/icu.avif` | — | 1 |
| `images/helicoptor.avif` | — | 1 |
| `images/fixed-wing.avif` | — | 1 |
| `images/airway.avif` | — | 1 |
| `images/trauma-care.avif` | — | 1 |
| `images/courses-header.avif` | — | 2 |
| `images/online2.avif` | — | 4 |
| `images/clsas.avif` | — | 4 |
| `images/kid-rythms.avif` | — | 4 |
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 7 |

## Interactions / JS
- GSAP
- ScrollTrigger
- GSAP Observer
- Stripe checkout links
- Inline hero-track scroll script
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/critical-care-transport/page.tsx` (or dynamic segment as noted)
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
