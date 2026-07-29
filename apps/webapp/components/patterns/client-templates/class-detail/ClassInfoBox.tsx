"use client";

import type { ReactNode } from "react";
import { CalendarCheck2, CalendarDays, CircleDollarSign, MapPin } from "lucide-react";
import type { ClassSummary } from "@/data/mocks/class-detail";

export type ClassInfoBoxProps = {
  summary: ClassSummary;
};

function ClassMetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
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
 * Top bounding box for the class detail page — title, enrollment summary,
 * and key class metadata. Status pill lives in the canvas title-bar; lifecycle
 * actions live in its more menu.
 */
export function ClassInfoBox({ summary }: ClassInfoBoxProps) {
  return (
    <header
      data-slot="class-info-box"
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
          {summary.program} · Enrollment Closes {summary.enrollmentCloseDate} ·{" "}
          {summary.enrolledCount}/{summary.capacity} enrolled
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <ClassMetaItem icon={<CalendarDays size={14} strokeWidth={1.75} />}>
          Starts {summary.classStartDate}
        </ClassMetaItem>
        <ClassMetaItem icon={<CalendarCheck2 size={14} strokeWidth={1.75} />}>
          Ends {summary.classEndDate}
        </ClassMetaItem>
        <ClassMetaItem icon={<CircleDollarSign size={14} strokeWidth={1.75} />}>
          {summary.price}
        </ClassMetaItem>
        <ClassMetaItem icon={<MapPin size={14} strokeWidth={1.75} />}>
          {summary.location}
        </ClassMetaItem>
      </div>
    </header>
  );
}
