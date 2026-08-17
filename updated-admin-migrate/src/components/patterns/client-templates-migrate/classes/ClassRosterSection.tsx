"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import type { ClassRosterRow } from "./classMocks";

type Subview = "status" | "role";

const STATUS_ORDER = ["Enrolled", "Waitlisted"];
const STATUS_COLOR: Record<string, string> = {
  Enrolled: "#27a644",
  Waitlisted: "#f2c94c",
};

export type ClassRosterSectionProps = {
  rows: ClassRosterRow[];
};

/** Bottom roster table — mirrors the Volunteers tab's `NestedGroupedTable` (By status / By ask). */
export function ClassRosterSection({ rows }: ClassRosterSectionProps) {
  const [subview, setSubview] = useState<Subview>("status");

  const columns = useMemo<TableColumn<ClassRosterRow>[]>(() => {
    const cols: TableColumn<ClassRosterRow>[] = [
      {
        key: "name",
        header: "Name",
        width: proportional(1, { minWidth: 160 }),
        renderCell: (row) => (
          <RowClickCell>
            <Avatar name={row.name} size="sm" />
            <span style={{ marginInlineStart: 8 }}>{row.name}</span>
          </RowClickCell>
        ),
      },
      {
        key: "email",
        header: "Email",
        width: pixel(200),
        renderCell: (row) => (
          <RowClickCell>
            <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
          </RowClickCell>
        ),
      },
    ];
    cols.push(
      subview === "status"
        ? {
            key: "role",
            header: "Role",
            width: pixel(140),
            renderCell: (row) => (
              <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.role}</span>
            ),
          }
        : {
            key: "status",
            header: "Status",
            width: pixel(140),
            renderCell: (row) => (
              <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.status}</span>
            ),
          },
    );
    return cols;
  }, [subview]);

  return (
    <section
      data-slot="class-roster-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Text weight="semibold">Students</Text>
      <ViewTabs aria-label="Students grouping">
        <ViewTab
          label="By status"
          selected={subview === "status"}
          onClick={() => setSubview("status")}
        />
        <ViewTab label="By role" selected={subview === "role"} onClick={() => setSubview("role")} />
      </ViewTabs>
      <GroupedTable
        data={rows}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => (subview === "status" ? row.status : row.role)}
        groupOrder={subview === "status" ? STATUS_ORDER : undefined}
        getGroupMeta={(key) => (subview === "status" ? { color: STATUS_COLOR[key], label: key } : { label: key })}
        listChrome
      />
    </section>
  );
}
