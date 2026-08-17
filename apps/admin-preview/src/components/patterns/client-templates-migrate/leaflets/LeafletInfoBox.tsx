"use client";

import type { ReactNode } from "react";
import { CalendarDays, Clock } from "lucide-react";
import type { LeafletDetail } from "@/data/mocks/leaflets";

export type LeafletInfoBoxProps = {
  leaflet: LeafletDetail;
};

function LeafletMetaItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
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

function formatDistributionDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Top bounding box for the leaflet detail page — title, countdown, and
 * distribution date. Mirrors `EventInfoBox`.
 */
export function LeafletInfoBox({ leaflet }: LeafletInfoBoxProps) {
  return (
    <header
      data-slot="leaflet-info-box"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 20,
        background: "var(--linear-color-panel)",
        border:

          "var(--linear-border-width) solid var(--linear-color-panel-border)",
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
          {leaflet.title}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <LeafletMetaItem icon={<Clock size={14} strokeWidth={1.75} />}>
          {leaflet.countdownLabel}
        </LeafletMetaItem>
        <LeafletMetaItem icon={<CalendarDays size={14} strokeWidth={1.75} />}>
          Distribution: {formatDistributionDate(leaflet.distributionDate)}
        </LeafletMetaItem>
      </div>
    </header>
  );
}
