"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Mail, Phone, MapPin, Clock, CalendarDays } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { StaffRow } from "@/data/mocks/staff";

export type StaffProfilePanelProps = {
  staff: StaffRow;
};

function RolePill({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        paddingInline: 7,
        borderRadius: 999,
        background: "var(--linear-color-sidebar-item-selected)",
        color: "var(--linear-color-ink-subtle)",
        fontSize: 11,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

/** Base profile block shown in every staff side panel, regardless of active tab. */
export function StaffProfilePanel({ staff }: StaffProfilePanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={staff.name} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <Text weight="medium">{staff.name}</Text>
          <div style={{ display: "flex", gap: 4 }}>
            {staff.isTrainer ? <RolePill label="Trainer" /> : null}
            {staff.isAdmin ? <RolePill label="Admin" /> : null}
          </div>
        </div>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Profile
          </Text>
        }
      >
        <SideContentField icon={<Mail size={16} strokeWidth={1.75} />} label={staff.email} />
        <SideContentField icon={<Phone size={16} strokeWidth={1.75} />} label={staff.phone} />
        <SideContentField
          icon={<MapPin size={16} strokeWidth={1.75} />}
          label={staff.location}
        />
      </List>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Activity
          </Text>
        }
      >
        <SideContentField
          icon={<Clock size={16} strokeWidth={1.75} />}
          label={`Last logged in ${staff.lastLoginAt}`}
        />
        <SideContentField
          icon={<CalendarDays size={16} strokeWidth={1.75} />}
          label={`Staff since ${staff.staffSince}`}
        />
      </List>
    </VStack>
  );
}
