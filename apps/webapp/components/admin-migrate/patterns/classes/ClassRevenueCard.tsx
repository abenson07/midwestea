"use client";

import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { ClassSidebarSection } from "./ClassSidebarSection";
import type { ClassRevenue } from "./classMocks";

export type ClassRevenueCardProps = {
  revenue: ClassRevenue;
  /** `total` — closed program breakdown. `active` — course callout. */
  variant: "total" | "active";
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

/** Right-rail revenue: closed-class totals, or a course's active collected amount. */
export function ClassRevenueCard({ revenue, variant }: ClassRevenueCardProps) {
  if (variant === "active") {
    return (
      <ClassSidebarSection title="Active revenue">
        <Text
          style={{
            fontSize: 22,
            lineHeight: "28px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
          }}
        >
          {revenue.total}
        </Text>
        <Text size="sm" color="secondary">
          Collected from registrations
        </Text>
      </ClassSidebarSection>
    );
  }

  return (
    <ClassSidebarSection title="Revenue">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <PropertyRow label="Total" value={revenue.total} />
        <PropertyRow label="Tuition" value={revenue.tuition} />
        <PropertyRow label="Registration fee" value={revenue.registrationFee} />
      </div>
    </ClassSidebarSection>
  );
}
