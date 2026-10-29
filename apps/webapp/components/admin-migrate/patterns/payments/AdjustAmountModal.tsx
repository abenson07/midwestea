"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import {
  formatCentsAsUSD,
  getTransactionAmountCents,
} from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";
import { updateTransactionAmount } from "@/lib/payments";
import { TransactionAmountCell } from "./TransactionAmountCell";

export type AdjustAmountModalProps = {
  isOpen: boolean;
  transaction: TransactionRow | null;
  onClose: () => void;
  onApply: (patch: Pick<TransactionRow, "amountDueCents" | "originalAmountDueCents" | "discountPercent">) => void;
};

const inputStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

export function AdjustAmountModal({ isOpen, transaction, onClose, onApply }: AdjustAmountModalProps) {
  const [percent, setPercent] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !transaction) return;
    setPercent("");
    setAmount((getTransactionAmountCents(transaction) / 100).toFixed(2));
  }, [isOpen, transaction]);

  if (!transaction) return null;
  const row = transaction;

  // Persists via the admin API (which voids + reissues any linked Stripe
  // invoice), and only updates local state once the server reports success.
  async function persist(
    nextDue: number,
    discountPercent: number | null,
    successMessage: string
  ) {
    if (saving) return;
    setSaving(true);
    try {
      const { success, error } = await updateTransactionAmount(
        row.id,
        nextDue,
        discountPercent ?? undefined
      );
      if (!success) {
        toast.error(error || "Failed to update amount");
        return;
      }
      onApply({
        amountDueCents: nextDue,
        // The server stores the pre-change amount_due as original_amount_due.
        originalAmountDueCents: row.amountDueCents,
        discountPercent,
      });
      toast.success(successMessage);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function applyDiscount() {
    const pct = Number.parseFloat(percent);
    if (!Number.isFinite(pct) || pct <= 0 || pct > 100) {
      toast.error("Enter a discount between 0 and 100.");
      return;
    }
    const quantity = row.quantity || 1;
    // amount_due is stored pre-quantity: discount the payable amount, then
    // convert back (same as the previous admin).
    const payable = row.amountDueCents * quantity;
    const newPayable = Math.round(payable * (1 - pct / 100));
    const nextDue = Math.round(newPayable / quantity);
    await persist(nextDue, pct, `${pct}% discount applied`);
  }

  async function setAmountDirectly() {
    const dollars = Number.parseFloat(amount);
    if (!Number.isFinite(dollars) || dollars < 0) {
      toast.error("Enter a valid dollar amount.");
      return;
    }
    const quantity = row.quantity || 1;
    const nextDue = Math.round(Math.round(dollars * 100) / quantity);
    await persist(
      nextDue,
      null,
      `Amount set to ${formatCentsAsUSD(Math.round(dollars * 100))}`
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust amount"
      width={420}
      footer={
        <Button label="Close" variant="secondary" onClick={onClose} />
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <Text size="sm" color="secondary" display="block">
            Current
          </Text>
          <div style={{ marginTop: 4 }}>
            <TransactionAmountCell row={row} />
          </div>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Text size="sm" color="secondary">
            Discount %
          </Text>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={percent}
              onChange={(event) => setPercent(event.target.value)}
              placeholder="e.g. 15"
              style={{ ...inputStyle, width: "auto", flex: 1, minWidth: 0 }}
            />
            <Button label="Apply Discount" variant="primary" disabled={saving} onClick={applyDiscount} />
          </div>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Text size="sm" color="secondary">
            Amount ($)
          </Text>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              min={0}
              step={0.01}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              style={{ ...inputStyle, width: "auto", flex: 1, minWidth: 0 }}
            />
            <Button label="Set Amount" variant="secondary" disabled={saving} onClick={setAmountDirectly} />
          </div>
        </label>
      </div>
    </Modal>
  );
}
