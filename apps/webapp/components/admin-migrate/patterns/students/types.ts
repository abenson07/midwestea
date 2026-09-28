export type StudentPaymentStatus = "paid" | "past-due" | "pending" | "na";

export type StudentClass = {
  id: string;
  name: string;
};

export type StudentRow = {
  id: string;
  name: string;
  email: string;
  classes: StudentClass[];
  paymentStatus: StudentPaymentStatus;
  joinedAt: string;
};

export type StudentsView = "all" | "current" | "past-due";

export type EnrollmentStatus = "registered" | "removed";

export type PastClassStatus = "Graduated" | "Failed" | "Dropped";

export type StudentRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  tshirtSize: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  hasRequiredInfo: boolean;
  stripeCustomerId: string;
  joinedAt: string;
};

export type StudentEnrollment = {
  studentId: string;
  classId: string;
  enrolledAt: string;
  status: EnrollmentStatus;
  /** The underlying enrollments.id — required to generate a certificate for this row. */
  enrollmentId?: string;
  /** Outcome once the class is closed. */
  outcome?: PastClassStatus;
  /** Set once a certificate has been generated for this enrollment. */
  certificateHref?: string;
};

export type StudentDocumentKind = "upload" | "issued";

export type StudentDocument = {
  id: string;
  studentId: string;
  kind: StudentDocumentKind;
  name: string;
  href: string;
  classId?: string;
  date: string;
};

export type EnrollmentPaymentStatus =
  | "Registration fee past due"
  | "Tuition A past due"
  | "Tuition B past due"
  | "All paid"
  | "First payment paid"
  | "Registration fee paid"
  | "Pending"
  | "No payments yet";

export function isEnrolled(row: StudentRow): boolean {
  return row.classes.length > 0;
}

export function matchesStudentsView(row: StudentRow, view: StudentsView): boolean {
  if (view === "current") return isEnrolled(row);
  if (view === "past-due") return isEnrolled(row) && row.paymentStatus === "past-due";
  return true;
}
