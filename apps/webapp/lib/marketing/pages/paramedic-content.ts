import { programTeamSection } from "@/lib/marketing/program-team-section";

export const paramedicSections = [
  {
    type: "custom" as const,
    label: "Hero",
    props: {
      titleLines: ["Paramedic"],
      description:
        "Take the next step in your EMS career with a state-approved Paramedic program designed for working EMTs. Learn advanced assessment, cardiology, pharmacology, airway management, and hands-on ALS care in a supportive, structured environment.",
      classStartLabel: "Next class starts",
      classStartDate: "January 11, 2026",
      priceNote:
        "This 12-month, state-approved Paramedic program helps you earn advanced certification on a shift-friendly schedule — all for $8,800.",
      variant: "register",
      registerLabel: "Register now for just",
      registerPrice: "8800",
      registerHref: "#",
      scrollHeight: "300vh",
      video: {
        poster: "/videos/paramedic-hero-vid_poster.jpg",
        mp4: "/videos/paramedic-hero-vid_mp4.mp4",
        webm: "/videos/paramedic-hero-vid_webm.webm",
      },
    },
  },
  {
    type: "custom" as const,
    label: "Enrollment Bar",
    props: {
      titleLines: ["Paramedic"],
      variant: "register",
      classStartLabel: "Next class starts",
      classStartDate: "January 11, 2026",
      priceNote: "Get certified today for just",
      price: "150",
      totalPrice: "8800",
      registerLabel: "Register",
      registerHref: "#",
    },
  },
  {
    type: "component" as const,
    component: "Layout 520" as const,
    props: {
      heading: "Answer the call",
      description: [
        "Paramedics are trusted with the highest level of pre-hospital medical care. In this program, you'll learn to manage complex emergencies, perform advanced procedures, and make critical decisions with confidence.",
        "Through a blend of classroom instruction, interactive simulations, hospital rotations, and field internships, you'll develop the clinical judgment and technical skills needed to care for patients when every moment matters.",
      ],
      cards: [
        { src: "/images/iv.avif", alt: "IV access training" },
        { src: "/images/emt-compressions.avif", alt: "Emergency medical care" },
        { src: "/images/medicine.avif", alt: "Paramedic pharmacology" },
      ],
    },
  },
  {
    type: "component" as const,
    component: "Layout 349" as const,
    props: {
      contents: [
        {
          heading: "Advanced patient assessment",
          description:
            "Develop the ability to evaluate critically ill and injured patients with accuracy and confidence. You'll study anatomy, physiology, pathophysiology, and advanced assessment techniques that support complex clinical decision-making in the field.",
          tags: ["Anatomy & physiology", "Pathophysiology", "Clinical decision-making"],
          image: { src: "/images/iv.avif", alt: "Advanced patient assessment" },
        },
        {
          heading: "Airway and critical care",
          description:
            "Learn advanced airway and ventilation management, including intubation, medication-assisted airway care, mechanical ventilation concepts, and essential ALS procedures. Build skill with IV/IO access and the medications paramedics administer during high-acuity calls.",
          tags: ["Advanced airway", "Mechanical ventilation", "IV/IO access & medications"],
          image: { src: "/images/airway.avif", alt: "Airway and critical care" },
        },
        {
          heading: "Cardiac and trauma care",
          description:
            "Gain expertise in ECG interpretation, arrhythmia recognition, cardiac pharmacology, and advanced resuscitation. Strengthen your ability to manage trauma, shock, and time-sensitive medical emergencies with paramedic-level proficiency.",
          tags: ["ECG interpretation", "Cardiac emergencies", "Trauma management"],
          image: { src: "/images/trauma-care.avif", alt: "Cardiac and trauma care" },
        },
      ],
    },
  },
  {
    type: "component" as const,
    component: "Layout 54" as const,
    props: {
      heading: "Who it's for",
      description:
        "The Paramedic program is designed for working EMTs who want to advance their scope of practice, take on higher-level clinical responsibilities, and provide advanced life support during complex medical and trauma emergencies.",
      subHeadings: [
        {
          title: "EMT professionals",
          description:
            "For working EMTs ready to advance their skills, responsibilities, and earning potential through Paramedic-level training.",
        },
        {
          title: "Fire service personnel",
          description:
            "Ideal for firefighters preparing to meet their department's ALS requirements or expand their operational medical role.",
        },
        {
          title: "Hospital and clinical staff",
          description:
            "A strong fit for healthcare workers looking to build advanced emergency care skills and gain broader patient care responsibilities.",
        },
        {
          title: "Military and veterans",
          description:
            "Well suited for those with field medical, combat lifesaver, or service backgrounds who want to transition into civilian pre-hospital medicine.",
        },
        {
          title: "Career-focused learners",
          description:
            "For students committed to a healthcare career pathway who want hands-on clinical experience and nationally recognized credentials.",
        },
        {
          title: "Community responders",
          description:
            "For responders who want to provide a higher level of care within their agencies, especially in rural or high-need communities.",
        },
      ],
    },
  },
  {
    type: "component" as const,
    component: "Paramedic Pricing" as const,
    props: {},
  },
  programTeamSection,
  {
    type: "component" as const,
    component: "Layout 493" as const,
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
          image: { src: "/images/online2.avif", alt: "Apply and get prepared" },
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
          image: { src: "/images/oxygen.webp", alt: "Build skills through training and evaluations" },
        },
        {
          heading: "Complete Testing & Earn Your Credentials",
          description:
            "After finishing your training, you'll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you'll receive your official credentials so you can move forward in your EMS career.",
          image: { src: "/images/oxygen.avif", alt: "Complete testing and earn your credentials" },
        },
      ],
    },
  },
  {
    type: "component" as const,
    component: "FAQ 6" as const,
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
          title: "Do I need to be an EMT to apply for the Paramedic program?",
          answer:
            "Yes. You must hold a current EMT certification (state or NREMT) before enrollment.",
        },
        {
          title: "How long is the Paramedic program?",
          answer:
            "Twelve months, with one class day per week based on your shift—either Monday or Tuesday.",
        },
        {
          title: "Is this program state-approved?",
          answer: "Yes.",
        },
        {
          title: "Will I earn college credit?",
          answer:
            "Yes you will earn 30 college credit hours at North Central Missouri College.",
        },
        {
          title: "What clinical experience will I get?",
          answer:
            "You'll complete hospital rotations and a field internship with experienced EMS preceptors.",
        },
        {
          title: "What certifications are included?",
          answer:
            "Students graduate with BLS, ACLS, PALS, PHTLS, and AMLS. Critical Care Paramedic (CCP) is optional.",
        },
        {
          title: "What are the admission requirements?",
          answer:
            "You'll need EMT certification, immunizations, a background check, a drug screen, and transcripts (HS/GED and college if applicable). You will also need to provide 2 references and a letter explaining why you want to be a paramedic.",
        },
        {
          title: "Placeholder for CoAEMSP Update",
          answer: "LOR-approved/ LSSR Pending",
        },
      ],
    },
  },
];
