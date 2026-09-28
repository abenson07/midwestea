import type { StagingCertificate } from "@/lib/admin-migrate/certificates";
import type { StagingClass } from "@/lib/admin-migrate/classes";
import type { StagingEnrollment } from "@/lib/admin-migrate/enrollments";
import type { StagingStudent } from "@/lib/admin-migrate/students";
import type { PastClassStatus } from "@/components/admin-migrate/patterns/students/types";
import type {
  StudentEnrollment,
  StudentPaymentStatus,
  StudentRecord,
  StudentRow,
} from "@/components/admin-migrate/patterns/students/types";
import type { TransactionRow } from "@/data/mocks/transactions";
import { getTransactionListStatus } from "@/data/mocks/transaction-status";
import { todayIsoDate } from "@/lib/dates";

function formatJoinedAt(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isClassClosed(stagingClass: StagingClass | undefined): boolean {
  if (!stagingClass?.classEnd) return false;
  return stagingClass.classEnd < todayIsoDate();
}

function listPaymentStatus(invoices: TransactionRow[], hasEnrollment: boolean): StudentPaymentStatus {
  if (!invoices.length) return hasEnrollment ? "pending" : "na";
  if (invoices.some((invoice) => getTransactionListStatus(invoice) === "past_due")) return "past-due";
  if (invoices.some((invoice) => getTransactionListStatus(invoice) === "pending")) return "pending";
  if (invoices.some((invoice) => invoice.transactionStatus === "paid")) return "paid";
  return "na";
}

const PAST_CLASS_STATUSES: PastClassStatus[] = ["Graduated", "Failed", "Dropped"];

function toPastClassStatus(outcome: string | null): PastClassStatus | undefined {
  return PAST_CLASS_STATUSES.find((status) => status === outcome);
}

export function toStudentEnrollment(
  enrollment: StagingEnrollment,
  certificate?: StagingCertificate,
): StudentEnrollment {
  return {
    studentId: enrollment.studentId,
    classId: enrollment.classId,
    enrolledAt: formatJoinedAt(enrollment.enrolledAt),
    status: enrollment.enrollmentStatus === "removed" ? "removed" : "registered",
    enrollmentId: enrollment.id,
    outcome: toPastClassStatus(enrollment.outcome),
    certificateHref: certificate?.status === "issued" ? certificate.downloadUrl ?? undefined : undefined,
  };
}

export function toIdentityListRow(
  student: StagingStudent,
  enrollments: StagingEnrollment[] = [],
  classes: StagingClass[] = [],
  invoices: TransactionRow[] = [],
): StudentRow {
  const classesById = new Map(classes.map((row) => [row.id, row]));
  const active = enrollments.filter((enrollment) => {
    if (enrollment.enrollmentStatus === "removed") return false;
    return !isClassClosed(classesById.get(enrollment.classId));
  });

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    classes: active.map((enrollment) => {
      const detail = classesById.get(enrollment.classId);
      return {
        id: enrollment.classId,
        name: detail?.name || detail?.classCode || "Class",
      };
    }),
    paymentStatus: listPaymentStatus(invoices, enrollments.some((row) => row.enrollmentStatus !== "removed")),
    joinedAt: formatJoinedAt(student.createdAt),
  };
}

export function toStudentRecord(student: StagingStudent): StudentRecord {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    phone: student.phone ?? "",
    tshirtSize: student.tShirtSize ?? "",
    emergencyContactName: student.emergencyContactName ?? "",
    emergencyContactPhone: student.emergencyContactPhone ?? "",
    hasRequiredInfo: student.hasRequiredInfo,
    stripeCustomerId: student.stripeCustomerId ?? "",
    joinedAt: formatJoinedAt(student.createdAt),
  };
}
