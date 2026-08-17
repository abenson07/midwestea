"use client";

import { Plus } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { useEventContext } from "@/components/integrated/events/EventContext";
import { BudgetStatusToken } from "./BudgetStatusToken";
import { eventMocksFor, type EventBudgetRow } from "@/data/mocks/events";

export type InvoicesListSectionProps = {
  onSelectInvoice?: (row: EventBudgetRow) => void;
  onAddInvoice?: () => void;
  onSeeAllInvoices?: () => void;
};

const PREVIEW_LIMIT = 5;

export function InvoicesListSection({
  onSelectInvoice,
  onAddInvoice,
  onSeeAllInvoices,
}: InvoicesListSectionProps) {
  const { enabled: demo } = useDemoModeOptional();
  const { eventId, invoices: liveInvoices } = useEventContext();
  const invoices: EventBudgetRow[] = demo
    ? eventMocksFor(eventId).budgetItems
    : liveInvoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoice,
        item: "Invoice",
        vendor: inv.sponsor,
        amount: `$${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        status:
          inv.status === "Paid"
            ? ("Paid" as const)
            : inv.status === "Overdue"
              ? ("Overdue" as const)
              : ("Pending" as const),
        dueDate: inv.dueDate,
      }));
  const preview = invoices.slice(0, PREVIEW_LIMIT);

  return (
    <section
      data-slot="invoices-list-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="semibold">Invoices</Text>
        {onAddInvoice ? (
          <IconButton
            label="Add invoice"
            variant="ghost"
            size="sm"
            icon={<Plus size={16} strokeWidth={1.75} />}
            onClick={onAddInvoice}
          />
        ) : null}
      </div>

      {invoices.length === 0 ? (
        <EmptyStateCard
          variant="pill"
          label="Add new invoice"
          onClick={onAddInvoice}
          minHeight={72}
        />
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {preview.map((invoice) => (
              <button
                key={invoice.id}
                type="button"
                onClick={() => onSelectInvoice?.(invoice)}
                style={{
                  all: "unset",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 4px",
                  borderRadius: "var(--linear-radius-sm)",
                  cursor: onSelectInvoice ? "pointer" : "default",
                }}
              >
                <Text size="sm" style={{ flex: 1, minWidth: 0 }}>
                  {invoice.invoiceNumber}
                </Text>
                <Text size="sm" color="secondary">
                  {invoice.amount}
                </Text>
                <span style={{ flexShrink: 0, width: 84, display: "flex", justifyContent: "flex-end" }}>
                  <BudgetStatusToken item={invoice} />
                </span>
              </button>
            ))}
          </div>
          {onSeeAllInvoices && invoices.length > 0 ? (
            <button
              type="button"
              onClick={onSeeAllInvoices}
              style={{
                all: "unset",
                cursor: "pointer",
                marginTop: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--linear-color-accent)",
              }}
            >
              See all invoices
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
