"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { DraftsSection } from "@/components/patterns/client-templates/drafts/DraftsSection";
import { catalogTemplatesOfKind } from "../catalog/catalogMocks";
import { ProgramCard } from "./ProgramCard";

function cardLength(classLength: string, classType: string): string {
  return classLength && classLength !== "—" ? classLength : classType;
}

/** Programs body — a 2-column grid of program cards. */
export function ProgramsPage() {
  const programs = catalogTemplatesOfKind("Program");

  return (
    <VStack gap={8}>
      <DraftsSection title="Programs" columns={2}>
        {programs.map((program) => (
          <ProgramCard
            key={program.id}
            program={{
              id: program.id,
              name: program.name,
              description: program.description,
              length: cardLength(program.classLength, program.defaultClassFormat),
            }}
          />
        ))}
      </DraftsSection>
    </VStack>
  );
}
