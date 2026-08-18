import { CoursesDemo } from "@/components/patterns/client-templates-migrate/courses";
import { listCourses } from "@/lib/staging/courses";
import { listPrerequisiteTypes, listTemplatePrerequisites } from "@/lib/staging/prerequisites";
import { prerequisiteNamesFor, toCatalogTemplate } from "../catalog/fromStaging";

export async function CoursesMigrate() {
  const [courses, assignments, types] = await Promise.all([
    listCourses(),
    listTemplatePrerequisites(),
    listPrerequisiteTypes(),
  ]);
  const templates = courses
    .filter((course) => course.kind === "Course")
    .map((course) => toCatalogTemplate(course, prerequisiteNamesFor(course.id, assignments, types)));

  return <CoursesDemo templates={templates} />;
}
