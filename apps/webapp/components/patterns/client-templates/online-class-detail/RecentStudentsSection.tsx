"use client";

import { useMemo } from "react";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import {
  sampleOnlineClassStudents,
  type OnlineClassStudentRow,
} from "@/data/mocks/online-class-detail";
import { buildStudentColumns } from "./studentColumns";

const recentStudentRows: OnlineClassStudentRow[] = sampleOnlineClassStudents
  .slice()
  .sort((a, b) => Date.parse(b.enrolledAt) - Date.parse(a.enrolledAt))
  .slice(0, 5);

export type RecentStudentsSectionProps = {
  onSelectStudent?: (row: OnlineClassStudentRow) => void;
};

/**
 * Overview widget — most recently enrolled students. No invoices or
 * prerequisites apply to online classes, so this replaces those sections;
 * see `AllStudentsPage` for the full roster.
 */
export function RecentStudentsSection({ onSelectStudent }: RecentStudentsSectionProps) {
  const columns = useMemo(() => buildStudentColumns(onSelectStudent), [onSelectStudent]);

  return (
    <NestedGroupedTable
      title="Recent Students"
      data={recentStudentRows}
      columns={columns}
      getRowKey={(row) => row.id}
    />
  );
}
