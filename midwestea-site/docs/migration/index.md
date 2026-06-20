# Midwest Emergency Academy – Trusted EMS Training in the Kansas City Area

## Source & target
- **Webflow file**: `midwestea.webflow/index.html`
- **Target route**: `/`
- **Reference template**: `NEW TEMPLATE REQUIRED`

## Page metadata (from `<head>`)
- **title**: Midwest Emergency Academy – Trusted EMS Training in the Kansas City Area
- **description**: Start your EMS training with confidence. Midwest Emergency Academy offers state-approved EMT, Paramedic, BLS, ACLS, and continuing education programs with flexible online and hands-on options. Learn from expert instructors trusted across Missouri and Kansas
- **og:title**: Your Path to Trusted EMS Training Starts Here
- **og:description**: Explore state-approved EMT, Paramedic, and continuing education programs designed for real-world readiness. Flexible learning, expert instructors, and support at every step.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c615f562e6c280cf3e8_emt-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 947, 948, 1259

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `section_home-hero` | ~312 | HomeHero | `components/home-hero.tsx (NEW)` | build-custom |
| 2 | `section-programs` | ~357 | HomePrograms | `components/home-programs.tsx (NEW)` | build-custom |
| 3 | `section_ways-to-learn` | ~525 | WaysToLearn | `components/ways-to-learn.tsx (NEW)` | build-custom |
| 4 | `section_testimonial` | ~590 | HomeTestimonial | `components/home-testimonial.tsx (NEW)` | build-custom |
| 5 | `section_trainers` | ~599 | Trainers | `components/trainers.tsx (NEW)` | build-custom |
| 6 | `section-courses-home` | ~635 | CoursesHome | `components/courses-home.tsx (NEW)` | build-custom |
| 7 | `section_faqs` | ~808 | FAQ 6 | `faq-6.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `section_home-hero`
- **Webflow HTML line**: ~312
- **Webflow classes**: `section_home-hero`
- **Component file**: `components/home-hero.tsx (NEW)`
- **Action**: build-custom
- **Headings**:
  - h4: "Paramedic"
  - h4: "Class name goes here"
  - h4: "Class name goes here"
  - h4: "Class name goes here"
  - h1: "Calling"
  - h1: "All"
  - h1: "Responders"
  - h3: "Training the Midwest's Finest to serve with purpose and always ready to answer the calls"
  - h3: "Emergency"
  - h3: "Medical"
  - h3: "Responder"
  - h3: "Emergency"
  - h3: "Medical"
  - h3: "Technician"
  - h3: "paramedic"
  - _(+6 more headings)_
- **Links**:
  - [Learn more](emergency-medical-responder.html)
  - [Learn more](emergency-medical-technician.html)
  - [Learn more](paramedic.html)
  - [Learn more](community-paramedic.html)
  - [Learn more](critical-care-transport.html)
- **Images** (17):
  - src: `images/cp-meta.png`
  - src: `images/atcc.avif`
  - src: `images/ccp.avif`
  - src: `images/paramedic.avif`
  - src: `images/company-watermark.avif`
  - src: `images/emr.png`
  - src: `images/emr-hero.avif`
  - src: `images/emt.png`
  - _(+9 more images)_

### Section 2: `section-programs`
- **Webflow HTML line**: ~357
- **Webflow classes**: `section-programs`
- **Component file**: `components/home-programs.tsx (NEW)`
- **Action**: build-custom
- **Tagline(s)**:
  - "Your money goes further with Us"
- **Headings**:
  - h3: "Training the Midwest's Finest to serve with purpose and always ready to answer the calls"
  - h3: "Emergency"
  - h3: "Medical"
  - h3: "Responder"
  - h3: "Emergency"
  - h3: "Medical"
  - h3: "Technician"
  - h3: "paramedic"
  - h3: "Community"
  - h3: "paramedic"
  - h3: "critical care"
  - h3: "Transport"
  - h3: "Advanced Tactical"
  - h3: "Casualty care"
  - h2: "Flexible Paths, One Standard of Excellence"
- **Paragraphs**:
  - "Emergency Medical Responder Learn more Emergency Medical Technician Learn more paramedic Learn more Community paramedic Learn more critical care Transport Learn more Advanced Tactical Casualty care Learn more Your money goes further with Us Flexible Paths, One Standard of Excellence Just starting your training or renewing your certification? Every MidwestEA program, from online courses to full paramedic instruction, meets state and NREMT standards to keep you field-ready."
  - "Online certification"
  - "In person training"
  - "Career preparation"
- **Links**:
  - [Learn more](emergency-medical-responder.html)
  - [Learn more](emergency-medical-technician.html)
  - [Learn more](paramedic.html)
  - [Learn more](community-paramedic.html)
  - [Learn more](critical-care-transport.html)
  - [Learn more](advanced-tactical-casualty-care.html)
- **Images** (13):
  - src: `images/company-watermark.avif`
  - src: `images/emr.png`
  - src: `images/emr-hero.avif`
  - src: `images/emt.png`
  - src: `images/emt.avif`
  - src: `images/paramedic.png`
  - src: `images/paramedic-hero-vid.avif`
  - src: `images/community-paramedic.png`
  - _(+5 more images)_

### Section 3: `section_ways-to-learn`
- **Webflow HTML line**: ~525
- **Webflow classes**: `section_ways-to-learn`
- **Component file**: `components/ways-to-learn.tsx (NEW)`
- **Action**: build-custom
- **Tagline(s)**:
  - "Your money goes further with Us"
  - "Kansas City's best instructors"
  - "Certification courses"
- **Headings**:
  - h2: "Flexible Paths, One Standard of Excellence"
  - h3: "Online certification"
  - h3: "In person training"
  - h3: "Full career programs"
  - h2: "“I knocked out my CPR renewal during my lunch break. Everything was straightforward, and I got my certificate immediately.”"
  - h2: "Learn from real responders"
  - h2: "Master the essentials"
  - h4: "Basic Life Support"
  - h4: "Advanced Cardiovascular life support"
  - h4: "Active Violence emergency response"
  - h4: "Pediatric Advanced Life Support"
  - h4: "CPR/First Aid"
- **Paragraphs**:
  - "Just starting your training or renewing your certification? Every MidwestEA program, from online courses to full paramedic instruction, meets state and NREMT standards to keep you field-ready."
  - "Online certification"
  - "In person training"
  - "Career preparation"
  - "Learn at your pace with flexible, instructor-backed courses. Trusted, state-approved training that gets you certified and ready to serve."
  - "Train alongside experienced EMS professionals in real-world environments. Hands-on, state-approved instruction that builds confidence and keeps your skills field-ready."
  - "Advance through comprehensive, state-approved EMS programs designed for real service. Graduate ready to lead, serve, and build a lasting career in emergency care."
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our certification courses are designed for those who need to refresh their skills and stay updated with the latest techniques. Whether you're returning to the field or looking to enhance your expertise, our programs provide the knowledge and confidence you need to excel."
- **Links**:
  - [Basic Life Support $49.99 View course](basic-life-support.html)
  - [Advanced Cardiovascular life support $149.99 View course](advanced-cardiovascular-life-support.html)
  - [Active Violence emergency response $39.99 View course](active-shooter-training.html)
  - [Pediatric Advanced Life Support $34.99 View course](pediatric-advanced-life-support.html)
  - [CPR/First Aid $34.99 View course](cpr-first-aid.html)
- **Images** (9):
  - src: `images/online.avif`
  - src: `images/clsas.avif`
  - src: `images/firefighter.avif`
  - src: `images/courses-header.avif`
  - src: `images/bls.avif`
  - src: `images/acls.webp`
  - src: `images/avert.jpg`
  - src: `images/pals2.avif`
  - _(+1 more images)_
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 4: `section_testimonial`
- **Webflow HTML line**: ~590
- **Webflow classes**: `section_testimonial text-align-center`
- **Component file**: `components/home-testimonial.tsx (NEW)`
- **Action**: build-custom
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Certification courses"
- **Headings**:
  - h2: "“I knocked out my CPR renewal during my lunch break. Everything was straightforward, and I got my certificate immediately.”"
  - h2: "Learn from real responders"
  - h2: "Master the essentials"
  - h4: "Basic Life Support"
  - h4: "Advanced Cardiovascular life support"
  - h4: "Active Violence emergency response"
  - h4: "Pediatric Advanced Life Support"
  - h4: "CPR/First Aid"
  - h4: "Pediatric CPR"
  - h4: "Child and babysitting Safety"
  - h4: "Administration of Epinephrine​​ Au​​to-Injectors"
  - h4: "Emergency Use of Medical Oxygen"
  - h4: "Bloodborne Pathogens"
- **Paragraphs**:
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our certification courses are designed for those who need to refresh their skills and stay updated with the latest techniques. Whether you're returning to the field or looking to enhance your expertise, our programs provide the knowledge and confidence you need to excel."
- **Links**:
  - [Basic Life Support $49.99 View course](basic-life-support.html)
  - [Advanced Cardiovascular life support $149.99 View course](advanced-cardiovascular-life-support.html)
  - [Active Violence emergency response $39.99 View course](active-shooter-training.html)
  - [Pediatric Advanced Life Support $34.99 View course](pediatric-advanced-life-support.html)
  - [CPR/First Aid $34.99 View course](cpr-first-aid.html)
  - [Pediatric CPR $34.99 View course](pediatric-first-aid-cpr-aed.html)
  - [Child and babysitting Safety $34.99 View course](child-and-babysitting-safety.html)
  - [Administration of Epinephrine​​ Au​​to-Injectors $35.00 View course](use-and-administration-of-epinephrine-auto-injectors.html)
  - [Emergency Use of Medical Oxygen $19.99 View course](emergency-use-of-medical-oxygen.html)
  - [Bloodborne Pathogens $19.99 View course](bloodborne-pathogens.html)
- **Images** (11):
  - src: `images/courses-header.avif`
  - src: `images/bls.avif`
  - src: `images/acls.webp`
  - src: `images/avert.jpg`
  - src: `images/pals2.avif`
  - src: `images/cpr.avif`
  - src: `images/heartsaver-pediatric-first-aid-training-in-kansas-city-first-aid-scaled.avif`
  - src: `images/safe-supervision.avif`
  - _(+3 more images)_
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 5: `section_trainers`
- **Webflow HTML line**: ~599
- **Webflow classes**: `section_trainers`
- **Component file**: `components/trainers.tsx (NEW)`
- **Action**: build-custom
- **Tagline(s)**:
  - "Kansas City's best instructors"
  - "Certification courses"
- **Headings**:
  - h2: "Learn from real responders"
  - h2: "Master the essentials"
  - h4: "Basic Life Support"
  - h4: "Advanced Cardiovascular life support"
  - h4: "Active Violence emergency response"
  - h4: "Pediatric Advanced Life Support"
  - h4: "CPR/First Aid"
  - h4: "Pediatric CPR"
  - h4: "Child and babysitting Safety"
  - h4: "Administration of Epinephrine​​ Au​​to-Injectors"
  - h4: "Emergency Use of Medical Oxygen"
  - h4: "Bloodborne Pathogens"
- **Paragraphs**:
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our certification courses are designed for those who need to refresh their skills and stay updated with the latest techniques. Whether you're returning to the field or looking to enhance your expertise, our programs provide the knowledge and confidence you need to excel."
- **Links**:
  - [Basic Life Support $49.99 View course](basic-life-support.html)
  - [Advanced Cardiovascular life support $149.99 View course](advanced-cardiovascular-life-support.html)
  - [Active Violence emergency response $39.99 View course](active-shooter-training.html)
  - [Pediatric Advanced Life Support $34.99 View course](pediatric-advanced-life-support.html)
  - [CPR/First Aid $34.99 View course](cpr-first-aid.html)
  - [Pediatric CPR $34.99 View course](pediatric-first-aid-cpr-aed.html)
  - [Child and babysitting Safety $34.99 View course](child-and-babysitting-safety.html)
  - [Administration of Epinephrine​​ Au​​to-Injectors $35.00 View course](use-and-administration-of-epinephrine-auto-injectors.html)
  - [Emergency Use of Medical Oxygen $19.99 View course](emergency-use-of-medical-oxygen.html)
  - [Bloodborne Pathogens $19.99 View course](bloodborne-pathogens.html)
- **Images** (11):
  - src: `images/courses-header.avif`
  - src: `images/bls.avif`
  - src: `images/acls.webp`
  - src: `images/avert.jpg`
  - src: `images/pals2.avif`
  - src: `images/cpr.avif`
  - src: `images/heartsaver-pediatric-first-aid-training-in-kansas-city-first-aid-scaled.avif`
  - src: `images/safe-supervision.avif`
  - _(+3 more images)_
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 6: `section-courses-home`
- **Webflow HTML line**: ~635
- **Webflow classes**: `section-courses-home`
- **Component file**: `components/courses-home.tsx (NEW)`
- **Action**: build-custom
- **Tagline(s)**:
  - "Certification courses"
- **Headings**:
  - h2: "Master the essentials"
  - h4: "Basic Life Support"
  - h4: "Advanced Cardiovascular life support"
  - h4: "Active Violence emergency response"
  - h4: "Pediatric Advanced Life Support"
  - h4: "CPR/First Aid"
  - h4: "Pediatric CPR"
  - h4: "Child and babysitting Safety"
  - h4: "Administration of Epinephrine​​ Au​​to-Injectors"
  - h4: "Emergency Use of Medical Oxygen"
  - h4: "Bloodborne Pathogens"
  - h2: "Questions?"
- **Paragraphs**:
  - "Our certification courses are designed for those who need to refresh their skills and stay updated with the latest techniques. Whether you're returning to the field or looking to enhance your expertise, our programs provide the knowledge and confidence you need to excel."
  - "Questions? Visit our FAQ section for more information regarding programs, courses, certifications, and more."
- **Links**:
  - [Basic Life Support $49.99 View course](basic-life-support.html)
  - [Advanced Cardiovascular life support $149.99 View course](advanced-cardiovascular-life-support.html)
  - [Active Violence emergency response $39.99 View course](active-shooter-training.html)
  - [Pediatric Advanced Life Support $34.99 View course](pediatric-advanced-life-support.html)
  - [CPR/First Aid $34.99 View course](cpr-first-aid.html)
  - [Pediatric CPR $34.99 View course](pediatric-first-aid-cpr-aed.html)
  - [Child and babysitting Safety $34.99 View course](child-and-babysitting-safety.html)
  - [Administration of Epinephrine​​ Au​​to-Injectors $35.00 View course](use-and-administration-of-epinephrine-auto-injectors.html)
  - [Emergency Use of Medical Oxygen $19.99 View course](emergency-use-of-medical-oxygen.html)
  - [Bloodborne Pathogens $19.99 View course](bloodborne-pathogens.html)
- **Images** (10):
  - src: `images/bls.avif`
  - src: `images/acls.webp`
  - src: `images/avert.jpg`
  - src: `images/pals2.avif`
  - src: `images/cpr.avif`
  - src: `images/heartsaver-pediatric-first-aid-training-in-kansas-city-first-aid-scaled.avif`
  - src: `images/safe-supervision.avif`
  - src: `images/epi.webp`
  - _(+2 more images)_

### Section 7: `section_faqs`
- **Webflow HTML line**: ~808
- **Webflow classes**: `section_faqs`
- **Component file**: `faq-6.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "We price every course to reflect the actual cost of expert instruction, curriculum development, and certification requirements—not inflated add-ons. Our goal is to make high-quality emergency training accessible, so you only pay for what directly supports your learning and certification."
  - "All courses are taught by certified, experienced instructors with real-world EMS, healthcare, or public safety backgrounds. Many actively work in the field, bringing current, practical knowledge into every lesson."
  - "Yes. MidwestEA uses nationally recognized curricula, follows the latest AHA/ILCOR guidelines, and provides state-approved certifications whenever applicable. All courses meet or exceed the standards required for professional use."
  - "We follow structured, evidence-based curriculum, use updated materials, and maintain small student-to-instructor ratios for better learning. Every course includes clear learning objectives and evaluation standards so you know exactly what you’re gaining."
  - "Course pricing depends on required materials, instructor qualifications, certification costs, and the depth of training involved. Shorter awareness-level courses cost less; advanced medical certifications require more instruction, evaluation, and resources."
  - "Yes. Whether online or blended, every course follows the same learning standards and uses clear, easy-to-follow instruction developed by EMS educators. Practical components are included when required for certification."
  - "All training is reviewed regularly and aligned with current guidelines, including AHA, ILCOR, and other national standards. When best practices change, our courses are updated to match."
- **FAQ items** (7):
  - `questions[0].title`: "How does MidwestEA keep pricing fair?"
  - `questions[0].answer`: "We price every course to reflect the actual cost of expert instruction, curriculum development, and certification requirements—not inflated add-ons. Our goal is to make high-quality emergency training accessible, so you only pay for what directly supports your learning and certification."
  - `questions[1].title`: "Who teaches the courses?"
  - `questions[1].answer`: "All courses are taught by certified, experienced instructors with real-world EMS, healthcare, or public safety backgrounds. Many actively work in the field, bringing current, practical knowledge into every lesson."
  - `questions[2].title`: "Are the certifications legitimate?"
  - `questions[2].answer`: "Yes. MidwestEA uses nationally recognized curricula, follows the latest AHA/ILCOR guidelines, and provides state-approved certifications whenever applicable. All courses meet or exceed the standards required for professional use."
  - `questions[3].title`: "How do you ensure training quality?"
  - `questions[3].answer`: "We follow structured, evidence-based curriculum, use updated materials, and maintain small student-to-instructor ratios for better learning. Every course includes clear learning objectives and evaluation standards so you know exactly what you’re gaining."
  - `questions[4].title`: "Why are some courses priced differently?"
  - `questions[4].answer`: "Course pricing depends on required materials, instructor qualifications, certification costs, and the depth of training involved. Shorter awareness-level courses cost less; advanced medical certifications require more instruction, evaluation, and resources."
  - `questions[5].title`: "Do you offer the same level of quality for online courses?"
  - `questions[5].answer`: "Yes. Whether online or blended, every course follows the same learning standards and uses clear, easy-to-follow instruction developed by EMS educators. Practical components are included when required for certification."
  - `questions[6].title`: "How often is your content updated?"
  - `questions[6].answer`: "All training is reviewed regularly and aligned with current guidelines, including AHA, ILCOR, and other national standards. When best practices change, our courses are updated to match."
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
| `images/cp-meta.png` | — | 1 |
| `images/atcc.avif` | — | 1 |
| `images/ccp.avif` | — | 1 |
| `images/paramedic.avif` | — | 1 |
| `images/company-watermark.avif` | — | 1 |
| `images/emr.png` | — | 1 |
| `images/emr-hero.avif` | — | 1 |
| `images/emt.png` | — | 1 |
| `images/emt.avif` | — | 1 |
| `images/paramedic.png` | — | 1 |
| `images/paramedic-hero-vid.avif` | — | 1 |
| `images/community-paramedic.png` | — | 1 |
| `images/cp-hero.avif` | — | 1 |
| `images/critical-care-paramedic.png` | — | 1 |
| `images/adv-tactical-casualty-care.png` | — | 1 |
| `images/online.avif` | — | 3 |
| `images/clsas.avif` | — | 3 |
| `images/firefighter.avif` | — | 3 |
| `images/courses-header.avif` | — | 3 |
| `images/bls.avif` | — | 3 |
| `images/acls.webp` | — | 3 |
| `images/avert.jpg` | — | 3 |
| `images/pals2.avif` | — | 3 |
| `images/cpr.avif` | — | 3 |
| `images/heartsaver-pediatric-first-aid-training-in-kansas-city-first-aid-scaled.avif` | — | 4 |
| `images/safe-supervision.avif` | — | 4 |
| `images/epi.webp` | — | 4 |
| `images/oxygen_1.avif` | — | 4 |
| `images/blood-borne2.jpg` | — | 4 |
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 7 |

## Interactions / JS
- GSAP
- ScrollTrigger
- GSAP Observer
- Swiper 12
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/index/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Build custom component(s): HomeHero, HomePrograms, WaysToLearn, HomeTestimonial, Trainers, CoursesHome
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- CMS-bound fields (`w-dyn-bind-empty`) need data source
- Custom components required: HomeHero, HomePrograms, WaysToLearn, HomeTestimonial, Trainers, CoursesHome
