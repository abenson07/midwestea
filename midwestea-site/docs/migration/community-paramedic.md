# Community Paramedic – Midwest Emergency Academy | Kansas City Certification

## Source & target
- **Webflow file**: `midwestea.webflow/community-paramedic.html`
- **Target route**: `/community-paramedic`
- **Reference template**: `/program-template`
- **Template gap notes**: Reference /program-template omits section_trainers (present in Webflow between Layout 54 and Layout 493).

## Page metadata (from `<head>`)
- **title**: Community Paramedic – Midwest Emergency Academy | Kansas City Certification
- **description**: Advance your EMS career with MidwestEA’s Community Paramedic program. A focused, two-week course that builds skills in chronic care, in-home assessments, care coordination, and community health support.
- **og:title**: Community Paramedic – Midwest Emergency Academy | Kansas City Certification
- **og:description**: Advance your EMS career with MidwestEA’s Community Paramedic program. A focused, two-week course that builds skills in chronic care, in-home assessments, care coordination, and community health support.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c619e3ead5c44aaff28_cp-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 798, 799, 1033

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `hero-track` | ~306 | ProgramHero | `components/program-hero.tsx (NEW)` | build-custom |
| 2 | `section-feature-grid` | ~421 | Layout 520 | `layout-520.tsx` | update-content |
| 3 | `section_layout349` | ~444 | Layout 349 | `layout-349.tsx` | update-content |
| 4 | `section_layout54` | ~509 | Layout 54 | `layout-54.tsx` | update-content |
| 5 | `section_trainers` | ~566 | Trainers | `components/trainers.tsx (NEW)` | build-custom |
| 6 | `section_layout493` | ~602 | Layout 493 | `layout-493.tsx` | update-content |
| 7 | `section_faqs` | ~675 | FAQ 6 | `faq-6.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `hero-track`
- **Webflow HTML line**: ~306
- **Webflow classes**: `hero-track`
- **Component file**: `components/program-hero.tsx (NEW)`
- **Action**: build-custom
- **Headings**:
  - h4: "Next class starts"
  - h4: "January"
  - h1: "Community Paramedic"
  - h4: "Next class starts"
  - h4: "January"
  - h2: "Step in before it becomes an emergency."
  - h2: "In-home assessments"
  - h2: "Care coordination skills"
  - h2: "Preventive and chronic care"
- **Paragraphs**:
  - "Expand your Paramedic skills beyond emergency response. This focused program prepares you to deliver in-home care, support chronic conditions, and connect patients with the resources they need in their community."
  - "This short, two-week Community Paramedic program helps you build advanced care and coordination skills — all in a flexible, hybrid format."
  - "Register now for just"
  - "Coming soon"
  - "Community Paramedics step into homes, not just emergency scenes. This course prepares you to support patients with chronic conditions, provide follow-up care, perform in-home assessments, and help people access the services they need before problems become emergencies. ‍ You’ll learn practical, patient-centered skills that make a direct impact on health, independence, and community well-being."
  - "Learn how to evaluate patients where they live, identify early warning signs, monitor chronic conditions, and guide patients toward safer, healthier routines."
  - "Build the ability to work alongside physicians, nurses, social workers, and community agencies. Learn to connect patients with ongoing care, follow-up resources, and support systems that matter."
  - "Strengthen your understanding of long-term conditions and how to stabilize them in the community. Learn strategies that reduce unnecessary 911 calls and prevent avoidable hospital visits."
- **Links**:
  - [Register now for just $](https://buy.stripe.com/eVqbJ1aZp3993FjgH06Vq0y)
- **Images** (9):
  - src: `images/cp1.avif`
  - src: `images/cp-car.avif`
  - src: `images/cp-unhoused.avif`
  - src: `images/cp4.avif`
  - src: `images/cp5.avif`
  - src: `images/cp1.avif`
  - src: `images/cp4.avif`
  - src: `images/cp1.avif`
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
  - h2: "Step in before it becomes an emergency."
  - h2: "In-home assessments"
  - h2: "Care coordination skills"
  - h2: "Preventive and chronic care"
  - h2: "Who it's for"
  - h3: "Working paramedics"
  - h3: "Rural responders"
  - h3: "Mobile integrated health teams"
  - h3: "Hospital and clinic partners"
  - h3: "Public health and community programs"
  - h3: "Career-advancing clinicians"
  - h2: "Learn from real responders"
  - h2: "Get started today"
- **Paragraphs**:
  - "Community Paramedics step into homes, not just emergency scenes. This course prepares you to support patients with chronic conditions, provide follow-up care, perform in-home assessments, and help people access the services they need before problems become emergencies. ‍ You’ll learn practical, patient-centered skills that make a direct impact on health, independence, and community well-being."
  - "Learn how to evaluate patients where they live, identify early warning signs, monitor chronic conditions, and guide patients toward safer, healthier routines."
  - "Build the ability to work alongside physicians, nurses, social workers, and community agencies. Learn to connect patients with ongoing care, follow-up resources, and support systems that matter."
  - "Strengthen your understanding of long-term conditions and how to stabilize them in the community. Learn strategies that reduce unnecessary 911 calls and prevent avoidable hospital visits."
  - "The Community Paramedic program is designed for certified paramedics who want to expand their skills beyond emergency response and support patients through in-home care, chronic condition management, and community health outreach."
  - "For certified Paramedics ready to expand their scope and support patients beyond emergency calls."
  - "Ideal for responders serving communities where access to regular healthcare is limited."
  - "Built for EMS systems adding MIH/CP services and needing trained providers."
  - "For Paramedics who coordinate with outpatient facilities, primary care, or transitional care teams."
  - "A strong fit for agencies focused on chronic disease management, outreach, or wellness checks."
  - _(+3 more paragraphs)_
- **Images** (10):
  - src: `images/cp1.avif`
  - src: `images/cp-car.avif`
  - src: `images/cp-unhoused.avif`
  - src: `images/cp4.avif`
  - src: `images/cp5.avif`
  - src: `images/cp1.avif`
  - src: `images/cp4.avif`
  - src: `images/cp1.avif`
  - _(+2 more images)_
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
  - h2: "In-home assessments"
  - h2: "Care coordination skills"
  - h2: "Preventive and chronic care"
  - h2: "Who it's for"
  - h3: "Working paramedics"
  - h3: "Rural responders"
  - h3: "Mobile integrated health teams"
  - h3: "Hospital and clinic partners"
  - h3: "Public health and community programs"
  - h3: "Career-advancing clinicians"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
- **Paragraphs**:
  - "Learn how to evaluate patients where they live, identify early warning signs, monitor chronic conditions, and guide patients toward safer, healthier routines."
  - "Build the ability to work alongside physicians, nurses, social workers, and community agencies. Learn to connect patients with ongoing care, follow-up resources, and support systems that matter."
  - "Strengthen your understanding of long-term conditions and how to stabilize them in the community. Learn strategies that reduce unnecessary 911 calls and prevent avoidable hospital visits."
  - "The Community Paramedic program is designed for certified paramedics who want to expand their skills beyond emergency response and support patients through in-home care, chronic condition management, and community health outreach."
  - "For certified Paramedics ready to expand their scope and support patients beyond emergency calls."
  - "Ideal for responders serving communities where access to regular healthcare is limited."
  - "Built for EMS systems adding MIH/CP services and needing trained providers."
  - "For Paramedics who coordinate with outpatient facilities, primary care, or transitional care teams."
  - "A strong fit for agencies focused on chronic disease management, outreach, or wellness checks."
  - "For Paramedics seeking a focused, meaningful specialty that improves continuity of care."
  - _(+5 more paragraphs)_
- **Tabs** (3):
  - `tabs[0].title`: "Apply & Get Prepared"
  - `tabs[0].description`: "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - `tabs[1].title`: "Learn From Expert Instructors"
  - `tabs[1].description`: "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - `tabs[2].title`: "Build Skills Through Training & Evaluations"
  - `tabs[2].description`: "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
- **Images** (7):
  - src: `images/cp4.avif`
  - src: `images/cp5.avif`
  - src: `images/cp1.avif`
  - src: `images/cp4.avif`
  - src: `images/cp1.avif`
  - src: `images/cp5.avif`
  - src: `images/courses-header.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 4: `section_layout54`
- **Webflow HTML line**: ~509
- **Webflow classes**: `section_layout54`
- **Component file**: `layout-54.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Who it's for"
  - h3: "Working paramedics"
  - h3: "Rural responders"
  - h3: "Mobile integrated health teams"
  - h3: "Hospital and clinic partners"
  - h3: "Public health and community programs"
  - h3: "Career-advancing clinicians"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
  - h3: "Complete Testing & Earn Your Credentials"
  - h2: "Questions?"
- **Paragraphs**:
  - "The Community Paramedic program is designed for certified paramedics who want to expand their skills beyond emergency response and support patients through in-home care, chronic condition management, and community health outreach."
  - "For certified Paramedics ready to expand their scope and support patients beyond emergency calls."
  - "Ideal for responders serving communities where access to regular healthcare is limited."
  - "Built for EMS systems adding MIH/CP services and needing trained providers."
  - "For Paramedics who coordinate with outpatient facilities, primary care, or transitional care teams."
  - "A strong fit for agencies focused on chronic disease management, outreach, or wellness checks."
  - "For Paramedics seeking a focused, meaningful specialty that improves continuity of care."
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed.efault text value"
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - _(+5 more paragraphs)_
- **FAQ items** (1):
  - `questions[0].title`: "Do I need to be a certified Paramedic to enroll?"
  - `questions[0].answer`: "Yes. A current Paramedic certification is required."
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
  - src: `images/clsas.avif`
  - src: `images/cp-unhoused.avif`
  - src: `images/cp1.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 5: `section_trainers`
- **Webflow HTML line**: ~566
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
  - "Yes. A current Paramedic certification is required."
  - "Two weeks, with two meetings per week in a hybrid format."
  - "No — the emphasis is on chronic care, in-home assessments, and community health support."
  - _(+1 more paragraphs)_
- **FAQ items** (4):
  - `questions[0].title`: "Do I need to be a certified Paramedic to enroll?"
  - `questions[0].answer`: "Yes. A current Paramedic certification is required."
  - `questions[1].title`: "How long is the program?"
  - `questions[1].answer`: "Two weeks, with two meetings per week in a hybrid format."
  - `questions[2].title`: "Is this focused on emergency skills?"
  - `questions[2].answer`: "No — the emphasis is on chronic care, in-home assessments, and community health support."
  - `questions[3].title`: "Will I learn chronic disease management?"
  - `questions[3].answer`: "Yes. Conditions such as diabetes, heart disease, and hypertension are core topics."
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
  - src: `images/clsas.avif`
  - src: `images/cp-unhoused.avif`
  - src: `images/cp1.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 6: `section_layout493`
- **Webflow HTML line**: ~602
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
  - "Yes. A current Paramedic certification is required."
  - "Two weeks, with two meetings per week in a hybrid format."
  - "No — the emphasis is on chronic care, in-home assessments, and community health support."
  - "Yes. Conditions such as diabetes, heart disease, and hypertension are core topics."
  - _(+2 more paragraphs)_
- **FAQ items** (6):
  - `questions[0].title`: "Do I need to be a certified Paramedic to enroll?"
  - `questions[0].answer`: "Yes. A current Paramedic certification is required."
  - `questions[1].title`: "How long is the program?"
  - `questions[1].answer`: "Two weeks, with two meetings per week in a hybrid format."
  - `questions[2].title`: "Is this focused on emergency skills?"
  - `questions[2].answer`: "No — the emphasis is on chronic care, in-home assessments, and community health support."
  - `questions[3].title`: "Will I learn chronic disease management?"
  - `questions[3].answer`: "Yes. Conditions such as diabetes, heart disease, and hypertension are core topics."
  - `questions[4].title`: "Does this program include hands-on practice?"
  - `questions[4].answer`: "Yes. You’ll complete scenario-based, patient-centered practice sessions."
  - `questions[5].title`: "Who benefits from Community Paramedics?"
  - `questions[5].answer`: "Patients with chronic conditions, limited healthcare access, recent hospital discharges, and those needing regular monitoring."
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
  - src: `images/clsas.avif`
  - src: `images/cp-unhoused.avif`
  - src: `images/cp1.avif`

### Section 7: `section_faqs`
- **Webflow HTML line**: ~675
- **Webflow classes**: `section_faqs`
- **Component file**: `faq-6.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Yes. A current Paramedic certification is required."
  - "Two weeks, with two meetings per week in a hybrid format."
  - "No — the emphasis is on chronic care, in-home assessments, and community health support."
  - "Yes. Conditions such as diabetes, heart disease, and hypertension are core topics."
  - "Yes. You’ll complete scenario-based, patient-centered practice sessions."
  - "Patients with chronic conditions, limited healthcare access, recent hospital discharges, and those needing regular monitoring."
- **FAQ items** (6):
  - `questions[0].title`: "Do I need to be a certified Paramedic to enroll?"
  - `questions[0].answer`: "Yes. A current Paramedic certification is required."
  - `questions[1].title`: "How long is the program?"
  - `questions[1].answer`: "Two weeks, with two meetings per week in a hybrid format."
  - `questions[2].title`: "Is this focused on emergency skills?"
  - `questions[2].answer`: "No — the emphasis is on chronic care, in-home assessments, and community health support."
  - `questions[3].title`: "Will I learn chronic disease management?"
  - `questions[3].answer`: "Yes. Conditions such as diabetes, heart disease, and hypertension are core topics."
  - `questions[4].title`: "Does this program include hands-on practice?"
  - `questions[4].answer`: "Yes. You’ll complete scenario-based, patient-centered practice sessions."
  - `questions[5].title`: "Who benefits from Community Paramedics?"
  - `questions[5].answer`: "Patients with chronic conditions, limited healthcare access, recent hospital discharges, and those needing regular monitoring."
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
| `images/cp1.avif` | — | 1 |
| `images/cp-car.avif` | — | 1 |
| `images/cp-unhoused.avif` | — | 1 |
| `images/cp4.avif` | — | 1 |
| `images/cp5.avif` | — | 1 |
| `images/courses-header.avif` | — | 2 |
| `images/student-studying.png` | — | 4 |
| `images/clsas.avif` | — | 4 |
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 7 |

## Interactions / JS
- GSAP
- ScrollTrigger
- GSAP Observer
- Stripe checkout links
- Inline hero-track scroll script
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/community-paramedic/page.tsx` (or dynamic segment as noted)
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
