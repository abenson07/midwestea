"use client";

import { Avatar } from "@/components/patterns/primitives/Avatar";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { CalendarDays, CircleDot, Mail } from "lucide-react";
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
            {student.level}
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
            Contact
          </Text>
        }
      >
        <SideContentField icon={<Mail size={16} strokeWidth={1.75} />} label={student.email} />
      </List>
    </VStack>
  );
}
