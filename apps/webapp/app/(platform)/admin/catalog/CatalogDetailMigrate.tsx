import { CatalogDetailDemo } from "@/components/admin-migrate/patterns/catalog";
import { listClasses } from "@/lib/admin-migrate/classes";
import { getCourseById, listCourses } from "@/lib/admin-migrate/courses";
import { listEnrollments } from "@/lib/admin-migrate/enrollments";
import { listPrerequisiteTypes, listTemplatePrerequisites } from "@/lib/admin-migrate/prerequisites";
import { countEnrollmentsByClass, toClassDetail } from "../classes/fromStaging";
import { prerequisiteNamesFor, toCatalogTemplate } from "./fromStaging";

export async function CatalogDetailMigrate({ templateId }: { templateId: string }) {
  const [course, classes, enrollments, assignments, types, allCourses] = await Promise.all([
    getCourseById(templateId),
    listClasses(),
    listEnrollments(),
    listTemplatePrerequisites(templateId),
    listPrerequisiteTypes(),
    listCourses(),
  ]);

  const template = course
    ? toCatalogTemplate(course, prerequisiteNamesFor(course.id, assignments, types))
    : undefined;
  const coursesById = new Map(allCourses.map((row) => [row.id, row]));
  const templateClasses = course
    ? classes
        .filter((row) => row.courseUuid === course.id || row.courseCode === course.code)
        .map((row) => toClassDetail(row, { course: coursesById.get(row.courseUuid ?? "") ?? course }))
    : undefined;

  return (
    <CatalogDetailDemo
      key={templateId}
      templateId={templateId}
      template={template}
      classes={template ? templateClasses : undefined}
      enrolledCounts={template ? countEnrollmentsByClass(enrollments) : undefined}
    />
  );
}
