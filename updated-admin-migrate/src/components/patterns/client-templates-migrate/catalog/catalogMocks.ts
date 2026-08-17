import { parseCalendarDate } from "@/lib/dates";
import {
  CLASS_DETAILS,
  CLASS_FORMATS,
  createdClassDetails,
  hasClassRecord,
  isClassOnline,
  type ClassActivityItem,
  type ClassDetail,
  type ClassExternalLink,
  type ClassFormat,
} from "../classes/classMocks";

export type CatalogTemplateKind = "Program" | "Course";

/** Live admin class types used on program/course templates. */
export const CATALOG_CLASS_TYPES = CLASS_FORMATS;

export type CatalogClassType = ClassFormat;

export function isCatalogClassOnline(classType: CatalogClassType): boolean {
  return isClassOnline(classType);
}

export function classFormatFromCatalogType(classType: CatalogClassType): ClassFormat {
  return classType;
}

export type CatalogTemplate = {
  id: string;
  kind: CatalogTemplateKind;
  code: string;
  name: string;
  description: string;
  defaultClassFormat: CatalogClassType;
  defaultLocation: string;
  price: string;
  registrationFee: string;
  certificationLength: string;
  registrationLimit: string;
  classLength: string;
  prerequisites: string[];
  externalLinks?: ClassExternalLink[];
};

export const CATALOG_TEMPLATES: Record<string, CatalogTemplate> = {
  "emt-basic": {
    id: "emt-basic",
    kind: "Program",
    code: "EMT",
    name: "Emergency Medical Technician",
    description: "Entry-level emergency medical technician certification program.",
    defaultClassFormat: "Hybrid",
    defaultLocation: "Midwest EMS Training Center",
    price: "$2,150.00",
    registrationFee: "$50.00",
    certificationLength: "2 years",
    registrationLimit: "25 seats",
    classLength: "12 weeks",
    prerequisites: ["High school graduation", "CPR Certificate"],
    externalLinks: [
      { id: "jb", name: "JB Learning", url: "https://www.jblearning.com" },
      { id: "platinum", name: "Platinum ED", url: "https://www.platinumed.com" },
    ],
  },
  aemt: {
    id: "aemt",
    kind: "Program",
    code: "AEMT",
    name: "Advanced Emergency Medical Technician",
    description: "Advanced EMT bridge program for expanded scope of practice.",
    defaultClassFormat: "Hybrid",
    defaultLocation: "Midwest EMS Training Center",
    price: "$5,600.00",
    registrationFee: "$100.00",
    certificationLength: "2 years",
    registrationLimit: "25 seats",
    classLength: "12 weeks",
    prerequisites: ["Current EMT certification", "CPR Certificate"],
  },
  "paramedic-program": {
    id: "paramedic-program",
    kind: "Program",
    code: "PARA",
    name: "Paramedic Program",
    description: "Advanced prehospital care and ALS certification program.",
    defaultClassFormat: "Hybrid",
    defaultLocation: "Midwest EMS Training Center",
    price: "$8,800.00",
    registrationFee: "$150.00",
    certificationLength: "2 years",
    registrationLimit: "25 seats",
    classLength: "1 year",
    prerequisites: ["High school graduation", "CPR Certificate"],
    externalLinks: [
      { id: "jb", name: "JB Learning", url: "https://www.jblearning.com" },
      { id: "platinum", name: "Platinum ED", url: "https://www.platinumed.com" },
    ],
  },
  atcc: {
    id: "atcc",
    kind: "Program",
    code: "ATCC",
    name: "Advanced Tactical Casualty Care",
    description: "Prepares responders for emergency medical care in tactical and high-threat situations.",
    defaultClassFormat: "In Person Only",
    defaultLocation: "—",
    price: "$1,650.00",
    registrationFee: "$100.00",
    certificationLength: "—",
    registrationLimit: "25 seats",
    classLength: "3 days",
    prerequisites: [],
  },
  cct: {
    id: "cct",
    kind: "Program",
    code: "CCT",
    name: "Critical Care Transport",
    description: "Specialized healthcare services for critical care transport situations.",
    defaultClassFormat: "In Person + Homework",
    defaultLocation: "—",
    price: "$1,650.00",
    registrationFee: "$100.00",
    certificationLength: "—",
    registrationLimit: "25 seats",
    classLength: "3 weeks",
    prerequisites: [],
  },
  cp: {
    id: "cp",
    kind: "Program",
    code: "CP",
    name: "Community Paramedic",
    description:
      "Comprehensive healthcare delivery in community settings, with an emphasis on preventive care and chronic disease management.",
    defaultClassFormat: "Hybrid",
    defaultLocation: "—",
    price: "$1,000.00",
    registrationFee: "$50.00",
    certificationLength: "—",
    registrationLimit: "—",
    classLength: "2 weeks",
    prerequisites: [],
  },
  emr: {
    id: "emr",
    kind: "Program",
    code: "EMR",
    name: "Emergency Medical Responder",
    description: "Learn the lifesaving skills trusted responders rely on when every second counts.",
    defaultClassFormat: "Online + Skills Training",
    defaultLocation: "—",
    price: "$750.00",
    registrationFee: "$50.00",
    certificationLength: "—",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: [],
  },
  "cpr-bls-provider": {
    id: "cpr-bls-provider",
    kind: "Course",
    code: "BLS",
    name: "Basic Life Support",
    description: "Online certification course covering foundational life support skills.",
    defaultClassFormat: "Online + Skills Training",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$49.99",
    certificationLength: "1 year",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: [],
  },
  "acls-provider": {
    id: "acls-provider",
    kind: "Course",
    code: "ACLS",
    name: "Advanced Cardiovascular Life Support (ACLS)",
    description: "Online certification course for advanced cardiovascular emergencies.",
    defaultClassFormat: "Online + Skills Training",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$149.99",
    certificationLength: "1 year",
    registrationLimit: "25 seats",
    classLength: "—",
    prerequisites: ["Current BLS Certification"],
    externalLinks: [
      { id: "jb", name: "JB Learning", url: "https://www.jblearning.com" },
      { id: "platinum", name: "Platinum ED", url: "https://www.platinumed.com" },
    ],
  },
  "pals-provider": {
    id: "pals-provider",
    kind: "Course",
    code: "PALS",
    name: "Pediatric Advanced Life Support (PALS)",
    description: "Online certification course for advanced pediatric emergency care.",
    defaultClassFormat: "Online Only",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$34.99",
    certificationLength: "1 year",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: ["Current BLS Certification"],
  },
  avert: {
    id: "avert",
    kind: "Course",
    code: "AVERT",
    name: "Active Violence Emergency Response Training",
    description: "Online certification course preparing responders for active violence incidents.",
    defaultClassFormat: "Online + Skills Training",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$39.99",
    certificationLength: "1 year",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: [],
  },
  cabs: {
    id: "cabs",
    kind: "Course",
    code: "CABS",
    name: "Child & Babysitting Safety",
    description: "Online certification course covering essential childcare safety skills.",
    defaultClassFormat: "Online Only",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$34.99",
    certificationLength: "1 year",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: [],
  },
  cpr: {
    id: "cpr",
    kind: "Course",
    code: "CPR",
    name: "CPR / First Aid",
    description: "Online certification course in CPR and basic first aid response.",
    defaultClassFormat: "Online + Skills Training",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$34.99",
    certificationLength: "1 year",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: [],
  },
  epi: {
    id: "epi",
    kind: "Course",
    code: "EPI",
    name: "Use and Administration of Epinephrine Auto-Injectors",
    description: "Online certification course on recognizing and treating anaphylaxis with epinephrine.",
    defaultClassFormat: "Online Only",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$35.00",
    certificationLength: "1 year",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: [],
  },
  oxy: {
    id: "oxy",
    kind: "Course",
    code: "OXY",
    name: "Emergency Use of Medical Oxygen",
    description: "Online certification course in emergency administration of medical oxygen.",
    defaultClassFormat: "Online Only",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$19.99",
    certificationLength: "1 year",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: [],
  },
  path: {
    id: "path",
    kind: "Course",
    code: "PATH",
    name: "Bloodborne Pathogens",
    description: "Online certification course on bloodborne pathogen exposure and control.",
    defaultClassFormat: "Online Only",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$19.99",
    certificationLength: "1 year",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: [],
  },
  peds: {
    id: "peds",
    kind: "Course",
    code: "PEDS",
    name: "Pediatric CPR & First Aid",
    description: "Online certification course focused on infant and child CPR and first aid.",
    defaultClassFormat: "Online Only",
    defaultLocation: "—",
    price: "—",
    registrationFee: "$34.99",
    certificationLength: "1 year",
    registrationLimit: "—",
    classLength: "—",
    prerequisites: [],
  },
};

export function catalogTemplatesOfKind(kind: CatalogTemplateKind): CatalogTemplate[] {
  return Object.values(CATALOG_TEMPLATES)
    .filter((template) => template.kind === kind)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function catalogTemplateFor(templateId: string): CatalogTemplate {
  return (
    CATALOG_TEMPLATES[templateId] ?? {
      id: templateId,
      kind: "Program",
      code: "—",
      name: "Template",
      description: "",
      defaultClassFormat: "In Person Only",
      defaultLocation: "—",
      price: "—",
      registrationFee: "—",
      certificationLength: "—",
      registrationLimit: "—",
      classLength: "—",
      prerequisites: [],
      externalLinks: [],
    }
  );
}

export function catalogTemplateHref(template: CatalogTemplate): string {
  return template.kind === "Program" ? `/programs/${template.id}` : `/courses/${template.id}`;
}

export function catalogSettingsHref(template: CatalogTemplate): string {
  return template.kind === "Program"
    ? `/settings/programs/${template.id}`
    : `/settings/courses/${template.id}`;
}

export function catalogListHref(kind: CatalogTemplateKind): string {
  return kind === "Program" ? "/programs" : "/courses";
}

export function classesForTemplate(code: string): ClassDetail[] {
  return [...Object.values(CLASS_DETAILS), ...createdClassDetails()].filter(
    (row) => row.courseCode === code,
  );
}

export function splitClassesByStatus(classes: ClassDetail[]): {
  open: ClassDetail[];
  past: ClassDetail[];
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const open: ClassDetail[] = [];
  const past: ClassDetail[] = [];
  for (const row of classes) {
    const end = parseCalendarDate(row.classEnd);
    if (end && end < today) past.push(row);
    else open.push(row);
  }
  return { open, past };
}

export function nextClassCode(templateCode: string, existingCount: number): string {
  return `${templateCode}-${String(existingCount + 1).padStart(3, "0")}`;
}

const SHORT_CLASS_PATHS = new Set([
  "open-class-a",
  "open-class-b",
  "closed-class-a",
  "bls",
  "acls",
  "ped",
  "oxy",
]);

/** Path relative to the admin base. Short aliases stay; everything else uses `/class/:id`. */
export function classDetailHref(classId: string): string {
  return SHORT_CLASS_PATHS.has(classId) ? `/${classId}` : `/class/${classId}`;
}

export function classHasPreviewPage(classId: string): boolean {
  return SHORT_CLASS_PATHS.has(classId);
}

export function classHasDetailRoute(classId: string): boolean {
  return hasClassRecord(classId);
}

export function catalogKindForClass(row: ClassDetail): CatalogTemplateKind {
  if (row.template?.kind) return row.template.kind;
  const match = Object.values(CATALOG_TEMPLATES).find((template) => template.code === row.courseCode);
  return match?.kind ?? "Program";
}

export function allClassDetails(): ClassDetail[] {
  return [...Object.values(CLASS_DETAILS), ...createdClassDetails()];
}

export function catalogTemplateFromHref(href: string | undefined): CatalogTemplate | undefined {
  if (!href) return undefined;
  const id = href.split("/").filter(Boolean).pop();
  return id ? CATALOG_TEMPLATES[id] : undefined;
}

export function catalogTemplateByCode(code: string): CatalogTemplate | undefined {
  return Object.values(CATALOG_TEMPLATES).find((template) => template.code === code);
}

export const CATALOG_ACTIVITY: Record<string, ClassActivityItem[]> = {
  "paramedic-program": [
    {
      id: "cat-para-1",
      kind: "create",
      text: "Dana Whitfield created PARA-004",
      date: "Aug 1",
    },
    {
      id: "cat-para-2",
      kind: "publish",
      text: "Dana Whitfield published PARA-004",
      date: "Aug 10",
    },
    {
      id: "cat-para-3",
      kind: "update",
      text: "Updated tuition to $8,800",
      date: "Jul 22",
    },
  ],
  "emt-basic": [
    {
      id: "cat-emt-1",
      kind: "create",
      text: "Marcus Cole created EMT-003",
      date: "Aug 1",
    },
  ],
};

export function catalogActivityFor(templateId: string): ClassActivityItem[] {
  return CATALOG_ACTIVITY[templateId] ?? [];
}
