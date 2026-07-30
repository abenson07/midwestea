"use client";

import type { ReactNode } from "react";
import { CalendarCheck2, CircleDollarSign, Wifi } from "lucide-react";
import type { OnlineClassSummary } from "@/data/mocks/online-class-detail";

export type OnlineClassInfoBoxProps = {
  summary: OnlineClassSummary;
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
 * Top bounding box for an online class — same shell as the in-person
 * `ClassInfoBox`, but swaps the Starts/Ends/Location metadata for a single
 * Online indicator (toggled from the Edit class panel; no location or
 * session dates apply to online classes).
 */
export function OnlineClassInfoBox({ summary }: OnlineClassInfoBoxProps) {
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
        <ClassMetaItem icon={<CalendarCheck2 size={14} strokeWidth={1.75} />}>
          Enrollment Closes {summary.enrollmentCloseDate}
        </ClassMetaItem>
        <ClassMetaItem icon={<CircleDollarSign size={14} strokeWidth={1.75} />}>
          {summary.price}
        </ClassMetaItem>
        {summary.isOnline ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 22,
              paddingInline: 8,
              borderRadius: 999,
              background: "var(--linear-color-sidebar-item-selected)",
              color: "var(--linear-color-ink-subtle)",
              fontSize: 12,
              lineHeight: "16px",
              whiteSpace: "nowrap",
            }}
          >
            <Wifi size={12} strokeWidth={1.75} />
            Online
          </span>
        ) : null}
      </div>
    </header>
  );
}
