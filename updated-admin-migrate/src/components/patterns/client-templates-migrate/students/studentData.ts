import { parseCalendarDate } from "@/lib/dates";
import {
  CLASS_DETAILS,
  CLASS_PREREQUISITE_ITEMS,
  CLASS_ROSTERS,
  classAllInvoicesFor,
  classDetailFor,
  type ClassActivityItem,
  type ClassPrerequisiteSubmission,
} from "../classes/classMocks";
import { sampleTransactions, type TransactionRow } from "@/data/mocks/transactions";
import { getTransactionListStatus } from "@/data/mocks/transaction-status";
import type {
  EnrollmentPaymentStatus,
  StudentDocument,
  StudentEnrollment,
  StudentPaymentStatus,
  StudentRecord,
  StudentRow,
} from "./types";

const CERT = "/documents/spencer-nash-certificate.pdf";

function isEnrollmentClosed(classId: string): boolean {
  const end = parseCalendarDate(classDetailFor(classId).classEnd);
  if (!end) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return end < today;
}

export type StudentInvoice = TransactionRow & {
  classCode: string;
};

export function invoicesForStudent(studentId: string): StudentInvoice[] {
  return sampleTransactions
    .filter((row) => row.studentId === studentId)
    .map((row) => ({
      ...row,
      classCode: CLASS_DETAILS[row.classId]?.classCode ?? row.classCode,
    }));
}

export function pastDueInvoicesForStudent(studentId: string): StudentInvoice[] {
  return invoicesForStudent(studentId).filter((invoice) => getTransactionListStatus(invoice) === "past_due");
}

export const STUDENT_RECORDS: StudentRecord[] = [
  {
    id: "stu-1",
    name: "Maya Ellison",
    email: "maya.ellison@example.com",
    phone: "(555) 201-0144",
    tshirtSize: "M",
    emergencyContactName: "Dana Ellison",
    emergencyContactPhone: "(555) 201-0188",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_maya_ellison",
    joinedAt: "Mar 4, 2025",
  },
  {
    id: "stu-2",
    name: "Jordan Hale",
    email: "jordan.hale@example.com",
    phone: "(555) 312-4401",
    tshirtSize: "L",
    emergencyContactName: "Sam Hale",
    emergencyContactPhone: "(555) 312-4490",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_jordan_hale",
    joinedAt: "Jun 18, 2025",
  },
  {
    id: "stu-3",
    name: "Priya Shah",
    email: "priya.shah@example.com",
    phone: "(555) 418-2209",
    tshirtSize: "S",
    emergencyContactName: "Ravi Shah",
    emergencyContactPhone: "(555) 418-2210",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_priya_shah",
    joinedAt: "Jun 22, 2025",
  },
  {
    id: "stu-4",
    name: "Caleb Ortiz",
    email: "caleb.ortiz@example.com",
    phone: "(555) 604-1182",
    tshirtSize: "XL",
    emergencyContactName: "Elena Ortiz",
    emergencyContactPhone: "(555) 604-1100",
    hasRequiredInfo: false,
    stripeCustomerId: "cus_caleb_ortiz",
    joinedAt: "May 9, 2025",
  },
  {
    id: "stu-5",
    name: "Hannah Briggs",
    email: "hannah.briggs@example.com",
    phone: "(555) 771-9033",
    tshirtSize: "M",
    emergencyContactName: "Paul Briggs",
    emergencyContactPhone: "(555) 771-9001",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_hannah_briggs",
    joinedAt: "Jan 12, 2026",
  },
  {
    id: "stu-6",
    name: "Malik Reeves",
    email: "malik.reeves@example.com",
    phone: "(555) 890-4412",
    tshirtSize: "L",
    emergencyContactName: "Nora Reeves",
    emergencyContactPhone: "(555) 890-4400",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_malik_reeves",
    joinedAt: "Jul 30, 2026",
  },
  {
    id: "stu-7",
    name: "Elise Navarro",
    email: "elise.navarro@example.com",
    phone: "(555) 233-6718",
    tshirtSize: "S",
    emergencyContactName: "Mateo Navarro",
    emergencyContactPhone: "(555) 233-6701",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_elise_navarro",
    joinedAt: "Aug 4, 2026",
  },
  {
    id: "stu-8",
    name: "Drew Kim",
    email: "drew.kim@example.com",
    phone: "(555) 119-3340",
    tshirtSize: "M",
    emergencyContactName: "Jin Kim",
    emergencyContactPhone: "(555) 119-3302",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_drew_kim",
    joinedAt: "Jul 21, 2026",
  },
  {
    id: "stu-9",
    name: "Sofia Alvarez",
    email: "sofia.alvarez@example.com",
    phone: "(555) 662-1844",
    tshirtSize: "M",
    emergencyContactName: "Luis Alvarez",
    emergencyContactPhone: "(555) 662-1800",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_sofia_alvarez",
    joinedAt: "Apr 16, 2026",
  },
  {
    id: "stu-10",
    name: "Nathan Brooks",
    email: "nathan.brooks@example.com",
    phone: "(555) 447-2291",
    tshirtSize: "L",
    emergencyContactName: "Helen Brooks",
    emergencyContactPhone: "(555) 447-2200",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_nathan_brooks",
    joinedAt: "Feb 8, 2026",
  },
  {
    id: "stu-11",
    name: "Riley Chen",
    email: "riley.chen@example.com",
    phone: "(555) 508-9914",
    tshirtSize: "S",
    emergencyContactName: "Wei Chen",
    emergencyContactPhone: "(555) 508-9900",
    hasRequiredInfo: false,
    stripeCustomerId: "cus_riley_chen",
    joinedAt: "May 14, 2025",
  },
  {
    id: "stu-12",
    name: "Amber Patel",
    email: "amber.patel@example.com",
    phone: "(555) 276-0135",
    tshirtSize: "M",
    emergencyContactName: "Kiran Patel",
    emergencyContactPhone: "(555) 276-0101",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_amber_patel",
    joinedAt: "Aug 1, 2026",
  },
  {
    id: "stu-13",
    name: "Luis Mendoza",
    email: "luis.mendoza@example.com",
    phone: "(555) 934-5520",
    tshirtSize: "XL",
    emergencyContactName: "Carmen Mendoza",
    emergencyContactPhone: "(555) 934-5500",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_luis_mendoza",
    joinedAt: "Jul 19, 2026",
  },
  {
    id: "stu-14",
    name: "Grace Whitaker",
    email: "grace.whitaker@example.com",
    phone: "(555) 381-7742",
    tshirtSize: "S",
    emergencyContactName: "Tom Whitaker",
    emergencyContactPhone: "(555) 381-7700",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_grace_whitaker",
    joinedAt: "Jun 20, 2025",
  },
  {
    id: "stu-15",
    name: "Owen Fraser",
    email: "owen.fraser@example.com",
    phone: "(555) 145-8826",
    tshirtSize: "L",
    emergencyContactName: "Claire Fraser",
    emergencyContactPhone: "(555) 145-8800",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_owen_fraser",
    joinedAt: "Jan 12, 2026",
  },
  {
    id: "stu-16",
    name: "Avery Lang",
    email: "avery.lang@example.com",
    phone: "(555) 720-3318",
    tshirtSize: "M",
    emergencyContactName: "Pat Lang",
    emergencyContactPhone: "(555) 720-3300",
    hasRequiredInfo: false,
    stripeCustomerId: "cus_avery_lang",
    joinedAt: "Sep 3, 2024",
  },
  {
    id: "stu-17",
    name: "Chris Dalton",
    email: "chris.dalton@example.com",
    phone: "(555) 613-2294",
    tshirtSize: "L",
    emergencyContactName: "Rita Dalton",
    emergencyContactPhone: "(555) 613-2200",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_chris_dalton",
    joinedAt: "Nov 11, 2023",
  },
  {
    id: "stu-18",
    name: "Morgan Ellis",
    email: "morgan.ellis@example.com",
    phone: "(555) 402-1187",
    tshirtSize: "M",
    emergencyContactName: "Jamie Ellis",
    emergencyContactPhone: "(555) 402-1100",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_morgan_ellis",
    joinedAt: "Jan 28, 2024",
  },
  {
    id: "stu-19",
    name: "Tariq Osei",
    email: "tariq.osei@example.com",
    phone: "(555) 733-0192",
    tshirtSize: "L",
    emergencyContactName: "Amina Osei",
    emergencyContactPhone: "(555) 733-0100",
    hasRequiredInfo: true,
    stripeCustomerId: "cus_tariq_osei",
    joinedAt: "Aug 4, 2026",
  },
];

const BY_ID = new Map(STUDENT_RECORDS.map((row) => [row.id, row]));
const BY_EMAIL = new Map(STUDENT_RECORDS.map((row) => [row.email.toLowerCase(), row]));

export const STUDENT_ENROLLMENTS: StudentEnrollment[] = [
  { studentId: "stu-1", classId: "bls", enrolledAt: "Mar 4, 2025", status: "registered" },
  { studentId: "stu-2", classId: "emt-002", enrolledAt: "Jun 18, 2025", status: "registered" },
  { studentId: "stu-3", classId: "emt-002", enrolledAt: "Jun 22, 2025", status: "registered" },
  { studentId: "stu-3", classId: "bls", enrolledAt: "Jul 2, 2025", status: "registered" },
  { studentId: "stu-4", classId: "open-class-b", enrolledAt: "May 9, 2025", status: "registered" },
  { studentId: "stu-5", classId: "closed-class-a", enrolledAt: "Jan 12, 2026", status: "registered", outcome: "Graduated" },
  { studentId: "stu-5", classId: "emt-001", enrolledAt: "Jan 10, 2026", status: "registered", outcome: "Failed" },
  { studentId: "stu-5", classId: "acls", enrolledAt: "Aug 14, 2026", status: "registered" },
  { studentId: "stu-5", classId: "open-class-a", enrolledAt: "Aug 14, 2026", status: "registered" },
  { studentId: "stu-6", classId: "para-002", enrolledAt: "Jul 30, 2026", status: "registered" },
  { studentId: "stu-6", classId: "open-class-a", enrolledAt: "Aug 9, 2026", status: "registered" },
  { studentId: "stu-7", classId: "para-003", enrolledAt: "Aug 4, 2026", status: "registered" },
  { studentId: "stu-7", classId: "acls", enrolledAt: "Aug 8, 2026", status: "registered" },
  { studentId: "stu-7", classId: "bls", enrolledAt: "Aug 10, 2026", status: "registered" },
  { studentId: "stu-7", classId: "open-class-a", enrolledAt: "Aug 11, 2026", status: "registered" },
  { studentId: "stu-8", classId: "aemt-001", enrolledAt: "Jul 21, 2026", status: "registered" },
  { studentId: "stu-9", classId: "atcc-001", enrolledAt: "Apr 16, 2026", status: "registered" },
  { studentId: "stu-9", classId: "acls", enrolledAt: "Aug 12, 2026", status: "registered" },
  { studentId: "stu-10", classId: "oxy", enrolledAt: "Feb 8, 2026", status: "registered" },
  { studentId: "stu-10", classId: "bls", enrolledAt: "Feb 10, 2026", status: "registered" },
  { studentId: "stu-11", classId: "open-class-b", enrolledAt: "May 14, 2025", status: "registered" },
  { studentId: "stu-11", classId: "oxy", enrolledAt: "Aug 8, 2026", status: "registered" },
  { studentId: "stu-12", classId: "para-002", enrolledAt: "Aug 1, 2026", status: "registered" },
  { studentId: "stu-12", classId: "acls", enrolledAt: "Aug 6, 2026", status: "registered" },
  { studentId: "stu-12", classId: "open-class-a", enrolledAt: "Aug 20, 2026", status: "registered" },
  { studentId: "stu-13", classId: "aemt-001", enrolledAt: "Jul 19, 2026", status: "registered" },
  { studentId: "stu-13", classId: "bls", enrolledAt: "Jul 22, 2026", status: "registered" },
  { studentId: "stu-14", classId: "emt-002", enrolledAt: "Jun 20, 2025", status: "registered" },
  { studentId: "stu-15", classId: "closed-class-a", enrolledAt: "Jan 12, 2026", status: "registered", outcome: "Graduated" },
  { studentId: "stu-15", classId: "open-class-a", enrolledAt: "Aug 12, 2026", status: "registered" },
  { studentId: "stu-16", classId: "closed-class-a", enrolledAt: "Jan 18, 2026", status: "registered", outcome: "Dropped" },
  { studentId: "stu-17", classId: "emt-001", enrolledAt: "Nov 11, 2023", status: "registered", outcome: "Graduated" },
  { studentId: "stu-18", classId: "emt-001", enrolledAt: "Jan 28, 2024", status: "registered", outcome: "Graduated" },
  { studentId: "stu-19", classId: "open-class-b", enrolledAt: "Aug 4, 2026", status: "registered" },
];

export const STUDENT_DOCUMENTS: StudentDocument[] = [
  {
    id: "doc-hannah-cert",
    studentId: "stu-5",
    kind: "issued",
    name: "PARA-001 completion certificate",
    href: CERT,
    classId: "closed-class-a",
    date: "Jun 20, 2026",
  },
  {
    id: "doc-hannah-cpr",
    studentId: "stu-5",
    kind: "upload",
    name: "CPR Certificate",
    href: CERT,
    classId: "open-class-a",
    date: "Mar 12, 2026",
  },
  {
    id: "doc-owen-cert",
    studentId: "stu-15",
    kind: "issued",
    name: "PARA-001 completion certificate",
    href: CERT,
    classId: "closed-class-a",
    date: "Jun 20, 2026",
  },
  {
    id: "doc-owen-hs",
    studentId: "stu-15",
    kind: "upload",
    name: "High school graduation",
    href: CERT,
    classId: "open-class-a",
    date: "Jun 4, 2022",
  },
  {
    id: "doc-maya-cpr",
    studentId: "stu-1",
    kind: "upload",
    name: "CPR / BLS Certification",
    href: CERT,
    classId: "bls",
    date: "Jan 9, 2026",
  },
  {
    id: "doc-caleb-cpr",
    studentId: "stu-4",
    kind: "upload",
    name: "CPR Certificate",
    href: CERT,
    classId: "open-class-b",
    date: "Nov 2, 2025",
  },
  {
    id: "doc-chris-cert",
    studentId: "stu-17",
    kind: "issued",
    name: "EMT-001 completion certificate",
    href: CERT,
    classId: "emt-001",
    date: "Apr 4, 2026",
  },
  {
    id: "doc-morgan-cert",
    studentId: "stu-18",
    kind: "issued",
    name: "EMT-001 completion certificate",
    href: CERT,
    classId: "emt-001",
    date: "Apr 4, 2026",
  },
  {
    id: "doc-elise-cpr",
    studentId: "stu-7",
    kind: "upload",
    name: "CPR Certificate",
    href: CERT,
    classId: "open-class-a",
    date: "Apr 3, 2026",
  },
];

export const STUDENT_ACTIVITY: Record<string, ClassActivityItem[]> = {
  "stu-1": [
    { id: "sa-1-1", kind: "enroll", text: "Enrolled in BLS-001", date: "Mar 4, 2025" },
    { id: "sa-1-2", kind: "prereq", text: "Uploaded CPR / BLS Certification", date: "Jan 9" },
    { id: "sa-1-3", kind: "update", text: "Paid registration fee for BLS-001", date: "Aug 15" },
  ],
  "stu-2": [
    { id: "sa-2-1", kind: "enroll", text: "Enrolled in EMT-002", date: "Jun 18, 2025" },
  ],
  "stu-3": [
    { id: "sa-3-1", kind: "enroll", text: "Enrolled in EMT-002", date: "Jun 22, 2025" },
    { id: "sa-3-2", kind: "enroll", text: "Enrolled in BLS-001", date: "Jul 2, 2025" },
  ],
  "stu-4": [
    { id: "sa-4-1", kind: "enroll", text: "Enrolled in EMT-003", date: "May 9, 2025" },
    { id: "sa-4-2", kind: "prereq", text: "Submitted CPR Certificate", date: "Nov 2, 2025" },
    { id: "sa-4-3", kind: "update", text: "Paid registration fee for EMT-003", date: "Aug 15" },
  ],
  "stu-5": [
    { id: "sa-5-1", kind: "enroll", text: "Enrolled in PARA-001", date: "Jan 12" },
    { id: "sa-5-2", kind: "update", text: "PARA-001 completion certificate issued", date: "Jun 20" },
    { id: "sa-5-3", kind: "enroll", text: "Enrolled in EMT-001", date: "Jan 10" },
    { id: "sa-5-4", kind: "update", text: "Marked failed in EMT-001", date: "Apr 4" },
    { id: "sa-5-5", kind: "enroll", text: "Enrolled in PARA-004", date: "Aug 14" },
    { id: "sa-5-6", kind: "prereq", text: "Submitted CPR Certificate for PARA-004", date: "Aug 14" },
    { id: "sa-5-7", kind: "enroll", text: "Enrolled in ACLS-001", date: "Aug 14" },
  ],
  "stu-6": [
    { id: "sa-6-1", kind: "enroll", text: "Enrolled in PARA-002", date: "Jul 30" },
    { id: "sa-6-2", kind: "enroll", text: "Enrolled in PARA-004", date: "Aug 9" },
    { id: "sa-6-3", kind: "prereq", text: "Submitted CPR Certificate", date: "Aug 9" },
  ],
  "stu-7": [
    { id: "sa-7-1", kind: "enroll", text: "Enrolled in PARA-003", date: "Aug 4" },
    { id: "sa-7-2", kind: "update", text: "Paid first invoice for PARA-003", date: "Aug 15" },
    { id: "sa-7-3", kind: "enroll", text: "Enrolled in PARA-004", date: "Aug 11" },
  ],
  "stu-11": [
    { id: "sa-11-1", kind: "enroll", text: "Enrolled in EMT-003", date: "May 14, 2025" },
    { id: "sa-11-2", kind: "enroll", text: "Enrolled in OXY-001", date: "Aug 8" },
  ],
  "stu-12": [
    { id: "sa-12-1", kind: "enroll", text: "Enrolled in PARA-002", date: "Aug 1" },
    { id: "sa-12-2", kind: "enroll", text: "Enrolled in PARA-004", date: "Aug 20" },
  ],
  "stu-15": [
    { id: "sa-15-1", kind: "enroll", text: "Enrolled in PARA-001", date: "Jan 12" },
    { id: "sa-15-2", kind: "update", text: "PARA-001 completion certificate issued", date: "Jun 20" },
    { id: "sa-15-3", kind: "enroll", text: "Enrolled in PARA-004", date: "Aug 12" },
    { id: "sa-15-4", kind: "prereq", text: "Submitted high school graduation", date: "Aug 12" },
  ],
  "stu-17": [
    { id: "sa-17-1", kind: "enroll", text: "Enrolled in EMT-001", date: "Nov 11, 2023" },
    { id: "sa-17-2", kind: "update", text: "EMT-001 completion certificate issued", date: "Apr 4" },
  ],
  "stu-18": [
    { id: "sa-18-1", kind: "enroll", text: "Enrolled in EMT-001", date: "Jan 28, 2024" },
    { id: "sa-18-2", kind: "update", text: "EMT-001 completion certificate issued", date: "Apr 4" },
  ],
};

export function studentById(id: string): StudentRecord | null {
  return BY_ID.get(id) ?? null;
}

export function studentByEmail(email: string): StudentRecord | null {
  return BY_EMAIL.get(email.toLowerCase()) ?? null;
}

export function enrollmentsFor(studentId: string): StudentEnrollment[] {
  return STUDENT_ENROLLMENTS.filter(
    (row) => row.studentId === studentId && row.status === "registered",
  );
}

export function pendingPrereqsForStudent(studentId: string): ClassPrerequisiteSubmission[] {
  const student = studentById(studentId);
  if (!student) return [];
  return Object.values(CLASS_PREREQUISITE_ITEMS).flatMap((items) =>
    items
      .filter((item) => item.student === student.name && item.status === "pending_review")
      .map((item) => ({
        id: item.id,
        studentId: item.studentId,
        student: item.student,
        type: item.type,
        issuedOn: item.issuedOn ?? "",
        issuer: item.issuer ?? "",
      })),
  );
}

export function documentsForStudent(studentId: string): StudentDocument[] {
  const fromMocks = STUDENT_DOCUMENTS.filter((doc) => doc.studentId === studentId);
  const student = studentById(studentId);
  if (!student) return fromMocks;

  const issuedFromRoster = Object.entries(CLASS_ROSTERS).flatMap(([classId, rows]) =>
    rows
      .filter((row) => row.email.toLowerCase() === student.email.toLowerCase() && row.certificateHref)
      .map((row) => ({
        id: `issued-${classId}-${studentId}`,
        studentId,
        kind: "issued" as const,
        name: `${CLASS_DETAILS[classId]?.classCode ?? classId} completion certificate`,
        href: row.certificateHref as string,
        classId,
        date: CLASS_DETAILS[classId]?.classEnd
          ? CLASS_DETAILS[classId].classEnd
          : "",
      })),
  );

  const seen = new Set(fromMocks.map((doc) => `${doc.kind}:${doc.classId ?? ""}:${doc.name}`));
  return [
    ...fromMocks,
    ...issuedFromRoster.filter((doc) => !seen.has(`${doc.kind}:${doc.classId ?? ""}:${doc.name}`)),
  ];
}

export function activityForStudent(studentId: string): ClassActivityItem[] {
  return STUDENT_ACTIVITY[studentId] ?? [];
}

export function enrollmentPaymentStatus(
  studentId: string,
  classId: string,
): EnrollmentPaymentStatus {
  const invoices = classAllInvoicesFor(classId).filter(
    (invoice) => invoice.studentId === studentId && invoice.transactionStatus !== "refunded",
  );
  if (!invoices.length) return "No payments yet";

  const listStatus = (invoice: TransactionRow) => getTransactionListStatus(invoice);
  const reg = invoices.find((invoice) => invoice.transactionType === "registration_fee");
  const tuitionA = invoices.find((invoice) => invoice.transactionType === "tuition_a");
  const tuitionB = invoices.find((invoice) => invoice.transactionType === "tuition_b");

  if (reg && listStatus(reg) === "past_due") return "Registration fee past due";
  if (tuitionA && listStatus(tuitionA) === "past_due") return "Tuition A past due";
  if (tuitionB && listStatus(tuitionB) === "past_due") return "Tuition B past due";
  if (invoices.every((invoice) => invoice.transactionStatus === "paid")) return "All paid";
  if (
    reg?.transactionStatus === "paid" &&
    tuitionA?.transactionStatus === "paid" &&
    tuitionB &&
    tuitionB.transactionStatus !== "paid"
  ) {
    return "First payment paid";
  }
  if (reg?.transactionStatus === "paid") return "Registration fee paid";
  if (invoices.some((invoice) => listStatus(invoice) === "pending")) return "Pending";
  return "Pending";
}

function listPaymentStatus(studentId: string): StudentPaymentStatus {
  const invoices = invoicesForStudent(studentId);
  if (!invoices.length) return enrollmentsFor(studentId).length ? "pending" : "na";
  if (invoices.some((invoice) => getTransactionListStatus(invoice) === "past_due")) return "past-due";
  if (invoices.some((invoice) => getTransactionListStatus(invoice) === "pending")) return "pending";
  if (invoices.some((invoice) => invoice.transactionStatus === "paid")) return "paid";
  return "na";
}

export function toStudentRow(record: StudentRecord): StudentRow {
  const active = enrollmentsFor(record.id).filter(
    (enrollment) => !isEnrollmentClosed(enrollment.classId),
  );
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    classes: active.map((enrollment) => {
      const detail = classDetailFor(enrollment.classId);
      return { id: detail.classCode, name: detail.title || detail.classCode };
    }),
    paymentStatus: listPaymentStatus(record.id),
    joinedAt: record.joinedAt,
  };
}

export const STUDENT_ROWS: StudentRow[] = STUDENT_RECORDS.map(toStudentRow);
