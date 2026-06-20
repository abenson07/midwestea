# Certification Courses - Midwest Emergency Academy

## Source & target
- **Webflow file**: `midwestea.webflow/courses.html`
- **Target route**: `/courses`
- **Reference template**: `/course-gallery`

## Page metadata (from `<head>`)
- **title**: Certification Courses - Midwest Emergency Academy
- **description**: Browse all certification courses offered by Midwest Emergency Academy, including BLS, ACLS, PALS, CPR/AED, Pediatric CPR, Child & Babysitting Safety, AVERT active violence response, Epinephrine administration, Bloodborne Pathogens, and Emergency Oxygen. Flexible online and blended training taught by expert instructors.
- **og:title**: Certification Courses - Midwest Emergency Academy
- **og:description**: Explore our full catalog of certification courses—BLS, ACLS, PALS, CPR/AED, Pediatric CPR, Babysitting, AVERT, Epinephrine, Bloodborne Pathogens, and Oxygen training. Trusted, flexible, instructor-led education.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224f8b142e131cf0ad2eee_courses-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 586, 587, 662

## Section map

| # | Webflow selector | Line | Target component | Component file | Action |
|---|-----------------|------|------------------|----------------|--------|
| 1 | `section_hero-header` | ~303 | Header 60 | `header-60.tsx` | update-content |
| 2 | `section_class-grid` | ~325 | Product 1 | `product-1.tsx` | update-content |
| 3 | `section_testimonial-small` | ~388 | Testimonial 1 | `testimonial-1.tsx` | update-content |
| 4 | `section_class-grid` | ~416 | Product 1 | `product-1.tsx` | update-content |
| 5 | `section_faq` | ~479 | FAQ 6 | `faq-6.tsx` | update-content |

## Section content (verbatim extraction)

### Section 1: `section_hero-header`
- **Webflow HTML line**: ~303
- **Webflow classes**: `section_hero-header text-color-white`
- **Component file**: `header-60.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Trusted by Industry Professionals"
- **Headings**:
  - h1: "Explore our state certified"
  - h1: "Courses"
  - h3: ""The process was seamless and streamlined and allowed my team members work at their own pace throughout the course.""
  - h2: "Questions?"
- **Paragraphs**:
  - "Advance your career with trusted, NREMT-accepted EMT and Paramedic training taught by experienced instructors with real-world emergency care experience."
  - "In person training Online course – get certified today $ No items found. Trusted by Industry Professionals "The process was seamless and streamlined and allowed my team members work at their own pace throughout the course." John Smith Fire Chief, KCFD In person training Online course – get certified today $ No items found. Questions? Visit our FAQ section for more information regarding programs, courses, certifications, and more."
- **Links**:
  - [See all FAQs](faq.html)
- **Images** (3):
  - src: `images/courses-header.avif`
  - src: `images/placeholder-image.svg`
  - src: `images/placeholder-image.svg`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 2: `section_class-grid`
- **Webflow HTML line**: ~325
- **Webflow classes**: `section_class-grid`
- **Component file**: `product-1.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Trusted by Industry Professionals"
- **Headings**:
  - h3: ""The process was seamless and streamlined and allowed my team members work at their own pace throughout the course.""
  - h2: "Questions?"
- **Paragraphs**:
  - "In person training Online course – get certified today $ No items found. Trusted by Industry Professionals "The process was seamless and streamlined and allowed my team members work at their own pace throughout the course." John Smith Fire Chief, KCFD In person training Online course – get certified today $ No items found. Questions? Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Most courses require no prior medical experience. Each class is designed to guide you step-by-step, using clear instruction that supports both beginners and experienced professionals."
- **FAQ items** (1):
  - `questions[0].title`: "Do I need any experience before taking these courses?"
  - `questions[0].answer`: "Most courses require no prior medical experience. Each class is designed to guide you step-by-step, using clear instruction that supports both beginners and experienced professionals."
- **Links**:
  - [See all FAQs](faq.html)
- **Images** (2):
  - src: `images/placeholder-image.svg`
  - src: `images/placeholder-image.svg`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 3: `section_testimonial-small`
- **Webflow HTML line**: ~388
- **Webflow classes**: `section_testimonial-small`
- **Component file**: `testimonial-1.tsx`
- **Action**: update-content
- **Tagline(s)**:
  - "Trusted by Industry Professionals"
- **Headings**:
  - h3: ""The process was seamless and streamlined and allowed my team members work at their own pace throughout the course.""
  - h2: "Questions?"
- **Paragraphs**:
  - "In person training Online course – get certified today $ No items found. Questions? Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Most courses require no prior medical experience. Each class is designed to guide you step-by-step, using clear instruction that supports both beginners and experienced professionals."
  - "Course length varies, but all programs are designed to fit into a busy schedule. You’ll study at your own pace, follow straightforward lessons, and complete a final evaluation when you’re ready."
  - "Yes. MidwestEA courses follow nationally recognized guidelines and provide certifications that are widely accepted across healthcare, public safety, and workplace environments. Always check your employer’s specific requirements to be sure."
  - "Once you pass the final test, you’ll receive your certification and be ready to get back out there with renewed confidence. Many students complete their certificate and return for additional training later."
  - "Absolutely. Many students combine courses to strengthen their skills or meet workplace requirements. You can enroll in any additional classes at your own pace—each one builds your knowledge without repeating unnecessary material."
- **FAQ items** (5):
  - `questions[0].title`: "Do I need any experience before taking these courses?"
  - `questions[0].answer`: "Most courses require no prior medical experience. Each class is designed to guide you step-by-step, using clear instruction that supports both beginners and experienced professionals."
  - `questions[1].title`: "How long will it take to complete my course?"
  - `questions[1].answer`: "Course length varies, but all programs are designed to fit into a busy schedule. You’ll study at your own pace, follow straightforward lessons, and complete a final evaluation when you’re ready."
  - `questions[2].title`: "Will my certification be accepted by employers?"
  - `questions[2].answer`: "Yes. MidwestEA courses follow nationally recognized guidelines and provide certifications that are widely accepted across healthcare, public safety, and workplace environments. Always check your employer’s specific requirements to be sure."
  - `questions[3].title`: "What happens after I finish the course?"
  - `questions[3].answer`: "Once you pass the final test, you’ll receive your certification and be ready to get back out there with renewed confidence. Many students complete their certificate and return for additional training later."
  - `questions[4].title`: "Can I take more than one course?"
  - `questions[4].answer`: "Absolutely. Many students combine courses to strengthen their skills or meet workplace requirements. You can enroll in any additional classes at your own pace—each one builds your knowledge without repeating unnecessary material."
- **Links**:
  - [See all FAQs](faq.html)
- **Images** (1):
  - src: `images/placeholder-image.svg`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 4: `section_class-grid`
- **Webflow HTML line**: ~416
- **Webflow classes**: `section_class-grid`
- **Component file**: `product-1.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
- **Paragraphs**:
  - "In person training Online course – get certified today $ No items found. Questions? Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Most courses require no prior medical experience. Each class is designed to guide you step-by-step, using clear instruction that supports both beginners and experienced professionals."
  - "Course length varies, but all programs are designed to fit into a busy schedule. You’ll study at your own pace, follow straightforward lessons, and complete a final evaluation when you’re ready."
  - "Yes. MidwestEA courses follow nationally recognized guidelines and provide certifications that are widely accepted across healthcare, public safety, and workplace environments. Always check your employer’s specific requirements to be sure."
  - "Once you pass the final test, you’ll receive your certification and be ready to get back out there with renewed confidence. Many students complete their certificate and return for additional training later."
  - "Absolutely. Many students combine courses to strengthen their skills or meet workplace requirements. You can enroll in any additional classes at your own pace—each one builds your knowledge without repeating unnecessary material."
- **FAQ items** (5):
  - `questions[0].title`: "Do I need any experience before taking these courses?"
  - `questions[0].answer`: "Most courses require no prior medical experience. Each class is designed to guide you step-by-step, using clear instruction that supports both beginners and experienced professionals."
  - `questions[1].title`: "How long will it take to complete my course?"
  - `questions[1].answer`: "Course length varies, but all programs are designed to fit into a busy schedule. You’ll study at your own pace, follow straightforward lessons, and complete a final evaluation when you’re ready."
  - `questions[2].title`: "Will my certification be accepted by employers?"
  - `questions[2].answer`: "Yes. MidwestEA courses follow nationally recognized guidelines and provide certifications that are widely accepted across healthcare, public safety, and workplace environments. Always check your employer’s specific requirements to be sure."
  - `questions[3].title`: "What happens after I finish the course?"
  - `questions[3].answer`: "Once you pass the final test, you’ll receive your certification and be ready to get back out there with renewed confidence. Many students complete their certificate and return for additional training later."
  - `questions[4].title`: "Can I take more than one course?"
  - `questions[4].answer`: "Absolutely. Many students combine courses to strengthen their skills or meet workplace requirements. You can enroll in any additional classes at your own pace—each one builds your knowledge without repeating unnecessary material."
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
- **Images** (1):
  - src: `images/placeholder-image.svg`
- **CMS note**: Contains `w-dyn-bind-empty` or `w-dyn-list` — dynamic fields need a data source at implementation time.

### Section 5: `section_faq`
- **Webflow HTML line**: ~479
- **Webflow classes**: `section_faq`
- **Component file**: `faq-6.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Most courses require no prior medical experience. Each class is designed to guide you step-by-step, using clear instruction that supports both beginners and experienced professionals."
  - "Course length varies, but all programs are designed to fit into a busy schedule. You’ll study at your own pace, follow straightforward lessons, and complete a final evaluation when you’re ready."
  - "Yes. MidwestEA courses follow nationally recognized guidelines and provide certifications that are widely accepted across healthcare, public safety, and workplace environments. Always check your employer’s specific requirements to be sure."
  - "Once you pass the final test, you’ll receive your certification and be ready to get back out there with renewed confidence. Many students complete their certificate and return for additional training later."
  - "Absolutely. Many students combine courses to strengthen their skills or meet workplace requirements. You can enroll in any additional classes at your own pace—each one builds your knowledge without repeating unnecessary material."
- **FAQ items** (5):
  - `questions[0].title`: "Do I need any experience before taking these courses?"
  - `questions[0].answer`: "Most courses require no prior medical experience. Each class is designed to guide you step-by-step, using clear instruction that supports both beginners and experienced professionals."
  - `questions[1].title`: "How long will it take to complete my course?"
  - `questions[1].answer`: "Course length varies, but all programs are designed to fit into a busy schedule. You’ll study at your own pace, follow straightforward lessons, and complete a final evaluation when you’re ready."
  - `questions[2].title`: "Will my certification be accepted by employers?"
  - `questions[2].answer`: "Yes. MidwestEA courses follow nationally recognized guidelines and provide certifications that are widely accepted across healthcare, public safety, and workplace environments. Always check your employer’s specific requirements to be sure."
  - `questions[3].title`: "What happens after I finish the course?"
  - `questions[3].answer`: "Once you pass the final test, you’ll receive your certification and be ready to get back out there with renewed confidence. Many students complete their certificate and return for additional training later."
  - `questions[4].title`: "Can I take more than one course?"
  - `questions[4].answer`: "Absolutely. Many students combine courses to strengthen their skills or meet workplace requirements. You can enroll in any additional classes at your own pace—each one builds your knowledge without repeating unnecessary material."
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
| `images/courses-header.avif` | — | 1 |
| `images/placeholder-image.svg` | — | 1 |
| `images/MidwestEAlogo_MidwestEA_lockup_white.svg` | — | 5 |

## Interactions / JS
- None detected beyond `midwestea.webflow/js/midwestea.js`
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/courses/page.tsx` (or dynamic segment as noted)
- [ ] Add/update entry in `lib/site-config.ts` with section props
- [ ] Port assets to `public/`
- [ ] Verify against Webflow export in browser

## Dependencies / blockers
- Requires content props system in `PageRenderer` / `site-config.ts`
- CMS-bound fields (`w-dyn-bind-empty`) need data source
