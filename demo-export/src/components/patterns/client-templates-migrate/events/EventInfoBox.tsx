"use client";

import type { ReactNode } from "react";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";
import type { EventDetail } from "@/data/mocks/events";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";

export type EventInfoBoxProps = {
  event: EventDetail;
  onEditDetails?: () => void;
};

function EventMetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
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
 * Top bounding box for the event detail page — title, committee/organizer
 * summary, and key event metadata. Mirrors `ClassInfoBox`.
 */
export function EventInfoBox({ event, onEditDetails }: EventInfoBoxProps) {
  return (
    <header
      data-slot="event-info-box"
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
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
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
            {event.title}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: "20px",
              color: "var(--linear-color-ink-subtle)",
            }}
          >
            {COMMITTEE_LABELS[event.committee]} · Organized by {event.organizer}
          </p>

          <p
            style={{
              margin: "8px 0 0",
              fontSize: 13,
              lineHeight: "20px",
              color: "var(--linear-color-ink-subtle)",
            }}
          >
            {event.description}
          </p>
        </div>
        {onEditDetails ? (
          <Button label="Edit details" variant="secondary" size="sm" onClick={onEditDetails} />
        ) : null}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <EventMetaItem icon={<CalendarDays size={14} strokeWidth={1.75} />}>
          {event.date}
        </EventMetaItem>
        <EventMetaItem icon={<Clock size={14} strokeWidth={1.75} />}>{event.time}</EventMetaItem>
        <EventMetaItem icon={<MapPin size={14} strokeWidth={1.75} />}>
          {event.location}
        </EventMetaItem>
        <EventMetaItem icon={<User size={14} strokeWidth={1.75} />}>
          {event.organizer}
        </EventMetaItem>
      </div>
    </header>
  );
}
