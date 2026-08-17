"use client";

import { useMemo, type CSSProperties } from "react";
import { useStripeInvoices } from "hooks";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { Text } from "@/components/patterns/primitives/Text";
import type { TableColumn } from "@/components/patterns/primitives/table";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import { buildInvoiceColumns } from "@/components/patterns/client-templates-migrate/invoicing";

function cardStyle(): CSSProperties {
  return {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 20,
    background: "var(--linear-color-panel)",
    border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
    borderRadius: "var(--linear-radius-md)",
    boxShadow: "var(--linear-shadow-panel)",
  };
}

function ActionItemsTable({
  title,
  rows,
  columns,
  loading,
  emptyLabel,
}: {
  title: string;
  rows: StripeInvoiceTableRow[];
  columns: TableColumn<StripeInvoiceTableRow>[];
  loading: boolean;
  emptyLabel: string;
}) {
  return (
    <section style={cardStyle()}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Text weight="semibold">{title}</Text>
        <Text size="sm" color="secondary">
          {rows.length} total
        </Text>
      </div>
      <div>
        <GroupedTable data={rows} columns={columns} getRowKey={(row) => row.id} listChrome />
        {!loading && rows.length === 0 ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">{emptyLabel}</Text>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * Copied as-is from Invoicing Overview's "Open invoices" table — placeholder
 * body for Action Items until Prerequisites-to-approve and Students-to-remove
 * get their own data sources. All three sections show the same open-invoices
 * data for now; real per-table filtering comes later.
 */
export function ActionItemsDemo() {
  const { invoices, loading } = useStripeInvoices();
  const columns = useMemo(() => buildInvoiceColumns(undefined, { even: true }), []);
  const openInvoices = useMemo(() => invoices.filter((invoice) => invoice.status === "open"), [invoices]);

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={<CanvasHeader topbar={{ title: "Action Items" }} />}
      >
        <ClassContentPage>
          <ActionItemsTable
            title="Prerequisites to approve"
            rows={openInvoices}
            columns={columns}
            loading={loading}
            emptyLabel="No prerequisites waiting for approval."
          />
          <ActionItemsTable
            title="Outstanding Invoices"
            rows={openInvoices}
            columns={columns}
            loading={loading}
            emptyLabel="No outstanding invoices."
          />
          <ActionItemsTable
            title="Students to remove"
            rows={openInvoices}
            columns={columns}
            loading={loading}
            emptyLabel="No students flagged for removal."
          />
        </ClassContentPage>
      </FoundationLayout>
    </div>
  );
}
