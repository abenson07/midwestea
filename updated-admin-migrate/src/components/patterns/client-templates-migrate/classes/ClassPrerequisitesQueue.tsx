"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import type { ClassPrerequisiteSubmission } from "./classMocks";

function DocumentLightbox({
  submission,
  onClose,
}: {
  submission: ClassPrerequisiteSubmission;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (!panelRef.current?.contains(event.target as Node)) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.72)",
        padding: 24,
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={submission.type}
        style={{
          position: "relative",
          boxSizing: "border-box",
          width: 480,
          maxWidth: "100%",
          padding: "40px 36px",
          background: "var(--linear-color-panel)",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          borderRadius: "var(--linear-radius-md)",
          boxShadow: "var(--linear-shadow-canvas)",
        }}
      >
        <div style={{ position: "absolute", top: 12, right: 12 }}>
          <IconButton
            label="Close"
            variant="ghost"
            size="sm"
            icon={<X size={16} strokeWidth={1.75} />}
            onClick={onClose}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            textAlign: "center",
          }}
        >
          <Text size="sm" color="secondary">
            {submission.issuer}
          </Text>
          <Text weight="semibold" style={{ fontSize: 18, lineHeight: "24px" }}>
            {submission.type}
          </Text>
          <Text color="secondary">This certifies that</Text>
          <Text weight="semibold" style={{ fontSize: 20, lineHeight: "28px" }}>
            {submission.student}
          </Text>
          <Text size="sm" color="secondary">
            Document on file · Issued {submission.issuedOn}
          </Text>
        </div>
      </div>
    </div>
  );
}

export type ClassPrerequisitesQueueProps = {
  submissions: ClassPrerequisiteSubmission[];
};

/** Pending prerequisite approvals — card chrome, mirrors `ClassEmptyPanel`. */
export function ClassPrerequisitesQueue({ submissions }: ClassPrerequisitesQueueProps) {
  const [rows, setRows] = useState(submissions);
  const [viewing, setViewing] = useState<ClassPrerequisiteSubmission | null>(null);

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  const columns: TableColumn<ClassPrerequisiteSubmission>[] = [
    {
      key: "student",
      header: "Student",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <>
          <Avatar name={row.student} size="sm" />
          <span style={{ marginInlineStart: 8 }}>{row.student}</span>
        </>
      ),
    },
    {
      key: "type",
      header: "Prerequisite",
      width: proportional(1.2, { minWidth: 160 }),
      renderCell: (row) => (
        <button
          type="button"
          onClick={() => setViewing(row)}
          style={{
            all: "unset",
            cursor: "pointer",
            color: "var(--linear-color-ink)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {row.type}
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      width: pixel(80),
      renderCell: (row) => (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
          <IconButton
            label={`Approve ${row.type} for ${row.student}`}
            variant="ghost"
            size="sm"
            icon={<Check size={15} strokeWidth={2} color="#27a644" />}
            onClick={() => {
              removeRow(row.id);
              toast.success(`Approved ${row.student}'s ${row.type}`);
            }}
          />
          <IconButton
            label={`Reject ${row.type} for ${row.student}`}
            variant="ghost"
            size="sm"
            icon={<X size={15} strokeWidth={2} />}
            onClick={() => {
              removeRow(row.id);
              toast.success(`Rejected ${row.student}'s ${row.type}`);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <section
      data-slot="class-prerequisites-queue"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 20,
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        borderRadius: "var(--linear-radius-md)",
        background: "var(--linear-color-panel)",
      }}
    >
      <Text weight="semibold">Prerequisites</Text>
      {rows.length ? (
        <GroupedTable
          data={rows}
          columns={columns}
          getRowKey={(row) => row.id}
          appearance="nested"
          listChrome={false}
        />
      ) : (
        <Text size="sm" color="secondary">
          No prerequisites to review.
        </Text>
      )}
      {viewing ? <DocumentLightbox submission={viewing} onClose={() => setViewing(null)} /> : null}
    </section>
  );
}
