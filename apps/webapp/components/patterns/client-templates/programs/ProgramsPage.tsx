"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { DraftsSection } from "@/components/patterns/client-templates/drafts";
import { ProgramCard } from "./ProgramCard";
import { samplePrograms } from "@/data/mocks/programs";

/** Programs body — a 2-column grid of program cards, sourced from MidwestEA.com. */
export function ProgramsPage() {
  return (
    <VStack gap={8}>
      <DraftsSection title="Programs" columns={2}>
        {samplePrograms.map((program) => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </DraftsSection>
    </VStack>
  );
}
