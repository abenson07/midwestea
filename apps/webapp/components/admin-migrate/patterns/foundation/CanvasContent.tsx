"use client";

import type { ReactNode } from "react";
import { GroupedIssuesTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedIssuesTable";
import { MixedContentView } from "@/components/admin-migrate/patterns/foundation/mixed-content";

/**
 * Canvas body variants for Foundation.
 * Extend this union as new view surfaces are added (board, timeline, …).
 */
export type CanvasContentVariant = "empty" | "grouped-table" | "mixed-content";

export type CanvasContentProps = {
  variant?: CanvasContentVariant;
  /**
   * When the variant includes a table, whether rows are grouped.
   * Applies to both `grouped-table` and `mixed-content`. @default true
   */
  grouped?: boolean;
  /** Escape hatch — wins over `variant` when provided. */
  children?: ReactNode;
};

/**
 * Switches Foundation canvas body by variant.
 */
export function CanvasContent({
  variant = "empty",
  grouped = true,
  children,
}: CanvasContentProps) {
  if (children != null) return <>{children}</>;

  switch (variant) {
    case "grouped-table":
      return (
        <div style={{ height: "100%", minHeight: 0 }}>
          <GroupedIssuesTable grouped={grouped} />
        </div>
      );
    case "mixed-content":
      return <MixedContentView grouped={grouped} />;
    case "empty":
    default:
      return null;
  }
}
