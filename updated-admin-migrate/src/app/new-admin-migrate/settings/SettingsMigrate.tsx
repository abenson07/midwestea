import { SettingsDemo } from "@/components/patterns/client-templates-migrate/settings";
import { listCourses } from "@/lib/staging/courses";
import { listLocations } from "@/lib/staging/locations";
import { listPrerequisiteTypes, listTemplatePrerequisites } from "@/lib/staging/prerequisites";
import { prerequisiteNamesFor, toCatalogTemplate, toLocationRow, toPrerequisiteRow } from "../catalog/fromStaging";

export async function SettingsMigrate() {
  const [courses, locations, types, assignments] = await Promise.all([
    listCourses(),
    listLocations(),
    listPrerequisiteTypes(),
    listTemplatePrerequisites(),
  ]);

  return (
    <SettingsDemo
      templates={courses.map((course) =>
        toCatalogTemplate(course, prerequisiteNamesFor(course.id, assignments, types)),
      )}
      locations={locations.map(toLocationRow)}
      prerequisites={types.map(toPrerequisiteRow)}
    />
  );
}
