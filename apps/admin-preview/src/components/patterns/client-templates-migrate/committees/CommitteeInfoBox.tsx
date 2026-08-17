"use client";

import type { ReactNode } from "react";
import { CalendarDays, MapPin, Users2 } from "lucide-react";

export type CommitteeInfoBoxCommittee = {
  name: string;
  description: string;
  chair?: string;
  memberCount?: number;
  meetingDay?: string;
  location?: string;
};

export type CommitteeInfoBoxProps = {
  committee: CommitteeInfoBoxCommittee;
};

function CommitteeMetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
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
 * Top bounding box for the committee detail page — name, description, and
 * key committee metadata.
 */
export function CommitteeInfoBox({ committee }: CommitteeInfoBoxProps) {
  return (
    <header
      data-slot="committee-info-box"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
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
          {committee.name}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: "20px",
            color: "var(--linear-color-ink-subtle)",
          }}
        >
          {committee.description}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        {committee.memberCount ? (
          <CommitteeMetaItem icon={<Users2 size={14} strokeWidth={1.75} />}>
            {committee.memberCount} members
          </CommitteeMetaItem>
        ) : null}
        {committee.meetingDay ? (
          <CommitteeMetaItem icon={<CalendarDays size={14} strokeWidth={1.75} />}>
            {committee.meetingDay}
          </CommitteeMetaItem>
        ) : null}
        {committee.location && committee.location !== "—" ? (
          <CommitteeMetaItem icon={<MapPin size={14} strokeWidth={1.75} />}>
            {committee.location}
          </CommitteeMetaItem>
        ) : null}
      </div>
    </header>
  );
}
