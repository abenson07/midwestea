"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { DraftsSection } from "@/components/patterns/client-templates/drafts/DraftsSection";
import { ProgramCard, type ProgramCardData } from "./ProgramCard";

/** Placeholder catalog until Programs gets a real data source. */
const PROGRAM_CARDS: ProgramCardData[] = [
  {
    id: "emt-basic",
    name: "EMT Basic",
    description: "Entry-level emergency medical technician certification program.",
    length: "12 weeks",
  },
  {
    id: "aemt",
    name: "AEMT",
    description: "Advanced EMT bridge program for expanded scope of practice.",
    length: "16 weeks",
  },
  {
    id: "paramedic",
    name: "Paramedic",
    description: "Advanced prehospital care and ALS certification program.",
    length: "12 months",
  },
];

/** Programs body — a 2-column grid of program cards. */
export function ProgramsPage() {
  return (
    <VStack gap={8}>
      <DraftsSection title="Programs" columns={2}>
        {PROGRAM_CARDS.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </DraftsSection>
    </VStack>
  );
}
