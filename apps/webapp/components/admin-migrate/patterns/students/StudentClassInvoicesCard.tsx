"use client";

import { X } from "lucide-react";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";
import { ClassSidebarSection } from "../classes/ClassSidebarSection";
import { TransactionAmountCell } from "../payments/TransactionAmountCell";
import { TransactionStatusToken } from "../payments/TransactionStatusToken";
import { formatShortDate, getTransactionTypeLabel } from "@/data/mocks/transaction-status";
import type { TransactionRow } from "@/data/mocks/transactions";

function InvoiceCard({ invoice }: { invoice: TransactionRow }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: "10px 0",
        borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      <Text size="sm" color="secondary">
        {invoice.invoiceNumber ?? "—"} · {getTransactionTypeLabel(invoice.transactionType)}
      </Text>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 600, lineHeight: "20px" }}>
          <TransactionAmountCell row={invoice} />
        </span>
        <TransactionStatusToken row={invoice} />
      </div>
      <Text size="sm" color="secondary">
        {invoice.paymentDate
          ? `Paid ${formatShortDate(invoice.paymentDate)}`
          : `Due ${formatShortDate(invoice.dueDate)}`}
      </Text>
    </div>
  );
}

export type StudentClassInvoicesCardProps = {
  className: string;
  invoices: TransactionRow[];
  hasOpenInvoices: boolean;
  onClose: () => void;
  onGoToClass: () => void;
  onVoidAndReissue: () => void;
};

/** Right-rail card: one class's invoices as cards, plus Void & Reissue when any are open. */
export function StudentClassInvoicesCard({
  className,
  invoices,
  hasOpenInvoices,
  onClose,
  onGoToClass,
  onVoidAndReissue,
}: StudentClassInvoicesCardProps) {
  return (
    <ClassSidebarSection
      title={className}
      action={
        <IconButton
          label="Close"
          variant="ghost"
          size="sm"
          icon={<X size={14} strokeWidth={1.75} />}
          onClick={onClose}
        />
      }
    >
      {invoices.length ? (
        <div>
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      ) : (
        <Text size="sm" color="secondary">
          No invoices yet.
        </Text>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
        {hasOpenInvoices ? (
          <Button label="Void & Reissue" variant="secondary" width="100%" onClick={onVoidAndReissue} />
        ) : null}
        <Button label="Go to class" variant="ghost" width="100%" onClick={onGoToClass} />
      </div>
    </ClassSidebarSection>
  );
}
