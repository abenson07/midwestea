import { cache } from "react";
import { todayIsoDate } from "@/lib/dates";
import { listClasses } from "./classes";
import { listCourses } from "./courses";
import { countEnrollmentsByClass, listEnrollments } from "./enrollments";
import { EMPTY_OPEN_CLASS_GROUPS, groupOpenClasses, type StagingOpenClassGroups } from "./openClasses";

/**
 * Open program/course nav for `/new-admin-migrate`. Cached per request so the
 * layout can pass a stable list into the sidebar before first paint.
 */
export const listOpenClassesForNav = cache(async (): Promise<StagingOpenClassGroups> => {
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
    return groupOpenClasses(
      classes.map((row) => {
        const template =
          (row.courseUuid ? byId.get(row.courseUuid) : undefined) ??
          (row.courseCode ? byCode.get(row.courseCode) : undefined);
        return {
          ...row,
          kind: template?.kind ?? "Course",
          templateName: template?.name ?? row.name ?? row.classCode ?? "Class",
          enrolledCount: enrolledCounts.get(row.id) ?? 0,
        };
      }),
      todayIsoDate(),
    );
  } catch {
    return EMPTY_OPEN_CLASS_GROUPS;
  }
});
