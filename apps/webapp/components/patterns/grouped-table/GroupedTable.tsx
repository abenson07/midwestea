"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { columnsToGridTemplate, type TableColumn } from "@/components/patterns/primitives/table";
import { LinearGroupHeader } from "./LinearGroupHeader";
import "./grouped-table.css";

export type GroupMeta = {
  color?: string;
  label?: string;
};

export type GroupedTableProps<T extends Record<string, unknown>> = {
  data: T[];
  columns: TableColumn<T>[];
  getRowKey: (item: T) => string;
  /**
   * When set, rows collapse into Linear-style grouped section headers.
   * Omit for a flat table (same component, no grouping).
   */
  groupBy?: (item: T) => string;
  /** Per-group color / display overrides for the Linear header. */
  getGroupMeta?: (groupKey: string) => GroupMeta | undefined;
  /** Trailing “+” on each Linear group header. */
  onAddToGroup?: (groupKey: string) => void;
  /** Fully replace the Linear header content (still to the right of the chevron). */
  renderGroupHeader?: (
    groupKey: string,
    count: number,
    collapsed: boolean,
  ) => ReactNode;
  groupOrder?: string[];
  defaultCollapsedGroups?: Iterable<string>;
  collapsedGroups?: Set<string>;
  onCollapsedGroupsChange?: (next: Set<string>) => void;
  hasHover?: boolean;
  /** Show the column header row. @default true */
  showHeader?: boolean;
  /**
   * Linear list chrome: 44px rows, muted cells, no column header bar, no dividers.
   * @default true when appearance is `"page"`; ignored for `"nested"` (nested has its own chrome).
   */
  listChrome?: boolean;
  /**
   * - `page` — full canvas list (hide thead, bold group headers)
   * - `nested` — detail-page section (visible thead, quieter groups)
   * @default "page"
   */
  appearance?: "page" | "nested";
};

/**
 * Plain grid-based table with Linear-style collapsible group headers.
 */
export function GroupedTable<T extends Record<string, unknown>>({
  data,
  columns,
  getRowKey,
  groupBy,
  getGroupMeta,
  onAddToGroup,
  renderGroupHeader,
  groupOrder,
  defaultCollapsedGroups,
  collapsedGroups: collapsedProp,
  onCollapsedGroupsChange,
  hasHover = true,
  showHeader = true,
  appearance = "page",
  listChrome,
}: GroupedTableProps<T>) {
  const resolvedListChrome = listChrome ?? appearance === "page";
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(
    () => new Set(defaultCollapsedGroups ?? []),
  );

  const isControlled = collapsedProp !== undefined;
  const collapsedGroups = isControlled ? collapsedProp : uncontrolledCollapsed;

  const setCollapsedGroups = useCallback(
    (next: Set<string>) => {
      if (!isControlled) setUncontrolledCollapsed(next);
      onCollapsedGroupsChange?.(next);
    },
    [isControlled, onCollapsedGroupsChange],
  );

  const onToggleGroup = useCallback(
    (key: string) => {
      const next = new Set(collapsedGroups);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setCollapsedGroups(next);
    },
    [collapsedGroups, setCollapsedGroups],
  );

  const groups = useMemo(() => {
    if (!groupBy) return null;
    const byKey = new Map<string, T[]>();
    for (const item of data) {
      const key = groupBy(item);
      if (!byKey.has(key)) byKey.set(key, []);
      byKey.get(key)!.push(item);
    }
    const order = groupOrder ?? Array.from(byKey.keys());
    return order
      .filter((key) => byKey.has(key))
      .map((key) => ({ key, items: byKey.get(key)! }));
  }, [data, groupBy, groupOrder]);

  const gridTemplateColumns = useMemo(() => columnsToGridTemplate(columns), [columns]);

  const renderRow = useCallback(
    (item: T) => (
      <div
        key={getRowKey(item)}
        className="grouped-table-row"
        data-hover={hasHover ? "true" : undefined}
        style={{ display: "grid", gridTemplateColumns }}
      >
        {columns.map((column) => (
          <div key={column.key} className="grouped-table-cell">
            {column.renderCell(item)}
          </div>
        ))}
      </div>
    ),
    [columns, getRowKey, gridTemplateColumns, hasHover],
  );

  return (
    <div
      data-slot="grouped-table"
      data-list-chrome={resolvedListChrome ? "true" : "false"}
      data-appearance={appearance}
      data-grouped={groups ? "true" : "false"}
      style={{
        height: appearance === "page" ? "100%" : "auto",
        minHeight: 0,
        overflow: appearance === "page" ? "auto" : "visible",
      }}
    >
      {showHeader ? (
        <div
          className="grouped-table-header-row"
          style={{ display: "grid", gridTemplateColumns }}
        >
          {columns.map((column) => (
            <div key={column.key} className="grouped-table-header-cell">
              {column.header}
            </div>
          ))}
        </div>
      ) : null}

      {groups
        ? groups.map(({ key, items }) => {
            const collapsed = collapsedGroups.has(key);
            const meta = getGroupMeta?.(key);
            const header = renderGroupHeader ? (
              renderGroupHeader(key, items.length, collapsed)
            ) : (
              <LinearGroupHeader
                label={meta?.label ?? key}
                count={items.length}
                color={meta?.color}
                onAdd={onAddToGroup ? () => onAddToGroup(key) : undefined}
                addLabel={`Add to ${meta?.label ?? key}`}
              />
            );
            return (
              <div key={key} className="grouped-table-group">
                <div
                  className="grouped-table-group-header"
                  onClick={() => onToggleGroup(key)}
                >
                  <ChevronRight
                    size={12}
                    strokeWidth={2}
                    style={{
                      color: "var(--linear-color-ink-subtle)",
                      flexShrink: 0,
                      transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
                      transition: "transform 0.1s ease",
                    }}
                  />
                  {header}
                </div>
                {!collapsed ? items.map(renderRow) : null}
              </div>
            );
          })
        : data.map(renderRow)}
    </div>
  );
}
