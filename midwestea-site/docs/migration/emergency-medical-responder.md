# Emergency Medical Responder (EMR) Training | Midwest Emergency Academy

## Source & target
- **Webflow file**: `midwestea.webflow/emergency-medical-responder.html`
- **Target route**: `/emergency-medical-responder`
- **Reference template**: `/program-template`
- **Template gap notes**: Reference /program-template omits section_trainers (present in Webflow between Layout 54 and Layout 493).

## Page metadata (from `<head>`)
- **title**: Emergency Medical Responder (EMR) Training | Midwest Emergency Academy
- **description**: Become a trusted Emergency Medical Responder with state-approved training from MidwestEA. Learn essential life-saving skills from real EMS professionals through hands-on, practical instruction in Kansas City.
- **og:title**: Emergency Medical Responder (EMR) Training | Midwest Emergency Academy
- **og:description**: Become a trusted Emergency Medical Responder with state-approved training from MidwestEA. Learn essential life-saving skills from real EMS professionals through hands-on, practical instruction in Kansas City.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61eaf244c8c13bda44_emr-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 796, 797, 1031

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `hero-track` | ~306 | ProgramHero | `components/program-hero.tsx (NEW)` | build-custom |
| 2 | `section-feature-grid` | ~421 | Layout 520 | `layout-520.tsx` | update-content |
| 3 | `section_layout349` | ~442 | Layout 349 | `layout-349.tsx` | update-content |
| 4 | `section_layout54` | ~507 | Layout 54 | `layout-54.tsx` | update-content |
| 5 | `section_trainers` | ~564 | Trainers | `components/trainers.tsx (NEW)` | build-custom |
| 6 | `section_layout493` | ~600 | Layout 493 | `layout-493.tsx` | update-content |
| 7 | `section_faqs` | ~673 | FAQ 6 | `faq-6.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `hero-track`
- **Webflow HTML line**: ~306
- **Webflow classes**: `hero-track`
- **Component file**: `components/program-hero.tsx (NEW)`
- **Action**: build-custom
- **Headings**:
  - h4: "Next class starts"
  - h4: "November"
  - h1: "Emergency Medical Responder"
  - h4: "Next class starts"
  - h4: "November"
  - h2: "be the first on the scene"
  - h2: "Master the essentials"
  - h2: "Airway Management"
  - h2: "Cardiac & respiratory"
- **Paragraphs**:
  - "Learn the lifesaving skills trusted responders rely on when every second counts. The EMR course gives you hands-on training to recognize emergencies, take decisive action, and provide critical care until EMS arrives."
  - "This state-approved EMR program helps you earn your certification in under 14 weeks — all for $750."
  - "Register now for just"
  - "Coming soon"
  - "As an Emergency Medical Responder, you’re often the first trained provider to reach a patient. This course gives you the essential skills to recognize emergencies, stabilize patients, and support higher-level providers when they arrive. Through hands-on practice and instructor-guided scenarios, you’ll learn how to assess a situation quickly, provide immediate care, and support patient survival in real emergencies. This is more than first aid. It’s the foundation of true first response."
  - "Build the core skills every responder relies on. Learn how to assess patients, secure scenes, and manage life-threatening bleeding with proven, hands-on techniques. These essentials form the backbone of effective emergency response—whether you’re on duty or helping in your community."
  - "Learn how to recognize and manage airway emergencies with confidence. From positioning and suctioning to bag-mask ventilation, you’ll gain practical skills that help protect a patient’s ability to breathe until advanced help arrives."
  - "Understand how to respond to cardiac arrest, breathing problems, and medical or traumatic emergencies. You’ll practice high-quality CPR, AED use, and real-world decision-making you can rely on in any environment."
- **Links**:
  - [Register now for just $](https://buy.stripe.com/6oUeVdebBgZZcbP4Yi6Vq0w)
- **Images** (9):
  - src: `images/lifeguard.avif`
  - src: `images/security.avif`
  - src: `images/park-ranger.avif`
  - src: `images/clsas.avif`
  - src: `images/oxygen.webp`
  - src: `images/aed.avif`
  - src: `images/clsas.avif`
  - src: `images/oxygen.webp`
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
  - h2: "be the first on the scene"
  - h2: "Master the essentials"
  - h2: "Airway Management"
  - h2: "Cardiac & respiratory"
  - h2: "Who it's for"
  - h3: "Law enforcement & corrections"
  - h3: "Events & Community"
  - h3: "Lifeguards & Park rangers"
  - h3: "Workplace Safety"
  - h3: "Sports & Fitness"
  - h3: "Advanced First Aid Seekers"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
- **Paragraphs**:
  - "As an Emergency Medical Responder, you’re often the first trained provider to reach a patient. This course gives you the essential skills to recognize emergencies, stabilize patients, and support higher-level providers when they arrive. Through hands-on practice and instructor-guided scenarios, you’ll learn how to assess a situation quickly, provide immediate care, and support patient survival in real emergencies. This is more than first aid. It’s the foundation of true first response."
  - "Build the core skills every responder relies on. Learn how to assess patients, secure scenes, and manage life-threatening bleeding with proven, hands-on techniques. These essentials form the backbone of effective emergency response—whether you’re on duty or helping in your community."
  - "Learn how to recognize and manage airway emergencies with confidence. From positioning and suctioning to bag-mask ventilation, you’ll gain practical skills that help protect a patient’s ability to breathe until advanced help arrives."
  - "Understand how to respond to cardiac arrest, breathing problems, and medical or traumatic emergencies. You’ll practice high-quality CPR, AED use, and real-world decision-making you can rely on in any environment."
  - "The EMR course is designed for people who are not EMS providers but want advanced first responder skills for work, volunteer service, or community safety."
  - "For police, corrections, and security personnel who are often first on scene and need stronger medical response skills."
  - "Ideal for event staff, crowd control teams, CERT members, and disaster response volunteers supporting community emergencies."
  - "For lifeguards, park rangers, and outdoor guides who may face injuries in remote or unpredictable environments."
  - "Designed for workplace Emergency Response Teams and safety leads who need advanced first aid training."
  - "A strong fit for athletic trainers and others supporting active groups where injuries are common."
  - _(+3 more paragraphs)_
- **Images** (10):
  - src: `images/lifeguard.avif`
  - src: `images/security.avif`
  - src: `images/park-ranger.avif`
  - src: `images/clsas.avif`
  - src: `images/oxygen.webp`
  - src: `images/aed.avif`
  - src: `images/clsas.avif`
  - src: `images/oxygen.webp`
  - _(+2 more images)_
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 3: `section_layout349`
- **Webflow HTML line**: ~442
- **Webflow classes**: `section_layout349`
- **Component file**: `layout-349.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Master the essentials"
  - h2: "Airway Management"
  - h2: "Cardiac & respiratory"
  - h2: "Who it's for"
  - h3: "Law enforcement & corrections"
  - h3: "Events & Community"
  - h3: "Lifeguards & Park rangers"
  - h3: "Workplace Safety"
  - h3: "Sports & Fitness"
  - h3: "Advanced First Aid Seekers"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
- **Paragraphs**:
  - "Build the core skills every responder relies on. Learn how to assess patients, secure scenes, and manage life-threatening bleeding with proven, hands-on techniques. These essentials form the backbone of effective emergency response—whether you’re on duty or helping in your community."
  - "Learn how to recognize and manage airway emergencies with confidence. From positioning and suctioning to bag-mask ventilation, you’ll gain practical skills that help protect a patient’s ability to breathe until advanced help arrives."
  - "Understand how to respond to cardiac arrest, breathing problems, and medical or traumatic emergencies. You’ll practice high-quality CPR, AED use, and real-world decision-making you can rely on in any environment."
  - "The EMR course is designed for people who are not EMS providers but want advanced first responder skills for work, volunteer service, or community safety."
  - "For police, corrections, and security personnel who are often first on scene and need stronger medical response skills."
  - "Ideal for event staff, crowd control teams, CERT members, and disaster response volunteers supporting community emergencies."
  - "For lifeguards, park rangers, and outdoor guides who may face injuries in remote or unpredictable environments."
  - "Designed for workplace Emergency Response Teams and safety leads who need advanced first aid training."
  - "A strong fit for athletic trainers and others supporting active groups where injuries are common."
  - "For individuals who want more than basic first aid—people looking for confidence and readiness to act before EMS arrives."
  - _(+5 more paragraphs)_
- **Tabs** (3):
  - `tabs[0].title`: "Apply & Get Prepared"
  - `tabs[0].description`: "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - `tabs[1].title`: "Learn From Expert Instructors"
  - `tabs[1].description`: "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - `tabs[2].title`: "Build Skills Through Training & Evaluations"
  - `tabs[2].description`: "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
- **Images** (7):
  - src: `images/clsas.avif`
  - src: `images/oxygen.webp`
  - src: `images/aed.avif`
  - src: `images/clsas.avif`
  - src: `images/oxygen.webp`
  - src: `images/aed.avif`
  - src: `images/courses-header.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 4: `section_layout54`
- **Webflow HTML line**: ~507
- **Webflow classes**: `section_layout54`
- **Component file**: `layout-54.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Who it's for"
  - h3: "Law enforcement & corrections"
  - h3: "Events & Community"
  - h3: "Lifeguards & Park rangers"
  - h3: "Workplace Safety"
  - h3: "Sports & Fitness"
  - h3: "Advanced First Aid Seekers"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
  - h3: "Complete Testing & Earn Your Credentials"
  - h2: "Questions?"
- **Paragraphs**:
  - "The EMR course is designed for people who are not EMS providers but want advanced first responder skills for work, volunteer service, or community safety."
  - "For police, corrections, and security personnel who are often first on scene and need stronger medical response skills."
  - "Ideal for event staff, crowd control teams, CERT members, and disaster response volunteers supporting community emergencies."
  - "For lifeguards, park rangers, and outdoor guides who may face injuries in remote or unpredictable environments."
  - "Designed for workplace Emergency Response Teams and safety leads who need advanced first aid training."
  - "A strong fit for athletic trainers and others supporting active groups where injuries are common."
  - "For individuals who want more than basic first aid—people looking for confidence and readiness to act before EMS arrives."
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed."
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - _(+5 more paragraphs)_
- **FAQ items** (1):
  - `questions[0].title`: "Do I need previous medical experience to take EMR?"
  - `questions[0].answer`: "No. EMR is designed for beginners and non-medical professionals. Our instructors guide you step-by-step."
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
  - src: `images/student-studying.png`
  - src: `images/cpr3.avif`
  - src: `images/caregivers.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 5: `section_trainers`
- **Webflow HTML line**: ~564
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
  - "No. EMR is designed for beginners and non-medical professionals. Our instructors guide you step-by-step."
  - "Yes, but you can earn your BLS certification with us during the EMR program."
  - "No. EMR is not an EMT license. It provides advanced first responder skills but does not grant EMS credentials."
  - _(+1 more paragraphs)_
- **FAQ items** (4):
  - `questions[0].title`: "Do I need previous medical experience to take EMR?"
  - `questions[0].answer`: "No. EMR is designed for beginners and non-medical professionals. Our instructors guide you step-by-step."
  - `questions[1].title`: "s BLS required before the course?"
  - `questions[1].answer`: "Yes, but you can earn your BLS certification with us during the EMR program."
  - `questions[2].title`: "Does EMR qualify me to work on an ambulance?"
  - `questions[2].answer`: "No. EMR is not an EMT license. It provides advanced first responder skills but does not grant EMS credentials."
  - `questions[3].title`: "How long is the EMR certification valid?"
  - `questions[3].answer`: "Two years. After that, you’ll complete a renewal course to stay certified."
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
  - src: `images/student-studying.png`
  - src: `images/cpr3.avif`
  - src: `images/caregivers.avif`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 6: `section_layout493`
- **Webflow HTML line**: ~600
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
  - "No. EMR is designed for beginners and non-medical professionals. Our instructors guide you step-by-step."
  - "Yes, but you can earn your BLS certification with us during the EMR program."
  - "No. EMR is not an EMT license. It provides advanced first responder skills but does not grant EMS credentials."
  - "Two years. After that, you’ll complete a renewal course to stay certified."
  - _(+2 more paragraphs)_
- **FAQ items** (6):
  - `questions[0].title`: "Do I need previous medical experience to take EMR?"
  - `questions[0].answer`: "No. EMR is designed for beginners and non-medical professionals. Our instructors guide you step-by-step."
  - `questions[1].title`: "s BLS required before the course?"
  - `questions[1].answer`: "Yes, but you can earn your BLS certification with us during the EMR program."
  - `questions[2].title`: "Does EMR qualify me to work on an ambulance?"
  - `questions[2].answer`: "No. EMR is not an EMT license. It provides advanced first responder skills but does not grant EMS credentials."
  - `questions[3].title`: "How long is the EMR certification valid?"
  - `questions[3].answer`: "Two years. After that, you’ll complete a renewal course to stay certified."
  - `questions[4].title`: "How long is the EMR course?"
  - `questions[4].answer`: "47–50 hours for initial certification and 16 hours for renewal."
  - `questions[5].title`: "Is the course offered in-person or online?"
  - `questions[5].answer`: "EMR is taught in a traditional classroom format with hands-on practice."
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
  - src: `images/student-studying.png`
  - src: `images/cpr3.avif`
  - src: `images/caregivers.avif`

### Section 7: `section_faqs`
- **Webflow HTML line**: ~673
- **Webflow classes**: `section_faqs`
- **Component file**: `faq-6.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "No. EMR is designed for beginners and non-medical professionals. Our instructors guide you step-by-step."
  - "Yes, but you can earn your BLS certification with us during the EMR program."
  - "No. EMR is not an EMT license. It provides advanced first responder skills but does not grant EMS credentials."
  - "Two years. After that, you’ll complete a renewal course to stay certified."
  - "47–50 hours for initial certification and 16 hours for renewal."
  - "EMR is taught in a traditional classroom format with hands-on practice."
- **FAQ items** (6):
  - `questions[0].title`: "Do I need previous medical experience to take EMR?"
  - `questions[0].answer`: "No. EMR is designed for beginners and non-medical professionals. Our instructors guide you step-by-step."
  - `questions[1].title`: "s BLS required before the course?"
  - `questions[1].answer`: "Yes, but you can earn your BLS certification with us during the EMR program."
  - `questions[2].title`: "Does EMR qualify me to work on an ambulance?"
  - `questions[2].answer`: "No. EMR is not an EMT license. It provides advanced first responder skills but does not grant EMS credentials."
  - `questions[3].title`: "How long is the EMR certification valid?"
  - `questions[3].answer`: "Two years. After that, you’ll complete a renewal course to stay certified."
  - `questions[4].title`: "How long is the EMR course?"
  - `questions[4].answer`: "47–50 hours for initial certification and 16 hours for renewal."
  - `questions[5].title`: "Is the course offered in-person or online?"
  - `questions[5].answer`: "EMR is taught in a traditional classroom format with hands-on practice."
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
| `images/lifeguard.avif` | — | 1 |
| `images/security.avif` | — | 1 |
| `images/park-ranger.avif` | — | 1 |
| `images/clsas.avif` | — | 1 |
| `images/oxygen.webp` | — | 1 |
| `images/aed.avif` | — | 1 |
| `images/courses-header.avif` | — | 2 |
| `images/online2.avif` | — | 4 |
| `images/student-studying.png` | — | 4 |
| `images/cpr3.avif` | — | 4 |
| `images/caregivers.avif` | — | 4 |
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 7 |

## Interactions / JS
- GSAP
- ScrollTrigger
- GSAP Observer
- Stripe checkout links
- Inline hero-track scroll script
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/emergency-medical-responder/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Build custom component(s): ProgramHero, Trainers
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- CMS-bound fields (`w-dyn-bind-empty`) need data source
- Custom components required: ProgramHero, Trainers
- Fix `/program-template` in site-config: add Trainers section between Layout 54 and Layout 493
