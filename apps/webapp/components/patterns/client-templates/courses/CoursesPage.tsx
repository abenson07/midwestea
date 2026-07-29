"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { CourseCard } from "./CourseCard";
import { sampleCourses } from "@/data/mocks/courses";

/** Courses body — a 2-column grid of course cards, sourced from MidwestEA.com. */
export function CoursesPage() {
  return (
    <VStack gap={8}>
      <DraftsSection title="Courses" columns={2}>
        {sampleCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </DraftsSection>
    </VStack>
  );
}
