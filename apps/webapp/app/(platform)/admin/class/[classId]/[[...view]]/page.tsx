import { ClassDetailDemo } from "@/components/admin-migrate/patterns/classes";
import { getClassById } from "@/lib/admin-migrate/classes";
import { listCourses } from "@/lib/admin-migrate/courses";
import { listEnrollments } from "@/lib/admin-migrate/enrollments";
import { listLocations } from "@/lib/admin-migrate/locations";
import { listClassPrerequisites, listPrerequisiteTypes } from "@/lib/admin-migrate/prerequisites";
import { listStudents } from "@/lib/admin-migrate/students";
import { listTransactions } from "@/lib/admin-migrate/transactions";
import { classPrerequisiteNames, toClassDetail, toRosterRow } from "../../../classes/fromStaging";
import { mapTransactionRows } from "../../../transactions/fromStaging";

export default async function ClassCatchAllRoute({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const stagingClass = await getClassById(classId);
  const resolvedClassId = stagingClass?.id;
  const [enrollments, classTransactions, courses, locations, classPrereqs, prereqTypes] =
    await Promise.all([
      resolvedClassId ? listEnrollments({ classId: resolvedClassId }) : Promise.resolve([]),
      resolvedClassId ? listTransactions({ classId: resolvedClassId }) : Promise.resolve([]),
      listCourses(),
      listLocations(),
      resolvedClassId ? listClassPrerequisites(resolvedClassId) : Promise.resolve([]),
      listPrerequisiteTypes(),
    ]);

  const course =
    stagingClass?.courseUuid
      ? courses.find((row) => row.id === stagingClass.courseUuid)
      : stagingClass?.courseCode
        ? courses.find((row) => row.code === stagingClass.courseCode)
        : undefined;
  const classDetail = stagingClass
    ? toClassDetail(stagingClass, {
        course,
        prerequisites: classPrerequisiteNames(resolvedClassId ?? classId, classPrereqs, prereqTypes),
      })
    : undefined;

  const students =
    enrollments.length || classTransactions.length ? await listStudents() : [];
  const studentsById = new Map(students.map((student) => [student.id, student]));
  const roster = enrollments
    .filter((enrollment) => enrollment.enrollmentStatus !== "removed" && studentsById.has(enrollment.studentId))
    .map((enrollment) => toRosterRow(enrollment, studentsById.get(enrollment.studentId)!));
  const transactions = mapTransactionRows(
    classTransactions,
    students,
    stagingClass ? [stagingClass] : [],
  );

  return (
    <ClassDetailDemo
      key={classId}
      classId={classId}
      classDetail={classDetail}
      roster={classDetail ? roster : undefined}
      transactions={classDetail ? transactions : undefined}
      locationNames={locations.map((location) => location.name)}
    />
  );
}
