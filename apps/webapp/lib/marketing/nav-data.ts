export function webflowPathToRoute(path: string): string {
  return "/" + path.replace(/\.html$/, "");
}

export const programLinks = [
  { label: "Emergency Medical Response", href: "/emergency-medical-responder" },
  { label: "Paramedic", href: "/paramedic" },
  { label: "Critical Care Transport", href: "/critical-care-transport" },
  { label: "Emergency Medical Technician", href: "/emergency-medical-technician" },
  { label: "Advanced Emergency Medical Technician", href: "/advanced-emergency-medical-technician" },
  { label: "Community Paramedic", href: "/community-paramedic" },
  { label: "Advanced Tactical Casualty Care", href: "/advanced-tactical-casualty-care" },
] as const;

export const courseLinks = [
  { label: "Advanced Cardiovascular Life Support", href: "/advanced-cardiovascular-life-support" },
  { label: "Basic Life Support", href: "/basic-life-support" },
  { label: "CPR / First Aid", href: "/cpr-first-aid" },
  { label: "Child & Babysitting Safety", href: "/child-and-babysitting-safety" },
  { label: "Active Violence Emergency Response", href: "/active-shooter-training" },
  { label: "Pediatric CPR", href: "/pediatric-first-aid-cpr-aed" },
  { label: "Emergency Oxygen", href: "/emergency-use-of-medical-oxygen" },
  { label: "Pediatric Advanced Life Support", href: "/pediatric-advanced-life-support" },
  { label: "Bloodborne Pathogens", href: "/bloodborne-pathogens" },
  { label: "Epinephrine", href: "/use-and-administration-of-epinephrine-auto-injectors" },
] as const;

export const programLinkColumns = [programLinks.slice(0, 3), programLinks.slice(3)] as const;

export const courseLinkColumns = [
  courseLinks.slice(0, 4),
  courseLinks.slice(4, 7),
  courseLinks.slice(7, 10),
] as const;

export const courseLinkColumnsNarrow = [
  courseLinks.slice(0, 5),
  courseLinks.slice(5, 10),
] as const;

export const navTestimonial = {
  quote:
    "The hands-on scenarios made a huge difference — I left feeling confident I could actually respond in a real emergency. The instructors were knowledgeable, supportive, and kept the training engaging from start to finish.",
  attribution: "John Smith, Fire Chief",
};
