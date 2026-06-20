import { programTeamSection } from "@/lib/program-team-section";

export const emergencyMedicalResponderSections = [
  {
    type: "custom" as const,
    label: "Hero" as const,
    props: {
      titleLines: ["Emergency Medical Responder"],
      description:
        "Learn the lifesaving skills trusted responders rely on when every second counts. The EMR course gives you hands-on training to recognize emergencies, take decisive action, and provide critical care until EMS arrives.",
      classStartLabel: "Next class starts",
      classStartDate: "November",
      priceNote:
        "This state-approved EMR program helps you earn your certification in under 14 weeks — all for $750.",
      variant: "waitlist",
      waitlistLabel: "Coming soon",
      registerHref: "https://buy.stripe.com/6oUeVdebBgZZcbP4Yi6Vq0w",
      scrollHeight: "300vh",
      video: {
        poster: "/videos/emr-hero-vid-2_poster.jpg",
        mp4: "/videos/emr-hero-vid-2_mp4.mp4",
        webm: "/videos/emr-hero-vid-2_webm.webm",
      },
    },
  },
  {
    type: "custom" as const,
    label: "Enrollment Bar" as const,
    props: {
      titleLines: ["Emergency Medical", "Responder"],
      variant: "waitlist",
      statusPrimary: "Coming soon",
      statusSecondary: "Price",
      statusNote: "Check back soon for class updates",
      waitlistLabel: "Coming soon",
      classStartLabel: "Next class starts",
      classStartDate: "November",
      priceNote: "Get certified today for just",
      registerHref: "https://buy.stripe.com/6oUeVdebBgZZcbP4Yi6Vq0w",
    },
  },
  {
    type: "component" as const,
    component: "Layout 520" as const,
    props: {
      heading: "be the first on the scene",
      description: [
        "As an Emergency Medical Responder, you’re often the first trained provider to reach a patient. This course gives you the essential skills to recognize emergencies, stabilize patients, and support higher-level providers when they arrive.",
        "Through hands-on practice and instructor-guided scenarios, you’ll learn how to assess a situation quickly, provide immediate care, and support patient survival in real emergencies.",
        "This is more than first aid. It’s the foundation of true first response.",
      ],
      cards: [
        { src: "/images/lifeguard.avif", alt: "" },
        { src: "/images/security.avif", alt: "" },
        { src: "/images/park-ranger.avif", alt: "" },
      ],
    },
  },
  {
    type: "component" as const,
    component: "Layout 349" as const,
    props: {
      contents: [
        {
          heading: "Master the essentials",
          description:
            "Build the core skills every responder relies on. Learn how to assess patients, secure scenes, and manage life-threatening bleeding with proven, hands-on techniques. These essentials form the backbone of effective emergency response—whether you’re on duty or helping in your community.",
          tags: ["Patient assessment", "Scene safety", "Bleeding control"],
          image: { src: "/images/clsas.avif", alt: "Master the essentials" },
        },
        {
          heading: "Airway Management",
          description:
            "Learn how to recognize and manage airway emergencies with confidence. From positioning and suctioning to bag-mask ventilation, you’ll gain practical skills that help protect a patient’s ability to breathe until advanced help arrives.",
          tags: [
            "Airway assessment & positioning",
            "Suction techniques",
            "Respiratory arrest response",
          ],
          image: { src: "/images/oxygen.webp", alt: "Airway Management" },
        },
        {
          heading: "Cardiac & respiratory",
          description:
            "Understand how to respond to cardiac arrest, breathing problems, and medical or traumatic emergencies. You’ll practice high-quality CPR, AED use, and real-world decision-making you can rely on in any environment.",
          tags: [
            "CPR for adults & infants",
            "AED usage",
            "Medical & trauma emergency care",
          ],
          image: { src: "/images/aed.avif", alt: "Cardiac and respiratory emergencies" },
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
        "The EMR course is designed for people who are not EMS providers but want advanced first responder skills for work, volunteer service, or community safety.",
      subHeadings: [
        {
          title: "Law enforcement & corrections",
          description:
            "For police, corrections, and security personnel who are often first on scene and need stronger medical response skills.",
        },
        {
          title: "Events & Community",
          description:
            "Ideal for event staff, crowd control teams, CERT members, and disaster response volunteers supporting community emergencies.",
        },
        {
          title: "Lifeguards & Park rangers",
          description:
            "For lifeguards, park rangers, and outdoor guides who may face injuries in remote or unpredictable environments.",
        },
        {
          title: "Workplace Safety",
          description:
            "Designed for workplace Emergency Response Teams and safety leads who need advanced first aid training.",
        },
        {
          title: "Sports & Fitness",
          description:
            "A strong fit for athletic trainers and others supporting active groups where injuries are common.",
        },
        {
          title: "Advanced First Aid Seekers",
          description:
            "For individuals who want more than basic first aid—people looking for confidence and readiness to act before EMS arrives.",
        },
      ],
    },
  },
  programTeamSection,
  {
    type: "component" as const,
    component: "Layout 493" as const,
    props: {
      tagline: "Getting certified has never been easier",
      heading: "Get started today",
      description:
        "Our programs are designed to make advanced EMS training clear, supportive, and straightforward. You’ll follow a structured path that blends expert-led instruction, real-world skill development, and the testing steps required for certification or licensure. Whether you’re starting your EMS journey or advancing to the next level, the process is simple to follow and built to help you succeed.",
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
            "Each program blends online learning with hands-on instruction. You’ll study with experienced EMS educators who break down complex topics into clear, practical lessons you can apply right away.",
          image: { src: "/images/student-studying.png", alt: "Learn from expert instructors" },
        },
        {
          heading: "Build Skills Through Training & Evaluations",
          description:
            "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track.",
          image: { src: "/images/cpr3.avif", alt: "Build skills through training and evaluations" },
        },
        {
          heading: "Complete Testing & Earn Your Credentials",
          description:
            "After finishing your training, you’ll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you’ll receive your official credentials so you can move forward in your EMS career.",
          image: { src: "/images/caregivers.avif", alt: "Complete testing and earn your credentials" },
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
          title: "Do I need previous medical experience to take EMR?",
          answer:
            "No. EMR is designed for beginners and non-medical professionals. Our instructors guide you step-by-step.",
        },
        {
          title: "Is BLS required before the course?",
          answer:
            "Yes, but you can earn your BLS certification with us during the EMR program.",
        },
        {
          title: "Does EMR qualify me to work on an ambulance?",
          answer:
            "No. EMR is not an EMT license. It provides advanced first responder skills but does not grant EMS credentials.",
        },
        {
          title: "How long is the EMR certification valid?",
          answer:
            "Two years. After that, you’ll complete a renewal course to stay certified.",
        },
        {
          title: "How long is the EMR course?",
          answer: "47–50 hours for initial certification and 16 hours for renewal.",
        },
        {
          title: "Is the course offered in-person or online?",
          answer: "EMR is taught in a traditional classroom format with hands-on practice.",
        },
      ],
    },
  },
];
