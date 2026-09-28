"use client";

import { Pencil } from "lucide-react";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";
import { ClassSidebarSection } from "../classes/ClassSidebarSection";
import type { StudentRecord } from "./types";

export type StudentDetailsCardProps = {
  student: StudentRecord;
  onEditDetails?: () => void;
};

function PropertyRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 28,
      }}
    >
      <Text size="sm" color="secondary" style={{ width: 108, flexShrink: 0 }}>
        {label}
      </Text>
      <Text size="sm" style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
        {value}
      </Text>
    </div>
  );
}

/** Personal details card — field on the left, value on the right. */
export function StudentDetailsCard({ student, onEditDetails }: StudentDetailsCardProps) {
  return (
    <ClassSidebarSection
      title="Personal details"
      action={
        onEditDetails ? (
          <IconButton
            label="Edit personal details"
            variant="ghost"
            size="sm"
            icon={<Pencil size={14} strokeWidth={1.75} />}
            onClick={onEditDetails}
          />
        ) : null
      }
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <PropertyRow label="Name" value={student.name} />
        <PropertyRow label="Email" value={student.email} />
        <PropertyRow label="Phone" value={student.phone} />
        <PropertyRow label="T-shirt" value={student.tshirtSize} />
        <PropertyRow label="Emergency" value={student.emergencyContactName} />
        <PropertyRow label="Emerg. phone" value={student.emergencyContactPhone} />
        <PropertyRow label="Required info" value={student.hasRequiredInfo ? "Yes" : "No"} />
        <PropertyRow label="Stripe ID" value={student.stripeCustomerId} />
      </div>
    </ClassSidebarSection>
  );
}
