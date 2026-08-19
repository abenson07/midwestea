"use client";

import { useMemo } from "react";
import { pixel, type TableColumn } from "@/components/admin-migrate/patterns/primitives/table";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/admin-migrate/patterns/client-templates/shared";
import { catalogKindForClass, splitClassesByStatus } from "../catalog/catalogMocks";
import { buildClassTableColumns, classDateLabel, startOfToday } from "./classTableColumns";
import type { ClassDetail } from "./classMocks";

export type ClassesTableProps = {
  data: ClassDetail[];
  onSelect: (row: ClassDetail) => void;
  /** Real enrollment counts (step 2). When omitted, falls back to the mock roster lookup. */
  enrolledCounts?: Map<string, number>;
};

/** Flat classes roster: name plus the program/course class-table columns (dates, enrolled). */
export function ClassesTable({ data, onSelect, enrolledCounts }: ClassesTableProps) {
  const closedIds = useMemo(() => {
    const { past } = splitClassesByStatus(data);
    return new Set(past.map((row) => row.id));
  }, [data]);

  const columns = useMemo(() => {
    const base = buildClassTableColumns({
      onSelect,
      dateLabel: (row) => classDateLabel(row, startOfToday(), closedIds.has(row.id)),
      enrolledCounts,
    });
    const typeColumn: TableColumn<ClassDetail> = {
      key: "type",
      header: "Type",
      width: pixel(100),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{catalogKindForClass(row)}</span>
        </RowClickCell>
      ),
    };
    return [base[0], typeColumn, ...base.slice(1)];
  }, [onSelect, closedIds, enrolledCounts]);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable data={data} columns={columns} getRowKey={(row) => row.id} listChrome />
    </div>
  );
}
