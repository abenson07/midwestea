import { PaymentsDemo } from "@/components/admin-migrate/patterns/payments";
import { listClasses } from "@/lib/admin-migrate/classes";
import { listEnrollments } from "@/lib/admin-migrate/enrollments";
import { listStudents } from "@/lib/admin-migrate/students";
import { listTransactions } from "@/lib/admin-migrate/transactions";
import { mapTransactionRows } from "./fromStaging";

export async function TransactionsMigrate() {
  const [transactions, students, classes, enrollments, activeStudents, activeClasses] = await Promise.all([
    listTransactions(),
    listStudents({ includeDeleted: true }),
    listClasses({ includeDeleted: true }),
    listEnrollments(),
    listStudents(),
    listClasses(),
  ]);

  // New Invoice targets: non-removed enrollments of non-deleted students in
  // non-deleted classes. The API re-validates all of this server-side.
  const liveStudents = new Map(activeStudents.map((student) => [student.id, student]));
  const liveClasses = new Map(activeClasses.map((row) => [row.id, row]));
  const invoiceTargets = enrollments.flatMap((enrollment) => {
    if (enrollment.enrollmentStatus === "removed") return [];
    const student = liveStudents.get(enrollment.studentId);
    const classRow = liveClasses.get(enrollment.classId);
    if (!student || !classRow) return [];
    return [
      {
        studentId: student.id,
        studentName: student.name,
        classId: classRow.id,
        classCode: classRow.classCode ?? "—",
        className: classRow.name ?? "—",
      },
    ];
  });

  return <PaymentsDemo rows={mapTransactionRows(transactions, students, classes)} invoiceTargets={invoiceTargets} />;
}
