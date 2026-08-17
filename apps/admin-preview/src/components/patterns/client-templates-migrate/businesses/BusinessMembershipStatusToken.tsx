"use client";

import type { BusinessMembershipStatus } from "./types";

const LABEL: Record<BusinessMembershipStatus, string> = {
  active: "Active",
  past_due: "Past Due",
  pending: "Pending",
  lapsed: "Lapsed",
};

const COLOR: Record<BusinessMembershipStatus, string> = {
  active: "#27a644",
  past_due: "#eb5757",
  pending: "#f2994a",
  lapsed: "#8a8f98",
};

export type BusinessMembershipStatusTokenProps = {
  status: BusinessMembershipStatus;
};

/** Colored status pill for a business membership row. */
export function BusinessMembershipStatusToken({ status }: BusinessMembershipStatusTokenProps) {
  const color = COLOR[status];

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
      {LABEL[status]}
    </span>
  );
}
