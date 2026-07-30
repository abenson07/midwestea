"use client";

import { Avatar } from "@astryxdesign/core/Avatar";
import { VStack } from "@astryxdesign/core/Layout";
import { List } from "@astryxdesign/core/List";
import { Text } from "@astryxdesign/core/Text";
import { CalendarDays, CircleDot, UserRound } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { ClassStudentRow } from "@/data/mocks/class-detail";

export type StudentDetailPanelProps = {
  student: ClassStudentRow;
};

/**
 * Student-in-class detail — shown in the outlined side panel when a
 * row is selected from the Students section.
 */
export function StudentDetailPanel({ student }: StudentDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={student.name} size="md" />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Text weight="medium">{student.name}</Text>
          <Text size="sm" color="secondary">
            {student.grade} grade
          </Text>
        </div>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Enrollment
          </Text>
        }
      >
        <SideContentField icon={<CircleDot size={16} strokeWidth={1.75} />} label={student.status} />
        <SideContentField
          icon={<CalendarDays size={16} strokeWidth={1.75} />}
          label={`Enrolled ${student.enrolledAt}`}
        />
      </List>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Guardian
          </Text>
        }
      >
        <SideContentField icon={<UserRound size={16} strokeWidth={1.75} />} label={student.guardian} />
      </List>
    </VStack>
  );
}
