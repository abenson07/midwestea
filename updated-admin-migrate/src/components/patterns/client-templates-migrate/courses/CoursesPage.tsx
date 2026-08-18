"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { DraftsSection } from "@/components/patterns/client-templates/drafts/DraftsSection";
import { useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { catalogTemplatesOfKind, type CatalogTemplate } from "../catalog/catalogMocks";
import { CourseCard } from "./CourseCard";

function cardLength(classLength: string, classType: string): string {
  return classLength && classLength !== "—" ? classLength : classType;
}

export type CoursesPageProps = {
  templates?: CatalogTemplate[];
};

/** Courses body — a 2-column grid of course cards. */
export function CoursesPage({ templates }: CoursesPageProps = {}) {
  const live = useIsNewAdminMigrate();
  const courses = templates ?? (live ? [] : catalogTemplatesOfKind("Course"));

  return (
    <VStack gap={8}>
      <DraftsSection title="Courses" columns={2}>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={{
              id: course.id,
              name: course.name,
              description: course.description,
              length: cardLength(course.classLength, course.defaultClassFormat),
            }}
          />
        ))}
      </DraftsSection>
    </VStack>
  );
}
