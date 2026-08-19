"use client";

import { useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { linearTokenVars } from "@/theme/linearTokens";
import type { StudentClass, StudentPaymentStatus, StudentRow } from "./types";

const PAYMENT_LABEL: Record<StudentPaymentStatus, string> = {
  paid: "Paid",
  "past-due": "Past due",
  pending: "Pending",
  na: "NA",
};

const PAYMENT_COLOR: Record<Exclude<StudentPaymentStatus, "na">, string> = {
  paid: "#27a644",
  "past-due": "#eb5757",
  pending: "#f2994a",
};

const CLASS_COUNT_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

function classCountLabel(count: number): string {
  const word = CLASS_COUNT_WORDS[count] ?? String(count);
  return `${word} ${count === 1 ? "class" : "classes"}`;
}

function PaymentStatusToken({ status }: { status: StudentPaymentStatus }) {
  if (status === "na") {
    return <span style={{ color: "var(--linear-color-ink-tertiary)" }}>NA</span>;
  }

  const color = PAYMENT_COLOR[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        paddingInline: 8,
        borderRadius: 999,
        background: `${color}1A`,
        color,
        fontSize: 12,
        fontWeight: 500,
        lineHeight: "16px",
        whiteSpace: "nowrap",
      }}
    >
      {PAYMENT_LABEL[status]}
    </span>
  );
}

function ClassesHover({ classes }: { classes: StudentClass[] }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const label = classCountLabel(classes.length);

  function show(event: MouseEvent<HTMLSpanElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setPos({ x: rect.left, y: rect.bottom + 6 });
  }

  return (
    <>
      <span
        onMouseEnter={show}
        onMouseLeave={() => setPos(null)}
        style={{
          color: "var(--linear-color-ink-subtle)",
          borderBottom: "1px dotted var(--linear-color-ink-tertiary)",
          cursor: "default",
        }}
      >
        {label}
      </span>
      {pos && typeof document !== "undefined"
        ? createPortal(
            <div
              role="tooltip"
              style={
                {
                  ...linearTokenVars,
                  position: "fixed",
                  left: pos.x,
                  top: pos.y,
                  zIndex: 80,
                  boxSizing: "border-box",
                  minWidth: 140,
                  padding: "6px 8px",
                  borderRadius: 8,
                  background: "var(--linear-color-side-panel)",
                  border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
                  boxShadow: "var(--linear-shadow-side-panel)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  pointerEvents: "none",
                } as CSSProperties
              }
            >
              {classes.map((item) => (
                <span
                  key={item.id}
                  style={{
                    color: "var(--linear-color-ink)",
                    fontSize: 12,
                    lineHeight: "18px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.name}
                </span>
              ))}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

function ClassesCell({ classes }: { classes: StudentClass[] }) {
  if (classes.length === 0) {
    return (
      <span style={{ color: "var(--linear-color-ink-tertiary)" }}>Not currently enrolled</span>
    );
  }
  if (classes.length === 1) {
    return <span style={{ color: "var(--linear-color-ink-subtle)" }}>{classes[0].name}</span>;
  }
  return <ClassesHover classes={classes} />;
}

function buildColumns(onSelect?: (id: string) => void): TableColumn<StudentRow>[] {
  const even = proportional(1, { minWidth: 140 });
  const click = (id: string) => (onSelect ? () => onSelect(id) : undefined);

  return [
    {
      key: "name",
      header: "Name",
      width: even,
      renderCell: (row) => (
        <RowClickCell onClick={click(row.id)}>
          <Avatar name={row.name} size="sm" />
          <span
            style={{
              marginInlineStart: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: "var(--linear-color-ink)",
            }}
          >
            {row.name}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: even,
      renderCell: (row) => (
        <RowClickCell onClick={click(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
        </RowClickCell>
      ),
    },
    {
      key: "classes",
      header: "Classes",
      width: even,
      renderCell: (row) => (
        <RowClickCell onClick={click(row.id)}>
          <ClassesCell classes={row.classes} />
        </RowClickCell>
      ),
    },
    {
      key: "payment",
      header: "Payment status",
      width: even,
      renderCell: (row) => (
        <RowClickCell onClick={click(row.id)}>
          <PaymentStatusToken status={row.paymentStatus} />
        </RowClickCell>
      ),
    },
    {
      key: "joined",
      header: "First enrolled",
      width: even,
      renderCell: (row) => (
        <RowClickCell onClick={click(row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.joinedAt}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type StudentsTableProps = {
  data?: StudentRow[];
  onSelect?: (id: string) => void;
};

/** Flat student roster: name, email, classes, payment status, and first enrolled. */
export function StudentsTable({ data = [], onSelect }: StudentsTableProps) {
  const columns = useMemo(() => buildColumns(onSelect), [onSelect]);

  return (
    <div style={{ height: "100%", minHeight: 0, boxSizing: "border-box", padding: "0 8px" }}>
      <GroupedTable data={data} columns={columns} getRowKey={(row) => row.id} listChrome />
    </div>
  );
}
