# Paramedic program – Midwest Emergency Academy | Kansas City Emergency Certification Training

## Source & target
- **Webflow file**: `midwestea.webflow/paramedic.html`
- **Target route**: `/paramedic`
- **Reference template**: `/program-template`
- **Template gap notes**: Reference /program-template omits section_trainers (present in Webflow between Layout 54 and Layout 493).

## Page metadata (from `<head>`)
- **title**: Paramedic program – Midwest Emergency Academy | Kansas City Emergency Certification Training
- **description**: Advance your EMS career with MidwestEA’s state-approved Paramedic program. A 12-month, shift-friendly schedule with hands-on labs, hospital rotations, and field internships. Prepare with confidence for NREMT and real-world ALS care.
- **og:title**: Paramedic program – Midwest Emergency Academy | Kansas City Emergency Certification Training
- **og:description**: Advance your EMS career with MidwestEA’s state-approved Paramedic program. A 12-month, shift-friendly schedule with hands-on labs, hospital rotations, and field internships. Prepare with confidence for NREMT and real-world ALS care.
- **og:image**: https://cdn.prod.website-files.com/6906768723b00f56b0a6a28e/69224c61dd5644a79fc5fd57_paramedic-meta.png

## Global chrome (excluded from PageRenderer sections)
- **Navigation**: `navigation.navigation-component` → `components/navigation.tsx` (NEW)
- **Footer**: `footer.footer_component` → `components/footer.tsx` (NEW)
- **Promo banner**: `div.banner` inside navigation
- **Detected in this file at lines**: 830, 831, 1081

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
  - h4: "August 27/28"
  - h1: "Paramedic"
  - h4: "Next class starts"
  - h4: "August 27/28"
  - h2: "Answer the call"
  - h2: "Advanced patient assessment"
  - h2: "Airway and critical care"
  - h2: "Cardiac and trauma care"
- **Paragraphs**:
  - "Take the next step in your EMS career with a state-approved Paramedic program designed for working EMTs. Learn advanced assessment, cardiology, pharmacology, airway management, and hands-on ALS care in a supportive, structured environment. Paramedic Program Cost Breakdown: ItemCost ‍Textbooks & Learning Materials $950.95 Platinum Ed Testing$105.00 Platinum Ed Planner$95.00Paramedic Program Polo$50.00 Background Check & Clinical Student Access$130.00 Student ID Card$20.00 Tuition$7,449.05 ‍Total …"
  - "This 12-month, state-approved Paramedic program helps you earn advanced certification on a shift-friendly schedule — all for $8,800."
  - "Register now for just"
  - "Coming soon"
  - "Paramedics are trusted with the highest level of pre-hospital medical care. In this program, you’ll learn to manage complex emergencies, perform advanced procedures, and make critical decisions with confidence. Through a blend of classroom instruction, interactive simulations, hospital rotations, and field internships, you’ll develop the clinical judgment and technical skills needed to care for patients when every moment matters."
  - "Develop the ability to evaluate critically ill and injured patients with accuracy and confidence. You’ll study anatomy, physiology, pathophysiology, and advanced assessment techniques that support complex clinical decision-making in the field."
  - "Learn advanced airway and ventilation management, including intubation, medication-assisted airway care, mechanical ventilation concepts, and essential ALS procedures. Build skill with IV/IO access and the medications paramedics administer during high-acuity calls."
  - "Gain expertise in ECG interpretation, arrhythmia recognition, cardiac pharmacology, and advanced resuscitation. Strengthen your ability to manage trauma, shock, and time-sensitive medical emergencies with paramedic-level proficiency."
- **Links**:
  - [Register now for just $](https://buy.stripe.com/28E28r9VldNNa3HeyS6Vq0v)
- **Images** (9):
  - src: `images/iv.avif`
  - src: `images/emt-compressions.avif`
  - src: `images/medicine.avif`
  - src: `images/iv.avif`
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
  - src: `images/paramedic2.png`
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
  - h2: "Answer the call"
  - h2: "Advanced patient assessment"
  - h2: "Airway and critical care"
  - h2: "Cardiac and trauma care"
  - h2: "Who it's for"
  - h3: "EMT professionals"
  - h3: "Fire service personnel"
  - h3: "Hospital and clinical staff"
  - h3: "Military and veterans"
  - h3: "Career-focused learners"
  - h3: "Community responders"
  - h2: "Learn from real responders"
  - h2: "Get started today"
- **Paragraphs**:
  - "Paramedics are trusted with the highest level of pre-hospital medical care. In this program, you’ll learn to manage complex emergencies, perform advanced procedures, and make critical decisions with confidence. Through a blend of classroom instruction, interactive simulations, hospital rotations, and field internships, you’ll develop the clinical judgment and technical skills needed to care for patients when every moment matters."
  - "Develop the ability to evaluate critically ill and injured patients with accuracy and confidence. You’ll study anatomy, physiology, pathophysiology, and advanced assessment techniques that support complex clinical decision-making in the field."
  - "Learn advanced airway and ventilation management, including intubation, medication-assisted airway care, mechanical ventilation concepts, and essential ALS procedures. Build skill with IV/IO access and the medications paramedics administer during high-acuity calls."
  - "Gain expertise in ECG interpretation, arrhythmia recognition, cardiac pharmacology, and advanced resuscitation. Strengthen your ability to manage trauma, shock, and time-sensitive medical emergencies with paramedic-level proficiency."
  - "The Paramedic program is designed for working EMTs who want to advance their scope of practice, take on higher-level clinical responsibilities, and provide advanced life support during complex medical and trauma emergencies."
  - "For working EMTs ready to advance their skills, responsibilities, and earning potential through Paramedic-level training."
  - "Ideal for firefighters preparing to meet their department’s ALS requirements or expand their operational medical role."
  - "A strong fit for healthcare workers looking to build advanced emergency care skills and gain broader patient care responsibilities."
  - "Well suited for those with field medical, combat lifesaver, or service backgrounds who want to transition into civilian pre-hospital medicine."
  - "For students committed to a healthcare career pathway who want hands-on clinical experience and nationally recognized credentials."
  - _(+3 more paragraphs)_
- **Images** (10):
  - src: `images/iv.avif`
  - src: `images/emt-compressions.avif`
  - src: `images/medicine.avif`
  - src: `images/iv.avif`
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
  - src: `images/paramedic2.png`
  - src: `images/airway.avif`
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
  - h2: "Advanced patient assessment"
  - h2: "Airway and critical care"
  - h2: "Cardiac and trauma care"
  - h2: "Who it's for"
  - h3: "EMT professionals"
  - h3: "Fire service personnel"
  - h3: "Hospital and clinical staff"
  - h3: "Military and veterans"
  - h3: "Career-focused learners"
  - h3: "Community responders"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
- **Paragraphs**:
  - "Develop the ability to evaluate critically ill and injured patients with accuracy and confidence. You’ll study anatomy, physiology, pathophysiology, and advanced assessment techniques that support complex clinical decision-making in the field."
  - "Learn advanced airway and ventilation management, including intubation, medication-assisted airway care, mechanical ventilation concepts, and essential ALS procedures. Build skill with IV/IO access and the medications paramedics administer during high-acuity calls."
  - "Gain expertise in ECG interpretation, arrhythmia recognition, cardiac pharmacology, and advanced resuscitation. Strengthen your ability to manage trauma, shock, and time-sensitive medical emergencies with paramedic-level proficiency."
  - "The Paramedic program is designed for working EMTs who want to advance their scope of practice, take on higher-level clinical responsibilities, and provide advanced life support during complex medical and trauma emergencies."
  - "For working EMTs ready to advance their skills, responsibilities, and earning potential through Paramedic-level training."
  - "Ideal for firefighters preparing to meet their department’s ALS requirements or expand their operational medical role."
  - "A strong fit for healthcare workers looking to build advanced emergency care skills and gain broader patient care responsibilities."
  - "Well suited for those with field medical, combat lifesaver, or service backgrounds who want to transition into civilian pre-hospital medicine."
  - "For students committed to a healthcare career pathway who want hands-on clinical experience and nationally recognized credentials."
  - "For responders who want to provide a higher level of care within their agencies, especially in rural or high-need communities."
  - _(+5 more paragraphs)_
- **Tabs** (3):
  - `tabs[0].title`: "Apply & Get Prepared"
  - `tabs[0].description`: "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - `tabs[1].title`: "Learn From Expert Instructors"
  - `tabs[1].description`: "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - `tabs[2].title`: "Build Skills Through Training & Evaluations"
  - `tabs[2].description`: "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
- **Images** (7):
  - src: `images/iv.avif`
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
  - src: `images/paramedic2.png`
  - src: `images/airway.avif`
  - src: `images/trauma-care.avif`
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
  - h3: "EMT professionals"
  - h3: "Fire service personnel"
  - h3: "Hospital and clinical staff"
  - h3: "Military and veterans"
  - h3: "Career-focused learners"
  - h3: "Community responders"
  - h2: "Learn from real responders"
  - h2: "Get started today"
  - h3: "Apply & Get Prepared"
  - h3: "Learn From Expert Instructors"
  - h3: "Build Skills Through Training & Evaluations"
  - h3: "Complete Testing & Earn Your Credentials"
  - h2: "Questions?"
- **Paragraphs**:
  - "The Paramedic program is designed for working EMTs who want to advance their scope of practice, take on higher-level clinical responsibilities, and provide advanced life support during complex medical and trauma emergencies."
  - "For working EMTs ready to advance their skills, responsibilities, and earning potential through Paramedic-level training."
  - "Ideal for firefighters preparing to meet their department’s ALS requirements or expand their operational medical role."
  - "A strong fit for healthcare workers looking to build advanced emergency care skills and gain broader patient care responsibilities."
  - "Well suited for those with field medical, combat lifesaver, or service backgrounds who want to transition into civilian pre-hospital medicine."
  - "For students committed to a healthcare career pathway who want hands-on clinical experience and nationally recognized credentials."
  - "For responders who want to provide a higher level of care within their agencies, especially in rural or high-need communities."
  - "Kansas City’s top EMS professionals bring real experience and field-tested insight to every course."
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed."
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - _(+5 more paragraphs)_
- **FAQ items** (1):
  - `questions[0].title`: "Do I need to be an EMT to apply for the Paramedic program?"
  - `questions[0].answer`: "Yes. You must hold a current EMT certification (state or NREMT) before enrollment."
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
  - src: `images/student.avif`
  - src: `images/oxygen.webp`
  - src: `images/oxygen.avif`
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
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed."
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official credentials so you can move forward in your EMS career."
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Yes. You must hold a current EMT certification (state or NREMT) before enrollment."
  - "Twelve months, with one class day per week based on your shift—either Monday or Tuesday."
  - "Yes."
  - _(+1 more paragraphs)_
- **FAQ items** (4):
  - `questions[0].title`: "Do I need to be an EMT to apply for the Paramedic program?"
  - `questions[0].answer`: "Yes. You must hold a current EMT certification (state or NREMT) before enrollment."
  - `questions[1].title`: "How long is the Paramedic program?"
  - `questions[1].answer`: "Twelve months, with one class day per week based on your shift—either Monday or Tuesday."
  - `questions[2].title`: "Is this program state-approved?"
  - `questions[2].answer`: "Yes."
  - `questions[3].title`: "Will I earn college credit?"
  - `questions[3].answer`: "Yes you will earn 30 college credit hours to North Central Missouri College."
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
  - src: `images/student.avif`
  - src: `images/oxygen.webp`
  - src: `images/oxygen.avif`
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
  - "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed."
  - "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence."
  - "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away."
  - "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track."
  - "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official credentials so you can move forward in your EMS career."
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Yes. You must hold a current EMT certification (state or NREMT) before enrollment."
  - "Twelve months, with one class day per week based on your shift—either Monday or Tuesday."
  - "Yes."
  - "Yes you will earn 30 college credit hours to North Central Missouri College."
  - _(+3 more paragraphs)_
- **FAQ items** (7):
  - `questions[0].title`: "Do I need to be an EMT to apply for the Paramedic program?"
  - `questions[0].answer`: "Yes. You must hold a current EMT certification (state or NREMT) before enrollment."
  - `questions[1].title`: "How long is the Paramedic program?"
  - `questions[1].answer`: "Twelve months, with one class day per week based on your shift—either Monday or Tuesday."
  - `questions[2].title`: "Is this program state-approved?"
  - `questions[2].answer`: "Yes."
  - `questions[3].title`: "Will I earn college credit?"
  - `questions[3].answer`: "Yes you will earn 30 college credit hours to North Central Missouri College."
  - `questions[4].title`: "What clinical experience will I get?"
  - `questions[4].answer`: "You’ll complete hospital rotations and a field internship with experienced EMS preceptors."
  - `questions[5].title`: "What certifications are included?"
  - `questions[5].answer`: "Students graduate with BLS, ACLS, PALS, PHTLS, and AMLS. Critical Care Paramedic (CCP) is optional."
  - `questions[6].title`: "What are the admission requirements?"
  - `questions[6].answer`: "You’ll need EMT certification, immunizations, a background check, a drug screen, and transcripts (HS/GED and college if applicable). You will also need to provide 2 references and a letter explaining why you want to be a paramedic."
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
  - src: `images/student.avif`
  - src: `images/oxygen.webp`
  - src: `images/oxygen.avif`

### Section 7: `section_faqs`
- **Webflow HTML line**: ~675
- **Webflow classes**: `section_faqs`
- **Component file**: `faq-6.tsx`
- **Action**: update-content
- **Headings**:
  - h2: "Questions?"
- **Paragraphs**:
  - "Visit our FAQ section for more information regarding programs, courses, certifications, and more."
  - "Yes. You must hold a current EMT certification (state or NREMT) before enrollment."
  - "Twelve months, with one class day per week based on your shift—either Monday or Tuesday."
  - "Yes."
  - "Yes you will earn 30 college credit hours to North Central Missouri College."
  - "You’ll complete hospital rotations and a field internship with experienced EMS preceptors."
  - "Students graduate with BLS, ACLS, PALS, PHTLS, and AMLS. Critical Care Paramedic (CCP) is optional."
  - "You’ll need EMT certification, immunizations, a background check, a drug screen, and transcripts (HS/GED and college if applicable). You will also need to provide 2 references and a letter explaining why you want to be a paramedic."
  - "LOR-approved/ LSSR Pending"
- **FAQ items** (8):
  - `questions[0].title`: "Do I need to be an EMT to apply for the Paramedic program?"
  - `questions[0].answer`: "Yes. You must hold a current EMT certification (state or NREMT) before enrollment."
  - `questions[1].title`: "How long is the Paramedic program?"
  - `questions[1].answer`: "Twelve months, with one class day per week based on your shift—either Monday or Tuesday."
  - `questions[2].title`: "Is this program state-approved?"
  - `questions[2].answer`: "Yes."
  - `questions[3].title`: "Will I earn college credit?"
  - `questions[3].answer`: "Yes you will earn 30 college credit hours to North Central Missouri College."
  - `questions[4].title`: "What clinical experience will I get?"
  - `questions[4].answer`: "You’ll complete hospital rotations and a field internship with experienced EMS preceptors."
  - `questions[5].title`: "What certifications are included?"
  - `questions[5].answer`: "Students graduate with BLS, ACLS, PALS, PHTLS, and AMLS. Critical Care Paramedic (CCP) is optional."
  - `questions[6].title`: "What are the admission requirements?"
  - `questions[6].answer`: "You’ll need EMT certification, immunizations, a background check, a drug screen, and transcripts (HS/GED and college if applicable). You will also need to provide 2 references and a letter explaining why you want to be a paramedic."
  - `questions[7].title`: "Placeholder for CoAEMSP Update"
  - `questions[7].answer`: "LOR-approved/ LSSR Pending"
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

## Assets

| Webflow src | Alt | Section # |
|-------------|-----|-----------|
| `images/iv.avif` | — | 1 |
| `images/emt-compressions.avif` | — | 1 |
| `images/medicine.avif` | — | 1 |
| `images/airway.avif` | — | 1 |
| `images/trauma-care.avif` | — | 1 |
| `images/paramedic2.png` | — | 1 |
| `images/courses-header.avif` | — | 2 |
| `images/online2.avif` | — | 4 |
| `images/student.avif` | — | 4 |
| `images/oxygen.webp` | — | 4 |
| `images/oxygen.avif` | — | 4 |

## Interactions / JS
- GSAP
- ScrollTrigger
- GSAP Observer
- Stripe checkout links
- Inline hero-track scroll script
- Global site JS: `midwestea.webflow/js/midwestea.js`

## Implementation checklist
- [ ] Create route `app/paramedic/page.tsx` (or dynamic segment as noted)
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
