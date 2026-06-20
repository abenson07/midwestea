# Advanced Tactical Casualty Care (ATCC) – Kansas City | Midwest Emergency Academy

## Source & target
- **Webflow file**: `midwestea.webflow/advanced-tactical-casualty-care.html`
- **Target route**: `/advanced-tactical-casualty-care`
- **Reference template**: `/program-template`
- **Template gap notes**: Reference /program-template omits section_trainers (present in Webflow between Layout 54 and Layout 493).

## Page metadata (from `<head>`)
- **title**: Advanced Tactical Casualty Care (ATCC) – Kansas City | Midwest Emergency Academy
- **description**: Learn life-saving tactical emergency care with MidwestEA’s ATCC course. Hands-on training for managing trauma, bleeding, airway issues, and critical injuries during high-threat situations.
- **og:title**: Advanced Tactical Casualty Care (ATCC) – Kansas City | Midwest Emergency Academy
- **og:description**: Learn life-saving tactical emergency care with MidwestEA’s ATCC course. Hands-on training for managing trauma, bleeding, airway issues, and critical injuries during high-threat situations.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61619077ba6f2bb5c8_atcc-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 781, 782, 1016

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
  - h1: "Advanced Tactical Casualty care"
  - h4: "Coming soon"
  - h2: "Stop the threat. Then save the life."
  - h2: "Tactical trauma care"
  - h2: "Airway and breathing support"
  - h2: "Movement and evacuation"
- **Paragraphs**:
  - "Train to manage life-threatening injuries in high-threat environments. This course prepares officers and responders to provide medical care after neutralizing a threat and transitioning from danger to patient care."
  - "This intensive ATCC program combines classroom learning and scenario-based training to teach life-saving care in tactical settings — with multiple delivery options available. $1250"
  - "Register now for just"
  - "Coming soon"
  - "ATCC gives officers and responders the skills to treat critical injuries after controlling a scene. You’ll learn how to stabilize severe trauma, manage bleeding, support airway and breathing issues, and move patients safely from danger to definitive care — all under real-world stress."
  - "Learn to treat life-threatening bleeding, chest injuries, and traumatic wounds during high-threat incidents. Training focuses on rapid assessment, hemorrhage control, and stabilizing injuries in unpredictable environments."
  - "Practice airway positioning, nasopharyngeal adjuncts, tension pneumothorax recognition, and needle decompression. Skills are taught through hands-on scenarios that mirror real tactical field care."
  - "Develop the ability to move injured individuals from warm zones to cold zones safely. Learn litter carries, casualty drags, and extraction techniques under time pressure and team-based conditions."
- **Links**:
  - [Register now for just $](https://buy.stripe.com/bJe6oHd7xdNNejXaiC6Vq0A)
- **Images** (9):
  - src: `images/atcc1.avif`
  - src: `images/move.png`
  - src: `images/buddy-care5.png`
  - src: `images/trauma-care.avif`
  - src: `images/airway.avif`
  - src: `images/move.png`
  - src: `images/atcc2.png`
  - src: `images/airway.avif`
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
  - h2: "Stop the threat. Then save the life."
  - h2: "Tactical trauma care"
  - h2: "Airway and breathing support"
  - h2: "Movement and evacuation"
  - h2: "Who it's for"
  - h3: "Law enforcement"
  - h3: "Tactical units"
  - h3: "Corrections teams"
  - h3: "Security personnel"
  - h3: "Emergency response teams"
  - h3: "Military and veterans"
  - h2: "Learn from real responders"
  - h2: "Get started today"
- **Paragraphs**:
  - "ATCC gives officers and responders the skills to treat critical injuries after controlling a scene. You’ll learn how to stabilize severe trauma, manage bleeding, support airway and breathing issues, and move patients safely from danger to definitive care — all under real-world stress."
  - "Learn to treat life-threatening bleeding, chest injuries, and traumatic wounds during high-threat incidents. Training focuses on rapid assessment, hemorrhage control, and stabilizing injuries in unpredictable environments."
  - "Practice airway positioning, nasopharyngeal adjuncts, tension pneumothorax recognition, and needle decompression. Skills are taught through hands-on scenarios that mirror real tactical field care."
  - "Develop the ability to move injured individuals from warm zones to cold zones safely. Learn litter carries, casualty drags, and extraction techniques under time pressure and team-based conditions."
  - "The ATCC course is designed for law enforcement officers, tactical teams, and responders who need the skills to provide lifesaving medical care during and after high-risk incidents."
  - "For patrol officers, field units, and supervisors who may encounter violence, traumatic injuries, or rapidly evolving scenes where immediate medical care is necessary."
  - "Ideal for SWAT, SRT, and specialized teams operating in high-threat environments where medical support must occur before EMS can safely enter."
  - "A strong fit for corrections officers who respond to inmate altercations, medical emergencies, or high-tension situations where quick intervention is essential."
  - "For private security teams, school security officers, and corporate or venue-based responders responsible for managing injuries during violent or high-risk events."
  - "Well suited for workplace ERT members, public safety partners, or community teams who support medical response in unpredictable or crowded environments."
  - _(+3 more paragraphs)_
- **Images** (10):
  - src: `images/atcc1.avif`
  - src: `images/move.png`
  - src: `images/buddy-care5.png`
  - src: `images/trauma-care.avif`
  - src: `images/airway.avif`
  - src: `images/move.png`
  - src: `images/atcc2.png`
  - src: `images/airway.avif`
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
  - h2: "Tactical trauma care"
  - h2: "Airway and breathing support"
  - h2: "Movement and evacuation"
  - h2: "Who it's for"
  - h3: "Law enforcement"
  - h3: "Tactical units"
  - h3: "Corrections teams"
  - h3: "Security personnel"
  - h3: "Emergency response teams"
  - h3: "Military and veterans"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
- **Paragraphs**:
  - "Learn to treat life-threatening bleeding, chest injuries, and traumatic wounds during high-threat incidents. Training focuses on rapid assessment, hemorrhage control, and stabilizing injuries in unpredictable environments."
  - "Practice airway positioning, nasopharyngeal adjuncts, tension pneumothorax recognition, and needle decompression. Skills are taught through hands-on scenarios that mirror real tactical field care."
  - "Develop the ability to move injured individuals from warm zones to cold zones safely. Learn litter carries, casualty drags, and extraction techniques under time pressure and team-based conditions."
  - "The ATCC course is designed for law enforcement officers, tactical teams, and responders who need the skills to provide lifesaving medical care during and after high-risk incidents."
  - "For patrol officers, field units, and supervisors who may encounter violence, traumatic injuries, or rapidly evolving scenes where immediate medical care is necessary."
  - "Ideal for SWAT, SRT, and specialized teams operating in high-threat environments where medical support must occur before EMS can safely enter."
  - "A strong fit for corrections officers who respond to inmate altercations, medical emergencies, or high-tension situations where quick intervention is essential."
  - "For private security teams, school security officers, and corporate or venue-based responders responsible for managing injuries during violent or high-risk events."
  - "Well suited for workplace ERT members, public safety partners, or community teams who support medical response in unpredictable or crowded environments."
  - "Appropriate for active-duty service members, reservists, and veterans with experience in tactical or field environments who want to sharpen or expand their casualty care skills."
  - _(+5 more paragraphs)_
- **Tabs** (3):
  - `tabs[0].title`: "Apply & Get Prepared"
  - `tabs[0].description`: "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - `tabs[1].title`: "Learn From Expert Instructors"
  - `tabs[1].description`: "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - `tabs[2].title`: "Build Skills Through Training & Evaluations"
  - `tabs[2].description`: "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
- **Images** (7):
  - src: `images/trauma-care.avif`
  - src: `images/airway.avif`
  - src: `images/move.png`
  - src: `images/atcc2.png`
  - src: `images/airway.avif`
  - src: `images/move.png`
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
  - h3: "Law enforcement"
  - h3: "Tactical units"
  - h3: "Corrections teams"
  - h3: "Security personnel"
  - h3: "Emergency response teams"
  - h3: "Military and veterans"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
  - h3: "Complete Testing & Earn Your Credentials"
  - h2: "Questions?"
- **Paragraphs**:
  - "The ATCC course is designed for law enforcement officers, tactical teams, and responders who need the skills to provide lifesaving medical care during and after high-risk incidents."
  - "For patrol officers, field units, and supervisors who may encounter violence, traumatic injuries, or rapidly evolving scenes where immediate medical care is necessary."
  - "Ideal for SWAT, SRT, and specialized teams operating in high-threat environments where medical support must occur before EMS can safely enter."
  - "A strong fit for corrections officers who respond to inmate altercations, medical emergencies, or high-tension situations where quick intervention is essential."
  - "For private security teams, school security officers, and corporate or venue-based responders responsible for managing injuries during violent or high-risk events."
  - "Well suited for workplace ERT members, public safety partners, or community teams who support medical response in unpredictable or crowded environments."
  - "Appropriate for active-duty service members, reservists, and veterans with experience in tactical or field environments who want to sharpen or expand their casualty care skills."
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed.efault text value"
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - _(+5 more paragraphs)_
- **FAQ items** (1):
  - `questions[0].title`: "Do I need medical experience to take ATCC?"
  - `questions[0].answer`: "No. The course is designed for officers and tactical responders of all experience levels."
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
  - src: `images/online.avif`
  - src: `images/clsas.avif`
  - src: `images/avert-meta.png`
  - src: `images/atcc2.avif`
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
  - "No. The course is designed for officers and tactical responders of all experience levels."
  - "It follows similar principles but is tailored for law enforcement and civilian tactical operations."
  - "You’ll train with chest seals, tourniquets, wound packing materials, NPAs, decompression needles, and evacuation equipment."
  - _(+1 more paragraphs)_
- **FAQ items** (4):
  - `questions[0].title`: "Do I need medical experience to take ATCC?"
  - `questions[0].answer`: "No. The course is designed for officers and tactical responders of all experience levels."
  - `questions[1].title`: "Is this the same as TCCC?"
  - `questions[1].answer`: "It follows similar principles but is tailored for law enforcement and civilian tactical operations."
  - `questions[2].title`: "What gear will I use?"
  - `questions[2].answer`: "You’ll train with chest seals, tourniquets, wound packing materials, NPAs, decompression needles, and evacuation equipment."
  - `questions[3].title`: "Is this course physically demanding?"
  - `questions[3].answer`: "Some scenarios require lifting, movement, and working under stress, but instructors guide you through safely."
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
  - src: `images/online.avif`
  - src: `images/clsas.avif`
  - src: `images/avert-meta.png`
  - src: `images/atcc2.avif`
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
  - "No. The course is designed for officers and tactical responders of all experience levels."
  - "It follows similar principles but is tailored for law enforcement and civilian tactical operations."
  - "You’ll train with chest seals, tourniquets, wound packing materials, NPAs, decompression needles, and evacuation equipment."
  - "Some scenarios require lifting, movement, and working under stress, but instructors guide you through safely."
  - _(+1 more paragraphs)_
- **FAQ items** (5):
  - `questions[0].title`: "Do I need medical experience to take ATCC?"
  - `questions[0].answer`: "No. The course is designed for officers and tactical responders of all experience levels."
  - `questions[1].title`: "Is this the same as TCCC?"
  - `questions[1].answer`: "It follows similar principles but is tailored for law enforcement and civilian tactical operations."
  - `questions[2].title`: "What gear will I use?"
  - `questions[2].answer`: "You’ll train with chest seals, tourniquets, wound packing materials, NPAs, decompression needles, and evacuation equipment."
  - `questions[3].title`: "Is this course physically demanding?"
  - `questions[3].answer`: "Some scenarios require lifting, movement, and working under stress, but instructors guide you through safely."
  - `questions[4].title`: "Can departments book group training?"
  - `questions[4].answer`: "Yes. Agencies can request private or department-wide sessions."
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
  - [Contact Us](contact.html)
  - [FAQ](faq.html)
- **Images** (4):
  - src: `images/online.avif`
  - src: `images/clsas.avif`
  - src: `images/avert-meta.png`
  - src: `images/atcc2.avif`

### Section 7: `section_faqs`
- **Webflow HTML line**: ~674
- **Webflow classes**: `section_faqs`
- **Component file**: `faq-6.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
  - h5: "Advanced Tactical"
  - h5: "Casualty Care"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "No. The course is designed for officers and tactical responders of all experience levels."
  - "It follows similar principles but is tailored for law enforcement and civilian tactical operations."
  - "You’ll train with chest seals, tourniquets, wound packing materials, NPAs, decompression needles, and evacuation equipment."
  - "Some scenarios require lifting, movement, and working under stress, but instructors guide you through safely."
  - "Yes. Agencies can request private or department-wide sessions."
- **FAQ items** (5):
  - `questions[0].title`: "Do I need medical experience to take ATCC?"
  - `questions[0].answer`: "No. The course is designed for officers and tactical responders of all experience levels."
  - `questions[1].title`: "Is this the same as TCCC?"
  - `questions[1].answer`: "It follows similar principles but is tailored for law enforcement and civilian tactical operations."
  - `questions[2].title`: "What gear will I use?"
  - `questions[2].answer`: "You’ll train with chest seals, tourniquets, wound packing materials, NPAs, decompression needles, and evacuation equipment."
  - `questions[3].title`: "Is this course physically demanding?"
  - `questions[3].answer`: "Some scenarios require lifting, movement, and working under stress, but instructors guide you through safely."
  - `questions[4].title`: "Can departments book group training?"
  - `questions[4].answer`: "Yes. Agencies can request private or department-wide sessions."
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
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `images/atcc1.avif` | — | 1 |
| `images/move.png` | — | 1 |
| `images/buddy-care5.png` | — | 1 |
| `images/trauma-care.avif` | — | 1 |
| `images/airway.avif` | — | 1 |
| `images/atcc2.png` | — | 1 |
| `images/courses-header.avif` | — | 2 |
| `images/online.avif` | — | 4 |
| `images/clsas.avif` | — | 4 |
| `images/avert-meta.png` | — | 4 |
| `images/atcc2.avif` | — | 4 |
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 7 |

## Interactions / JS
- GSAP
- ScrollTrigger
- GSAP Observer
- Stripe checkout links
- Inline hero-track scroll script
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/advanced-tactical-casualty-care/page.tsx` (or dynamic segment as noted)
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
