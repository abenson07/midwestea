"use client";

import { Text } from "@/components/patterns/primitives/Text";
import { ClassSidebarSection } from "./ClassSidebarSection";
import type { ClassDetail } from "./classMocks";

export type ClassDetailsCardProps = {
  classDetail: ClassDetail;
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

/** Properties card — field on the left, value on the right. */
export function ClassDetailsCard({ classDetail }: ClassDetailsCardProps) {
  return (
    <ClassSidebarSection title="Properties">
      <div style={{ display: "flex", flexDirection: "column" }}>
        <PropertyRow
          label="Status"
          value={classDetail.publishStatus === "published" ? "Published" : "Draft"}
        />
        <PropertyRow label="Registration" value={classDetail.registrationFee} />
        <PropertyRow label="Tuition" value={classDetail.tuitionFee} />
        <PropertyRow label="Class size" value={classDetail.classSize} />
        <PropertyRow label="Type" value={classDetail.classFormat} />
        <PropertyRow label="Dates" value={classDetail.date} />
      </div>
    </ClassSidebarSection>
  );
}
