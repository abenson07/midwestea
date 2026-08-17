"use client";

import { Text } from "@/components/patterns/primitives/Text";
import type { ClassDetail } from "./classMocks";

export type ClassDetailsCardProps = {
  classDetail: ClassDetail;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Text size="sm" color="secondary">
        {label}
      </Text>
      <Text weight="medium">{value}</Text>
    </div>
  );
}

/** Left-rail properties list summarizing fees, size, format, prerequisites count, and schedule — no card chrome, mirrors Linear's issue "Properties" sidebar. */
export function ClassDetailsCard({ classDetail }: ClassDetailsCardProps) {
  return (
    <section
      data-slot="class-details-card"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <Text weight="semibold">Class Details</Text>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <DetailRow label="Registration Fee" value={classDetail.registrationFee} />
        <DetailRow label="Tuition Fee" value={classDetail.tuitionFee} />
        <DetailRow label="Class Size" value={classDetail.classSize} />
        <DetailRow label="Class Type" value={classDetail.classFormat} />
        <DetailRow
          label="Prerequisites"
          value={classDetail.prerequisites.length ? `${classDetail.prerequisites.length} required` : "None"}
        />
        <DetailRow label="Dates" value={classDetail.date} />
      </div>
    </section>
  );
}
