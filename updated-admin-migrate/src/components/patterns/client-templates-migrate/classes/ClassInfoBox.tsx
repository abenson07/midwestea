"use client";

import type { ReactNode } from "react";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import type { ClassDetail } from "./classMocks";

export type ClassInfoBoxProps = {
  classDetail: ClassDetail;
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

/** Class overview header — title, summary, and schedule, no card chrome. */
export function ClassInfoBox({ classDetail }: ClassInfoBoxProps) {
  return (
    <header
      data-slot="class-info-box"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
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
          {classDetail.title}
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: "20px",
            color: "var(--linear-color-ink-subtle)",
          }}
        >
          {classDetail.type} · Instructed by {classDetail.instructor}
        </p>

        <p
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            lineHeight: "20px",
            color: "var(--linear-color-ink-subtle)",
          }}
        >
          {classDetail.description}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <ClassMetaItem icon={<CalendarDays size={14} strokeWidth={1.75} />}>
          {classDetail.date}
        </ClassMetaItem>
        <ClassMetaItem icon={<Clock size={14} strokeWidth={1.75} />}>
          {classDetail.time}
        </ClassMetaItem>
        <ClassMetaItem icon={<MapPin size={14} strokeWidth={1.75} />}>
          {classDetail.location}
        </ClassMetaItem>
        <ClassMetaItem icon={<User size={14} strokeWidth={1.75} />}>
          {classDetail.instructor}
        </ClassMetaItem>
      </div>
    </header>
  );
}
