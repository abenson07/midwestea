"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Calendar } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { PersonWithMembership } from "hooks";
import type { PeopleUpdate, MembershipsUpdate } from "@/types/database";
import type { NeighborRow } from "./types";
import { ContactSection, MembershipSection, VolunteerSection } from "./PersonSections";

export type NeighborDetailPanelProps = {
  neighbor: NeighborRow;
  person: PersonWithMembership;
  onUpdatePerson: (data: PeopleUpdate) => void | Promise<void>;
  onUpdateMembership: (data: MembershipsUpdate) => void | Promise<void>;
};

/** Neighbor detail — shown in the outlined side panel when a row is selected from Neighbors. */
export function NeighborDetailPanel({
  neighbor,
  person,
  onUpdatePerson,
  onUpdateMembership,
}: NeighborDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={neighbor.name} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{neighbor.name}</Text>
          <Text size="sm" color="secondary">
            Neighbor
          </Text>
        </div>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Details
          </Text>
        }
      >
        <SideContentField icon={<Calendar size={16} strokeWidth={1.75} />} label={`Joined ${neighbor.joinedDate}`} />
      </List>

      <ContactSection person={person} onCommit={onUpdatePerson} />
      <MembershipSection person={person} onCommit={onUpdateMembership} />
      <VolunteerSection person={person} />
    </VStack>
  );
}
