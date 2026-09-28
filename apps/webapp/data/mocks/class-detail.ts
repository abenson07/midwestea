export type ClassSummary = {
  name: string;
  program: string;
  courseCode: string;
  isOnline: boolean;
  status: "enrolling" | "in-progress" | "closed";
  enrollmentStartDate: string;
  enrollmentCloseDate: string;
  classStartDate: string;
  classEndDate: string;
  lengthOfClass: string;
  registrationLimit: number;
  certificationLength: number;
  price: string;
  registrationFee: string;
  location: string;
  enrolledCount: number;
  capacity: number;
};

export const sampleClassSummary: ClassSummary = {
  name: "PARA-001",
  program: "Paramedic Program",
  courseCode: "PARA",
  isOnline: false,
  status: "in-progress",
  enrollmentStartDate: "Dec 22, 2025",
  enrollmentCloseDate: "Jan 11, 2026",
  classStartDate: "Jan 12, 2026",
  classEndDate: "Jan 12, 2027",
  lengthOfClass: "—",
  registrationLimit: 25,
  certificationLength: 1,
  price: "$8,800.00",
  registrationFee: "$150.00",
  location: "Dubuque, IA",
  enrolledCount: 7,
  capacity: 25,
};

export type ClassStudentRow = {
  id: string;
  name: string;
  status: "Enrolled" | "Waitlisted" | "Withdrawn";
  level: string;
  email: string;
  enrolledAt: string;
};

export const sampleClassStudents: ClassStudentRow[] = [
  {
    id: "stu-1",
    name: "Caulin R Pendleton",
    status: "Enrolled",
    level: "EMT-B",
    email: "caulinpendleton@yahoo.com",
    enrolledAt: "Dec 28, 2025",
  },
  {
    id: "stu-2",
    name: "Nina Stevenson",
    status: "Enrolled",
    level: "EMT-I",
    email: "thegnarledneedle@gmail.com",
    enrolledAt: "Dec 30, 2025",
  },
  {
    id: "stu-3",
    name: "Michael Unruh",
    status: "Enrolled",
    level: "EMT-B",
    email: "michaelunruh@outlook.com",
    enrolledAt: "Jan 2, 2026",
  },
  {
    id: "stu-4",
    name: "Megan Royer",
    status: "Enrolled",
    level: "EMT-P",
    email: "meganroyer@hotmail.com",
    enrolledAt: "Jan 3, 2026",
  },
  {
    id: "stu-5",
    name: "Garrett Bull",
    status: "Enrolled",
    level: "EMT-B",
    email: "gbull2701@gmail.com",
    enrolledAt: "Jan 5, 2026",
  },
  {
    id: "stu-6",
    name: "Samuel Walker",
    status: "Enrolled",
    level: "EMT-B",
    email: "samuel.a.walker.03@gmail.com",
    enrolledAt: "Jan 6, 2026",
  },
  {
    id: "stu-7",
    name: "Max Pekay",
    status: "Enrolled",
    level: "EMT-I",
    email: "pekay0117@gmail.com",
    enrolledAt: "Jan 8, 2026",
  },
];

export type ClassPrerequisiteRow = {
  id: string;
  studentName: string;
  docName: string;
  submittedAt: string;
  fileUrl: string;
};

export const sampleClassPrerequisites: ClassPrerequisiteRow[] = [
  {
    id: "doc-1",
    studentName: "Garrett Bull",
    docName: "Immunization records",
    submittedAt: "Jan 5, 2026",
    fileUrl: "#",
  },
  {
    id: "doc-2",
    studentName: "Samuel Walker",
    docName: "Background check consent",
    submittedAt: "Jan 6, 2026",
    fileUrl: "#",
  },
  {
    id: "doc-3",
    studentName: "Max Pekay",
    docName: "EMT certification",
    submittedAt: "Jan 8, 2026",
    fileUrl: "#",
  },
];

export type ClassInvoiceRow = {
  id: string;
  studentName: string;
  invoiceLabel: string;
  amount: string;
  status: "Open" | "Overdue" | "Paid";
  dueDate: string;
  /** Set when `status` is "Paid" — shown in the paid-token tooltip. */
  paidDate?: string;
  /** Set when `status` is "Overdue" — shown as "{n}d past due". */
  daysPastDue?: number;
};

export const sampleClassInvoices: ClassInvoiceRow[] = [
  {
    id: "inv-2201a",
    studentName: "Caulin R Pendleton",
    invoiceLabel: "Invoice A",
    amount: "$4,400.00",
    status: "Paid",
    dueDate: "Jan 12, 2026",
    paidDate: "Jan 10, 2026",
  },
  {
    id: "inv-2201b",
    studentName: "Caulin R Pendleton",
    invoiceLabel: "Invoice B",
    amount: "$4,400.00",
    status: "Paid",
    dueDate: "Jul 12, 2026",
    paidDate: "Jul 9, 2026",
  },
  {
    id: "inv-2202a",
    studentName: "Nina Stevenson",
    invoiceLabel: "Invoice A",
    amount: "$4,400.00",
    status: "Paid",
    dueDate: "Jan 12, 2026",
    paidDate: "Jan 12, 2026",
  },
  {
    id: "inv-2202b",
    studentName: "Nina Stevenson",
    invoiceLabel: "Invoice B",
    amount: "$4,400.00",
    status: "Open",
    dueDate: "Jul 12, 2026",
  },
  {
    id: "inv-2198a",
    studentName: "Michael Unruh",
    invoiceLabel: "Invoice A",
    amount: "$4,400.00",
    status: "Paid",
    dueDate: "Jan 12, 2026",
    paidDate: "Jan 14, 2026",
  },
  {
    id: "inv-2198b",
    studentName: "Michael Unruh",
    invoiceLabel: "Invoice B",
    amount: "$4,400.00",
    status: "Overdue",
    dueDate: "Jul 12, 2026",
    daysPastDue: 16,
  },
];
