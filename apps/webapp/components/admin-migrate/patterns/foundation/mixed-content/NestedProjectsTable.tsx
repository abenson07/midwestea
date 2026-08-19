"use client";

import { useMemo } from "react";
import { CircleDashed, Hexagon } from "lucide-react";
import {
  pixel,
  proportional,
  type TableColumn,
} from "@/components/admin-migrate/patterns/primitives/table";
import {
  sampleNestedProjects,
  type NestedProjectRow,
} from "@/data/mocks/nested-projects";
import { NestedGroupedTable } from "@/components/admin-migrate/patterns/grouped-table/NestedGroupedTable";

const GROUP_ORDER = [
  "In Progress",
  "Ready to Build",
  "Scoping",
  "Backlog",
];

const groupColors: Record<string, string> = {
  "In Progress": "#f2c94c",
  "Ready to Build": "#5e6ad2",
  Scoping: "#4db6ac",
  Backlog: "#8a8f98",
};

function StatusRing({ percent, color }: { percent: number; color: string }) {
  const size = 16;
  const stroke = 2;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, percent)) / 100) * c;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: "var(--linear-color-ink-subtle)",
        fontSize: 13,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--linear-color-hairline)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {percent}%
    </span>
  );
}

const columns: TableColumn<NestedProjectRow>[] = [
  {
    key: "name",
    header: "Name",
    width: proportional(1, { minWidth: 200 }),
    renderCell: (row) => (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          minWidth: 0,
        }}
      >
        <Hexagon
          size={14}
          strokeWidth={2}
          style={{ color: row.color, flexShrink: 0 }}
        />
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: "var(--linear-color-ink)",
          }}
        >
          {row.name}
        </span>
      </span>
    ),
  },
  {
    key: "health",
    header: "Health",
    width: pixel(120),
    renderCell: (row) => (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color:
            row.health.startsWith("On track")
              ? "#27a644"
              : "var(--linear-color-ink-subtle)",
          fontSize: 13,
        }}
      >
        <CircleDashed size={14} strokeWidth={1.75} />
        {row.health}
      </span>
    ),
  },
  {
    key: "priority",
    header: "Priority",
    width: pixel(72),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)" }}>
        {row.priority}
      </span>
    ),
  },
  {
    key: "lead",
    header: "Lead",
    width: pixel(56),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.lead}</span>
    ),
  },
  {
    key: "targetDate",
    header: "Target date",
    width: pixel(96),
    renderCell: (row) => (
      <span style={{ color: "var(--linear-color-ink-subtle)" }}>
        {row.targetDate}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    width: pixel(72),
    renderCell: (row) => (
      <StatusRing percent={row.statusPercent} color={row.color} />
    ),
  },
];

export type NestedProjectsTableProps = {
  /** When false, renders the same rows flat (no group headers). @default true */
  grouped?: boolean;
};

/**
 * Sample nested projects table for mixed-content / initiative pages.
 */
export function NestedProjectsTable({
  grouped = true,
}: NestedProjectsTableProps) {
  const groupOrder = useMemo(() => GROUP_ORDER, []);

  return (
    <NestedGroupedTable
      title="Projects"
      data={sampleNestedProjects}
      columns={columns}
      getRowKey={(row) => row.id}
      groupBy={grouped ? (row) => row.group : undefined}
      groupOrder={groupOrder}
      getGroupMeta={(key) => ({
        color: groupColors[key],
        label: key,
      })}
    />
  );
}
