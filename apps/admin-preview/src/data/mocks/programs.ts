export type ProgramCard = {
  id: string;
  name: string;
  code: string;
  duration: string;
  tuition: string;
  description: string;
};

/** Static — mirrors the Career Programs listed on MidwestEA.com. */
export const samplePrograms: ProgramCard[] = [
  {
    id: "emr",
    name: "Emergency Medical Responder",
    code: "EMR",
    duration: "14 weeks",
    tuition: "$750",
    description:
      "Learn the lifesaving skills trusted responders rely on when every second counts.",
  },
  {
    id: "emt",
    name: "Emergency Medical Technician",
    code: "EMT",
    duration: "12 weeks",
    tuition: "$2,150",
    description:
      "Patient assessment and emergency stabilization through blended online and in-person instruction.",
  },
  {
    id: "aemt",
    name: "Advanced Emergency Medical Technician",
    code: "AEMT",
    duration: "12 weeks",
    tuition: "$5,600",
    description:
      "Expands on EMT skills with advanced assessment, medication administration, and expanded scope capabilities.",
  },
  {
    id: "paramedic",
    name: "Paramedic",
    code: "PARA",
    duration: "12 months",
    tuition: "$8,800",
    description:
      "For working EMTs — advanced assessment, cardiology, pharmacology, and airway management on a shift-friendly schedule.",
  },
  {
    id: "community-paramedic",
    name: "Community Paramedic",
    code: "CP",
    duration: "8 weeks",
    tuition: "$3,200",
    description:
      "Comprehensive healthcare delivery in community settings, with an emphasis on preventive care and chronic disease management.",
  },
  {
    id: "critical-care-paramedic",
    name: "Critical Care Paramedic",
    code: "CCP",
    duration: "10 weeks",
    tuition: "$4,400",
    description: "Specialized healthcare services for critical care transport situations.",
  },
  {
    id: "atcc",
    name: "Advanced Tactical Casualty Care",
    code: "ATCC",
    duration: "1 week",
    tuition: "$950",
    description:
      "Prepares responders for emergency medical care in tactical and high-threat situations.",
  },
];
