export type CourseCard = {
  id: string;
  name: string;
  code: string;
  format: string;
  price: string;
  description: string;
};

/** Static — mirrors the Life Saving Courses listed on MidwestEA.com. */
export const sampleCourses: CourseCard[] = [
  {
    id: "bls",
    name: "Basic Life Support",
    code: "BLS",
    format: "Online",
    price: "$49.99",
    description: "Online certification course covering foundational life support skills.",
  },
  {
    id: "acls",
    name: "Advanced Cardiovascular Life Support",
    code: "ACLS",
    format: "Online",
    price: "$149.99",
    description: "Online certification course for advanced cardiovascular emergencies.",
  },
  {
    id: "cpr-first-aid",
    name: "CPR / First Aid",
    code: "CPR",
    format: "Online",
    price: "$34.99",
    description: "Online certification course in CPR and basic first aid response.",
  },
  {
    id: "pediatric-cpr",
    name: "Pediatric CPR & First Aid",
    code: "PEDS-CPR",
    format: "Online",
    price: "$34.99",
    description: "Online certification course focused on infant and child CPR and first aid.",
  },
  {
    id: "pals",
    name: "Pediatric Advanced Life Support",
    code: "PALS",
    format: "Online",
    price: "$34.99",
    description: "Online certification course for advanced pediatric emergency care.",
  },
  {
    id: "child-babysitting-safety",
    name: "Child & Babysitting Safety",
    code: "CBS",
    format: "Online",
    price: "$34.99",
    description: "Online certification course covering essential childcare safety skills.",
  },
  {
    id: "averb",
    name: "Active Violence Emergency Response Training",
    code: "AVERT",
    format: "Online",
    price: "$39.99",
    description: "Online certification course preparing responders for active violence incidents.",
  },
  {
    id: "bloodborne-pathogens",
    name: "Bloodborne Pathogens",
    code: "BBP",
    format: "Online",
    price: "$19.99",
    description: "Online certification course on bloodborne pathogen exposure and control.",
  },
  {
    id: "emergency-oxygen",
    name: "Emergency Use of Medical Oxygen",
    code: "O2",
    format: "Online",
    price: "$19.99",
    description: "Online certification course in emergency administration of medical oxygen.",
  },
  {
    id: "epinephrine",
    name: "Use and Administration of Epinephrine Auto-Injectors",
    code: "EPI",
    format: "Online",
    price: "$35.00",
    description: "Online certification course on recognizing and treating anaphylaxis with epinephrine.",
  },
];
