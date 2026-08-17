"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import type { ClassRosterRow } from "./classMocks";

const STATUS_ORDER = ["Enrolled", "Waitlisted"];
const STATUS_COLOR: Record<string, string> = {
  Enrolled: "#27a644",
  Waitlisted: "#f2c94c",
};

const STATUS_OPTIONS = [
  { value: "Enrolled", label: "Enrolled" },
  { value: "Waitlisted", label: "Waitlisted" },
];

const ROLE_OPTIONS = [
  { value: "Student", label: "Student" },
  { value: "Instructor", label: "Instructor" },
];

const columns: TableColumn<ClassRosterRow>[] = [
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
  {
    key: "role",
    header: "Role",
    width: pixel(140),
    renderCell: (row) => <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.role}</span>,
  },
];

export type ClassRosterSectionProps = {
  rows: ClassRosterRow[];
};

export function ClassRosterSection({ rows }: ClassRosterSectionProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (
        query &&
        !row.name.toLowerCase().includes(query) &&
        !row.email.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (statusFilter.length && !statusFilter.includes(row.status)) return false;
      if (roleFilter.length && !roleFilter.includes(row.role)) return false;
      return true;
    });
  }, [rows, search, statusFilter, roleFilter]);

  return (
    <section
      data-slot="class-roster-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Text weight="semibold">Students</Text>
        <ListToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search students…"
          filterGroups={[
            { label: "Status", options: STATUS_OPTIONS, selected: statusFilter, onChange: setStatusFilter },
            { label: "Role", options: ROLE_OPTIONS, selected: roleFilter, onChange: setRoleFilter },
          ]}
        />
      </div>
      <GroupedTable
        data={filteredRows}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={(row) => row.status}
        groupOrder={STATUS_ORDER}
        getGroupMeta={(key) => ({ color: STATUS_COLOR[key], label: key })}
        listChrome
      />
    </section>
  );
}
