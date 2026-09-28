import { ProgramsDemo } from "@/components/admin-migrate/patterns/programs";
import { listCourses } from "@/lib/admin-migrate/courses";
import { listPrerequisiteTypes, listTemplatePrerequisites } from "@/lib/admin-migrate/prerequisites";
import { prerequisiteNamesFor, toCatalogTemplate } from "../catalog/fromStaging";

export async function ProgramsMigrate() {
  const [courses, assignments, types] = await Promise.all([
    listCourses(),
    listTemplatePrerequisites(),
    listPrerequisiteTypes(),
  ]);
  const templates = courses
    .filter((course) => course.kind === "Program")
    .map((course) => toCatalogTemplate(course, prerequisiteNamesFor(course.id, assignments, types)));

  return <ProgramsDemo templates={templates} />;
}
