"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/admin-migrate/patterns/primitives/Avatar";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";
import { pixel, proportional, type TableColumn } from "@/components/admin-migrate/patterns/primitives/table";
import { GroupedTable } from "@/components/admin-migrate/patterns/grouped-table/GroupedTable";
import { RowClickCell, useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { ClassSidebarSection } from "./ClassSidebarSection";
import { ClassPrerequisiteViewer, type ClassPrerequisiteDecision } from "./ClassPrerequisiteViewer";
import { classPrerequisiteQueueFor, type ClassDetail, type ClassPrerequisiteSubmission } from "./classMocks";
import { PREREQUISITE_STATUS_COLOR, PREREQUISITE_STATUS_LABEL } from "./prerequisiteStatus";

/** 12-column table. Table takes all 12 until a row is selected, then it shifts to 11 + a 1-column sidebar. */
const PREREQUISITES_GRID = { columns: 12, left: 11, right: 1, gap: 24 } as const;

export type ClassPrerequisitesPageProps = {
  classDetail: ClassDetail;
};

export function ClassPrerequisitesPage({ classDetail }: ClassPrerequisitesPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const live = useIsNewAdminMigrate();
  const rows = live ? [] : classPrerequisiteQueueFor(classDetail.id);
  const [decisions, setDecisions] = useState<Record<string, ClassPrerequisiteDecision>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(searchParams.get("submissionId"));

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  function selectSubmission(id: string | null) {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    if (id) params.set("submissionId", id);
    else params.delete("submissionId");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  function decide(row: ClassPrerequisiteSubmission, decision: ClassPrerequisiteDecision, reason?: string) {
    setDecisions((prev) => ({ ...prev, [row.id]: decision }));
    if (decision === "rejected" && reason) {
      setRejectReasons((prev) => ({ ...prev, [row.id]: reason }));
    }
    toast.success(`${decision === "approved" ? "Approved" : "Rejected"} ${row.student}'s ${row.type}`);
  }

  function undo(id: string) {
    setDecisions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setRejectReasons((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const columns: TableColumn<ClassPrerequisiteSubmission>[] = [
    {
      key: "student",
      header: "Student",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => selectSubmission(row.id)}>
          <Avatar name={row.student} size="sm" />
          <span
            style={{ marginInlineStart: 8, fontWeight: row.id === selectedId ? 600 : undefined }}
          >
            {row.student}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "type",
      header: "Prerequisite",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => selectSubmission(row.id)}>{row.type}</RowClickCell>
      ),
    },
    {
      key: "issuedOn",
      header: "Issued",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => selectSubmission(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.issuedOn}</span>
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "",
      width: pixel(100),
      renderCell: (row) => {
        const status =
          decisions[row.id] === "approved"
            ? "approved"
            : decisions[row.id] === "rejected"
              ? "needs_resubmission"
              : "pending_review";
        return (
          <RowClickCell onClick={() => selectSubmission(row.id)}>
            <span style={{ color: PREREQUISITE_STATUS_COLOR[status] }}>
              {PREREQUISITE_STATUS_LABEL[status]}
            </span>
          </RowClickCell>
        );
      },
    },
  ];

  return (
    <div
      style={{
        boxSizing: "border-box",
        padding: "32px 24px 64px",
        display: "grid",
        gridTemplateColumns: selected
          ? `repeat(${PREREQUISITES_GRID.left}, minmax(0, 1fr)) minmax(280px, 1fr)`
          : `repeat(${PREREQUISITES_GRID.columns}, minmax(0, 1fr))`,
        gap: PREREQUISITES_GRID.gap,
        alignItems: "start",
      }}
    >
      <div
        style={{
          gridColumn: `span ${selected ? PREREQUISITES_GRID.left : PREREQUISITES_GRID.columns}`,
          minWidth: 0,
        }}
      >
        {rows.length ? (
          <GroupedTable data={rows} columns={columns} getRowKey={(row) => row.id} listChrome />
        ) : (
          <Text color="secondary">No prerequisite submissions for this class.</Text>
        )}
      </div>

      {selected ? (
        <div style={{ gridColumn: `span ${PREREQUISITES_GRID.right}`, minWidth: 0 }}>
          <ClassSidebarSection
            title={selected.type}
            action={
              <IconButton
                label="Close"
                variant="ghost"
                size="sm"
                icon={<X size={14} strokeWidth={1.75} />}
                onClick={() => selectSubmission(null)}
              />
            }
          >
            <ClassPrerequisiteViewer
              submission={selected}
              decision={decisions[selected.id]}
              rejectReason={rejectReasons[selected.id]}
              onApprove={() => decide(selected, "approved")}
              onReject={(reason) => decide(selected, "rejected", reason)}
              onUndo={() => undo(selected.id)}
            />
          </ClassSidebarSection>
        </div>
      ) : null}
    </div>
  );
}
