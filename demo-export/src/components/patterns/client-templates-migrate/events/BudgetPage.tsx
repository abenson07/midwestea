"use client";

import { useMemo } from "react";
import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { NestedGroupedTable } from "@/components/patterns/grouped-table/NestedGroupedTable";
import {
  EmptyStateCard,
  RowClickCell,
  ClassContentPage,
} from "@/components/patterns/client-templates/shared";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { useEventContext } from "@/components/integrated/events/EventContext";
import { BudgetChart } from "./BudgetChart";
import { SponsorshipLevelsPanel } from "./SponsorshipLevelsPanel";
import {
  eventMocksFor,
  type EventBudgetSummary,
  type EventSponsorshipInvoiceRow,
} from "@/data/mocks/events";

const GROUP_ORDER = ["Overdue", "Pending", "Paid"];

const groupColors: Record<string, string> = {
  Overdue: "#eb5757",
  Pending: "#f2c94c",
  Paid: "#27a644",
};

function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function mapInvoiceStatus(status: string): EventSponsorshipInvoiceRow["status"] {
  const lower = status.toLowerCase();
  if (lower === "paid" || lower === "succeeded") return "Paid";
  if (lower === "overdue") return "Overdue";
  return "Pending";
}

function buildColumns(
  onSelectInvoice?: (row: EventSponsorshipInvoiceRow) => void,
): TableColumn<EventSponsorshipInvoiceRow>[] {
  return [
    {
      key: "business",
      header: "Business",
      width: proportional(1, { minWidth: 180 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.business}</span>
        </RowClickCell>
      ),
    },
    {
      key: "invoiceNumber",
      header: "Invoice #",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.invoiceNumber}</span>
        </RowClickCell>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      width: pixel(96),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.amount}</span>
        </RowClickCell>
      ),
    },
    {
      key: "dueDate",
      header: "Due",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{row.dueDate}</span>
        </RowClickCell>
      ),
    },
    {
      key: "level",
      header: "Level",
      width: pixel(140),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelectInvoice?.(row)}>
          <span style={{ color: "var(--linear-color-ink)" }}>{row.level}</span>
        </RowClickCell>
      ),
    },
  ];
}

export type BudgetPageProps = {
  onSelectBudgetItem?: (row: EventSponsorshipInvoiceRow) => void;
  onAddSponsor?: () => void;
  onEditLevels?: () => void;
};

/**
 * Sponsorships page — mixed-content layout like Overview: a five-column
 * summary row (budget chart spanning four columns, sponsorship levels in
 * the fifth), then sponsorship invoices nested below, grouped by payment
 * status.
 */
export function BudgetPage({
  onSelectBudgetItem,
  onAddSponsor,
  onEditLevels,
}: BudgetPageProps) {
  const { enabled: demo } = useDemoModeOptional();
  const { eventId, budget, invoices, sponsorshipTiers } = useEventContext();
  const columns = useMemo(() => buildColumns(onSelectBudgetItem), [onSelectBudgetItem]);
  const groupOrder = useMemo(() => GROUP_ORDER, []);
  const mocks = demo ? eventMocksFor(eventId) : null;

  const summary: EventBudgetSummary = mocks
    ? mocks.budgetSummary
    : {
        totalBudget: budget.goal,
        received: budget.raised,
        pending: budget.pledged,
      };

  const invoiceRows: EventSponsorshipInvoiceRow[] = mocks
    ? mocks.sponsorshipInvoices
    : invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoice,
        business: inv.sponsor,
        level: inv.level ?? "—",
        amount: formatMoney(inv.amount),
        dueDate: inv.dueDate,
        status: mapInvoiceStatus(inv.status),
      }));

  if (!demo && invoiceRows.length === 0 && sponsorshipTiers.length === 0) {
    return (
      <ClassContentPage>
        <EmptyStateCard
          variant="pill"
          label="Add new sponsor"
          onClick={onAddSponsor}
        />
      </ClassContentPage>
    );
  }

  return (
    <ClassContentPage>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        <div style={{ gridColumn: "span 4" }}>
          <BudgetChart summary={summary} />
        </div>
        <div style={{ gridColumn: "span 1" }}>
          <SponsorshipLevelsPanel onEdit={onEditLevels} />
        </div>
      </div>
      {invoiceRows.length === 0 ? (
        <EmptyStateCard
          variant="pill"
          label="Add new sponsor"
          onClick={onAddSponsor}
        />
      ) : (
        <NestedGroupedTable
          title="Sponsorship invoices"
          data={invoiceRows}
          columns={columns}
          getRowKey={(row) => row.id}
          groupBy={(row) => row.status}
          groupOrder={groupOrder}
          getGroupMeta={(key) => ({ color: groupColors[key], label: key })}
        />
      )}
    </ClassContentPage>
  );
}
