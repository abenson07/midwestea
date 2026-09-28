import { CoursesDemo } from "@/components/admin-migrate/patterns/courses";
import { listCourses } from "@/lib/admin-migrate/courses";
import { listPrerequisiteTypes, listTemplatePrerequisites } from "@/lib/admin-migrate/prerequisites";
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
