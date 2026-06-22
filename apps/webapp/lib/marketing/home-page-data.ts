export type HeroSlide = {
  image: string;
};

export type ProgramItem = {
  titleLines: string[];
  href: string;
  image: string;
  mobileImage: string;
  relatedLink?: {
    label: string;
    href: string;
    isNew?: boolean;
  };
};

export type CourseSlide = {
  title: string;
  price: string;
  href: string;
  image: string;
};

export const homeHeroSlides: HeroSlide[] = [
  { image: "/images/cp-meta.png" },
  { image: "/images/atcc.avif" },
  { image: "/images/ccp.avif" },
  { image: "/images/paramedic.avif" },
];

export const homePrograms: ProgramItem[] = [
  {
    titleLines: ["Emergency", "Medical", "Responder"],
    href: "/emergency-medical-responder",
    image: "/images/emr.png",
    mobileImage: "/images/emr-hero.avif",
  },
  {
    titleLines: ["Emergency", "Medical", "Technician"],
    href: "/emergency-medical-technician",
    image: "/images/emt.png",
    mobileImage: "/images/emt.avif",
    relatedLink: {
      label: "AEMT course",
      href: "/advanced-emergency-medical-technician",
      isNew: true,
    },
  },
  {
    titleLines: ["paramedic"],
    href: "/paramedic",
    image: "/images/paramedic.png",
    mobileImage: "/images/paramedic-hero-vid.avif",
  },
  {
    titleLines: ["Community", "paramedic"],
    href: "/community-paramedic",
    image: "/images/community-paramedic.png",
    mobileImage: "/images/cp-hero.avif",
  },
  {
    titleLines: ["critical care", "Transport"],
    href: "/critical-care-transport",
    image: "/images/critical-care-paramedic.png",
    mobileImage: "/images/ccp.avif",
  },
  {
    titleLines: ["Advanced Tactical", "Casualty care"],
    href: "/advanced-tactical-casualty-care",
    image: "/images/adv-tactical-casualty-care.png",
    mobileImage: "/images/atcc.avif",
  },
];

export type WaysToLearnCard = {
  id: "online" | "inperson" | "career";
  label: string;
  tabLabel?: string;
  image: string;
  description: string;
};

export const waysToLearnCards: WaysToLearnCard[] = [
  {
    id: "online",
    label: "Online certification",
    image: "/images/online.avif",
    description:
      "Learn at your pace with flexible, instructor-backed courses. Trusted, state-approved training that gets you certified and ready to serve.",
  },
  {
    id: "inperson",
    label: "In person training",
    image: "/images/clsas.avif",
    description:
      "Train alongside experienced EMS professionals in real-world environments. Hands-on, state-approved instruction that builds confidence and keeps your skills field-ready.",
  },
  {
    id: "career",
    label: "Full career programs",
    tabLabel: "Career preparation",
    image: "/images/firefighter.avif",
    description:
      "Advance through comprehensive, state-approved EMS programs designed for real service. Graduate ready to lead, serve, and build a lasting career in emergency care.",
  },
];

export const homeCourseSlides: CourseSlide[] = [
  {
    title: "Basic Life Support",
    price: "$0",
    href: "/basic-life-support",
    image: "/images/bls.avif",
  },
  {
    title: "Advanced Cardiovascular life support",
    price: "$0",
    href: "/advanced-cardiovascular-life-support",
    image: "/images/acls.webp",
  },
  {
    title: "Active Violence emergency response",
    price: "$0",
    href: "/active-shooter-training",
    image: "/images/avert.jpg",
  },
  {
    title: "Pediatric Advanced Life Support",
    price: "$0",
    href: "/pediatric-advanced-life-support",
    image: "/images/pals2.avif",
  },
  {
    title: "CPR/First Aid",
    price: "$0",
    href: "/cpr-first-aid",
    image: "/images/cpr.avif",
  },
  {
    title: "Pediatric CPR",
    price: "$0",
    href: "/pediatric-first-aid-cpr-aed",
    image:
      "/images/pediatric_advanced_life_support.avif",
  },
  {
    title: "Child and babysitting Safety",
    price: "$0",
    href: "/child-and-babysitting-safety",
    image: "/images/safe-supervision.avif",
  },
  {
    title: "Administration of Epinephrine Auto-Injectors",
    price: "$0",
    href: "/use-and-administration-of-epinephrine-auto-injectors",
    image: "/images/epi.webp",
  },
  {
    title: "Emergency Use of Medical Oxygen",
    price: "$0",
    href: "/emergency-use-of-medical-oxygen",
    image: "/images/oxygen_1.avif",
  },
  {
    title: "Bloodborne Pathogens",
    price: "$0",
    href: "/bloodborne-pathogens",
    image: "/images/blood-borne2.jpg",
  },
];

export const homeFaqQuestions = [
  {
    title: "How does MidwestEA keep pricing fair?",
    answer:
      "We price every course to reflect the actual cost of expert instruction, curriculum development, and certification requirements—not inflated add-ons. Our goal is to make high-quality emergency training accessible, so you only pay for what directly supports your learning and certification.",
  },
  {
    title: "Who teaches the courses?",
    answer:
      "All courses are taught by certified, experienced instructors with real-world EMS, healthcare, or public safety backgrounds. Many actively work in the field, bringing current, practical knowledge into every lesson.",
  },
  {
    title: "Are the certifications legitimate?",
    answer:
      "Yes. MidwestEA uses nationally recognized curricula, follows the latest AHA/ILCOR guidelines, and provides state-approved certifications whenever applicable. All courses meet or exceed the standards required for professional use.",
  },
  {
    title: "How do you ensure training quality?",
    answer:
      "We follow structured, evidence-based curriculum, use updated materials, and maintain small student-to-instructor ratios for better learning. Every course includes clear learning objectives and evaluation standards so you know exactly what you're gaining.",
  },
  {
    title: "Why are some courses priced differently?",
    answer:
      "Course pricing depends on required materials, instructor qualifications, certification costs, and the depth of training involved. Shorter awareness-level courses cost less; advanced medical certifications require more instruction, evaluation, and resources.",
  },
  {
    title: "Do you offer the same level of quality for online courses?",
    answer:
      "Yes. Whether online or blended, every course follows the same learning standards and uses clear, easy-to-follow instruction developed by EMS educators. Practical components are included when required for certification.",
  },
  {
    title: "How often is your content updated?",
    answer:
      "All training is reviewed regularly and aligned with current guidelines, including AHA, ILCOR, and other national standards. When best practices change, our courses are updated to match.",
  },
];
