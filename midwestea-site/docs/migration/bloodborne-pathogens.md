# Bloodborne Pathogens Training | Midwest Emergency Academy

## Source & target
- **Webflow file**: `midwestea.webflow/bloodborne-pathogens.html`
- **Target route**: `/bloodborne-pathogens`
- **Reference template**: `/course-template`

## Page metadata (from `<head>`)
- **title**: Bloodborne Pathogens Training | Midwest Emergency Academy
- **description**: Learn how to identify, prevent, and respond to exposure risks with Bloodborne Pathogens training. Covers OSHA requirements, safe practices, and real-world precautions for workplace safety.
- **og:title**: Bloodborne Pathogens Training | Midwest Emergency Academy
- **og:description**: Learn how to identify, prevent, and respond to exposure risks with Bloodborne Pathogens training. Covers OSHA requirements, safe practices, and real-world precautions for workplace safety.

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 842, 843, 1042

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `section_course-header` | ~305 | Product Header 6 | `product-header-6.tsx` | update-content |
| 2 | `section_gallery22` | ~452 | Gallery 22 | `gallery-22.tsx` | update-content |
| 3 | `section_who-its-for` | ~527 | Layout 423 | `layout-423.tsx` | update-content |
| 4 | `section_layout493` | ~620 | Layout 493 | `layout-493.tsx` | update-content |
| 5 | `section_testimonial-small` | ~682 | Testimonial 1 | `testimonial-1.tsx` | update-content |
| 6 | `section_faqs` | ~703 | FAQ 6 | `faq-6.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `section_course-header`
- **Webflow HTML line**: ~305
- **Webflow classes**: `section_course-header`
- **Component file**: `product-header-6.tsx`
- **Action**: update-content
- **Headings**:
  - h1: "Bloodborne Pathogens"
  - h2: "Master essential skills"
  - h4: "Know the hazards"
  - h4: "Prevent exposure"
  - h4: "Exposure response"
- **Paragraphs**:
  - "Learn how to recognize exposure risks and protect yourself and others in the workplace. This OSHA-aligned course teaches safe practices, prevention strategies, and what to do if an incident occurs. Designed for anyone who may come into contact with blood or bodily fluids on the job."
- **Links**:
  - [Register for $](https://buy.stripe.com/5kQbJ13wX6llejX76q6Vq0j)
- **Images** (4):
  - src: `images/bloodborneupdated.png`
  - src: `images/blood-risks.avif`
  - src: `images/sharps.webp`
  - src: `images/blood-borne.jpg`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 2: `section_gallery22`
- **Webflow HTML line**: ~452
- **Webflow classes**: `section_gallery22`
- **Component file**: `gallery-22.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "relevant for many fields"
  - "Getting certified has never been easier"
- **Headings**:
  - h2: "Master essential skills"
  - h4: "Know the hazards"
  - h4: "Prevent exposure"
  - h4: "Exposure response"
  - h2: "Protect yourself"
  - h3: "Safety in everyday tasks"
  - h3: "Protection for helping professions"
  - h3: "Ready for real situations"
  - h2: "Get started today"
  - h3: "Register & Get Started"
  - h3: "Take the Test"
- **Paragraphs**:
  - "relevant for many fields Protect yourself This course supports anyone who may encounter blood or bodily fluids in their workplace or community role."
  - "Employees in offices, warehouses, retail, and service environments learn how to protect themselves during unexpected exposure incidents."
  - "Childcare workers, educators, and community staff learn practical precautions when assisting others who may be injured or ill."
  - "Security staff, volunteers, and EMS-adjacent roles learn how to recognize hazards and respond safely if exposure occurs."
  - "Understanding exposure risks doesn’t have to be complicated. This online course walks you through real-world examples, safe practices, and essential steps to protect yourself and others in any workplace setting."
  - "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
- **Tabs** (2):
  - `tabs[0].title`: "Register & Get Started"
  - `tabs[0].description`: "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - `tabs[1].title`: "Take the Test"
  - `tabs[1].description`: "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
- **Images** (6):
  - src: `images/blood-risks.avif`
  - src: `images/sharps.webp`
  - src: `images/blood-borne.jpg`
  - src: `images/workplace.avif`
  - src: `images/caregivers.avif`
  - src: `images/ems.avif`

### Section 3: `section_who-its-for`
- **Webflow HTML line**: ~527
- **Webflow classes**: `section_who-its-for`
- **Component file**: `layout-423.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "relevant for many fields"
  - "Getting certified has never been easier"
  - "Trusted by Industry Professionals"
- **Headings**:
  - h2: "Protect yourself"
  - h3: "Safety in everyday tasks"
  - h3: "Protection for helping professions"
  - h3: "Ready for real situations"
  - h2: "Get started today"
  - h3: "Register & Get Started"
  - h3: "Take the Test"
  - h3: "Get certified"
  - h3: "“Everything was explained in simple terms. I finally understand what to do if there’s an exposure and how to protect myself at work.”"
  - h2: "Questions?"
- **Paragraphs**:
  - "This course supports anyone who may encounter blood or bodily fluids in their workplace or community role."
  - "Employees in offices, warehouses, retail, and service environments learn how to protect themselves during unexpected exposure incidents."
  - "Childcare workers, educators, and community staff learn practical precautions when assisting others who may be injured or ill."
  - "Security staff, volunteers, and EMS-adjacent roles learn how to recognize hazards and respond safely if exposure occurs."
  - "Understanding exposure risks doesn’t have to be complicated. This online course walks you through real-world examples, safe practices, and essential steps to protect yourself and others in any workplace setting."
  - "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
  - "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards."
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
- **Tabs** (3):
  - `tabs[0].title`: "Register & Get Started"
  - `tabs[0].description`: "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - `tabs[1].title`: "Take the Test"
  - `tabs[1].description`: "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
  - `tabs[2].title`: "Get certified"
  - `tabs[2].description`: "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards."
- **Links**:
  - [See all FAQs](faq.html)
- **Images** (6):
  - src: `images/workplace.avif`
  - src: `images/caregivers.avif`
  - src: `images/ems.avif`
  - src: `images/online2.avif`
  - src: `images/online.avif`
  - src: `images/icu.avif`

### Section 4: `section_layout493`
- **Webflow HTML line**: ~620
- **Webflow classes**: `section_layout493`
- **Component file**: `layout-493.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Getting certified has never been easier"
  - "Trusted by Industry Professionals"
- **Headings**:
  - h2: "Get started today"
  - h3: "Register & Get Started"
  - h3: "Take the Test"
  - h3: "Get certified"
  - h3: "“Everything was explained in simple terms. I finally understand what to do if there’s an exposure and how to protect myself at work.”"
  - h2: "Questions?"
- **Paragraphs**:
  - "Understanding exposure risks doesn’t have to be complicated. This online course walks you through real-world examples, safe practices, and essential steps to protect yourself and others in any workplace setting."
  - "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
  - "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards."
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Yes. This training aligns with OSHA’s Bloodborne Pathogens Standard for workplace safety."
  - "Some versions include a short knowledge check, but many rely on participation and discussion."
  - "No. This course is designed for all workplace roles, not just healthcare."
  - "Typically 45–90 minutes depending on the group and format."
  - "Availability varies by schedule."
  - _(+1 more paragraphs)_
- **FAQ items** (6):
  - `questions[0].title`: "Does this course meet OSHA requirements?"
  - `questions[0].answer`: "Yes. This training aligns with OSHA’s Bloodborne Pathogens Standard for workplace safety."
  - `questions[1].title`: "Is there a written test?"
  - `questions[1].answer`: "Some versions include a short knowledge check, but many rely on participation and discussion."
  - `questions[2].title`: "Do I need medical training?"
  - `questions[2].answer`: "No. This course is designed for all workplace roles, not just healthcare."
  - `questions[3].title`: "How long is the class?"
  - `questions[3].answer`: "Typically 45–90 minutes depending on the group and format."
  - `questions[4].title`: "Is this offered in Spanish?"
  - `questions[4].answer`: "Availability varies by schedule."
  - `questions[5].title`: "Does this course include CPR?"
  - `questions[5].answer`: "No. CPR is a separate certification but can be added with Pediatric CPR or CPR/First Aid."
- **Tabs** (3):
  - `tabs[0].title`: "Register & Get Started"
  - `tabs[0].description`: "Sign up and receive access to your course. Learn with clear, easy-to-follow online content created and taught by expert instructors who guide you through each step."
  - `tabs[1].title`: "Take the Test"
  - `tabs[1].description`: "When you’re ready, complete the online exam. Most courses require a 75% or higher to pass, and some may include an in-person or Remote Skills Verification session."
  - `tabs[2].title`: "Get certified"
  - `tabs[2].description`: "Pass your test and receive your digital certificate. Download it, share it, and get back out there confidently—fully prepared and up to date with national training standards."
- **Links**:
  - [See all FAQs](faq.html)
- **Images** (3):
  - src: `images/online2.avif`
  - src: `images/online.avif`
  - src: `images/icu.avif`

### Section 5: `section_testimonial-small`
- **Webflow HTML line**: ~682
- **Webflow classes**: `section_testimonial-small`
- **Component file**: `testimonial-1.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Trusted by Industry Professionals"
- **Headings**:
  - h3: "“Everything was explained in simple terms. I finally understand what to do if there’s an exposure and how to protect myself at work.”"
  - h2: "Questions?"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Yes. This training aligns with OSHA’s Bloodborne Pathogens Standard for workplace safety."
  - "Some versions include a short knowledge check, but many rely on participation and discussion."
  - "No. This course is designed for all workplace roles, not just healthcare."
  - "Typically 45–90 minutes depending on the group and format."
  - "Availability varies by schedule."
  - "No. CPR is a separate certification but can be added with Pediatric CPR or CPR/First Aid."
  - "Certification is valid for one year per OSHA guidelines."
- **FAQ items** (7):
  - `questions[0].title`: "Does this course meet OSHA requirements?"
  - `questions[0].answer`: "Yes. This training aligns with OSHA’s Bloodborne Pathogens Standard for workplace safety."
  - `questions[1].title`: "Is there a written test?"
  - `questions[1].answer`: "Some versions include a short knowledge check, but many rely on participation and discussion."
  - `questions[2].title`: "Do I need medical training?"
  - `questions[2].answer`: "No. This course is designed for all workplace roles, not just healthcare."
  - `questions[3].title`: "How long is the class?"
  - `questions[3].answer`: "Typically 45–90 minutes depending on the group and format."
  - `questions[4].title`: "Is this offered in Spanish?"
  - `questions[4].answer`: "Availability varies by schedule."
  - `questions[5].title`: "Does this course include CPR?"
  - `questions[5].answer`: "No. CPR is a separate certification but can be added with Pediatric CPR or CPR/First Aid."
  - `questions[6].title`: "How long is certification valid?"
  - `questions[6].answer`: "Certification is valid for one year per OSHA guidelines."
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

### Section 6: `section_faqs`
- **Webflow HTML line**: ~703
- **Webflow classes**: `section_faqs`
- **Component file**: `faq-6.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Yes. This training aligns with OSHA’s Bloodborne Pathogens Standard for workplace safety."
  - "Some versions include a short knowledge check, but many rely on participation and discussion."
  - "No. This course is designed for all workplace roles, not just healthcare."
  - "Typically 45–90 minutes depending on the group and format."
  - "Availability varies by schedule."
  - "No. CPR is a separate certification but can be added with Pediatric CPR or CPR/First Aid."
  - "Certification is valid for one year per OSHA guidelines."
- **FAQ items** (7):
  - `questions[0].title`: "Does this course meet OSHA requirements?"
  - `questions[0].answer`: "Yes. This training aligns with OSHA’s Bloodborne Pathogens Standard for workplace safety."
  - `questions[1].title`: "Is there a written test?"
  - `questions[1].answer`: "Some versions include a short knowledge check, but many rely on participation and discussion."
  - `questions[2].title`: "Do I need medical training?"
  - `questions[2].answer`: "No. This course is designed for all workplace roles, not just healthcare."
  - `questions[3].title`: "How long is the class?"
  - `questions[3].answer`: "Typically 45–90 minutes depending on the group and format."
  - `questions[4].title`: "Is this offered in Spanish?"
  - `questions[4].answer`: "Availability varies by schedule."
  - `questions[5].title`: "Does this course include CPR?"
  - `questions[5].answer`: "No. CPR is a separate certification but can be added with Pediatric CPR or CPR/First Aid."
  - `questions[6].title`: "How long is certification valid?"
  - `questions[6].answer`: "Certification is valid for one year per OSHA guidelines."
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
| `images/bloodborneupdated.png` | — | 1 |
| `images/blood-risks.avif` | — | 1 |
| `images/sharps.webp` | — | 1 |
| `images/blood-borne.jpg` | — | 1 |
| `images/workplace.avif` | — | 2 |
| `images/caregivers.avif` | — | 2 |
| `images/ems.avif` | — | 2 |
| `images/online2.avif` | — | 3 |
| `images/online.avif` | — | 3 |
| `images/icu.avif` | — | 3 |
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 6 |

## Interactions / JS
- GSAP
- ScrollTrigger
- Stripe checkout links
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/bloodborne-pathogens/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- CMS-bound fields (`w-dyn-bind-empty`) need data source
- See [_README.md](_README.md#course-detail-template-shared-by-12-pages) for shared course template structure
- Cross-reference [basic-life-support.md](basic-life-support.md) for full template; this page differs in content only
