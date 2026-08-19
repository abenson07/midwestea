import { StudentDetailDemo } from "@/components/admin-migrate/patterns/students";
import { listCertificates } from "@/lib/admin-migrate/certificates";
import { listClasses } from "@/lib/admin-migrate/classes";
import { listCourses } from "@/lib/admin-migrate/courses";
import { listEnrollments } from "@/lib/admin-migrate/enrollments";
import { getStudentById, listStudents } from "@/lib/admin-migrate/students";
import { listTransactions } from "@/lib/admin-migrate/transactions";
import { toClassDetail } from "../../../classes/fromStaging";
import { mapTransactionRows } from "../../../transactions/fromStaging";
import { toStudentEnrollment, toStudentRecord } from "../../fromStaging";

export default async function StudentProfileRoute({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const [stagingStudent, enrollments, classes, courses, studentTransactions, certificates] = await Promise.all([
    getStudentById(studentId),
    listEnrollments({ studentId }),
    listClasses(),
    listCourses(),
    listTransactions({ studentId }),
    listCertificates({ studentId }),
  ]);
  const certificateByEnrollmentId = new Map(certificates.map((row) => [row.enrollmentId, row]));
  const student = stagingStudent ? toStudentRecord(stagingStudent) : undefined;
  const students = stagingStudent ? [stagingStudent] : await listStudents();
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const classDetails = classes
    .filter((row) => enrollments.some((enrollment) => enrollment.classId === row.id))
    .map((row) =>
      toClassDetail(row, {
        course: (row.courseUuid && coursesById.get(row.courseUuid)) || undefined,
      }),
    );
  const transactions = mapTransactionRows(studentTransactions, students, classes);

  return (
    <StudentDetailDemo
      key={studentId}
      studentId={studentId}
      student={student}
      enrollments={
        student
          ? enrollments
              .filter((enrollment) => enrollment.enrollmentStatus !== "removed")
              .map((enrollment) => toStudentEnrollment(enrollment, certificateByEnrollmentId.get(enrollment.id)))
          : undefined
      }
      classDetails={student ? classDetails : undefined}
      transactions={student ? transactions : undefined}
    />
  );
}
