import type { PageSection } from "@/lib/marketing/site-config";

const registerHref = "#";

export const communityParamedicSections: PageSection[] = [
  {
    type: "custom",
    label: "Hero",
    props: {
      titleLines: ["Community Paramedic"],
      description:
        "Expand your Paramedic skills beyond emergency response. This focused program prepares you to deliver in-home care, support chronic conditions, and connect patients with the resources they need in their community.",
      classStartLabel: "Next class starts",
      classStartDate: "January",
      priceNote:
        "This short, two-week Community Paramedic program helps you build advanced care and coordination skills — all in a flexible, hybrid format.",
      variant: "waitlist",
      waitlistLabel: "Coming soon",
      registerHref,
      scrollHeight: "300vh",
      video: {
        poster: "/videos/cp-hero-video_poster.0000000.jpg",
        mp4: "/videos/cp-hero-video_mp4.mp4",
        webm: "/videos/cp-hero-video_webm.webm",
      },
    },
  },
  {
    type: "custom",
    label: "Enrollment Bar",
    props: {
      titleLines: ["Community Paramedic"],
      variant: "waitlist",
      classStartLabel: "Next class starts",
      classStartDate: "January",
      waitlistLabel: "Coming soon",
      registerHref,
    },
  },
  {
    type: "component",
    component: "Layout 520",
    props: {
      heading: "Step in before it becomes an emergency.",
      description:
        "Community Paramedics step into homes, not just emergency scenes. This course prepares you to support patients with chronic conditions, provide follow-up care, perform in-home assessments, and help people access the services they need before problems become emergencies.\n\nYou'll learn practical, patient-centered skills that make a direct impact on health, independence, and community well-being.",
      cards: [
        { src: "/images/cp1.avif", alt: "Community paramedic in-home care" },
        { src: "/images/cp-car.avif", alt: "Community paramedic mobile response" },
        { src: "/images/cp-unhoused.avif", alt: "Community paramedic outreach" },
      ],
    },
  },
  {
    type: "component",
    component: "Layout 349",
    props: {
      contents: [
        {
          heading: "In-home assessments",
          description:
            "Learn how to evaluate patients where they live, identify early warning signs, monitor chronic conditions, and guide patients toward safer, healthier routines.",
          tags: ["Home assessments", "Chronic monitoring", "Early intervention"],
          image: { src: "/images/cp4.avif", alt: "In-home assessments" },
        },
        {
          heading: "Care coordination skills",
          description:
            "Build the ability to work alongside physicians, nurses, social workers, and community agencies. Learn to connect patients with ongoing care, follow-up resources, and support systems that matter.",
          tags: ["Care coordination", "Community resources", "Patient navigation"],
          image: { src: "/images/cp5.avif", alt: "Care coordination skills" },
        },
        {
          heading: "Preventive and chronic care",
          description:
            "Strengthen your understanding of long-term conditions and how to stabilize them in the community. Learn strategies that reduce unnecessary 911 calls and prevent avoidable hospital visits.",
          tags: ["Chronic disease", "Medication support", "Preventive care"],
          image: { src: "/images/cp1.avif", alt: "Preventive and chronic care" },
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
        "The Community Paramedic program is designed for certified paramedics who want to expand their skills beyond emergency response and support patients through in-home care, chronic condition management, and community health outreach.",
      subHeadings: [
        {
          title: "Working paramedics",
          description:
            "For certified Paramedics ready to expand their scope and support patients beyond emergency calls.",
        },
        {
          title: "Rural responders",
          description:
            "Ideal for responders serving communities where access to regular healthcare is limited.",
        },
        {
          title: "Mobile integrated health teams",
          description:
            "Built for EMS systems adding MIH/CP services and needing trained providers.",
        },
        {
          title: "Hospital and clinic partners",
          description:
            "For Paramedics who coordinate with outpatient facilities, primary care, or transitional care teams.",
        },
        {
          title: "Public health and community programs",
          description:
            "A strong fit for agencies focused on chronic disease management, outreach, or wellness checks.",
        },
        {
          title: "Career-advancing clinicians",
          description:
            "For Paramedics seeking a focused, meaningful specialty that improves continuity of care.",
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
          image: { src: "/images/clsas.avif", alt: "Learn from expert instructors" },
        },
        {
          heading: "Build Skills Through Training & Evaluations",
          description:
            "Develop real-world readiness through skills labs, scenarios, and clinical or field experiences. Throughout the program, instructors support you, answer questions, and help you stay on track.",
          image: { src: "/images/cp-unhoused.avif", alt: "Build skills through training and evaluations" },
        },
        {
          heading: "Complete Testing & Earn Your Credentials",
          description:
            "After finishing your training, you'll complete the required written exams, skills evaluations, and your NREMT and state licensure steps. Once everything is approved, you'll receive your official credentials so you can move forward in your EMS career.",
          image: { src: "/images/cp1.avif", alt: "Complete testing and earn your credentials" },
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
          title: "Do I need to be a certified Paramedic to enroll?",
          answer: "Yes. A current Paramedic certification is required.",
        },
        {
          title: "How long is the program?",
          answer: "Two weeks, with two meetings per week in a hybrid format.",
        },
        {
          title: "Is this focused on emergency skills?",
          answer:
            "No — the emphasis is on chronic care, in-home assessments, and community health support.",
        },
        {
          title: "Will I learn chronic disease management?",
          answer:
            "Yes. Conditions such as diabetes, heart disease, and hypertension are core topics.",
        },
        {
          title: "Does this program include hands-on practice?",
          answer:
            "Yes. You'll complete scenario-based, patient-centered practice sessions.",
        },
        {
          title: "Who benefits from Community Paramedics?",
          answer:
            "Patients with chronic conditions, limited healthcare access, recent hospital discharges, and those needing regular monitoring.",
        },
      ],
    },
  },
];
