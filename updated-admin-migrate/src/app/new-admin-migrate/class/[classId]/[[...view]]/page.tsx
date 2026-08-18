import { ClassDetailDemo } from "@/components/patterns/client-templates-migrate/classes";
import { getClassById } from "@/lib/staging/classes";
import { listCourses } from "@/lib/staging/courses";
import { listEnrollments } from "@/lib/staging/enrollments";
import { listLocations } from "@/lib/staging/locations";
import { listClassPrerequisites, listPrerequisiteTypes } from "@/lib/staging/prerequisites";
import { listStudents } from "@/lib/staging/students";
import { listTransactions } from "@/lib/staging/transactions";
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
