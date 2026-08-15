"use client";

import type { PrerequisiteStatus } from "@midwestea/types";
import { PREREQUISITE_STATUS_LABELS } from "@midwestea/types";

interface PrerequisiteStatusBadgeProps {
  status: PrerequisiteStatus;
  className?: string;
}

// Fixed, one Tailwind class set per status. This is the single rendering of
// prerequisite status in the app -- reused by BEN-869 for staff views. Do
// not let a second badge implementation appear anywhere.
const STATUS_CLASSES: Record<PrerequisiteStatus, string> = {
  satisfied: "bg-green-100 text-green-800",
  pending_review: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-red-100 text-red-800",
  expiring_before_class: "bg-amber-100 text-amber-800",
  missing: "bg-gray-100 text-gray-800",
  not_required: "bg-gray-100 text-gray-600",
};

/**
 * Exhaustive over PrerequisiteStatus -- no `default` branch, so a future
 * status value fails type-checking rather than rendering blank.
 */
export function PrerequisiteStatusBadge({ status, className }: PrerequisiteStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[status]} ${className ?? ""}`}
    >
      {PREREQUISITE_STATUS_LABELS[status]}
    </span>
  );
}
