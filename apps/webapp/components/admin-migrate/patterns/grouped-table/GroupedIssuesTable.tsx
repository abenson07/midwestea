"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/admin-migrate/patterns/primitives/Avatar";
import { Calendar, Circle, MoreHorizontal } from "lucide-react";
import {
  pixel,
  proportional,
  type TableColumn,
} from "@/components/admin-migrate/patterns/primitives/table";
import {
  sampleGroupedIssues,
  type GroupedIssueRow,
} from "@/data/mocks/grouped-issues";
import { GroupedTable } from "./GroupedTable";

const groupColors: Record<string, string> = {
  MLCC: "#27a644",
  MWO: "#f2c94c",
  Personal: "#5e6ad2",
};

const GROUP_ORDER = ["MLCC", "MWO", "Personal"];

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: "var(--linear-color-sidebar-item-selected)",
        color: "var(--linear-color-ink-subtle)",
        fontSize: 12,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const columns: TableColumn<GroupedIssueRow>[] = [
  {
    key: "menu",
    header: "",
    width: pixel(28),
    renderCell: () => (
      <MoreHorizontal
        size={14}
        strokeWidth={1.75}
        style={{ color: "var(--linear-color-ink-subtle)", opacity: 0.7 }}
      />
    ),
  },
  {
    key: "id",
    header: "ID",
    width: pixel(88),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)", fontSize: 13 }}>
        {row.id}
      </span>
    ),
  },
  {
    key: "status",
    header: "",
    width: pixel(28),
    renderCell: () => (
      <Circle
        size={14}
        strokeWidth={1.75}
        style={{ color: "var(--linear-color-ink-subtle)" }}
      />
    ),
  },
  {
    key: "title",
    header: "Title",
    width: proportional(1, { minWidth: 180 }),
    renderCell: (row) => (
      <span
        style={{
          color: "var(--linear-color-ink)",
          fontSize: 13,
          fontWeight: 400,
        }}
      >
        {row.title}
      </span>
    ),
  },
  {
    key: "group",
    header: "Project",
    width: pixel(96),
    renderCell: (row) => (
      <MetaPill>
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: groupColors[row.group] ?? "#8a8f98",
          }}
        />
        {row.group}
      </MetaPill>
    ),
  },
  {
    key: "dueDate",
    header: "Due",
    width: pixel(96),
    renderCell: (row) =>
      row.dueDate ? (
        <MetaPill>
          <Calendar size={12} strokeWidth={2} color="#eb5757" />
          {row.dueDate}
        </MetaPill>
      ) : null,
  },
  {
    key: "assignee",
    header: "Assignee",
    width: pixel(36),
    renderCell: (row) => <Avatar name={row.assignee} size="sm" />,
  },
  {
    key: "updatedAt",
    header: "Updated",
    width: pixel(56),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)", fontSize: 13 }}>
        {row.updatedAt}
      </span>
    ),
  },
];

export type GroupedIssuesTableProps = {
  /** When false, renders the same rows flat (no group headers). @default true */
  grouped?: boolean;
};

/**
 * Sample Linear-style grouped issues list — shared by gallery + Foundation canvas.
 */
export function GroupedIssuesTable({
  grouped = true,
}: GroupedIssuesTableProps) {
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <GroupedTable
      data={sampleGroupedIssues}
      columns={columns}
      getRowKey={(row) => row.id}
      groupBy={grouped ? (row) => row.group : undefined}
      groupOrder={groupOrder}
      getGroupMeta={(key) => ({
        color: groupColors[key],
        label: key,
      })}
      onAddToGroup={() => {}}
      listChrome
    />
  );
}
