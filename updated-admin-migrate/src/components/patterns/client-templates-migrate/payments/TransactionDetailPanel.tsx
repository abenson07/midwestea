"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { VStack } from "@/components/patterns/primitives/Stack";
import { IconButton } from "@/components/patterns/shared/IconButton";
import {
  DetailActionBar,
  DetailRow,
  DetailSection,
} from "@/components/patterns/foundation/detail";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { classDetailHref, classHasDetailRoute } from "@/components/patterns/client-templates-migrate/catalog";
import {
  dueDateInputValue,
  endOfLocalDayIso,
  formatShortDate,
  getTransactionTypeLabel,
} from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";
import { AdjustAmountModal } from "./AdjustAmountModal";
import { CancelTransactionModal } from "./CancelTransactionModal";
import { MarkPaidModal } from "./MarkPaidModal";
import { TransactionAmountCell } from "./TransactionAmountCell";
import { TransactionStatusToken } from "./TransactionStatusToken";

const dateInputStyle = {
  boxSizing: "border-box" as const,
  height: 28,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

const linkStyle = {
  all: "unset",
  color: "var(--linear-color-accent)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "right",
} as const;

export type TransactionDetailContext = "student" | "class";

export type TransactionDetailPanelProps = {
  transaction: TransactionRow;
  onChange: (patch: Partial<TransactionRow>) => void;
  /** Hide the entity we already came from and lift the other into the main details. */
  context?: TransactionDetailContext;
};

export function TransactionDetailPanel({
  transaction,
  onChange,
  context,
}: TransactionDetailPanelProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const [dueDate, setDueDate] = useState(dueDateInputValue(transaction.dueDate));
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);

  useEffect(() => {
    setDueDate(dueDateInputValue(transaction.dueDate));
    setEditingDueDate(false);
  }, [transaction.id, transaction.dueDate]);

  const isPending = transaction.transactionStatus === "pending";
  const canCancelOrPay =
    transaction.transactionStatus !== "paid" && transaction.transactionStatus !== "cancelled";

  function openStudent() {
    router.push(`${basePath}/students/${transaction.studentId}`);
  }

  function openClass() {
    if (classHasDetailRoute(transaction.classId)) {
      router.push(`${basePath}${classDetailHref(transaction.classId)}`);
      return;
    }
    toast.info("Demo mode — no detail page for this class");
  }

  function saveDueDate(next: string) {
    if (!next) return;
    setDueDate(next);
    setEditingDueDate(false);
    onChange({ dueDate: endOfLocalDayIso(next) });
    toast.success("Due date saved — demo mode, saved locally only");
  }

  function remind() {
    toast.success(`Reminder sent to ${transaction.studentName} — demo mode, not delivered`);
  }

  function confirmPaid() {
    onChange({
      transactionStatus: "paid",
      paymentDate: new Date().toISOString(),
      amountPaidCents: transaction.amountDueCents,
    });
    setMarkPaidOpen(false);
    toast.success("Marked as paid — demo mode, saved locally only");
  }

  function confirmCancel() {
    onChange({ transactionStatus: "cancelled" });
    setCancelOpen(false);
    toast.success("Invoice cancelled — demo mode, saved locally only");
  }

  const studentRow = (
    <DetailRow
      label="Student"
      valueContent={
        <button type="button" onClick={openStudent} style={linkStyle}>
          {transaction.studentName}
        </button>
      }
    />
  );
  const emailRow = <DetailRow label="Email" value={transaction.studentEmail ?? "–"} />;
  const classRow = (
    <DetailRow
      label="Class"
      valueContent={
        <button type="button" onClick={openClass} style={linkStyle}>
          {transaction.className} ({transaction.classCode})
        </button>
      }
    />
  );

  return (
    <>
      <VStack gap={4}>
        <div>
          <Text size="sm" color="secondary" display="block">
            Invoice number
          </Text>
          <Text weight="semibold">{transaction.invoiceNumber ?? "–"}</Text>
        </div>

        <DetailSection isFirst>
          <DetailRow
            label="Amount due"
            valueContent={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <TransactionAmountCell row={transaction} />
                {isPending ? (
                  <IconButton
                    label="Adjust amount"
                    variant="ghost"
                    size="sm"
                    icon={<Pencil size={14} strokeWidth={1.75} />}
                    onClick={() => setAdjustOpen(true)}
                  />
                ) : null}
              </span>
            }
          />
          <DetailRow label="Status" valueContent={<TransactionStatusToken row={transaction} />} />
          <DetailRow label="Type" value={getTransactionTypeLabel(transaction.transactionType)} />
          <DetailRow
            label="Due date"
            valueContent={
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                {editingDueDate ? (
                  <input
                    type="date"
                    value={dueDate}
                    autoFocus
                    onChange={(event) => saveDueDate(event.target.value)}
                    onBlur={() => setEditingDueDate(false)}
                    style={dateInputStyle}
                  />
                ) : (
                  <>
                    <Text weight="medium">{formatShortDate(transaction.dueDate)}</Text>
                    {isPending ? (
                      <IconButton
                        label="Edit due date"
                        variant="ghost"
                        size="sm"
                        icon={<Pencil size={14} strokeWidth={1.75} />}
                        onClick={() => setEditingDueDate(true)}
                      />
                    ) : null}
                  </>
                )}
              </span>
            }
          />
          {isPending ? (
            <div style={{ paddingTop: 8 }}>
              <Button label="Send reminder" variant="secondary" width="100%" onClick={remind} />
            </div>
          ) : null}
          {context === "class" ? null : classRow}
          {context === "student" ? null : (
            <>
              {studentRow}
              {emailRow}
            </>
          )}
        </DetailSection>

        {canCancelOrPay ? (
          <DetailSection>
            <DetailActionBar>
              <Button label="Mark as paid" variant="primary" onClick={() => setMarkPaidOpen(true)} />
              <Button label="Cancel invoice" variant="secondary" onClick={() => setCancelOpen(true)} />
            </DetailActionBar>
          </DetailSection>
        ) : null}
      </VStack>

      <AdjustAmountModal
        isOpen={adjustOpen}
        transaction={transaction}
        onClose={() => setAdjustOpen(false)}
        onApply={(patch) => onChange(patch)}
      />
      <MarkPaidModal
        isOpen={markPaidOpen}
        transaction={transaction}
        onClose={() => setMarkPaidOpen(false)}
        onConfirm={confirmPaid}
      />
      <CancelTransactionModal
        isOpen={cancelOpen}
        transaction={transaction}
        onClose={() => setCancelOpen(false)}
        onConfirm={confirmCancel}
      />
    </>
  );
}
