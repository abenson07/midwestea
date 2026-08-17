"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { DraftsSection } from "@/components/patterns/client-templates/drafts/DraftsSection";
import { CommitteeCard } from "./CommitteeCard";
import { COMMITTEE_HUB_CARDS } from "@/lib/committees/committeeSlug";

/** Committees body — a 2-column grid of committee cards. */
export function CommitteesPage() {
  return (
    <VStack gap={8}>
      <DraftsSection title="Committees" columns={2}>
        {COMMITTEE_HUB_CARDS.map((committee) => (
          <CommitteeCard
            key={committee.id}
            committee={{
              id: committee.id,
              name: committee.name,
              description: committee.description,
              chair: "",
              memberCount: 0,
              cadence: "Ongoing",
            }}
          />
        ))}
      </DraftsSection>
    </VStack>
  );
}
