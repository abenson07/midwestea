export type StudentSummary = {
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive" | "graduated";
  studentSince: string;
  location: string;
};

export const sampleStudentSummary: StudentSummary = {
  name: "Caulin R Pendleton",
  email: "caulinpendleton@yahoo.com",
  phone: "(563) 555-0148",
  status: "active",
  studentSince: "Dec 28, 2025",
  location: "Dubuque, IA",
};

export type StudentPrerequisiteRow = {
  id: string;
  className: string;
  docName: string;
  submittedAt: string;
  fileUrl: string;
};

export const sampleStudentPrerequisites: StudentPrerequisiteRow[] = [
  {
    id: "doc-1",
    className: "PARA-001",
    docName: "Immunization records",
    submittedAt: "Jan 5, 2026",
    fileUrl: "#",
  },
  {
    id: "doc-2",
    className: "PARA-001",
    docName: "Background check consent",
    submittedAt: "Jan 6, 2026",
    fileUrl: "#",
  },
];

export type StudentInvoiceRow = {
  id: string;
  className: string;
  invoiceLabel: string;
  amount: string;
  status: "Open" | "Overdue" | "Paid";
  dueDate: string;
  /** Set when `status` is "Paid" — shown in the paid-token tooltip. */
  paidDate?: string;
  /** Set when `status` is "Overdue" — shown as "{n}d past due". */
  daysPastDue?: number;
};

export const sampleStudentInvoices: StudentInvoiceRow[] = [
  {
    id: "inv-2201a",
    className: "PARA-001",
    invoiceLabel: "Invoice A",
    amount: "$4,400.00",
    status: "Paid",
    dueDate: "Jan 12, 2026",
    paidDate: "Jan 10, 2026",
  },
  {
    id: "inv-2201b",
    className: "PARA-001",
    invoiceLabel: "Invoice B",
    amount: "$4,400.00",
    status: "Overdue",
    dueDate: "Jul 12, 2026",
    daysPastDue: 16,
  },
];

export type StudentClassRow = {
  id: string;
  className: string;
  program: string;
  status: "Enrolled" | "Waitlisted" | "Completed" | "Withdrawn";
  startDate: string;
  endDate: string;
};

export const sampleStudentClasses: StudentClassRow[] = [
  {
    id: "cls-1",
    className: "PARA-001",
    program: "Paramedic Program",
    status: "Enrolled",
    startDate: "Jan 12, 2026",
    endDate: "Jan 12, 2027",
  },
  {
    id: "cls-2",
    className: "EMT-014",
    program: "EMT Basic",
    status: "Completed",
    startDate: "Mar 3, 2025",
    endDate: "Jun 3, 2025",
  },
];

export type StudentCertificateRow = {
  id: string;
  name: string;
  issuedDate: string;
  expiresDate: string;
  fileUrl: string;
};

export const sampleStudentCertificates: StudentCertificateRow[] = [
  {
    id: "cert-1",
    name: "EMT-Basic Certification",
    issuedDate: "Jun 10, 2025",
    expiresDate: "Jun 10, 2027",
    fileUrl: "#",
  },
  {
    id: "cert-2",
    name: "CPR/BLS Certification",
    issuedDate: "Nov 2, 2025",
    expiresDate: "Nov 2, 2027",
    fileUrl: "#",
  },
];

export type StudentDocumentRow = {
  id: string;
  name: string;
  uploadedAt: string;
  fileUrl: string;
};

export const sampleStudentDocuments: StudentDocumentRow[] = [
  {
    id: "doc-101",
    name: "Driver's license",
    uploadedAt: "Dec 20, 2025",
    fileUrl: "#",
  },
  {
    id: "doc-102",
    name: "Immunization records",
    uploadedAt: "Jan 5, 2026",
    fileUrl: "#",
  },
  {
    id: "doc-103",
    name: "Background check consent",
    uploadedAt: "Jan 6, 2026",
    fileUrl: "#",
  },
];
