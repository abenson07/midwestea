import type { PageSection } from "@/lib/marketing/site-config";

const registerHref = "#";

export const advancedEmergencyMedicalTechnicianSections: PageSection[] = [
  {
    type: "custom",
    label: "Hero",
    props: {
      titleLines: ["Advanced Emergency", "Medical Technician"],
      description:
        "Build on your EMT foundation with advanced patient assessment, medication administration, and expanded scope skills. Our state-approved, shift-friendly AEMT program is primarily offered in person—with classes two days per week covering the same material so you can attend the day that best fits your schedule.",
      classStartLabel: "Next class starts",
      classStartDate: "August 19th, 2026",
      priceNote:
        "This state-approved AEMT program helps you earn your certification in six months — all for $0",
      variant: "register",
      registerLabel: "Register now for just",
      registerHref,
      registerPrice: "0",
      video: {
        poster: "/videos/aemt_hero_poster.jpg",
        mp4: "/videos/aemt_hero.mp4",
      },
    },
  },
  {
    type: "custom",
    label: "Enrollment Bar",
    props: {
      titleLines: ["Advanced Emergency", "Medical Technician"],
      variant: "register",
      classStartLabel: "Next class starts",
      classStartDate: "August 19th, 2026",
      priceNote: "Get certified today for just",
      price: "0",
      registerLabel: "Register",
      registerHref,
    },
  },
  {
    type: "component",
    component: "Layout 520",
    props: {
      heading: "Advance your EMS scope of practice",
      description:
        "AEMTs build on core EMT skills with expanded assessment, treatment, and medication capabilities. This shift-friendly program prepares you for greater clinical responsibility with hands-on scenarios, instructor-led skills labs, and field-ready practice.",
      cards: [
        { src: "/images/paramedic-1.avif", alt: "AEMT training" },
        { src: "/images/buddy-care-3.avif", alt: "Patient care training" },
        { src: "/images/oxygen.avif", alt: "Oxygen administration training" },
      ],
    },
  },
  {
    type: "component",
    component: "Layout 349",
    props: {
      contents: [
        {
          heading: "Expand your clinical foundation",
          description:
            "Deepen the assessment and treatment skills you built as an EMT. Learn advanced patient evaluation, expanded medical interventions, and the decision-making AEMTs rely on in the field.",
          image: { src: "/images/clsas.avif", alt: "AEMT clinical skills" },
          tags: ["Advanced assessment", "Expanded scope", "Medical emergencies"],
        },
        {
          heading: "Airway & breathing management",
          description:
            "Advance beyond BLS-level airway support with additional techniques and equipment. Practice airway positioning, suctioning, oxygen delivery, and ventilation strategies for complex patients.",
          image: { src: "/images/airway.avif", alt: "Airway and breathing management" },
          tags: ["Airway management", "Oxygen therapy", "Ventilation"],
        },
        {
          heading: "Cardiac & emergency response",
          description:
            "Strengthen cardiac arrest care, shock management, and time-sensitive emergency response. Build on CPR and AED skills with the advanced assessment strategies AEMTs use on critical calls.",
          image: { src: "/images/aed.avif", alt: "Cardiac emergency response" },
          tags: ["CPR and AED", "Cardiac emergencies", "Shock management"],
        },
      ],
    },
  },
  {
    type: "component",
    component: "Layout 493",
    props: {
      tagline: "Getting certified has never been easier",
      heading: "Get started today",
      description:
        "Our shift-friendly programs are designed to make advanced EMS training clear, supportive, and straightforward. You'll follow a structured path that blends expert-led, in-person instruction, real-world skill development, and the testing steps required for certification or licensure.",
      tabs: [
        {
          heading: "Apply & Get Prepared",
          description:
            "Submit your application and receive clear instructions on what comes next. Our team guides you through prerequisites, documentation, and anything you need to get started with confidence.",
          image: { src: "/images/student-studying.png", alt: "Apply and get prepared" },
        },
        {
          heading: "Learn From Expert Instructors",
          description:
            "Training is primarily delivered in person with experienced EMS educators who break down complex topics into clear, practical lessons. Online instruction may be used occasionally due to weather or other special circumstances.",
          image: { src: "/images/student.avif", alt: "Learn from expert instructors" },
        },
        {
          heading: "Build Skills Through Training & Evaluations",
          description:
            "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track.",
          image: { src: "/images/cpr3.avif", alt: "Skills training and evaluations" },
        },
        {
          heading: "Complete Testing & Earn Your Credentials",
          description:
            "After finishing your training, you'll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you'll receive your official credentials so you can move forward in your EMS career.",
          image: { src: "/images/emt-compressions.avif", alt: "Complete testing and earn credentials" },
        },
      ],
    },
  },
  {
    type: "component",
    component: "FAQ 6",
    props: {
      heading: "Questions?",
      description:
        "Visit our FAQ section for more information regarding programs, courses, certifications, and more.",
      button: {
        title: "See all FAQs",
        url: "/faq",
      },
      questions: [
        {
          title: "Do I need EMT certification before starting AEMT training?",
          answer:
            "Yes. You must hold a current EMT certification (state or NREMT) before enrolling in the AEMT program.",
        },
        {
          title: "How long is AEMT certification valid?",
          answer:
            "AEMT licenses follow state requirements; NREMT certification is typically valid for two years with continuing education.",
        },
        {
          title: "How long is the program?",
          answer: "Six months.",
        },
        {
          title: "Is the course offered in-person or online?",
          answer:
            "AEMT is primarily offered in person. Online instruction may be utilized occasionally due to weather conditions or other special circumstances, but the program is not designed as a fully online course.",
        },
        {
          title: "What does shift-friendly mean?",
          answer:
            "Classes are offered two days per week covering the same material. Students may attend the day that best fits their schedule each week.",
        },
        {
          title: "Is this program state-approved?",
          answer: "Yes. Completing this course meets state requirements for AEMT certification.",
        },
        {
          title: "What happens after I finish the program?",
          answer:
            "You'll complete NREMT testing and, once passed, can apply for your state AEMT license.",
        },
        {
          title: "Will I get clinical experience?",
          answer:
            "Yes. Students participate in clinical and field experiences as available through our EMS partners.",
        },
      ],
    },
  },
];
