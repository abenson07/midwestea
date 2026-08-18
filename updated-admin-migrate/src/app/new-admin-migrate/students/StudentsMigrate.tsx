import { StudentsDemo } from "@/components/patterns/client-templates-migrate/students";
import { listClasses } from "@/lib/staging/classes";
import { listEnrollments } from "@/lib/staging/enrollments";
import { listStudents } from "@/lib/staging/students";
import { listTransactions } from "@/lib/staging/transactions";
import { mapTransactionRows } from "../transactions/fromStaging";
import { toIdentityListRow } from "./fromStaging";

export async function StudentsMigrate() {
  const [students, enrollments, classes, transactions] = await Promise.all([
    listStudents(),
    listEnrollments(),
    listClasses(),
    listTransactions(),
  ]);
  const invoiceRows = mapTransactionRows(transactions, students, classes);
  const enrollmentsByStudent = new Map<string, typeof enrollments>();
  for (const enrollment of enrollments) {
    const list = enrollmentsByStudent.get(enrollment.studentId) ?? [];
    list.push(enrollment);
    enrollmentsByStudent.set(enrollment.studentId, list);
  }

  return (
    <StudentsDemo
      rows={students.map((student) =>
        toIdentityListRow(
          student,
          enrollmentsByStudent.get(student.id) ?? [],
          classes,
          invoiceRows.filter((row) => row.studentId === student.id),
        ),
      )}
    />
  );
}
