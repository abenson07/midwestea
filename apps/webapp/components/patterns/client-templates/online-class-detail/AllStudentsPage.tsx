"use client";

import { useMemo } from "react";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import {
  sampleOnlineClassStudents,
  type OnlineClassStudentRow,
} from "@/data/mocks/online-class-detail";
import { buildStudentColumns } from "./studentColumns";

export type AllStudentsPageProps = {
  onSelectStudent?: (row: OnlineClassStudentRow) => void;
};

/**
 * Full-width "All Students" list — a flat table (no invoice/prerequisite
 * grouping applies to online classes) of everyone enrolled, waitlisted, or
 * withdrawn from this class.
 */
export function AllStudentsPage({ onSelectStudent }: AllStudentsPageProps) {
  const columns = useMemo(() => buildStudentColumns(onSelectStudent), [onSelectStudent]);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable
        data={sampleOnlineClassStudents}
        columns={columns}
        getRowKey={(row) => row.id}
        listChrome
      />
    </div>
  );
}
