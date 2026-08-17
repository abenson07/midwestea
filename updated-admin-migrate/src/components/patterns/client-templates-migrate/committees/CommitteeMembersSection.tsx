"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import {
  sampleCommitteeMembers,
  countChairs,
  displayMemberTitle,
  type CommitteeMemberRow,
} from "@/data/mocks/committees";

export type CommitteeMembersSectionProps = {
  onSelectMember?: (row: CommitteeMemberRow) => void;
};

/**
 * Members list for the committee Overview page — a plain Name / Role list,
 * matching the boxed shape of `VolunteersListSection` for a side-by-side
 * layout with `CommitteeMeetingsSection`.
 */
export function CommitteeMembersSection({ onSelectMember }: CommitteeMembersSectionProps) {
  const { enabled: demo } = useDemoModeOptional();
  const members = demo ? sampleCommitteeMembers : [];
  const chairCount = countChairs(members);

  return (
    <section
      data-slot="committee-members-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text weight="semibold">Members</Text>
        <Text size="sm" color="secondary">
          {members.length} total
        </Text>
      </div>

      {members.length === 0 ? (
        <EmptyStateCard variant="plain" label="No members added yet" minHeight={72} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {members.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => onSelectMember?.(member)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 4px",
                borderRadius: "var(--linear-radius-sm)",
                cursor: onSelectMember ? "pointer" : "default",
              }}
            >
              <Avatar name={member.name} size="sm" />
              <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                {member.name}
              </Text>
              <Text size="sm" color="secondary">
                {displayMemberTitle(member.role, chairCount)}
              </Text>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
