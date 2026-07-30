"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  Table,
  useTableGroupedRows,
  type TableColumn,
  type TableDensity,
  type TableDividers,
  type TablePlugin,
} from "@astryxdesign/core/Table";
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
   * When set, rows collapse into Astryx grouped section headers.
   * Omit for a flat table (same component, no grouping plugin).
   */
  groupBy?: (item: T) => string;
  /** Per-group color / display overrides for the Linear header. */
  getGroupMeta?: (groupKey: string) => GroupMeta | undefined;
  /** Trailing “+” on each Linear group header. */
  onAddToGroup?: (groupKey: string) => void;
  /** Fully replace the Linear header content (still to the right of Astryx chevron). */
  renderGroupHeader?: (
    groupKey: string,
    count: number,
    collapsed: boolean,
  ) => ReactNode;
  groupOrder?: string[];
  defaultCollapsedGroups?: Iterable<string>;
  collapsedGroups?: Set<string>;
  onCollapsedGroupsChange?: (next: Set<string>) => void;
  density?: TableDensity;
  dividers?: TableDividers;
  hasHover?: boolean;
  plugins?: Record<string, TablePlugin<T>>;
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
 * Astryx Table + `useTableGroupedRows`, with Linear-style group headers by default.
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
  density = "compact",
  dividers = "none",
  hasHover = true,
  plugins: extraPlugins,
  appearance = "page",
  listChrome,
}: GroupedTableProps<T>) {
  const resolvedListChrome =
    listChrome ?? (appearance === "page");
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(
    () => new Set(defaultCollapsedGroups ?? []),
  );

  const isControlled = collapsedProp !== undefined;
  const collapsedGroups = isControlled
    ? collapsedProp
    : uncontrolledCollapsed;

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

  const defaultHeader = useCallback(
    (groupKey: string, count: number) => {
      const meta = getGroupMeta?.(groupKey);
      return (
        <LinearGroupHeader
          label={meta?.label ?? groupKey}
          count={count}
          color={meta?.color}
          onAdd={onAddToGroup ? () => onAddToGroup(groupKey) : undefined}
          addLabel={`Add to ${meta?.label ?? groupKey}`}
        />
      );
    },
    [getGroupMeta, onAddToGroup],
  );

  const grouped = useTableGroupedRows<T>({
    data,
    groupBy: groupBy ?? (() => ""),
    collapsedGroups,
    onToggleGroup,
    getRowKey,
    renderGroupHeader: renderGroupHeader ?? defaultHeader,
    groupOrder,
  });

  const isGrouped = groupBy != null;

  const plugins = useMemo(() => {
    if (!isGrouped) return extraPlugins;
    return {
      ...extraPlugins,
      grouped: grouped.plugin,
    };
  }, [extraPlugins, grouped.plugin, isGrouped]);

  return (
    <div
      data-slot="grouped-table"
      data-list-chrome={resolvedListChrome ? "true" : "false"}
      data-appearance={appearance}
      style={{ height: appearance === "page" ? "100%" : "auto", minHeight: 0 }}
    >
      <Table
        data={isGrouped ? grouped.data : data}
        columns={columns}
        idKey={isGrouped ? grouped.idKey : getRowKey}
        density={density}
        dividers={dividers}
        hasHover={hasHover}
        plugins={plugins}
        textOverflow="wrap"
      />
    </div>
  );
}
