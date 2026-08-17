"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useAllSponsorships, useBusinesses, useStripeInvoices, useDemoGuard } from "hooks";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { GroupedTable } from "@/components/patterns/grouped-table/GroupedTable";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { getApiBase } from "@/lib/apiBase";
import {
  customerLabelFromEmail,
  formatDueDate,
  formatUsd,
  isOpenPastDue,
} from "@/components/billing/invoiceUtils";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import { buildInvoiceColumns } from "./InvoicingInvoicesPage";

const UPCOMING_WINDOW_SECONDS = 14 * 24 * 60 * 60;

function isUpcomingDue(invoice: StripeInvoiceTableRow): boolean {
  if (invoice.status !== "open" || invoice.due_date == null) return false;
  const now = Math.floor(Date.now() / 1000);
  return invoice.due_date >= now && invoice.due_date <= now + UPCOMING_WINDOW_SECONDS;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <Text weight="semibold">{title}</Text>
      {children}
    </section>
  );
}

function ReminderRow({
  invoice,
  businessName,
  isPastDue,
}: {
  invoice: StripeInvoiceTableRow;
  businessName: string;
  isPastDue: boolean;
}) {
  const { enabled: demo, sendDemoEmail } = useDemoGuard();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendReminder() {
    setSending(true);
    try {
      if (demo) {
        await sendDemoEmail({
          subject: `Invoice reminder — ${businessName}`,
          text: `This is a reminder that an invoice for ${businessName} (${formatUsd(invoice.amount_due)}) is due ${formatDueDate(invoice.due_date)}.`,
          context: businessName,
        });
        setSent(true);
        return;
      }
      const res = await fetch(
        `${getApiBase()}/api/stripe/invoices/${encodeURIComponent(invoice.id)}/remind`,
        { method: "POST" },
      );
      if (res.ok) setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Text weight="medium">{businessName}</Text>
        <Text size="sm" color={isPastDue ? "accent" : "secondary"}>
          {isPastDue ? "Past due" : "Due"} {formatDueDate(invoice.due_date)} ·{" "}
          {formatUsd(invoice.amount_due)}
        </Text>
      </div>
      <Button
        label={sent ? "Sent" : sending ? "Sending…" : "Send reminder"}
        variant="secondary"
        onClick={sent ? undefined : () => void sendReminder()}
      />
    </div>
  );
}

const SEGMENT_COLOR = {
  pledged: "#8a8f98",
  invoiced: "#f2c94c",
  paid: "#27a644",
} as const;

function YearChart({
  pledged,
  invoiced,
  paid,
}: {
  pledged: number;
  invoiced: number;
  paid: number;
}) {
  const total = pledged + invoiced + paid;
  const pct = (value: number) => (total > 0 ? (value / total) * 100 : 0);
  const year = new Date().getFullYear();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Text size="sm" color="secondary">
        {formatUsd(total * 100)} tracked in {year}
      </Text>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: 12,
          borderRadius: 999,
          overflow: "hidden",
          background: "var(--linear-color-hairline)",
        }}
      >
        {pledged > 0 ? (
          <span style={{ width: `${pct(pledged)}%`, background: SEGMENT_COLOR.pledged }} />
        ) : null}
        {invoiced > 0 ? (
          <span style={{ width: `${pct(invoiced)}%`, background: SEGMENT_COLOR.invoiced }} />
        ) : null}
        {paid > 0 ? (
          <span style={{ width: `${pct(paid)}%`, background: SEGMENT_COLOR.paid }} />
        ) : null}
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {(
          [
            ["Pledged", pledged, SEGMENT_COLOR.pledged],
            ["Invoiced", invoiced, SEGMENT_COLOR.invoiced],
            ["Paid", paid, SEGMENT_COLOR.paid],
          ] as const
        ).map(([label, value, color]) => (
          <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }}
            />
            <Text size="sm" color="secondary">
              {label}
            </Text>
            <Text size="sm" weight="medium">
              {formatUsd(value * 100)}
            </Text>
          </span>
        ))}
      </div>
    </div>
  );
}

export type InvoicingOverviewPageProps = {
  onSelectInvoice?: (row: StripeInvoiceTableRow) => void;
};

export function InvoicingOverviewPage({ onSelectInvoice }: InvoicingOverviewPageProps) {
  const { invoices, loading: invoicesLoading } = useStripeInvoices();
  const { businesses } = useBusinesses();
  const { sponsorships } = useAllSponsorships();
  const openInvoiceColumns = useMemo(
    () => buildInvoiceColumns(onSelectInvoice, { even: true }),
    [onSelectInvoice],
  );

  const openInvoices = useMemo(() => invoices.filter((i) => i.status === "open"), [invoices]);
  const pastDue = useMemo(() => openInvoices.filter(isOpenPastDue), [openInvoices]);
  const upcoming = useMemo(() => openInvoices.filter(isUpcomingDue), [openInvoices]);

  function nameFor(invoice: StripeInvoiceTableRow): string {
    const match = businesses.find(
      (b) =>
        b.email &&
        invoice.customer_email &&
        b.email.toLowerCase() === invoice.customer_email.toLowerCase(),
    );
    return match?.business_name ?? customerLabelFromEmail(invoice.customer_email);
  }

  const currentYear = new Date().getFullYear();
  const yearTotals = useMemo(() => {
    const rows = sponsorships.filter((s) => s.parentYear === currentYear);
    const sum = (status: string) =>
      rows.filter((s) => s.status === status).reduce((total, s) => total + (s.amount ?? 0), 0);
    return { pledged: sum("pledged"), invoiced: sum("invoiced"), paid: sum("paid") };
  }, [sponsorships, currentYear]);

  return (
    <ClassContentPage>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Card title="Open invoices">
          <Text size="md" weight="semibold">
            {invoicesLoading ? "—" : openInvoices.length}
          </Text>
          <Text size="sm" color="secondary">
            Unpaid, awaiting payment
          </Text>
        </Card>
        <Card title="Past due">
          <Text size="md" weight="semibold">
            {pastDue.length}
          </Text>
          <Text size="sm" color="secondary">
            Needs a reminder now
          </Text>
        </Card>
        <Card title="Due soon">
          <Text size="md" weight="semibold">
            {upcoming.length}
          </Text>
          <Text size="sm" color="secondary">
            Due within 14 days
          </Text>
        </Card>
      </div>

      <Card title={`Money for ${currentYear}`}>
        <YearChart pledged={yearTotals.pledged} invoiced={yearTotals.invoiced} paid={yearTotals.paid} />
      </Card>

      <Card title="Sponsors needing a reminder">
        {pastDue.length === 0 && upcoming.length === 0 ? (
          <Text size="sm" color="secondary">
            Nobody needs a reminder right now.
          </Text>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pastDue.map((invoice) => (
              <ReminderRow key={invoice.id} invoice={invoice} businessName={nameFor(invoice)} isPastDue />
            ))}
            {upcoming.map((invoice) => (
              <ReminderRow
                key={invoice.id}
                invoice={invoice}
                businessName={nameFor(invoice)}
                isPastDue={false}
              />
            ))}
          </div>
        )}
      </Card>

      <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text weight="semibold">Open invoices</Text>
        <div style={{ marginInline: -8 }}>
          <GroupedTable
            data={openInvoices}
            columns={openInvoiceColumns}
            getRowKey={(row) => row.id}
            listChrome
          />
          {!invoicesLoading && openInvoices.length === 0 ? (
            <div style={{ padding: 24 }}>
              <Text color="secondary">No open invoices right now.</Text>
            </div>
          ) : null}
        </div>
      </section>
    </ClassContentPage>
  );
}
