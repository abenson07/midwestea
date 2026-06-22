import type { PageSection } from "@/lib/marketing/site-config";
import { programTeamSection } from "@/lib/marketing/program-team-section";

const registerHref = "#";

export const criticalCareTransportSections: PageSection[] = [
  {
    type: "custom",
    label: "Hero",
    props: {
      titleLines: ["Critical Care Transport"],
      description:
        "Critical Care Transport gives experienced Paramedics, Nurses, and other medical professionals the advanced training needed to care for the sickest patients during ground or air transport. We guide you through every step with clear instruction, hands-on practice, and real-world preparation.",
      classStartLabel: "Coming soon",
      classStartDate: "",
      priceNote:
        "This Critical Care Transport program delivers classroom, simulation, and clinical training, all designed for paramedics, nurses, and medical professionals advancing into critical care transport. $0",
      variant: "waitlist",
      waitlistLabel: "Coming soon",
      registerHref,
      scrollHeight: "300vh",
      video: {
        poster: "/videos/cct-hero-video_poster.0000000.jpg",
        mp4: "/videos/cct-hero-video_mp4.mp4",
        webm: "/videos/cct-hero-video_webm.webm",
      },
    },
  },
  {
    type: "custom",
    label: "Enrollment Bar",
    props: {
      titleLines: ["Critical Care Transport"],
      variant: "waitlist",
    },
  },
  {
    type: "component",
    component: "Layout 520",
    props: {
      heading: "Advance your transport skills",
      description:
        "The Critical Care Transport program is an advanced course designed for clinicians responsible for managing high-acuity patients during interfacility or emergency transport. The curriculum builds on ALS foundations and prepares you for complex airway, cardiovascular, respiratory, neurological, trauma, neonatal, and pharmacological management.\n\nTraining blends classroom instruction, simulation, and clinical experiences to mirror the demands of real critical care transport environments, whether in an MICU, CCT ambulance, or rotor/fixed-wing aircraft.",
      cards: [
        { src: "/images/icu.avif", alt: "Critical care transport ICU training" },
        { src: "/images/helicoptor.avif", alt: "Air medical transport" },
        { src: "/images/fixed-wing.avif", alt: "Fixed-wing critical care transport" },
      ],
    },
  },
  {
    type: "component",
    component: "Layout 349",
    props: {
      contents: [
        {
          heading: "Advanced airway and ventilation",
          description:
            "Learn advanced airway procedures, medication-assisted interventions, and ventilator setup used during critical transports. Training focuses on managing complex respiratory cases and keeping patients stable throughout movement.",
          tags: ["Advanced airway", "Ventilator management", "Oxygenation strategies"],
          image: { src: "/images/airway.avif", alt: "Advanced airway and ventilation" },
        },
        {
          heading: "Critical care",
          description:
            "Strengthen your ability to care for cardiac, neurological, and multi-system emergencies with critical care–level interventions. You'll study hemodynamics, shock management, and the medications used to stabilize high-acuity patients.",
          tags: ["Cardiac management", "Neurological care", "Critical pharmacology"],
          image: { src: "/images/icu.avif", alt: "Critical care interventions" },
        },
        {
          heading: "Trauma and transport",
          description:
            "Develop the skills to manage severe trauma, control bleeding, and prepare patients for long or high-risk transports. Scenarios focus on packaging, reassessment, and maintaining stability in dynamic ground or air environments.",
          tags: ["Trauma stabilization", "Transport protocols", "High-risk assessment"],
          image: { src: "/images/trauma-care.avif", alt: "Trauma and transport care" },
        },
      ],
    },
  },
  {
    type: "component",
    component: "Layout 54",
    props: {
      heading: "Who it's for",
      description:
        "The Critical Care Transport program is designed for experienced professionals who want to manage high-acuity patients, perform advanced interventions, and work confidently in critical care or specialized transport settings.",
      subHeadings: [
        {
          title: "Experienced paramedics",
          description:
            "For Paramedics ready to expand their clinical scope and handle complex patient presentations.",
        },
        {
          title: "Flight and transport clinicians",
          description:
            "Ideal for those pursuing or working in air medical, MICU, or interfacility transport roles.",
        },
        {
          title: "Hospital-based EMS teams",
          description:
            "For Paramedics supporting emergency departments, ICUs, and rapid response teams.",
        },
        {
          title: "Special operations responders",
          description:
            "A strong fit for responders involved in rescue, tactical, or specialized medical operations.",
        },
        {
          title: "Career-advancing providers",
          description:
            "For Paramedics seeking advanced credentials that open doors to critical care, leadership, or specialized EMS roles.",
        },
        {
          title: "Rural and frontier providers",
          description:
            "Built for Paramedics who manage long transports and need advanced stabilization skills.",
        },
      ],
    },
  },
  programTeamSection,
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
          image: { src: "/images/online2.avif", alt: "Apply and get prepared" },
        },
        {
          heading: "Learn From Expert Instructors",
          description:
            "Each program blends online learning with hands-on instruction. You'll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away.",
          image: { src: "/images/clsas.avif", alt: "Learn from expert instructors" },
        },
        {
          heading: "Build Skills Through Training & Evaluations",
          description:
            "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track.",
          image: { src: "/images/kid-rythms.avif", alt: "Build skills through training and evaluations" },
        },
        {
          heading: "Complete Testing & Earn Your Credentials",
          description:
            "After finishing your training, you'll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you'll receive your official credentials so you can move forward in your EMS career.",
          image: { src: "/images/icu.avif", alt: "Complete testing and earn your credentials" },
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
          title: "Do I need to be a Paramedic to enroll?",
          answer:
            "No. Paramedics, nurses, respiratory therapists, and other licensed medical professionals can enroll.",
        },
        {
          title: "How long is the program?",
          answer: "Over 120 hours, depending on clinical and simulation availability.",
        },
        {
          title: "Is this course focused on transport?",
          answer: "Yes. It prepares you for high-acuity ground and air transport environments.",
        },
        {
          title: "Will I learn ventilator management?",
          answer: "Yes. Ventilator and advanced airway training are core components.",
        },
        {
          title: "Is this course hands-on?",
          answer:
            "Yes. You'll complete skills labs, simulations, and clinical or field rotations.",
        },
        {
          title: "Is this recognized for advancement?",
          answer:
            "Yes. Critical Care Transport (CCT) certification is widely recognized for transport, flight, and advanced EMS roles.",
        },
      ],
    },
  },
];
