"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { CircleDot, Sparkles } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { PersonWithMembership } from "hooks";
import type { PeopleUpdate, MembershipsUpdate } from "@/types/database";
import type { VolunteerRow } from "./types";
import { ContactSection, MembershipSection } from "./PersonSections";

export type VolunteerDetailPanelProps = {
  volunteer: VolunteerRow;
  person: PersonWithMembership;
  onUpdatePerson: (data: PeopleUpdate) => void | Promise<void>;
  onUpdateMembership: (data: MembershipsUpdate) => void | Promise<void>;
};

/** Volunteer detail — shown in the outlined side panel when a row is selected from Volunteers. */
export function VolunteerDetailPanel({
  volunteer,
  person,
  onUpdatePerson,
  onUpdateMembership,
}: VolunteerDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={volunteer.name} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{volunteer.name}</Text>
          <Text size="sm" color="secondary">
            {volunteer.interestArea}
          </Text>
        </div>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Volunteering
          </Text>
        }
      >
        <SideContentField
          icon={<CircleDot size={16} strokeWidth={1.75} />}
          label={volunteer.hasVolunteeredBefore ? "Has volunteered before" : "Interested, not yet volunteered"}
        />
        <SideContentField icon={<Sparkles size={16} strokeWidth={1.75} />} label={volunteer.interestArea} />
      </List>

      <ContactSection person={person} onCommit={onUpdatePerson} />
      <MembershipSection person={person} onCommit={onUpdateMembership} />
    </VStack>
  );
}
