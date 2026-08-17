export type ClassTemplateRef = {
  kind: "Program" | "Course";
  name: string;
  /** Path relative to the admin base (`/admin` or `/admin-preview`). */
  href: string;
};

export type ClassDetail = {
  id: string;
  /** Human class ID, e.g. "PARA-001" — assigned from the parent template's code. */
  classCode: string;
  title: string;
  type: string;
  instructor: string;
  description: string;
  date: string;
  time: string;
  location: string;
  publishStatus: "draft" | "published";
  registrationFee: string;
  tuitionFee: string;
  classSize: string;
  classFormat: "Online" | "Hybrid" | "In-person";
  prerequisites: string[];
  /** The program or course template this class was created from. */
  template?: ClassTemplateRef;
};

export type ClassRosterRow = {
  id: string;
  name: string;
  email: string;
  role: "Student" | "Instructor";
  status: "Enrolled" | "Waitlisted";
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

export type ClassDueInvoice = {
  id: string;
  student: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
};

export type ClassPrerequisiteSubmission = {
  id: string;
  student: string;
  type: string;
  issuedOn: string;
  issuer: string;
};

export type ClassActivityKind = "enroll" | "publish" | "create" | "prereq" | "update";

export type ClassActivityItem = {
  id: string;
  kind: ClassActivityKind;
  text: string;
  date: string;
};

export const CLASS_DETAILS: Record<string, ClassDetail> = {
  "open-class-a": {
    id: "open-class-a",
    classCode: "PARA-001",
    title: "Open Class A",
    type: "BLS Certification",
    instructor: "Dana Whitfield",
    description:
      "Basic Life Support certification course — hands-on skills stations, written exam, and card issuance.",
    date: "Sep 8 – Oct 3, 2026",
    time: "6:00 PM – 9:00 PM",
    location: "Midwest EMS Training Center, Room 2",
    publishStatus: "published",
    registrationFee: "$25",
    tuitionFee: "$450",
    classSize: "18 / 24 seats",
    classFormat: "Hybrid",
    prerequisites: ["High school graduation", "CPR Certificate"],
    template: { kind: "Program", name: "Paramedic Program", href: "/programs/paramedic-program" },
  },
  "open-class-b": {
    id: "open-class-b",
    classCode: "PARA-001",
    title: "Open Class B",
    type: "ACLS Certification",
    instructor: "Marcus Cole",
    description:
      "Advanced Cardiac Life Support recertification — case-based scenarios and skills stations.",
    date: "Oct 13 – Nov 7, 2026",
    time: "6:00 PM – 9:00 PM",
    location: "Midwest EMS Training Center, Room 1",
    publishStatus: "draft",
    registrationFee: "$25",
    tuitionFee: "$600",
    classSize: "12 / 20 seats",
    classFormat: "Online",
    prerequisites: ["Current BLS Certification"],
    template: { kind: "Program", name: "Paramedic Program", href: "/programs/paramedic-program" },
  },
};

export const CLASS_ROSTERS: Record<string, ClassRosterRow[]> = {
  "open-class-a": [
    { id: "r1", name: "Priya Anand", email: "priya.anand@example.com", role: "Student", status: "Enrolled" },
    { id: "r2", name: "Lena Brandt", email: "lena.brandt@example.com", role: "Student", status: "Enrolled" },
    { id: "r3", name: "Owen Castillo", email: "owen.castillo@example.com", role: "Student", status: "Enrolled" },
    { id: "r4", name: "Dana Whitfield", email: "dana.whitfield@example.com", role: "Instructor", status: "Enrolled" },
    { id: "r5", name: "Sam Reyes", email: "sam.reyes@example.com", role: "Student", status: "Waitlisted" },
  ],
  "open-class-b": [
    { id: "r6", name: "Marcus Cole", email: "marcus.cole@example.com", role: "Instructor", status: "Enrolled" },
    { id: "r7", name: "Ines Novak", email: "ines.novak@example.com", role: "Student", status: "Enrolled" },
    { id: "r8", name: "Tariq Osei", email: "tariq.osei@example.com", role: "Student", status: "Waitlisted" },
  ],
};

export function classDetailFor(classId: string): ClassDetail {
  return (
    CLASS_DETAILS[classId] ?? {
      id: classId,
      title: "Class",
      type: "Class",
      instructor: "—",
      description: "",
      date: "—",
      time: "—",
      location: "—",
      publishStatus: "draft",
      registrationFee: "—",
      tuitionFee: "—",
      classSize: "—",
      classFormat: "In-person",
      prerequisites: [],
    }
  );
}

export const CLASS_DUE_INVOICES: Record<string, ClassDueInvoice[]> = {
  "open-class-a": [
    {
      id: "inv-a1",
      student: "Priya Anand",
      invoiceNumber: "INV-1042",
      amount: "$450.00",
      dueDate: "Sep 1, 2026",
    },
    {
      id: "inv-a2",
      student: "Lena Brandt",
      invoiceNumber: "INV-1043",
      amount: "$450.00",
      dueDate: "Sep 1, 2026",
    },
    {
      id: "inv-a3",
      student: "Owen Castillo",
      invoiceNumber: "INV-1044",
      amount: "$450.00",
      dueDate: "Sep 8, 2026",
    },
    {
      id: "inv-a4",
      student: "Sam Reyes",
      invoiceNumber: "INV-1048",
      amount: "$25.00",
      dueDate: "Aug 20, 2026",
    },
  ],
  "open-class-b": [
    {
      id: "inv-b1",
      student: "Ines Novak",
      invoiceNumber: "INV-1101",
      amount: "$600.00",
      dueDate: "Oct 1, 2026",
    },
    {
      id: "inv-b2",
      student: "Tariq Osei",
      invoiceNumber: "INV-1102",
      amount: "$25.00",
      dueDate: "Sep 15, 2026",
    },
  ],
};

export const CLASS_PREREQUISITE_QUEUE: Record<string, ClassPrerequisiteSubmission[]> = {
  "open-class-a": [
    {
      id: "prereq-a1",
      student: "Priya Anand",
      type: "CPR Certificate",
      issuedOn: "Mar 12, 2026",
      issuer: "American Heart Association",
    },
    {
      id: "prereq-a2",
      student: "Lena Brandt",
      type: "High school graduation",
      issuedOn: "Jun 4, 2022",
      issuer: "Lincoln High School",
    },
    {
      id: "prereq-a3",
      student: "Owen Castillo",
      type: "CPR Certificate",
      issuedOn: "Jan 28, 2026",
      issuer: "Red Cross",
    },
  ],
  "open-class-b": [
    {
      id: "prereq-b1",
      student: "Ines Novak",
      type: "Current BLS Certification",
      issuedOn: "Nov 2, 2025",
      issuer: "American Heart Association",
    },
  ],
};

export function classRosterFor(classId: string): ClassRosterRow[] {
  return CLASS_ROSTERS[classId] ?? [];
}

export function classDueInvoicesFor(classId: string): ClassDueInvoice[] {
  return CLASS_DUE_INVOICES[classId] ?? [];
}

export function classPrerequisiteQueueFor(classId: string): ClassPrerequisiteSubmission[] {
  return CLASS_PREREQUISITE_QUEUE[classId] ?? [];
}

export const CLASS_ACTIVITY: Record<string, ClassActivityItem[]> = {
  "open-class-a": [
    {
      id: "act-a1",
      kind: "enroll",
      text: "Priya Anand enrolled",
      date: "Aug 14",
    },
    {
      id: "act-a2",
      kind: "enroll",
      text: "Lena Brandt enrolled",
      date: "Aug 12",
    },
    {
      id: "act-a3",
      kind: "publish",
      text: "Dana Whitfield published the class",
      date: "Aug 10",
    },
    {
      id: "act-a4",
      kind: "prereq",
      text: "Owen Castillo submitted CPR Certificate",
      date: "Aug 9",
    },
    {
      id: "act-a5",
      kind: "create",
      text: "Dana Whitfield created the class",
      date: "Aug 1",
    },
  ],
  "open-class-b": [
    {
      id: "act-b1",
      kind: "enroll",
      text: "Ines Novak enrolled",
      date: "Aug 15",
    },
    {
      id: "act-b2",
      kind: "update",
      text: "Marcus Cole set type to Online",
      date: "Aug 8",
    },
    {
      id: "act-b3",
      kind: "create",
      text: "Marcus Cole created the class",
      date: "Aug 1",
    },
  ],
};

export function classActivityFor(classId: string): ClassActivityItem[] {
  return CLASS_ACTIVITY[classId] ?? [];
}

/** Registration + two tuition-half invoices (Invoice A / Invoice B) per student. */
export const CLASS_STUDENT_PAYMENTS: Record<string, ClassStudentPayment> = {
  r1: {
    studentId: "r1",
    registration: { amount: "$25.00", status: "Paid", dueDate: "Aug 14, 2026", paidDate: "Aug 14, 2026" },
    invoiceA: { amount: "$225.00", status: "Paid", dueDate: "Sep 8, 2026", paidDate: "Sep 2, 2026" },
    invoiceB: { amount: "$225.00", status: "Paid", dueDate: "Sep 20, 2026", paidDate: "Sep 18, 2026" },
  },
  r2: {
    studentId: "r2",
    registration: { amount: "$25.00", status: "Paid", dueDate: "Aug 12, 2026", paidDate: "Aug 12, 2026" },
    invoiceA: { amount: "$225.00", status: "Paid", dueDate: "Sep 8, 2026", paidDate: "Sep 6, 2026" },
    invoiceB: { amount: "$225.00", status: "Open", dueDate: "Sep 20, 2026" },
  },
  r3: {
    studentId: "r3",
    registration: { amount: "$25.00", status: "Paid", dueDate: "Aug 9, 2026", paidDate: "Aug 10, 2026" },
    invoiceA: { amount: "$225.00", status: "Overdue", dueDate: "Aug 1, 2026", daysPastDue: 15 },
    invoiceB: { amount: "$225.00", status: "Open", dueDate: "Sep 20, 2026" },
  },
  r5: {
    studentId: "r5",
    registration: { amount: "$25.00", status: "Open", dueDate: "Aug 20, 2026" },
    invoiceA: { amount: "$225.00", status: "Open", dueDate: "Sep 8, 2026" },
    invoiceB: { amount: "$225.00", status: "Open", dueDate: "Sep 20, 2026" },
  },
  r7: {
    studentId: "r7",
    registration: { amount: "$25.00", status: "Paid", dueDate: "Aug 15, 2026", paidDate: "Aug 15, 2026" },
    invoiceA: { amount: "$300.00", status: "Paid", dueDate: "Oct 13, 2026", paidDate: "Oct 10, 2026" },
    invoiceB: { amount: "$300.00", status: "Open", dueDate: "Oct 25, 2026" },
  },
  r8: {
    studentId: "r8",
    registration: { amount: "$25.00", status: "Open", dueDate: "Sep 15, 2026" },
    invoiceA: { amount: "$300.00", status: "Open", dueDate: "Oct 13, 2026" },
    invoiceB: { amount: "$300.00", status: "Open", dueDate: "Oct 25, 2026" },
  },
};

export function classStudentPaymentFor(studentId: string): ClassStudentPayment | null {
  return CLASS_STUDENT_PAYMENTS[studentId] ?? null;
}
