import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";
import { getTransactionListStatus } from "@/data/mocks/transaction-status";
import { calendarDaysUntil, formatCalendarMonthDay, todayIsoDate } from "@/lib/dates";

export type ClassTemplateRef = {
  kind: "Program" | "Course";
  name: string;
  /** Path relative to the admin base (`/admin` or `/admin-preview`). */
  href: string;
};

export const CLASS_FORMATS = [
  "In Person Only",
  "Hybrid",
  "Online + Skills Training",
  "In Person + Homework",
  "Online Only",
] as const;

export type ClassFormat = (typeof CLASS_FORMATS)[number];

export type ClassExternalLink = {
  id: string;
  name: string;
  url: string;
};

export type ClassDetail = {
  id: string;
  /** Human class ID, e.g. "PARA-001" — assigned from the parent template's code. */
  classCode: string;
  /** The parent program/course template's code, e.g. "PARA". */
  courseCode: string;
  title: string;
  publishStatus: "draft" | "published";
  classFormat: ClassFormat;
  location: string;
  /** YYYY-MM-DD */
  enrollmentStart: string;
  /** YYYY-MM-DD */
  enrollmentClose: string;
  /** YYYY-MM-DD */
  classStart: string;
  /** YYYY-MM-DD */
  classEnd: string;
  classLength: string;
  registrationLimit: string;
  certificationLength: string;
  /** Raw years behind `certificationLength`'s display string — prefills the certificate duration field. */
  certificationLengthYears?: number | null;
  price: string;
  registrationFee: string;
  chargeFullAmountAtRegistration?: boolean;
  prerequisites: string[];
  externalLinks?: ClassExternalLink[];
  /** The program or course template this class was created from. */
  template?: ClassTemplateRef;
};

/** "Online + Skills Training" / "Online Only" class types mark a class as online. */
export function isClassOnline(classFormat: ClassDetail["classFormat"]): boolean {
  return classFormat === "Online Only" || classFormat === "Online + Skills Training";
}

const CREATED_CLASSES: Record<string, ClassDetail> = {};
const CREATED_ACTIVITY: Record<string, ClassActivityItem[]> = {};

export function registerCreatedClass(detail: ClassDetail): void {
  CREATED_CLASSES[detail.id] = detail;
  CREATED_ACTIVITY[detail.id] = [
    {
      id: `act-${detail.id}-create`,
      kind: "create",
      text: "Created the class",
      date: formatCalendarMonthDay(todayIsoDate()),
    },
  ];
}

export function createdClassDetails(): ClassDetail[] {
  return Object.values(CREATED_CLASSES);
}

export function hasClassRecord(classId: string): boolean {
  return Boolean(CLASS_DETAILS[classId] || CREATED_CLASSES[classId]);
}

export type ClassRosterRow = {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Instructor";
  status: "Enrolled" | "Waitlisted";
  /** The underlying enrollments.id — required to generate a certificate for this row. */
  enrollmentId?: string;
  /** Set once a certificate has been generated for this roster row. */
  certificateHref?: string;
};

export type ClassRevenue = {
  tuition: string;
  registrationFee: string;
  total: string;
};

export type ClassPaymentLineStatus = "Paid" | "Open" | "Overdue";

export type ClassPaymentLine = {
  amount: string;
  status: ClassPaymentLineStatus;
  dueDate: string;
  paidDate?: string;
  daysPastDue?: number;
};

export type ClassStudentPayment = {
  studentId: string;
  registration: ClassPaymentLine;
  invoiceA: ClassPaymentLine;
  invoiceB: ClassPaymentLine;
};

export type PrerequisiteItemStatus =
  | "not_started"
  | "pending_review"
  | "approved"
  | "expired"
  | "needs_resubmission"
  | "optional"
  | "expires_before_class_starts";

export type RosterPrerequisiteStatus = "approved" | "needs-review" | "needs-reminder";

export type RosterPaymentStatus = "paid" | "partially-paid" | "past-due" | "pending" | "na";

export type ClassPrerequisiteItem = {
  id: string;
  studentId: string;
  student: string;
  type: string;
  status: PrerequisiteItemStatus;
  issuedOn?: string;
  expiresOn?: string;
  issuer?: string;
  /** Earlier submissions for this same (student, type) pair, most recent first. */
  previousSubmissions?: {
    status: PrerequisiteItemStatus;
    issuedOn?: string;
    expiresOn?: string;
    submittedOn: string;
    rejectionReason?: string;
  }[];
};

export type ClassPrerequisiteSubmission = {
  id: string;
  studentId: string;
  student: string;
  type: string;
  issuedOn: string;
  expiresOn?: string;
  issuer: string;
};

export type ClassPrerequisiteQueueRow = ClassPrerequisiteSubmission & {
  classId: string;
  className: string;
};

export type ClassFollowUpRow = {
  id: string;
  studentId: string;
  student: string;
  classId: string;
  className: string;
  /** Missing required documents for this student in this class. */
  types: string[];
  /** Calendar days until class start; null when the class has no start date. */
  daysUntilClass: number | null;
};

export type StudentRemovalReason = "Invoice not paid" | "Prerequisite not provided";

export type StudentToRemove = {
  id: string;
  name: string;
  email: string;
  classId: string;
  className: string;
  reason: StudentRemovalReason;
  paidAmount: string;
};

export type ClassActivityKind = "enroll" | "publish" | "create" | "prereq" | "update";

export type ClassActivityItem = {
  id: string;
  kind: ClassActivityKind;
  text: string;
  date: string;
};

const PARA_TEMPLATE: ClassTemplateRef = {
  kind: "Program",
  name: "Paramedic Program",
  href: "/programs/paramedic-program",
};
const EMT_TEMPLATE: ClassTemplateRef = {
  kind: "Program",
  name: "Emergency Medical Technician",
  href: "/programs/emt-basic",
};
const AEMT_TEMPLATE: ClassTemplateRef = {
  kind: "Program",
  name: "Advanced Emergency Medical Technician",
  href: "/programs/aemt",
};
const ATCC_TEMPLATE: ClassTemplateRef = {
  kind: "Program",
  name: "Advanced Tactical Casualty Care",
  href: "/programs/atcc",
};

function onlineCourse(
  partial: Pick<
    ClassDetail,
    "id" | "classCode" | "courseCode" | "title" | "registrationFee" | "registrationLimit" | "prerequisites" | "template"
  > & { classFormat?: ClassFormat; externalLinks?: ClassExternalLink[] },
): ClassDetail {
  return {
    publishStatus: "published",
    classFormat: "Online + Skills Training",
    location: "—",
    enrollmentStart: "",
    enrollmentClose: "",
    classStart: "",
    classEnd: "",
    classLength: "—",
    certificationLength: "1 year",
    price: "—",
    ...partial,
  };
}

export const CLASS_DETAILS: Record<string, ClassDetail> = {
  "open-class-a": {
    id: "open-class-a",
    classCode: "PARA-004",
    courseCode: "PARA",
    title: "PARA-004",
    publishStatus: "published",
    classFormat: "Hybrid",
    location: "Midwest EMS Training Center, Room 2",
    externalLinks: [
      { id: "jb", name: "JB Learning", url: "https://www.jblearning.com" },
      { id: "platinum", name: "Platinum ED", url: "https://www.platinumed.com" },
    ],
    enrollmentStart: "2026-07-15",
    enrollmentClose: "2026-08-18",
    classStart: "2026-09-08",
    classEnd: "2026-10-03",
    classLength: "1 year",
    registrationLimit: "25 seats",
    certificationLength: "2 years",
    price: "$8,800.00",
    registrationFee: "$150.00",
    prerequisites: ["High school graduation", "CPR Certificate"],
    template: PARA_TEMPLATE,
  },
  "open-class-b": {
    id: "open-class-b",
    classCode: "EMT-003",
    courseCode: "EMT",
    title: "EMT-003",
    publishStatus: "published",
    classFormat: "Hybrid",
    location: "Lawrence",
    externalLinks: [
      { id: "jb", name: "JB Learning", url: "https://www.jblearning.com" },
      { id: "platinum", name: "Platinum ED", url: "https://www.platinumed.com" },
    ],
    enrollmentStart: "2026-04-20",
    enrollmentClose: "2026-05-16",
    classStart: "2026-06-06",
    classEnd: "2026-09-12",
    classLength: "12 weeks",
    registrationLimit: "25 seats",
    certificationLength: "2 years",
    price: "$2,150.00",
    registrationFee: "$50.00",
    prerequisites: ["High school graduation", "CPR Certificate"],
    template: EMT_TEMPLATE,
  },
  "closed-class-a": {
    id: "closed-class-a",
    classCode: "PARA-001",
    courseCode: "PARA",
    title: "PARA-001",
    publishStatus: "published",
    classFormat: "Hybrid",
    location: "—",
    enrollmentStart: "2025-12-01",
    enrollmentClose: "2025-12-22",
    classStart: "2026-01-12",
    classEnd: "2026-06-20",
    classLength: "1 year",
    registrationLimit: "25 seats",
    certificationLength: "2 years",
    price: "$8,800.00",
    registrationFee: "$150.00",
    prerequisites: ["High school graduation", "CPR Certificate"],
    template: PARA_TEMPLATE,
  },
  "emt-001": {
    id: "emt-001",
    classCode: "EMT-001",
    courseCode: "EMT",
    title: "EMT-001",
    publishStatus: "published",
    classFormat: "Hybrid",
    location: "Raytown, MO",
    enrollmentStart: "2025-12-01",
    enrollmentClose: "2026-01-03",
    classStart: "2026-01-10",
    classEnd: "2026-04-04",
    classLength: "12 weeks",
    registrationLimit: "25 seats",
    certificationLength: "2 years",
    price: "$2,150.00",
    registrationFee: "$50.00",
    prerequisites: ["High school graduation", "CPR Certificate"],
    template: EMT_TEMPLATE,
  },
  "emt-002": {
    id: "emt-002",
    classCode: "EMT-002",
    courseCode: "EMT",
    title: "EMT-002",
    publishStatus: "published",
    classFormat: "Hybrid",
    location: "Raytown, MO",
    enrollmentStart: "2026-06-01",
    enrollmentClose: "2026-06-27",
    classStart: "2026-07-18",
    classEnd: "2026-10-10",
    classLength: "12 weeks",
    registrationLimit: "25 seats",
    certificationLength: "2 years",
    price: "$2,150.00",
    registrationFee: "$50.00",
    prerequisites: ["High school graduation", "CPR Certificate"],
    template: EMT_TEMPLATE,
  },
  "aemt-001": {
    id: "aemt-001",
    classCode: "AEMT-001",
    courseCode: "AEMT",
    title: "AEMT-001",
    publishStatus: "published",
    classFormat: "Hybrid",
    location: "Topeka, KS",
    enrollmentStart: "2026-07-15",
    enrollmentClose: "2026-07-29",
    classStart: "2026-08-19",
    classEnd: "2027-02-19",
    classLength: "12 weeks",
    registrationLimit: "25 seats",
    certificationLength: "2 years",
    price: "$5,600.00",
    registrationFee: "$100.00",
    prerequisites: ["Current EMT certification", "CPR Certificate"],
    template: AEMT_TEMPLATE,
  },
  "atcc-001": {
    id: "atcc-001",
    classCode: "ATCC-001",
    courseCode: "ATCC",
    title: "ATCC-001",
    publishStatus: "published",
    classFormat: "In Person Only",
    location: "—",
    enrollmentStart: "2026-09-01",
    enrollmentClose: "2026-09-14",
    classStart: "2026-10-05",
    classEnd: "2026-10-10",
    classLength: "3 days",
    registrationLimit: "25 seats",
    certificationLength: "—",
    price: "$1,650.00",
    registrationFee: "$100.00",
    prerequisites: [],
    template: ATCC_TEMPLATE,
  },
  "para-002": {
    id: "para-002",
    classCode: "PARA-002",
    courseCode: "PARA",
    title: "PARA-002",
    publishStatus: "published",
    classFormat: "Hybrid",
    location: "—",
    enrollmentStart: "2026-07-20",
    enrollmentClose: "2026-08-06",
    classStart: "2026-08-27",
    classEnd: "2027-08-27",
    classLength: "1 year",
    registrationLimit: "25 seats",
    certificationLength: "2 years",
    price: "$8,800.00",
    registrationFee: "$300.00",
    prerequisites: ["High school graduation", "CPR Certificate"],
    template: PARA_TEMPLATE,
  },
  "para-003": {
    id: "para-003",
    classCode: "PARA-003",
    courseCode: "PARA",
    title: "PARA-003",
    publishStatus: "published",
    classFormat: "Hybrid",
    location: "—",
    enrollmentStart: "2026-08-01",
    enrollmentClose: "2026-08-15",
    classStart: "2026-09-05",
    classEnd: "",
    classLength: "1 year",
    registrationLimit: "25 seats",
    certificationLength: "2 years",
    price: "$8,800.00",
    registrationFee: "$150.00",
    prerequisites: ["High school graduation", "CPR Certificate"],
    template: PARA_TEMPLATE,
  },
  bls: onlineCourse({
    id: "bls",
    classCode: "BLS-001",
    courseCode: "BLS",
    title: "Basic Life Support",
    registrationFee: "$49.99",
    registrationLimit: "—",
    prerequisites: [],
    template: { kind: "Course", name: "Basic Life Support", href: "/courses/cpr-bls-provider" },
  }),
  acls: onlineCourse({
    id: "acls",
    classCode: "ACLS-001",
    courseCode: "ACLS",
    title: "Advanced Cardiovascular Life Support (ACLS)",
    registrationFee: "$149.99",
    registrationLimit: "25 seats",
    prerequisites: ["Current BLS Certification"],
    externalLinks: [
      { id: "jb", name: "JB Learning", url: "https://www.jblearning.com" },
      { id: "platinum", name: "Platinum ED", url: "https://www.platinumed.com" },
    ],
    template: {
      kind: "Course",
      name: "Advanced Cardiovascular Life Support (ACLS)",
      href: "/courses/acls-provider",
    },
  }),
  oxy: onlineCourse({
    id: "oxy",
    classCode: "OXY-001",
    courseCode: "OXY",
    title: "Emergency Use of Medical Oxygen",
    registrationFee: "$19.99",
    registrationLimit: "—",
    prerequisites: [],
    classFormat: "Online Only",
    template: { kind: "Course", name: "Emergency Use of Medical Oxygen", href: "/courses/oxy" },
  }),
  avert: onlineCourse({
    id: "avert",
    classCode: "AVERT-001",
    courseCode: "AVERT",
    title: "Active Violence Emergency Response Training",
    registrationFee: "$39.99",
    registrationLimit: "—",
    prerequisites: [],
    template: {
      kind: "Course",
      name: "Active Violence Emergency Response Training",
      href: "/courses/avert",
    },
  }),
  cabs: onlineCourse({
    id: "cabs",
    classCode: "CABS-001",
    courseCode: "CABS",
    title: "Child & Babysitting Safety",
    registrationFee: "$34.99",
    registrationLimit: "—",
    prerequisites: [],
    classFormat: "Online Only",
    template: { kind: "Course", name: "Child & Babysitting Safety", href: "/courses/cabs" },
  }),
  cpr: onlineCourse({
    id: "cpr",
    classCode: "CPR-001",
    courseCode: "CPR",
    title: "CPR / First Aid",
    registrationFee: "$34.99",
    registrationLimit: "—",
    prerequisites: [],
    template: { kind: "Course", name: "CPR / First Aid", href: "/courses/cpr" },
  }),
  epi: onlineCourse({
    id: "epi",
    classCode: "EPI-001",
    courseCode: "EPI",
    title: "Use and Administration of Epinephrine Auto-Injectors",
    registrationFee: "$35.00",
    registrationLimit: "—",
    prerequisites: [],
    classFormat: "Online Only",
    template: {
      kind: "Course",
      name: "Use and Administration of Epinephrine Auto-Injectors",
      href: "/courses/epi",
    },
  }),
  ped: onlineCourse({
    id: "ped",
    classCode: "PALS-001",
    courseCode: "PALS",
    title: "Pediatric Advanced Life Support (PALS)",
    registrationFee: "$34.99",
    registrationLimit: "—",
    prerequisites: ["Current BLS Certification"],
    classFormat: "Online Only",
    template: {
      kind: "Course",
      name: "Pediatric Advanced Life Support (PALS)",
      href: "/courses/pals-provider",
    },
  }),
  path: onlineCourse({
    id: "path",
    classCode: "PATH-001",
    courseCode: "PATH",
    title: "Bloodborne Pathogens",
    registrationFee: "$19.99",
    registrationLimit: "—",
    prerequisites: [],
    classFormat: "Online Only",
    template: { kind: "Course", name: "Bloodborne Pathogens", href: "/courses/path" },
  }),
  peds: onlineCourse({
    id: "peds",
    classCode: "PEDS-001",
    courseCode: "PEDS",
    title: "Pediatric CPR & First Aid",
    registrationFee: "$34.99",
    registrationLimit: "—",
    prerequisites: [],
    classFormat: "Online Only",
    template: { kind: "Course", name: "Pediatric CPR & First Aid", href: "/courses/peds" },
  }),
};

const CERT = "/documents/spencer-nash-certificate.pdf";

export const CLASS_ROSTERS: Record<string, ClassRosterRow[]> = {
  "open-class-a": [
    { id: "para4-hannah", name: "Hannah Briggs", email: "hannah.briggs@example.com", role: "Student", status: "Enrolled" },
    { id: "para4-owen", name: "Owen Fraser", email: "owen.fraser@example.com", role: "Student", status: "Enrolled" },
    { id: "para4-malik", name: "Malik Reeves", email: "malik.reeves@example.com", role: "Student", status: "Enrolled" },
    { id: "para4-amber", name: "Amber Patel", email: "amber.patel@example.com", role: "Student", status: "Enrolled" },
    { id: "para4-elise", name: "Elise Navarro", email: "elise.navarro@example.com", role: "Student", status: "Enrolled" },
  ],
  "open-class-b": [
    { id: "emt3-caleb", name: "Caleb Ortiz", email: "caleb.ortiz@example.com", role: "Student", status: "Enrolled" },
    { id: "emt3-riley", name: "Riley Chen", email: "riley.chen@example.com", role: "Student", status: "Enrolled" },
    { id: "emt3-ines", name: "Ines Novak", email: "ines.novak@example.com", role: "Student", status: "Waitlisted" },
    { id: "emt3-tariq", name: "Tariq Osei", email: "tariq.osei@example.com", role: "Student", status: "Waitlisted" },
    { id: "emt3-sam", name: "Sam Reyes", email: "sam.reyes@example.com", role: "Student", status: "Waitlisted" },
  ],
  "closed-class-a": [
    { id: "para1-hannah", name: "Hannah Briggs", email: "hannah.briggs@example.com", role: "Student", status: "Enrolled", certificateHref: CERT },
    { id: "para1-owen", name: "Owen Fraser", email: "owen.fraser@example.com", role: "Student", status: "Enrolled", certificateHref: CERT },
  ],
  bls: [
    { id: "bls1-1", name: "Maya Ellison", email: "maya.ellison@example.com", role: "Student", status: "Enrolled" },
    { id: "bls1-2", name: "Priya Shah", email: "priya.shah@example.com", role: "Student", status: "Enrolled" },
    { id: "bls1-3", name: "Elise Navarro", email: "elise.navarro@example.com", role: "Student", status: "Enrolled" },
    { id: "bls1-4", name: "Nathan Brooks", email: "nathan.brooks@example.com", role: "Student", status: "Enrolled" },
    { id: "bls1-5", name: "Luis Mendoza", email: "luis.mendoza@example.com", role: "Student", status: "Enrolled" },
  ],
  acls: [
    { id: "acls1-1", name: "Hannah Briggs", email: "hannah.briggs@example.com", role: "Student", status: "Enrolled" },
    { id: "acls1-2", name: "Elise Navarro", email: "elise.navarro@example.com", role: "Student", status: "Enrolled" },
    { id: "acls1-3", name: "Sofia Alvarez", email: "sofia.alvarez@example.com", role: "Student", status: "Enrolled" },
    { id: "acls1-4", name: "Amber Patel", email: "amber.patel@example.com", role: "Student", status: "Enrolled" },
  ],
  oxy: [
    { id: "oxy-1", name: "Nathan Brooks", email: "nathan.brooks@example.com", role: "Student", status: "Enrolled" },
    { id: "oxy-2", name: "Riley Chen", email: "riley.chen@example.com", role: "Student", status: "Enrolled" },
  ],
  "emt-001": [
    { id: "emt1-1", name: "Chris Dalton", email: "chris.dalton@example.com", role: "Student", status: "Enrolled" },
    { id: "emt1-2", name: "Morgan Ellis", email: "morgan.ellis@example.com", role: "Student", status: "Enrolled" },
  ],
  "emt-002": [
    { id: "emt2-1", name: "Jordan Hale", email: "jordan.hale@example.com", role: "Student", status: "Enrolled" },
    { id: "emt2-2", name: "Priya Shah", email: "priya.shah@example.com", role: "Student", status: "Enrolled" },
    { id: "emt2-3", name: "Grace Whitaker", email: "grace.whitaker@example.com", role: "Student", status: "Enrolled" },
  ],
  "aemt-001": [
    { id: "aemt-1", name: "Drew Kim", email: "drew.kim@example.com", role: "Student", status: "Enrolled" },
    { id: "aemt-2", name: "Luis Mendoza", email: "luis.mendoza@example.com", role: "Student", status: "Enrolled" },
  ],
  "atcc-001": [
    { id: "atcc-1", name: "Sofia Alvarez", email: "sofia.alvarez@example.com", role: "Student", status: "Enrolled" },
  ],
  "para-002": [
    { id: "para2-malik", name: "Malik Reeves", email: "malik.reeves@example.com", role: "Student", status: "Enrolled" },
    { id: "para2-amber", name: "Amber Patel", email: "amber.patel@example.com", role: "Student", status: "Enrolled" },
  ],
  "para-003": [
    { id: "para3-elise", name: "Elise Navarro", email: "elise.navarro@example.com", role: "Student", status: "Enrolled" },
  ],
};

export function classDetailFor(classId: string): ClassDetail {
  return (
    CLASS_DETAILS[classId] ??
    CREATED_CLASSES[classId] ?? {
      id: classId,
      classCode: "—",
      courseCode: "—",
      title: "Class",
      publishStatus: "draft",
      classFormat: "In Person Only",
      location: "—",
      enrollmentStart: "",
      enrollmentClose: "",
      classStart: "",
      classEnd: "",
      classLength: "—",
      registrationLimit: "—",
      certificationLength: "—",
      price: "—",
      registrationFee: "—",
      chargeFullAmountAtRegistration: false,
      prerequisites: [],
    }
  );
}

/** Per-student required-item status. Approvals and follow-up are slices of this. */
export const CLASS_PREREQUISITE_ITEMS: Record<string, ClassPrerequisiteItem[]> = {
  "open-class-a": [
    {
      id: "prereq-a1",
      studentId: "para4-hannah",
      student: "Hannah Briggs",
      type: "CPR Certificate",
      status: "pending_review",
      issuedOn: "Mar 12, 2026",
      expiresOn: "Mar 12, 2028",
      issuer: "American Heart Association",
      previousSubmissions: [
        {
          status: "needs_resubmission",
          issuedOn: "Jan 4, 2026",
          expiresOn: "Jan 4, 2028",
          submittedOn: "Jan 6, 2026",
          rejectionReason: "Certificate photo was cropped — issue date not visible.",
        },
      ],
    },
    {
      id: "prereq-a1b",
      studentId: "para4-hannah",
      student: "Hannah Briggs",
      type: "High school graduation",
      status: "not_started",
    },
    {
      id: "prereq-a2",
      studentId: "para4-owen",
      student: "Owen Fraser",
      type: "High school graduation",
      status: "pending_review",
      issuedOn: "Jun 4, 2022",
      issuer: "Lincoln High School",
    },
    {
      id: "prereq-a2b",
      studentId: "para4-owen",
      student: "Owen Fraser",
      type: "CPR Certificate",
      status: "approved",
      issuedOn: "Feb 18, 2026",
      expiresOn: "Feb 18, 2028",
      issuer: "American Heart Association",
    },
    {
      id: "prereq-a3",
      studentId: "para4-malik",
      student: "Malik Reeves",
      type: "CPR Certificate",
      status: "pending_review",
      issuedOn: "Jan 28, 2026",
      issuer: "Red Cross",
    },
    {
      id: "prereq-a3b",
      studentId: "para4-malik",
      student: "Malik Reeves",
      type: "High school graduation",
      status: "not_started",
    },
    {
      id: "prereq-a4a",
      studentId: "para4-amber",
      student: "Amber Patel",
      type: "CPR Certificate",
      status: "not_started",
    },
    {
      id: "prereq-a4b",
      studentId: "para4-amber",
      student: "Amber Patel",
      type: "High school graduation",
      status: "not_started",
    },
    {
      id: "prereq-a5a",
      studentId: "para4-elise",
      student: "Elise Navarro",
      type: "CPR Certificate",
      status: "approved",
      issuedOn: "Apr 3, 2026",
      issuer: "American Heart Association",
    },
    {
      id: "prereq-a5b",
      studentId: "para4-elise",
      student: "Elise Navarro",
      type: "High school graduation",
      status: "approved",
      issuedOn: "May 20, 2021",
      issuer: "West High School",
    },
  ],
  "open-class-b": [
    {
      id: "prereq-b1",
      studentId: "emt3-caleb",
      student: "Caleb Ortiz",
      type: "CPR Certificate",
      status: "pending_review",
      issuedOn: "Nov 2, 2025",
      issuer: "American Heart Association",
    },
    {
      id: "prereq-b1b",
      studentId: "emt3-caleb",
      student: "Caleb Ortiz",
      type: "High school graduation",
      status: "approved",
      issuedOn: "Jun 1, 2023",
      issuer: "Lawrence High School",
    },
    {
      id: "prereq-b2a",
      studentId: "emt3-riley",
      student: "Riley Chen",
      type: "CPR Certificate",
      status: "not_started",
    },
    {
      id: "prereq-b2b",
      studentId: "emt3-riley",
      student: "Riley Chen",
      type: "High school graduation",
      status: "not_started",
    },
  ],
  acls: [
    {
      id: "prereq-acls-hannah",
      studentId: "acls1-1",
      student: "Hannah Briggs",
      type: "Current BLS Certification",
      status: "not_started",
    },
  ],
};

function toSubmission(item: ClassPrerequisiteItem): ClassPrerequisiteSubmission {
  return {
    id: item.id,
    studentId: item.studentId,
    student: item.student,
    type: item.type,
    issuedOn: item.issuedOn ?? "",
    expiresOn: item.expiresOn,
    issuer: item.issuer ?? "",
  };
}

export function classRosterFor(classId: string): ClassRosterRow[] {
  return CLASS_ROSTERS[classId] ?? [];
}

export const CLASS_REVENUE: Record<string, ClassRevenue> = {
  "closed-class-a": {
    tuition: "$17,600.00",
    registrationFee: "$300.00",
    total: "$17,900.00",
  },
  bls: {
    tuition: "$0.00",
    registrationFee: "$249.95",
    total: "$249.95",
  },
  acls: {
    tuition: "$0.00",
    registrationFee: "$599.96",
    total: "$599.96",
  },
  oxy: {
    tuition: "$0.00",
    registrationFee: "$39.98",
    total: "$39.98",
  },
};

export function classRevenueFor(classId: string): ClassRevenue | null {
  return CLASS_REVENUE[classId] ?? null;
}

export function classAllInvoicesFor(
  classId: string,
  rows: TransactionRow[] = sampleTransactions,
): TransactionRow[] {
  return rows.filter((row) => row.classId === classId);
}

/** Past-due transactions are a filter of the class list, not a separate dataset. */
export function classDueInvoicesFor(
  classId: string,
  rows: TransactionRow[] = sampleTransactions,
): TransactionRow[] {
  return classAllInvoicesFor(classId, rows).filter(
    (row) => getTransactionListStatus(row) === "past_due",
  );
}

export function classInvoicesForStudent(
  classId: string,
  studentName: string,
  rows: TransactionRow[] = sampleTransactions,
): TransactionRow[] {
  return classAllInvoicesFor(classId, rows).filter((row) => row.studentName === studentName);
}

export type EnrollmentInvoiceSummary =
  | "No invoices"
  | "Pending"
  | "Partially paid"
  | "All paid"
  | "Past due";

export function enrollmentInvoiceSummary(invoices: TransactionRow[]): EnrollmentInvoiceSummary {
  if (invoices.length === 0) return "No invoices";
  if (invoices.some((invoice) => getTransactionListStatus(invoice) === "past_due")) return "Past due";
  const settled = invoices.filter((invoice) => {
    const status = getTransactionListStatus(invoice);
    return status === "paid" || status === "refunded";
  });
  if (settled.length === invoices.length) return "All paid";
  if (settled.length > 0) return "Partially paid";
  return "Pending";
}

export function paidInvoiceTotal(invoices: TransactionRow[]): string {
  const total = invoices
    .filter((invoice) => invoice.transactionStatus === "paid")
    .reduce((sum, invoice) => sum + Math.round(invoice.amountDueCents * invoice.quantity), 0);
  return (total / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function classPrerequisiteItemsFor(classId: string): ClassPrerequisiteItem[] {
  return CLASS_PREREQUISITE_ITEMS[classId] ?? [];
}

export type StudentPrerequisiteRow = {
  type: string;
  status: PrerequisiteItemStatus;
  submissionId: string | null;
};

/** Required items for this student, with status even when they have not started. */
export function studentPrerequisiteRows(
  classId: string,
  studentId: string,
  required: string[] = CLASS_DETAILS[classId]?.prerequisites ?? [],
): StudentPrerequisiteRow[] {
  const items = classPrerequisiteItemsFor(classId).filter((item) => item.studentId === studentId);
  const types = required.length ? required : [...new Set(items.map((item) => item.type))];
  return types.map((type) => {
    const item = items.find((row) => row.type === type);
    return {
      type,
      status: item?.status ?? "not_started",
      submissionId: item?.status === "pending_review" ? item.id : null,
    };
  });
}

export function classPrerequisiteQueueFor(classId: string): ClassPrerequisiteSubmission[] {
  return classPrerequisiteItemsFor(classId)
    .filter((item) => item.status === "pending_review")
    .map(toSubmission);
}

export function allClassDueInvoices(rows: TransactionRow[] = sampleTransactions): TransactionRow[] {
  return Object.keys(CLASS_DETAILS).flatMap((classId) => classDueInvoicesFor(classId, rows));
}

export function allPrerequisiteQueue(): ClassPrerequisiteQueueRow[] {
  return Object.entries(CLASS_PREREQUISITE_ITEMS).flatMap(([classId, rows]) =>
    rows
      .filter((row) => row.status === "pending_review")
      .map((row) => ({
        ...toSubmission(row),
        classId,
        className: CLASS_DETAILS[classId]?.title ?? classId,
      })),
  );
}

export function classFollowUpFor(classId: string): ClassFollowUpRow[] {
  const detail = CLASS_DETAILS[classId];
  const required = detail?.prerequisites ?? [];
  if (!required.length) return [];
  const className = detail?.title ?? classId;
  const items = classPrerequisiteItemsFor(classId);
  const daysUntilClass = calendarDaysUntil(detail?.classStart ?? "");
  return classRosterFor(classId)
    .filter((row) => row.role === "Student" && row.status === "Enrolled")
    .flatMap((student) => {
      const types = required.filter((type) => {
        const item = items.find((row) => row.studentId === student.id && row.type === type);
        return !item || item.status === "not_started";
      });
      if (!types.length) return [];
      return [
        {
          id: `follow-${classId}-${student.id}`,
          studentId: student.id,
          student: student.name,
          classId,
          className,
          types,
          daysUntilClass,
        },
      ];
    });
}

export function allFollowUpQueue(): ClassFollowUpRow[] {
  return Object.keys(CLASS_PREREQUISITE_ITEMS).flatMap((classId) => classFollowUpFor(classId));
}

export function rosterPrerequisiteStatusFor(
  classId: string,
  studentId: string,
): RosterPrerequisiteStatus {
  const required = CLASS_DETAILS[classId]?.prerequisites ?? [];
  if (!required.length) return "approved";
  const items = classPrerequisiteItemsFor(classId).filter((item) => item.studentId === studentId);
  const statuses = required.map((type) => items.find((row) => row.type === type)?.status ?? "not_started");
  if (statuses.some((status) => status === "pending_review")) return "needs-review";
  if (statuses.some((status) => status === "not_started")) return "needs-reminder";
  return "approved";
}

export function rosterPaymentStatusFor(
  classId: string,
  student: ClassRosterRow,
  rows: TransactionRow[] = sampleTransactions,
): RosterPaymentStatus {
  const payment = classStudentPaymentFor(student.id);
  if (payment) {
    const lines = [payment.registration, payment.invoiceA, payment.invoiceB];
    if (lines.some((line) => line.status === "Overdue")) return "past-due";
    if (lines.every((line) => line.status === "Paid")) return "paid";
    if (lines.some((line) => line.status === "Paid")) return "partially-paid";
    return "pending";
  }

  const invoices = classAllInvoicesFor(classId, rows).filter(
    (invoice) => invoice.studentId === student.id || invoice.studentName === student.name,
  );
  const summary = enrollmentInvoiceSummary(invoices);
  switch (summary) {
    case "No invoices":
      return "na";
    case "Past due":
      return "past-due";
    case "All paid":
      return "paid";
    case "Partially paid":
      return "partially-paid";
    case "Pending":
      return "pending";
  }
}

export const STUDENTS_TO_REMOVE: StudentToRemove[] = [
  {
    id: "rm-1",
    name: "Hannah Briggs",
    email: "hannah.briggs@example.com",
    classId: "open-class-a",
    className: "PARA-004",
    reason: "Invoice not paid",
    paidAmount: "$150.00",
  },
  {
    id: "rm-2",
    name: "Owen Fraser",
    email: "owen.fraser@example.com",
    classId: "open-class-a",
    className: "PARA-004",
    reason: "Invoice not paid",
    paidAmount: "$150.00",
  },
  {
    id: "rm-3",
    name: "Malik Reeves",
    email: "malik.reeves@example.com",
    classId: "open-class-a",
    className: "PARA-004",
    reason: "Invoice not paid",
    paidAmount: "$150.00",
  },
  {
    id: "rm-4",
    name: "Amber Patel",
    email: "amber.patel@example.com",
    classId: "open-class-a",
    className: "PARA-004",
    reason: "Invoice not paid",
    paidAmount: "$0.00",
  },
  {
    id: "rm-5",
    name: "Tariq Osei",
    email: "tariq.osei@example.com",
    classId: "open-class-b",
    className: "EMT-003",
    reason: "Prerequisite not provided",
    paidAmount: "$0.00",
  },
];

export const CLASS_ACTIVITY: Record<string, ClassActivityItem[]> = {
  "open-class-a": [
    { id: "act-a1", kind: "enroll", text: "Hannah Briggs enrolled", date: "Aug 14" },
    { id: "act-a2", kind: "enroll", text: "Owen Fraser enrolled", date: "Aug 12" },
    { id: "act-a3", kind: "publish", text: "Dana Whitfield published the class", date: "Aug 10" },
    { id: "act-a4", kind: "update", text: "Updated tuition to $8,800", date: "Aug 9" },
    { id: "act-a5", kind: "create", text: "Dana Whitfield created the class", date: "Aug 1" },
  ],
  "open-class-b": [
    { id: "act-b1", kind: "enroll", text: "Caleb Ortiz enrolled", date: "Aug 15" },
    { id: "act-b2", kind: "enroll", text: "Riley Chen enrolled", date: "Aug 8" },
    { id: "act-b3", kind: "create", text: "Marcus Cole created the class", date: "May 1" },
  ],
  "closed-class-a": [
    { id: "act-c1", kind: "publish", text: "Class closed", date: "Jun 20" },
    { id: "act-c2", kind: "enroll", text: "Hannah Briggs enrolled", date: "Feb 4" },
    { id: "act-c3", kind: "create", text: "Dana Whitfield created the class", date: "Jan 6" },
  ],
  bls: [
    { id: "act-bls-1", kind: "enroll", text: "Maya Ellison enrolled", date: "Aug 12" },
    { id: "act-bls-2", kind: "publish", text: "Published the class", date: "Aug 4" },
    { id: "act-bls-3", kind: "create", text: "Created the class", date: "Aug 1" },
  ],
  acls: [
    { id: "act-acls-1", kind: "enroll", text: "Hannah Briggs enrolled", date: "Aug 14" },
    { id: "act-acls-2", kind: "publish", text: "Published the class", date: "Aug 6" },
    { id: "act-acls-3", kind: "create", text: "Created the class", date: "Aug 2" },
  ],
  oxy: [
    { id: "act-oxy-1", kind: "enroll", text: "Nathan Brooks enrolled", date: "Aug 11" },
    { id: "act-oxy-2", kind: "create", text: "Created the class", date: "Aug 3" },
  ],
};

export function classActivityFor(classId: string): ClassActivityItem[] {
  return CLASS_ACTIVITY[classId] ?? CREATED_ACTIVITY[classId] ?? [];
}

/** Registration + two tuition-half invoices (Invoice A / Invoice B) per student. */
export const CLASS_STUDENT_PAYMENTS: Record<string, ClassStudentPayment> = {
  "para4-hannah": {
    studentId: "para4-hannah",
    registration: { amount: "$150.00", status: "Paid", dueDate: "Aug 14, 2026", paidDate: "Aug 14, 2026" },
    invoiceA: { amount: "$4,400.00", status: "Overdue", dueDate: "Sep 1, 2026", daysPastDue: 5 },
    invoiceB: { amount: "$4,400.00", status: "Open", dueDate: "Sep 20, 2026" },
  },
  "para4-owen": {
    studentId: "para4-owen",
    registration: { amount: "$150.00", status: "Paid", dueDate: "Aug 12, 2026", paidDate: "Aug 12, 2026" },
    invoiceA: { amount: "$4,400.00", status: "Overdue", dueDate: "Sep 1, 2026", daysPastDue: 5 },
    invoiceB: { amount: "$4,400.00", status: "Open", dueDate: "Sep 20, 2026" },
  },
  "para4-malik": {
    studentId: "para4-malik",
    registration: { amount: "$150.00", status: "Paid", dueDate: "Aug 9, 2026", paidDate: "Aug 9, 2026" },
    invoiceA: { amount: "$4,400.00", status: "Overdue", dueDate: "Sep 8, 2026", daysPastDue: 3 },
    invoiceB: { amount: "$4,400.00", status: "Open", dueDate: "Sep 20, 2026" },
  },
  "para4-amber": {
    studentId: "para4-amber",
    registration: { amount: "$150.00", status: "Overdue", dueDate: "Aug 20, 2026", daysPastDue: 12 },
    invoiceA: { amount: "$4,400.00", status: "Open", dueDate: "Sep 8, 2026" },
    invoiceB: { amount: "$4,400.00", status: "Open", dueDate: "Sep 20, 2026" },
  },
  "para4-elise": {
    studentId: "para4-elise",
    registration: { amount: "$150.00", status: "Paid", dueDate: "Aug 6, 2026", paidDate: "Aug 6, 2026" },
    invoiceA: { amount: "$4,400.00", status: "Paid", dueDate: "Aug 15, 2026", paidDate: "Aug 15, 2026" },
    invoiceB: { amount: "$4,400.00", status: "Open", dueDate: "Sep 12, 2026" },
  },
  "emt3-caleb": {
    studentId: "emt3-caleb",
    registration: { amount: "$50.00", status: "Paid", dueDate: "Aug 15, 2026", paidDate: "Aug 15, 2026" },
    invoiceA: { amount: "$1,075.00", status: "Open", dueDate: "Oct 1, 2026" },
    invoiceB: { amount: "$1,075.00", status: "Open", dueDate: "Oct 25, 2026" },
  },
  "emt3-riley": {
    studentId: "emt3-riley",
    registration: { amount: "$50.00", status: "Open", dueDate: "Sep 15, 2026" },
    invoiceA: { amount: "$1,075.00", status: "Open", dueDate: "Oct 13, 2026" },
    invoiceB: { amount: "$1,075.00", status: "Open", dueDate: "Oct 25, 2026" },
  },
  "emt3-tariq": {
    studentId: "emt3-tariq",
    registration: { amount: "$50.00", status: "Open", dueDate: "Sep 15, 2026" },
    invoiceA: { amount: "$1,075.00", status: "Open", dueDate: "Oct 13, 2026" },
    invoiceB: { amount: "$1,075.00", status: "Open", dueDate: "Oct 25, 2026" },
  },
};

export function classStudentPaymentFor(studentId: string): ClassStudentPayment | null {
  return CLASS_STUDENT_PAYMENTS[studentId] ?? null;
}
