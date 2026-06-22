export type ProgramGalleryPanel = {
  title: string;
  description: string;
  classLabel: string;
  classDate: string;
  priceNote: string;
  href: string;
  image: string;
};

/** Static program catalog; prices and class links are enriched from Supabase at render time. */
export const programGalleryPanels: ProgramGalleryPanel[] = [
  {
    title: "Emergency Medical Responder",
    description:
      "Learn the lifesaving skills trusted responders rely on when every second counts. The EMR course gives you hands-on training to recognize emergencies, take decisive action, and provide critical care until EMS arrives.",
    classLabel: "Classes",
    classDate: "Coming soon",
    priceNote:
      "This state-approved EMR program helps you earn your certification in under 14 weeks — all for $0.",
    href: "/emergency-medical-responder",
    image: "/images/emr-hero.avif",
  },
  {
    title: "Emergency Medical Techinician",
    description:
      "Train to assess, stabilize, and care for patients during emergencies. Our state-approved EMT program blends online learning with in-person skills days so you can learn with confidence and at a pace that supports your schedule.",
    classLabel: "Next class starts",
    classDate: "January 17th",
    priceNote:
      "This state-approved EMT program helps you earn your certification in just 12 weeks — all for $0.",
    href: "/emergency-medical-technician",
    image: "/images/emt-hero.avif",
  },
  {
    title: "Advanced Emergency Medical Technician",
    description:
      "Build on your EMT foundation with advanced assessment, medication administration, and expanded scope skills. Our state-approved AEMT program blends online learning with in-person skills days.",
    classLabel: "Orientation",
    classDate: "August 19–20, 2026 · Topeka, Kansas",
    priceNote:
      "This state-approved AEMT program helps you earn your certification in just 12 weeks — all for $0.",
    href: "/advanced-emergency-medical-technician",
    image: "/images/emt-hero.avif",
  },
  {
    title: "paramedic",
    description:
      "Take the next step in your EMS career with a state-approved Paramedic program designed for working EMTs. Learn advanced assessment, cardiology, pharmacology, airway management, and hands-on ALS care in a supportive, structured environment.",
    classLabel: "Next class starts",
    classDate: "January 12/13",
    priceNote:
      "This 12-month, state-approved Paramedic program helps you earn advanced certification on a shift-friendly schedule — all for $0.",
    href: "/paramedic",
    image: "/images/paramedic-hero-vid.avif",
  },
  {
    title: "community paramedic",
    description:
      "Learn to deliver comprehensive healthcare services in community settings, focusing on preventive care and chronic disease management.",
    classLabel: "Classes",
    classDate: "Coming soon",
    priceNote:
      "Gain the skills you need to provide crucial, basic life support to sick and injured patients in emergency situations",
    href: "/community-paramedic",
    image: "/images/cp-hero.avif",
  },
  {
    title: "Critical care paramedic",
    description:
      "Learn to deliver comprehensive healthcare services in community settings, focusing on preventive care and chronic disease management.",
    classLabel: "classes",
    classDate: "coming soon",
    priceNote:
      "Gain the skills you need to provide crucial, basic life support to sick and injured patients in emergency situations",
    href: "/critical-care-transport",
    image: "/images/ccp.avif",
  },
  {
    title: "Advanced tactical casualty care",
    description:
      "Learn to deliver comprehensive healthcare services in community settings, focusing on preventive care and chronic disease management.",
    classLabel: "classes",
    classDate: "coming soon",
    priceNote:
      "Gain the skills you need to provide crucial, basic life support to sick and injured patients in emergency situations",
    href: "/advanced-tactical-casualty-care",
    image: "/images/atcc.avif",
  },
];
