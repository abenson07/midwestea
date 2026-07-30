export type ClassSummary = {
  name: string;
  program: string;
  term: string;
  teacher: string;
  status: "enrolling" | "in-progress" | "closed";
  enrolledCount: number;
  capacity: number;
};

export const sampleClassSummary: ClassSummary = {
  name: "Algebra I — Section 3",
  program: "Midwest Learning Co-op",
  term: "Fall 2026",
  teacher: "Priya Nair",
  status: "enrolling",
  enrolledCount: 18,
  capacity: 24,
};

export type ClassStudentRow = {
  id: string;
  name: string;
  status: "Enrolled" | "Waitlisted" | "Withdrawn";
  grade: string;
  guardian: string;
  enrolledAt: string;
};

export const sampleClassStudents: ClassStudentRow[] = [
  {
    id: "stu-1",
    name: "Maya Thompson",
    status: "Enrolled",
    grade: "9th",
    guardian: "Renee Thompson",
    enrolledAt: "Jul 02",
  },
  {
    id: "stu-2",
    name: "Owen Castillo",
    status: "Enrolled",
    grade: "9th",
    guardian: "Diego Castillo",
    enrolledAt: "Jul 03",
  },
  {
    id: "stu-3",
    name: "Freya Larsen",
    status: "Enrolled",
    grade: "10th",
    guardian: "Ingrid Larsen",
    enrolledAt: "Jul 08",
  },
  {
    id: "stu-4",
    name: "Malik Johnson",
    status: "Waitlisted",
    grade: "9th",
    guardian: "Aisha Johnson",
    enrolledAt: "Jul 20",
  },
  {
    id: "stu-5",
    name: "Sofia Reyes",
    status: "Waitlisted",
    grade: "9th",
    guardian: "Camila Reyes",
    enrolledAt: "Jul 22",
  },
  {
    id: "stu-6",
    name: "Ethan Brooks",
    status: "Withdrawn",
    grade: "10th",
    guardian: "Tanya Brooks",
    enrolledAt: "Jun 14",
  },
];

export type ClassPrerequisiteRow = {
  id: string;
  studentName: string;
  docName: string;
  submittedAt: string;
  fileUrl: string;
};

export const sampleClassPrerequisites: ClassPrerequisiteRow[] = [];

export type ClassInvoiceRow = {
  id: string;
  studentName: string;
  amount: string;
  status: "Open" | "Overdue" | "Paid";
  dueDate: string;
};

export const sampleClassInvoices: ClassInvoiceRow[] = [
  {
    id: "inv-2201",
    studentName: "Maya Thompson",
    amount: "$450.00",
    status: "Open",
    dueDate: "Aug 01",
  },
  {
    id: "inv-2202",
    studentName: "Owen Castillo",
    amount: "$450.00",
    status: "Open",
    dueDate: "Aug 01",
  },
  {
    id: "inv-2198",
    studentName: "Freya Larsen",
    amount: "$450.00",
    status: "Overdue",
    dueDate: "Jul 15",
  },
];
