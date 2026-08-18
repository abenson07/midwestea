import { StudentDetailDemo } from "@/components/patterns/client-templates-migrate/students";
import { listClasses } from "@/lib/staging/classes";
import { listCourses } from "@/lib/staging/courses";
import { listEnrollments } from "@/lib/staging/enrollments";
import { getStudentById, listStudents } from "@/lib/staging/students";
import { listTransactions } from "@/lib/staging/transactions";
import { toClassDetail } from "../../../classes/fromStaging";
import { mapTransactionRows } from "../../../transactions/fromStaging";
import { toStudentEnrollment, toStudentRecord } from "../../fromStaging";

export default async function StudentProfileRoute({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const [stagingStudent, enrollments, classes, courses, studentTransactions] = await Promise.all([
    getStudentById(studentId),
    listEnrollments({ studentId }),
    listClasses(),
    listCourses(),
    listTransactions({ studentId }),
  ]);
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
              .map(toStudentEnrollment)
          : undefined
      }
      classDetails={student ? classDetails : undefined}
      transactions={student ? transactions : undefined}
    />
  );
}
