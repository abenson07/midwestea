"use client";

import type { ReactNode } from "react";
import { ListFilter, Plus } from "lucide-react";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { GroupedTable, type GroupedTableProps } from "./GroupedTable";
import { LinearGroupHeader } from "./LinearGroupHeader";

export type NestedGroupedTableProps<T extends Record<string, unknown>> = Omit<
  GroupedTableProps<T>,
  "appearance" | "listChrome"
> & {
  /** Section title, or custom left-slot content (e.g. view tabs). */
  title?: ReactNode;
  titleActions?: ReactNode;
  onFilterClick?: () => void;
  onAddClick?: () => void;
};

/**
 * Grouped table nested under mixed-content pages:
 * section title + visible column headers + quieter group chrome.
 */
export function NestedGroupedTable<T extends Record<string, unknown>>({
  title = "Projects",
  titleActions,
  onFilterClick,
  onAddClick,
  renderGroupHeader,
  onAddToGroup,
  getGroupMeta,
  ...tableProps
}: NestedGroupedTableProps<T>) {
  const nestedHeader =
    renderGroupHeader ??
    ((groupKey: string, count: number) => {
      const meta = getGroupMeta?.(groupKey);
      return (
        <LinearGroupHeader
          label={meta?.label ?? groupKey}
          count={count}
          tone="muted"
          onAdd={onAddToGroup ? () => onAddToGroup(groupKey) : undefined}
          addLabel={`Add to ${meta?.label ?? groupKey}`}
        />
      );
    });

  return (
    <section
      data-slot="nested-grouped-table"
      style={{ display: "flex", flexDirection: "column", gap: 4 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          minHeight: 32,
          paddingInline: 4,
        }}
      >
        {typeof title === "string" ? (
          <h2
            style={{
              margin: 0,
              fontSize: 13,
              lineHeight: "20px",
              fontWeight: 500,
              color: "var(--linear-color-ink)",
            }}
          >
            {title}
          </h2>
        ) : (
          title
        )}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
          {titleActions}
          <IconButton
            label="Filter"
            variant="ghost"
            size="sm"
            icon={<ListFilter size={14} strokeWidth={2} />}
            onClick={onFilterClick}
          />
          <IconButton
            label="Add"
            variant="ghost"
            size="sm"
            icon={<Plus size={14} strokeWidth={2} />}
            onClick={onAddClick}
          />
        </div>
      </div>

      <GroupedTable
        {...tableProps}
        appearance="nested"
        listChrome={false}
        getGroupMeta={getGroupMeta}
        onAddToGroup={onAddToGroup}
        renderGroupHeader={nestedHeader}
      />
    </section>
  );
}
