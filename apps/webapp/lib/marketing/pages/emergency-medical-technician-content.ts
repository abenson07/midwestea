import type { PageSection } from "@/lib/marketing/site-config";

const registerHref = "#";

export const emergencyMedicalTechnicianSections: PageSection[] = [
  {
    type: "custom",
    label: "Hero",
    props: {
      titleLines: ["Emergency Medical", "Technician"],
      description:
        "Train to assess, stabilize, and care for patients during emergencies. Our state-approved EMT program blends online learning with in-person skills days so you can learn with confidence and at a pace that supports your schedule.",
      classStartLabel: "Next class starts",
      classStartDate: "lawrence, KS jun 6th / Raytownn , MO July 11th",
      priceNote:
        "This state-approved EMT program helps you earn your certification in just 14 weeks — all for $0",
      variant: "register",
      registerLabel: "Register now for just",
      registerHref,
      registerPrice: "0",
      video: {
        poster: "/videos/emt-hero-vid_poster.0000000.jpg",
        mp4: "/videos/emt-hero-vid_mp4.mp4",
        webm: "/videos/emt-hero-vid_webm.webm",
      },
    },
  },
  {
    type: "custom",
    label: "Enrollment Bar",
    props: {
      titleLines: ["Emergency Medical", "Technician"],
      variant: "register",
      classStartLabel: "Next class starts",
      classStartDate: "lawrence, KS jun 6th / Raytownn , MO July 11th",
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
      heading: "Be the first to provide care",
      description:
        "EMTs are the first clinical providers at the scene of an emergency. This course prepares you for that responsibility with the skills, judgment, and real-world practice you need to care for patients in their most critical moments. You'll learn from experienced instructors, work through hands-on scenarios, and complete clinical experience that helps you grow comfortable making decisions in the field.",
      cards: [
        { src: "/images/paramedic-1.avif", alt: "EMT training" },
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
          heading: "Build your foundation",
          description:
            "Develop the core abilities every EMT depends on. Learn how to perform complete patient assessments, gather vital signs, manage traumatic injuries, and respond to common medical problems with confidence and accuracy.",
          image: { src: "/images/clsas.avif", alt: "EMT foundational skills" },
          tags: ["Patient assessment", "Trauma care", "Medical emergencies"],
        },
        {
          heading: "Airway & breathing Management",
          description:
            "Learn how to recognize airway problems and support breathing using proven BLS-level skills. You'll practice airway positioning, suctioning, oxygen delivery, and effective bag-mask ventilation.",
          image: { src: "/images/airway.avif", alt: "Airway and breathing management" },
          tags: ["Airway management", "Oxygen therapy", "Bag-mask ventilation"],
        },
        {
          heading: "Cardiac & emergency response",
          description:
            "Master the principles of cardiac arrest care, shock management, and time-sensitive medical emergencies. Practice high-quality CPR, AED use, and the assessment strategies EMTs rely on during fast-moving calls.",
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
        "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You'll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you're starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed.",
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
            "Each program blends online learning with hands-on instruction. You'll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away.",
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
          title: "Do I need medical experience before starting EMT training?",
          answer:
            "No. This course is beginner-friendly, and our instructors teach each skill step by step.",
        },
        {
          title: "Is BLS required before the first EMT class?",
          answer:
            "Yes, but if you don't have BLS yet, we provide the certification during the program.",
        },
        {
          title: "How long is EMT certification valid?",
          answer:
            "EMT licenses are valid for five years, and NREMT certification is valid for two years.",
        },
        {
          title: "How long is the program?",
          answer: "Twelve weeks, with a mix of online and in-person sessions.",
        },
        {
          title: "Is this program state-approved?",
          answer: "Yes. Completing this course meets state requirements for EMT certification.",
        },
        {
          title: "What happens after I finish the program?",
          answer:
            "You'll take the NREMT exam, and once passed, you can apply for your state EMT license.",
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
