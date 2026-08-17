"use client";

import { Bell } from "lucide-react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Button } from "@/components/patterns/primitives/Button";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import {
  formatShortDate,
  getTransactionDaysPastDue,
  getTransactionTypeLabel,
} from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";
import { TransactionAmountCell } from "./TransactionAmountCell";
import { TransactionStatusToken } from "./TransactionStatusToken";

const PAST_DUE_COLOR = "#eb5757";

export type TransactionColumnOptions = {
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Include student name/email. Default true. */
  showStudent?: boolean;
  /** Include class ID. Default true. */
  showClass?: boolean;
  onRemind?: (row: TransactionRow) => void;
};

function selectHandler(options: TransactionColumnOptions, id: string) {
  return options.onSelect ? () => options.onSelect?.(id) : undefined;
}

export function buildTransactionColumns(options: TransactionColumnOptions = {}): TableColumn<TransactionRow>[] {
  const showStudent = options.showStudent !== false;
  const showClass = options.showClass !== false;
  const columns: TableColumn<TransactionRow>[] = [];

  columns.push({
    key: "invoiceNumber",
    header: "Invoice Number",
    width: pixel(120),
    renderCell: (row) => (
      <RowClickCell onClick={selectHandler(options, row.id)}>
        <span
          style={{
            color: "var(--linear-color-ink)",
            fontWeight: row.id === options.selectedId ? 600 : undefined,
          }}
        >
          {row.invoiceNumber ?? "–"}
        </span>
      </RowClickCell>
    ),
  });

  if (showStudent) {
    columns.push(
      {
        key: "studentName",
        header: "Student Name",
        width: proportional(1, { minWidth: 150 }),
        renderCell: (row) => (
          <RowClickCell onClick={selectHandler(options, row.id)}>
            <Avatar name={row.studentName} size="sm" />
            <span style={{ marginInlineStart: 8 }}>{row.studentName}</span>
          </RowClickCell>
        ),
      },
      {
        key: "studentEmail",
        header: "Student Email",
        width: proportional(1, { minWidth: 180 }),
        renderCell: (row) => (
          <RowClickCell onClick={selectHandler(options, row.id)}>
            <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.studentEmail ?? "–"}</span>
          </RowClickCell>
        ),
      },
    );
  }

  if (showClass) {
    columns.push({
      key: "classCode",
      header: "Class ID",
      width: pixel(110),
      renderCell: (row) => (
        <RowClickCell onClick={selectHandler(options, row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.classCode}</span>
        </RowClickCell>
      ),
    });
  }

  columns.push(
    {
      key: "type",
      header: "Type",
      width: proportional(1, { minWidth: 140 }),
      renderCell: (row) => (
        <RowClickCell onClick={selectHandler(options, row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {getTransactionTypeLabel(row.transactionType)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "amount",
      header: "Amount Due",
      width: pixel(200),
      renderCell: (row) => (
        <RowClickCell onClick={selectHandler(options, row.id)}>
          <TransactionAmountCell row={row} />
        </RowClickCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: pixel(110),
      renderCell: (row) => (
        <RowClickCell onClick={selectHandler(options, row.id)}>
          <TransactionStatusToken row={row} />
        </RowClickCell>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={selectHandler(options, row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{formatShortDate(row.dueDate)}</span>
        </RowClickCell>
      ),
    },
  );

  return columns;
}

export function buildPastDueTransactionColumns(
  options: TransactionColumnOptions = {},
): TableColumn<TransactionRow>[] {
  const showStudent = options.showStudent !== false;
  const columns: TableColumn<TransactionRow>[] = [];

  if (showStudent) {
    columns.push({
      key: "student",
      header: "Student",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={selectHandler(options, row.id)}>
          <Avatar name={row.studentName} size="sm" />
          <span
            style={{
              marginInlineStart: 8,
              fontWeight: row.id === options.selectedId ? 600 : undefined,
            }}
          >
            {row.studentName}
          </span>
        </RowClickCell>
      ),
    });
  }

  columns.push(
    {
      key: "invoiceNumber",
      header: "Invoice #",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={selectHandler(options, row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.invoiceNumber ?? "–"}</span>
        </RowClickCell>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: proportional(1, { minWidth: 140 }),
      renderCell: (row) => (
        <RowClickCell onClick={selectHandler(options, row.id)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>
            {getTransactionTypeLabel(row.transactionType)}
          </span>
        </RowClickCell>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: pixel(200),
      renderCell: (row) => (
        <RowClickCell onClick={selectHandler(options, row.id)}>
          <TransactionAmountCell row={row} />
        </RowClickCell>
      ),
    },
    {
      key: "pastDue",
      header: "Past Due",
      width: pixel(130),
      renderCell: (row) => {
        const days = getTransactionDaysPastDue(row);
        return (
          <RowClickCell onClick={selectHandler(options, row.id)}>
            <span style={{ color: PAST_DUE_COLOR, fontWeight: 500 }}>
              {days} day{days === 1 ? "" : "s"} past due
            </span>
          </RowClickCell>
        );
      },
    },
  );

  if (options.onRemind) {
    columns.push({
      key: "remind",
      header: "",
      width: pixel(108),
      renderCell: (row) => (
        <Button
          label="Remind"
          variant="secondary"
          size="sm"
          icon={<Bell size={13} strokeWidth={1.75} />}
          onClick={() => options.onRemind?.(row)}
        />
      ),
    });
  }

  return columns;
}

export const TRANSACTION_STATUS_FILTER_OPTIONS = [
  { value: "open", label: "Open (unpaid)" },
  { value: "past_due", label: "Past due" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export const TRANSACTION_TYPE_FILTER_OPTIONS = [
  { value: "registration_fee", label: "Registration Fee" },
  { value: "tuition_a", label: "First Invoice" },
  { value: "tuition_b", label: "Second Invoice" },
  { value: "custom", label: "Custom Invoice" },
  { value: "pay_in_full", label: "Pay in Full" },
  { value: "na", label: "N/A" },
];
