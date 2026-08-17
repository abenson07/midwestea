"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { DraftsSection } from "@/components/patterns/client-templates/drafts/DraftsSection";
import { CourseCard, type CourseCardData } from "./CourseCard";

/** Placeholder catalog until Courses gets a real data source. */
const COURSE_CARDS: CourseCardData[] = [
  {
    id: "cpr-bls-provider",
    name: "CPR/BLS Provider",
    description: "Basic Life Support provider course for healthcare professionals.",
    length: "1 day",
  },
  {
    id: "acls-provider",
    name: "ACLS Provider",
    description: "Advanced Cardiovascular Life Support certification course.",
    length: "2 days",
  },
  {
    id: "pals-provider",
    name: "PALS Provider",
    description: "Pediatric Advanced Life Support certification course.",
    length: "2 days",
  },
];

/** Courses body — a 2-column grid of course cards. */
export function CoursesPage() {
  return (
    <VStack gap={8}>
      <DraftsSection title="Courses" columns={2}>
        {COURSE_CARDS.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </DraftsSection>
    </VStack>
  );
}
