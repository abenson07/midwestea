import type { StagingStudent } from "@/lib/staging/students";
import type { StudentRecord, StudentRow } from "@/components/patterns/client-templates-migrate/students/types";

function formatJoinedAt(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toIdentityListRow(student: StagingStudent): StudentRow {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    classes: [],
    paymentStatus: "na",
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
