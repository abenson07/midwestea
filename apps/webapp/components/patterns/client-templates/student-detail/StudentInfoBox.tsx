"use client";

import type { ReactNode } from "react";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import type { StudentSummary } from "@/data/mocks/student-detail";

export type StudentInfoBoxProps = {
  summary: StudentSummary;
};

function StudentMetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--linear-color-ink-subtle)",
        fontSize: 13,
        lineHeight: "20px",
      }}
    >
      <span style={{ display: "inline-flex" }}>{icon}</span>
      {children}
    </span>
  );
}

/**
 * Top bounding box for the student detail page — name, contact summary,
 * and key student metadata. Status pill lives in the canvas title-bar.
 */
export function StudentInfoBox({ summary }: StudentInfoBoxProps) {
  return (
    <header
      data-slot="student-info-box"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 20,
        border:
          "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
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
          {summary.name}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: "20px",
            color: "var(--linear-color-ink-subtle)",
          }}
        >
          Student since {summary.studentSince}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <StudentMetaItem icon={<Mail size={14} strokeWidth={1.75} />}>
          {summary.email}
        </StudentMetaItem>
        <StudentMetaItem icon={<Phone size={14} strokeWidth={1.75} />}>
          {summary.phone}
        </StudentMetaItem>
        <StudentMetaItem icon={<CalendarDays size={14} strokeWidth={1.75} />}>
          Since {summary.studentSince}
        </StudentMetaItem>
        <StudentMetaItem icon={<MapPin size={14} strokeWidth={1.75} />}>
          {summary.location}
        </StudentMetaItem>
      </div>
    </header>
  );
}
