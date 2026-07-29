"use client";

import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { CalendarDays, CircleDot, GraduationCap } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { StudentClassRow } from "@/data/mocks/student-detail";

export type ClassDetailPanelProps = {
  classRow: StudentClassRow;
};

/**
 * Class-enrollment detail — shown in the outlined side panel when a
 * row is selected from the Classes section.
 */
export function ClassDetailPanel({ classRow }: ClassDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text weight="medium">{classRow.className}</Text>
        <Text size="sm" color="secondary">
          {classRow.program}
        </Text>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Enrollment
          </Text>
        }
      >
        <SideContentField icon={<CircleDot size={16} strokeWidth={1.75} />} label={classRow.status} />
        <SideContentField
          icon={<GraduationCap size={16} strokeWidth={1.75} />}
          label={classRow.program}
        />
      </List>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Dates
          </Text>
        }
      >
        <SideContentField
          icon={<CalendarDays size={16} strokeWidth={1.75} />}
          label={`Starts ${classRow.startDate}`}
        />
        <SideContentField
          icon={<CalendarDays size={16} strokeWidth={1.75} />}
          label={`Ends ${classRow.endDate}`}
        />
      </List>
    </VStack>
  );
}
