"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { VStack } from "@/components/patterns/primitives/Stack";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import {
  DetailActionBar,
  DetailRow,
  DetailSection,
  DetailTimeline,
  type DetailTimelineStep,
} from "@/components/patterns/foundation/detail";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { classDetailHref, classHasDetailRoute } from "@/components/patterns/client-templates-migrate/catalog";
import {
  TRANSACTION_LIST_STATUS_LABEL,
  TRANSACTION_STATUS_COLOR,
  dueDateInputValue,
  endOfLocalDayIso,
  formatCentsAsUSD,
  formatShortDate,
  getTransactionAmountCents,
  getTransactionListStatus,
  getTransactionTypeLabel,
} from "@/data/mocks/transaction-status";
import type { TransactionRow, TransactionType } from "@/data/mocks/transactions";
import { AdjustAmountModal } from "./AdjustAmountModal";
import { CancelTransactionModal } from "./CancelTransactionModal";
import { MarkPaidModal } from "./MarkPaidModal";
import { TransactionStatusToken } from "./TransactionStatusToken";
import { useTransactions } from "./useTransactions";

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
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  textAlign: "right",
  textDecoration: "underline",
  textUnderlineOffset: 2,
} as const;

const TYPE_ORDER: Record<TransactionType, number> = {
  registration_fee: 0,
  tuition_a: 1,
  tuition_b: 2,
  pay_in_full: 3,
  custom: 4,
};

export type TransactionDetailContext = "student" | "class";

export type TransactionDetailPanelProps = {
  transaction: TransactionRow;
  onChange: (patch: Partial<TransactionRow>) => void;
  /** Hide the entity we already came from and lift the other into the main details. */
  context?: TransactionDetailContext;
};

function relatedInvoices(transaction: TransactionRow, all: TransactionRow[]): TransactionRow[] {
  if (!transaction.studentId || !transaction.classId) return [transaction];
  return all.filter((row) => row.studentId === transaction.studentId && row.classId === transaction.classId);
}

function invoiceLifecycleSteps(transaction: TransactionRow): DetailTimelineStep[] {
  const markerColor = TRANSACTION_STATUS_COLOR[getTransactionListStatus(transaction)];
  const steps: DetailTimelineStep[] = [
    { label: "Created", meta: formatShortDate(transaction.createdAt), markerColor },
    { label: "Due", meta: formatShortDate(transaction.dueDate), markerColor },
  ];
  if (transaction.transactionStatus === "paid") {
    steps.push({ label: "Paid", meta: formatShortDate(transaction.paymentDate), isDestination: true, markerColor });
  } else if (transaction.transactionStatus === "cancelled") {
    steps.push({ label: "Cancelled", isDestination: true, markerColor });
  } else if (transaction.transactionStatus === "refunded") {
    steps.push({ label: "Refunded", isDestination: true, markerColor });
  } else {
    steps[1].isDestination = true;
  }
  return steps;
}

function relatedPaymentSteps(transaction: TransactionRow, all: TransactionRow[]): DetailTimelineStep[] {
  const siblings = relatedInvoices(transaction, all);
  if (siblings.length <= 1) return invoiceLifecycleSteps(transaction);

  return [...siblings]
    .sort((a, b) => {
      const typeDelta = (TYPE_ORDER[a.transactionType ?? "custom"] ?? 99) - (TYPE_ORDER[b.transactionType ?? "custom"] ?? 99);
      if (typeDelta !== 0) return typeDelta;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })
    .map((row) => {
      const status = getTransactionListStatus(row);
      return {
        label: getTransactionTypeLabel(row.transactionType),
        meta: `${TRANSACTION_LIST_STATUS_LABEL[status]} · ${formatCentsAsUSD(getTransactionAmountCents(row))}`,
        isDestination: row.id === transaction.id,
        markerColor: TRANSACTION_STATUS_COLOR[status],
      };
    });
}

function paymentLinkLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.length > 22 ? `${parsed.pathname.slice(0, 22)}…` : parsed.pathname;
    return `${parsed.host}${path}`;
  } catch {
    return url.length > 32 ? `${url.slice(0, 32)}…` : url;
  }
}

export function TransactionDetailPanel({
  transaction,
  onChange,
  context,
}: TransactionDetailPanelProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const { transactions } = useTransactions();
  const [dueDate, setDueDate] = useState(dueDateInputValue(transaction.dueDate));
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [markPaidOpen, setMarkPaidOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setDueDate(dueDateInputValue(transaction.dueDate));
    setEditingDueDate(false);
  }, [transaction.id, transaction.dueDate]);

  const isPending = transaction.transactionStatus === "pending";
  const paymentUrl = transaction.stripeHostedInvoiceUrl ?? null;
  const timelineSteps = useMemo(
    () => relatedPaymentSteps(transaction, transactions),
    [transaction, transactions],
  );

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

  async function copyPaymentLink() {
    if (!paymentUrl) return;
    try {
      await navigator.clipboard.writeText(paymentUrl);
      toast.success("Payment link copied");
    } catch {
      toast.error("Could not copy payment link");
    }
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
        <VStack gap={2} align="start">
          <TransactionStatusToken row={transaction} />
          <Text
            weight="semibold"
            display="block"
            style={{ fontSize: 28, lineHeight: "34px", letterSpacing: "-0.02em" }}
          >
            {formatCentsAsUSD(getTransactionAmountCents(transaction))}
          </Text>
        </VStack>

        <DetailTimeline steps={timelineSteps} />

        {isPending ? (
          <DetailActionBar>
            <Button label="Edit" variant="secondary" onClick={() => setAdjustOpen(true)} />
            <Button label="Remind" variant="secondary" onClick={remind} />
            <Dropdown
              label="More actions"
              open={moreOpen}
              onOpenChange={setMoreOpen}
              width={180}
              trigger={<Button label="More" variant="secondary" />}
            >
              <DropdownItem
                label="Mark as paid"
                onSelect={() => {
                  setMoreOpen(false);
                  setMarkPaidOpen(true);
                }}
              />
              <DropdownItem
                label="Cancel invoice"
                onSelect={() => {
                  setMoreOpen(false);
                  setCancelOpen(true);
                }}
              />
            </Dropdown>
          </DetailActionBar>
        ) : null}

        <DetailSection>
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
          <DetailRow label="Invoice date" value={formatShortDate(transaction.createdAt)} />
          <DetailRow label="Invoice no" value={transaction.invoiceNumber ?? "–"} />
          <DetailRow label="Type" value={getTransactionTypeLabel(transaction.transactionType)} />
          {context === "student" ? null : (
            <>
              {studentRow}
              {emailRow}
            </>
          )}
          {context === "class" ? null : classRow}
          <DetailRow
            label="Payment link"
            valueContent={
              paymentUrl ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, minWidth: 0 }}>
                  <a
                    href={paymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      ...linkStyle,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 160,
                    }}
                  >
                    {paymentLinkLabel(paymentUrl)}
                  </a>
                  <IconButton
                    label="Copy payment link"
                    variant="ghost"
                    size="sm"
                    icon={<Copy size={14} strokeWidth={1.75} />}
                    onClick={() => void copyPaymentLink()}
                  />
                </span>
              ) : (
                <Text weight="medium">No payment link</Text>
              )
            }
          />
        </DetailSection>
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
