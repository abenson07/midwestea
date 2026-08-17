"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import type { PersonWithMembership } from "hooks";
import type { PeopleUpdate, MembershipsUpdate } from "@/types/database";
import type { MemberRow, MembershipType } from "./types";
import { ContactSection, MembershipSection, VolunteerSection } from "./PersonSections";

const MEMBERSHIP_TYPE_LABEL: Record<MembershipType, string> = {
  household: "Household",
  individual: "Individual",
  senior: "Senior",
  student: "Student",
  "no-tier": "No tier",
};

export type MemberDetailPanelProps = {
  member: MemberRow;
  person: PersonWithMembership;
  onUpdatePerson: (data: PeopleUpdate) => void | Promise<void>;
  onUpdateMembership: (data: MembershipsUpdate) => void | Promise<void>;
};

/** Member detail — shown in the outlined side panel when a row is selected from Members. */
export function MemberDetailPanel({
  member,
  person,
  onUpdatePerson,
  onUpdateMembership,
}: MemberDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={member.name} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{member.name}</Text>
          <Text size="sm" color="secondary">
            {MEMBERSHIP_TYPE_LABEL[member.membershipType]}
          </Text>
        </div>
      </div>

      <ContactSection person={person} onCommit={onUpdatePerson} />
      <MembershipSection person={person} onCommit={onUpdateMembership} />
      <VolunteerSection person={person} />
    </VStack>
  );
}
