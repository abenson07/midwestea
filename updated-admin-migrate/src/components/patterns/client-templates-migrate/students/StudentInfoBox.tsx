"use client";

import { Text } from "@/components/patterns/primitives/Text";
import type { StudentRecord } from "./types";

export type StudentInfoBoxProps = {
  student: StudentRecord;
};

/** Student overview header — name and email, no card chrome. */
export function StudentInfoBox({ student }: StudentInfoBoxProps) {
  return (
    <header
      data-slot="student-info-box"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 22,
          lineHeight: "28px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "var(--linear-color-ink)",
        }}
      >
        {student.name}
      </h1>
      <Text size="sm" color="secondary">
        {student.email}
      </Text>
    </header>
  );
}
