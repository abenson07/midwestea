import { listClasses } from "@/lib/staging/classes";
import { listCourses } from "@/lib/staging/courses";
import { countEnrollmentsByClass, listEnrollments } from "@/lib/staging/enrollments";
import { stagingError, stagingOk } from "@/lib/staging/apiResponse";

export const runtime = "nodejs";

/**
 * GET /api/new-admin-migrate/classes
 * Class labels from staging (id, code, name, dates, program vs course).
 */
export async function GET() {
  try {
    const [classes, courses, enrollments] = await Promise.all([
      listClasses(),
      listCourses(),
      listEnrollments(),
    ]);
    const enrolledCounts = countEnrollmentsByClass(enrollments);
    const byId = new Map(courses.map((course) => [course.id, course]));
    const byCode = new Map(
      courses.filter((course) => course.code).map((course) => [course.code as string, course]),
    );
    return stagingOk({
      classes: classes.map((row) => ({
        ...row,
        kind:
          (row.courseUuid ? byId.get(row.courseUuid)?.kind : undefined) ??
          (row.courseCode ? byCode.get(row.courseCode)?.kind : undefined) ??
          "Course",
        enrolledCount: enrolledCounts.get(row.id) ?? 0,
      })),
    });
  } catch (err) {
    return stagingError(err, "Failed to list classes");
  }
}
