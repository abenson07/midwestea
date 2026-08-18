"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { DraftsSection } from "@/components/patterns/client-templates/drafts/DraftsSection";
import { useIsNewAdminMigrate } from "@/components/patterns/client-templates/shared";
import { catalogTemplatesOfKind, type CatalogTemplate } from "../catalog/catalogMocks";
import { ProgramCard } from "./ProgramCard";

function cardLength(classLength: string, classType: string): string {
  return classLength && classLength !== "—" ? classLength : classType;
}

export type ProgramsPageProps = {
  templates?: CatalogTemplate[];
};

/** Programs body — a 2-column grid of program cards. */
export function ProgramsPage({ templates }: ProgramsPageProps = {}) {
  const live = useIsNewAdminMigrate();
  const programs = templates ?? (live ? [] : catalogTemplatesOfKind("Program"));

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
