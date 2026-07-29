"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Text, Heading } from "@/components/patterns/primitives/Text";
import { List } from "@/components/patterns/primitives/List";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { OtherClassRow } from "@/data/mocks/classes";

export type ClassSummaryPanelProps = {
  otherClass: OtherClassRow;
};

/** Summary side panel for a closed/other class — can drill into full detail. */
export function ClassSummaryPanel({ otherClass }: ClassSummaryPanelProps) {
  const router = useRouter();

  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="sm" color="secondary">
          {otherClass.code}
        </Text>
        <Heading level={2}>{otherClass.name}</Heading>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Summary
          </Text>
        }
      >
        <SideContentField
          icon={<CalendarDays size={16} strokeWidth={1.75} />}
          label={`Closed ${otherClass.closedDate}`}
        />
        <SideContentField
          icon={<UsersIcon size={16} strokeWidth={1.75} />}
          label={`${otherClass.totalEnrolled} total enrolled`}
        />
      </List>

      <Button
        label="View full detail"
        variant="secondary"
        size="sm"
        width="100%"
        onClick={() => router.push("/admin-preview/class-detail")}
      />
    </VStack>
  );
}
