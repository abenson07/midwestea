"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { X } from "lucide-react";
import {
  dueDateInputValue,
  endOfLocalDayIso,
  formatCentsAsUSD,
  getTransactionAmountCents,
  todayLocalDateInputValue,
} from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";

type ReplacementRow = {
  id: string;
  amount: string;
  dueDate: string;
};

function rowsFromOpenInvoices(openInvoices: TransactionRow[]): ReplacementRow[] {
  return openInvoices.map((invoice) => ({
    id: invoice.id,
    amount: (getTransactionAmountCents(invoice) / 100).toFixed(2),
    dueDate: dueDateInputValue(invoice.dueDate),
  }));
}

function sumCents(rows: ReplacementRow[]): number {
  return rows.reduce((sum, row) => {
    const dollars = Number.parseFloat(row.amount);
    return sum + (Number.isFinite(dollars) ? Math.round(dollars * 100) : 0);
  }, 0);
}

const inputStyle = {
  boxSizing: "border-box" as const,
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

export type VoidAndReissueModalProps = {
  isOpen: boolean;
  className: string;
  openInvoices: TransactionRow[];
  onClose: () => void;
  onConfirm: (voidedIds: string[], replacements: { amountCents: number; dueDateIso: string }[]) => void;
};

/** Voids the class's open invoices and replaces them with a new schedule, or a single pay-in-full row. */
export function VoidAndReissueModal({
  isOpen,
  className,
  openInvoices,
  onClose,
  onConfirm,
}: VoidAndReissueModalProps) {
  const [rows, setRows] = useState<ReplacementRow[]>([]);

  useEffect(() => {
    if (isOpen) setRows(rowsFromOpenInvoices(openInvoices));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const originalTotalCents = openInvoices.reduce((sum, row) => sum + getTransactionAmountCents(row), 0);
  const newTotalCents = sumCents(rows);

  function updateRow(id: string, patch: Partial<ReplacementRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, amount: "", dueDate: todayLocalDateInputValue() },
    ]);
  }

  function payInFull() {
    setRows([
      {
        id: `pay-in-full-${Date.now()}`,
        amount: (originalTotalCents / 100).toFixed(2),
        dueDate: todayLocalDateInputValue(),
      },
    ]);
  }

  function confirm() {
    if (!rows.length) {
      toast.error("Add at least one replacement invoice, or use Pay in Full.");
      return;
    }
    const replacements: { amountCents: number; dueDateIso: string }[] = [];
    for (const row of rows) {
      const dollars = Number.parseFloat(row.amount);
      if (!Number.isFinite(dollars) || dollars <= 0 || !row.dueDate) {
        toast.error("Every replacement row needs an amount and a due date.");
        return;
      }
      replacements.push({ amountCents: Math.round(dollars * 100), dueDateIso: endOfLocalDayIso(row.dueDate) });
    }
    onConfirm(
      openInvoices.map((row) => row.id),
      replacements,
    );
    toast.success(`Voided and reissued invoices for ${className} — demo mode, saved locally only`);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Void & Reissue — ${className}`}
      width={480}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Confirm" variant="primary" onClick={confirm} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Text size="sm" color="secondary">
          Voids {openInvoices.length} open invoice{openInvoices.length === 1 ? "" : "s"} and creates
          replacements below.
        </Text>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((row) => (
            <div key={row.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
                <Text size="sm" color="secondary">
                  $
                </Text>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={row.amount}
                  onChange={(event) => updateRow(row.id, { amount: event.target.value })}
                  placeholder="0.00"
                  style={{ ...inputStyle, width: "100%" }}
                />
              </div>
              <input
                type="date"
                value={row.dueDate}
                onChange={(event) => updateRow(row.id, { dueDate: event.target.value })}
                style={{ ...inputStyle, width: 150 }}
              />
              <IconButton
                label="Remove row"
                variant="ghost"
                size="sm"
                icon={<X size={13} strokeWidth={1.75} />}
                onClick={() => removeRow(row.id)}
              />
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Button label="Add row" variant="secondary" size="sm" onClick={addRow} />
          <Button label="Pay in Full" variant="secondary" size="sm" onClick={payInFull} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "10px 12px",
            borderRadius: 6,
            background: "var(--linear-color-canvas)",
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text size="sm" color="secondary">
              Original total
            </Text>
            <Text size="sm">{formatCentsAsUSD(originalTotalCents)}</Text>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text size="sm" color="secondary">
              New total
            </Text>
            <Text size="sm" weight="medium">
              {formatCentsAsUSD(newTotalCents)}
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
}
