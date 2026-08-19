import { ClassesDemo } from "@/components/admin-migrate/patterns/classes";
import { listClasses } from "@/lib/admin-migrate/classes";
import { listCourses } from "@/lib/admin-migrate/courses";
import { listEnrollments } from "@/lib/admin-migrate/enrollments";
import { countEnrollmentsByClass, toClassDetail } from "./fromStaging";

export async function ClassesMigrate() {
  const [classes, enrollments, courses] = await Promise.all([
    listClasses(),
    listEnrollments(),
    listCourses(),
  ]);
  const coursesById = new Map(courses.map((course) => [course.id, course]));
  const coursesByCode = new Map(
    courses.filter((course) => course.code).map((course) => [course.code as string, course]),
  );

  return (
    <ClassesDemo
      rows={classes.map((row) =>
        toClassDetail(row, {
          course: (row.courseUuid && coursesById.get(row.courseUuid)) ||
            (row.courseCode ? coursesByCode.get(row.courseCode) : undefined),
        }),
      )}
      enrolledCounts={countEnrollmentsByClass(enrollments)}
    />
  );
}
