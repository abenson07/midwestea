import { ProgramsDemo } from "@/components/patterns/client-templates-migrate/programs";
import { listCourses } from "@/lib/staging/courses";
import { listPrerequisiteTypes, listTemplatePrerequisites } from "@/lib/staging/prerequisites";
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
