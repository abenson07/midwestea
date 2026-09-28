import type { PrerequisiteItemStatus } from "./classMocks";

/** Single source of truth for prerequisite status labels + badge colors. */
export const PREREQUISITE_STATUS_LABEL: Record<PrerequisiteItemStatus, string> = {
  not_started: "Not started",
  pending_review: "Pending review",
  approved: "Approved",
  expired: "Expired",
  needs_resubmission: "Needs resubmission",
  optional: "Optional",
  expires_before_class_starts: "Expires before class starts",
};

export const PREREQUISITE_STATUS_COLOR: Record<PrerequisiteItemStatus, string> = {
  not_started: "#8a8f98",
  pending_review: "#f2994a",
  approved: "#27a644",
  expired: "#eb5757",
  needs_resubmission: "#eb5757",
  optional: "#8a8f98",
  expires_before_class_starts: "#f2c94c",
};
