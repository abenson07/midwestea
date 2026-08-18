"use client";

import { useMemo, useState, type MouseEvent } from "react";
import { Bell, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { ListToolbar } from "@/components/patterns/foundation/ListToolbar";
import {
  rosterPaymentStatusFor,
  rosterPrerequisiteStatusFor,
  type ClassRosterRow,
  type RosterPaymentStatus,
} from "./classMocks";
import { PREREQUISITE_STATUS_COLOR, PREREQUISITE_STATUS_LABEL } from "./prerequisiteStatus";
import { useTransactions } from "../payments/useTransactions";
import type { TransactionRow } from "@/data/mocks/transactions";

const STATUS_ORDER = ["Enrolled", "Waitlisted"];
const STATUS_COLOR: Record<string, string> = {
  Enrolled: "#27a644",
  Waitlisted: "#f2c94c",
};

const STATUS_OPTIONS = [
  { value: "Enrolled", label: "Enrolled" },
  { value: "Waitlisted", label: "Waitlisted" },
];

const PAYMENT_LABEL: Record<RosterPaymentStatus, string> = {
  paid: "Paid",
  "partially-paid": "Partially paid",
  "past-due": "Past due",
  pending: "Pending",
  na: "NA",
};

const PAYMENT_COLOR: Record<Exclude<RosterPaymentStatus, "na">, string> = {
  paid: "#27a644",
  "partially-paid": "#f2c94c",
  "past-due": "#eb5757",
  pending: "#f2994a",
};

const certificateLinkStyle = {
  color: "var(--linear-color-accent)",
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
} as const;

function remindPrerequisite(name: string) {
  toast.success(`Reminder sent to ${name} — demo mode, not delivered`);
}

function StatusBadge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
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
      {label}
    </span>
  );
}

function PaymentStatusBadge({ status }: { status: RosterPaymentStatus }) {
  if (status === "na") {
    return <span style={{ color: "var(--linear-color-ink-tertiary)" }}>NA</span>;
  }
  return <StatusBadge label={PAYMENT_LABEL[status]} color={PAYMENT_COLOR[status]} />;
}

function stopRowClick(event: MouseEvent) {
  event.stopPropagation();
}

function buildColumns(
  onSelectStudent?: (id: string) => void,
  selectedStudentId?: string | null,
  showCertificates?: boolean,
  classId?: string,
  showPrerequisites?: boolean,
  onReviewPrerequisite?: (studentId: string) => void,
  invoices?: TransactionRow[],
): TableColumn<ClassRosterRow>[] {
  function selectIfStudent(row: ClassRosterRow) {
    return row.role === "Student" ? () => onSelectStudent?.(row.id) : undefined;
  }

  const even = proportional(1);
  const columns: TableColumn<ClassRosterRow>[] = [
    {
      key: "name",
      header: "Name",
      width: even,
      align: "start",
      renderCell: (row) => (
        <RowClickCell onClick={selectIfStudent(row)}>
          <Avatar name={row.name} size="sm" />
          <span
            style={{
              marginInlineStart: 8,
              fontWeight: row.id === selectedStudentId ? 600 : undefined,
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
      align: "start",
      renderCell: (row) => (
        <RowClickCell onClick={selectIfStudent(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.email}</span>
        </RowClickCell>
      ),
    },
  ];

  if (showPrerequisites && classId) {
    columns.push({
      key: "prerequisites",
      header: "Prerequisites",
      width: even,
      align: "start",
      renderCell: (row) => {
        if (row.role !== "Student" || row.status !== "Enrolled") {
          return <span style={{ color: "var(--linear-color-ink-subtle)" }}>—</span>;
        }
        const status = rosterPrerequisiteStatusFor(classId, row.id);
        if (status === "approved") {
          return (
            <StatusBadge
              label={PREREQUISITE_STATUS_LABEL.approved}
              color={PREREQUISITE_STATUS_COLOR.approved}
            />
          );
        }
        if (status === "needs-review") {
          return (
            <span onClick={stopRowClick}>
              <Button
                label="Review"
                variant="secondary"
                size="sm"
                icon={<ClipboardCheck size={13} strokeWidth={1.75} />}
                onClick={() => onReviewPrerequisite?.(row.id)}
              />
            </span>
          );
        }
        return (
          <span onClick={stopRowClick}>
            <Button
              label="Remind"
              variant="secondary"
              size="sm"
              icon={<Bell size={13} strokeWidth={1.75} />}
              onClick={() => remindPrerequisite(row.name)}
            />
          </span>
        );
      },
    });
  }

  if (classId) {
    columns.push({
      key: "payment",
      header: "Payment status",
      width: even,
      align: "start",
      renderCell: (row) => (
        <RowClickCell onClick={selectIfStudent(row)}>
          <PaymentStatusBadge status={rosterPaymentStatusFor(classId, row, invoices)} />
        </RowClickCell>
      ),
    });
  }

  if (showCertificates) {
    columns.push({
      key: "certificate",
      header: "Certificate",
      width: even,
      align: "start",
      renderCell: (row) =>
        row.certificateHref ? (
          <a
            href={row.certificateHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            style={certificateLinkStyle}
          >
            View PDF
          </a>
        ) : (
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>—</span>
        ),
    });
  }

  return columns;
}

export type ClassRosterSectionProps = {
  rows: ClassRosterRow[];
  classId?: string;
  selectedStudentId?: string | null;
  onSelectStudent?: (id: string) => void;
  onReviewPrerequisite?: (studentId: string) => void;
  showCertificates?: boolean;
  showPrerequisites?: boolean;
};

export function ClassRosterSection({
  rows,
  classId,
  selectedStudentId,
  onSelectStudent,
  onReviewPrerequisite,
  showCertificates = false,
  showPrerequisites = false,
}: ClassRosterSectionProps) {
  const { transactions } = useTransactions();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const hasWaitlist = rows.some((row) => row.status === "Waitlisted");

  const columns = useMemo(
    () =>
      buildColumns(
        onSelectStudent,
        selectedStudentId,
        showCertificates,
        classId,
        showPrerequisites,
        onReviewPrerequisite,
        transactions,
      ),
    [onSelectStudent, selectedStudentId, showCertificates, classId, showPrerequisites, onReviewPrerequisite, transactions],
  );

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
      return true;
    });
  }, [rows, search, statusFilter]);

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
          ]}
        />
      </div>
      <GroupedTable
        data={filteredRows}
        columns={columns}
        getRowKey={(row) => row.id}
        groupBy={hasWaitlist ? (row) => row.status : undefined}
        groupOrder={STATUS_ORDER}
        getGroupMeta={(key) => ({ color: STATUS_COLOR[key], label: key })}
        listChrome
      />
    </section>
  );
}
