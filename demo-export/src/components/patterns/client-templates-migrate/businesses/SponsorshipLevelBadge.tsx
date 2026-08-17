"use client";

import type { SponsorshipLevel } from "./types";

const LABEL: Record<SponsorshipLevel, string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

const COLOR: Record<SponsorshipLevel, string> = {
  platinum: "#5e6ad2",
  gold: "#f2994a",
  silver: "#8a8f98",
  bronze: "#a1662f",
};

export type SponsorshipLevelBadgeProps = {
  level: SponsorshipLevel;
};

/** Colored level pill for a sponsor row. */
export function SponsorshipLevelBadge({ level }: SponsorshipLevelBadgeProps) {
  const color = COLOR[level];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: `${color}1A`,
        color,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {LABEL[level]}
    </span>
  );
}
