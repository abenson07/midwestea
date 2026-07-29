"use client";

import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { STAFF_PERMISSIONS, type StaffRow } from "@/data/mocks/staff";

export type StaffPermissionsSectionProps = {
  staff: StaffRow;
};

/** Read-only view of an admin's hardcoded permission set. */
export function StaffPermissionsSection({ staff }: StaffPermissionsSectionProps) {
  return (
    <List
      density="compact"
      header={
        <Text type="label" color="secondary">
          Permissions
        </Text>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 4px" }}>
        {STAFF_PERMISSIONS.map((permission) => (
          <Checkbox
            key={permission}
            label={permission}
            value={staff.permissions.includes(permission)}
            isDisabled
          />
        ))}
      </div>
    </List>
  );
}
