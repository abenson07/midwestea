import { SettingsDemo } from "@/components/admin-migrate/patterns/settings";
import { listCourses } from "@/lib/admin-migrate/courses";
import { listLocations } from "@/lib/admin-migrate/locations";
import { listPrerequisiteTypes, listTemplatePrerequisites } from "@/lib/admin-migrate/prerequisites";
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
