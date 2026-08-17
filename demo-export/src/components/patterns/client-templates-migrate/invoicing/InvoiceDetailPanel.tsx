"use client";

import { useState } from "react";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { VStack } from "@/components/patterns/primitives/Stack";
import {
  DetailActionBar,
  DetailRow,
  DetailSection,
  DetailTimeline,
  type DetailTimelineStep,
} from "@/components/patterns/foundation/detail";
import { useQueryClient } from "@tanstack/react-query";
import { getApiBase } from "@/lib/apiBase";
import { STRIPE_INVOICES_QUERY_KEY, useDemoGuard } from "hooks";
import {
  customerLabelFromEmail,
  formatDueDate,
  formatUsd,
  mercuryInvoiceDisplayStatus,
  mercuryInvoiceStatusColor,
} from "@/components/billing/invoiceUtils";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";

export type InvoiceDetailPanelProps = {
  invoice: StripeInvoiceTableRow;
};

const STATUS_HEX: Record<"warning" | "info" | "success", string> = {
  warning: "#eb5757",
  info: "#f2c94c",
  success: "#27a644",
};

type ManualPaymentMethod = "cash" | "check";

export function InvoiceDetailPanel({ invoice }: InvoiceDetailPanelProps) {
  const queryClient = useQueryClient();
  const { enabled: demo, sendDemoEmail } = useDemoGuard();
  const [reminding, setReminding] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [confirmMethod, setConfirmMethod] = useState<ManualPaymentMethod | null>(null);
  const [recordingPayment, setRecordingPayment] = useState(false);

  const displayStatus = mercuryInvoiceDisplayStatus(invoice);
  const statusColor = STATUS_HEX[mercuryInvoiceStatusColor(displayStatus)];
  const isOpen = invoice.status === "open";

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: STRIPE_INVOICES_QUERY_KEY });
  }

  async function sendReminder() {
    setReminding(true);
    setStatusMessage(null);
    if (demo) {
      try {
        await sendDemoEmail({
          subject: `Invoice reminder — ${invoice.number ?? invoice.id}`,
          text: `This is a reminder that invoice ${invoice.number ?? invoice.id} for ${formatUsd(invoice.amount_due)} is due ${formatDueDate(invoice.due_date)}.`,
          context: invoice.customer_email ?? undefined,
        });
        setStatusMessage("Reminder sent.");
      } catch (e) {
        setStatusMessage(e instanceof Error ? e.message : "Could not send reminder.");
      } finally {
        setReminding(false);
      }
      return;
    }
    try {
      const res = await fetch(
        `${getApiBase()}/api/stripe/invoices/${encodeURIComponent(invoice.id)}/remind`,
        { method: "POST" },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not send reminder.");
      setStatusMessage("Reminder sent.");
      await invalidate();
    } catch (e) {
      setStatusMessage(e instanceof Error ? e.message : "Could not send reminder.");
    } finally {
      setReminding(false);
    }
  }

  async function recordManualPayment(method: ManualPaymentMethod) {
    setRecordingPayment(true);
    setStatusMessage(null);
    if (demo) {
      const { patchDemoEntity } = await import("@/lib/demo/demoStore");
      patchDemoEntity("invoices", invoice.id, { status: "paid", payment_method: method });
      setStatusMessage(`Marked paid by ${method} — demo mode, saved locally only`);
      setConfirmMethod(null);
      setRecordingPayment(false);
      return;
    }
    try {
      const res = await fetch(
        `${getApiBase()}/api/stripe/invoices/${encodeURIComponent(invoice.id)}/mark-paid`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method }),
        },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not record payment.");
      setStatusMessage(`Marked paid by ${method}.`);
      setConfirmMethod(null);
      await invalidate();
    } catch (e) {
      setStatusMessage(e instanceof Error ? e.message : "Could not record payment.");
    } finally {
      setRecordingPayment(false);
    }
  }

  const timelineSteps: DetailTimelineStep[] = [
    { label: "Invoice created", meta: formatDueDate(invoice.created) },
  ];
  if (invoice.customer_email) {
    timelineSteps.push({
      label: `Sent to ${customerLabelFromEmail(invoice.customer_email)}`,
      meta: invoice.customer_email,
      isDestination: displayStatus !== "Paid",
    });
  }
  if (displayStatus === "Paid") {
    timelineSteps.push({ label: "Paid", isDestination: true });
  }

  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 22,
              paddingInline: 8,
              borderRadius: 999,
              background: `${statusColor}1A`,
              color: statusColor,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {displayStatus}
          </span>
          <Text size="sm" color="secondary">
            {invoice.number ? `Invoice ${invoice.number}` : invoice.id}
          </Text>
        </div>
        <Text style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.01em" }}>
          {formatUsd(invoice.amount_due)}
        </Text>
      </div>

      <DetailTimeline steps={timelineSteps} />

      <DetailActionBar>
        {isOpen ? (
          <Button
            label={reminding ? "Sending…" : "Send reminder"}
            variant="secondary"
            size="sm"
            onClick={() => void sendReminder()}
          />
        ) : null}
        {invoice.hosted_invoice_url ? (
          <a
            href={invoice.hosted_invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Button label="Open pay page" variant="ghost" size="sm" />
          </a>
        ) : null}
      </DetailActionBar>

      <DetailSection>
        {invoice.customer_email ? <DetailRow label="Recipient" value={invoice.customer_email} /> : null}
        <DetailRow label="Due" value={formatDueDate(invoice.due_date)} />
        {invoice.event_name ? <DetailRow label="Event" value={invoice.event_name} /> : null}
        {invoice.sponsorship_category ? (
          <DetailRow label="Category" value={invoice.sponsorship_category} />
        ) : null}
      </DetailSection>

      {isOpen ? (
        <DetailSection title="Record manual payment">
          <Text size="sm" color="secondary">
            Use this when a sponsor paid by cash or check instead of card — this marks the
            invoice paid in Stripe and records how.
          </Text>

          {confirmMethod ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginTop: 8,
                padding: 10,
                borderRadius: 8,
                border: "var(--linear-border-width) solid var(--linear-color-hairline)",
              }}
            >
              <Text size="sm">
                Confirm: mark this invoice as paid via <strong>{confirmMethod}</strong>? This
                cannot be undone.
              </Text>
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  label={recordingPayment ? "Recording…" : "Confirm"}
                  variant="primary"
                  onClick={() => void recordManualPayment(confirmMethod)}
                />
                <Button label="Cancel" variant="ghost" onClick={() => setConfirmMethod(null)} />
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button label="Paid by cash" variant="secondary" onClick={() => setConfirmMethod("cash")} />
              <Button label="Paid by check" variant="secondary" onClick={() => setConfirmMethod("check")} />
            </div>
          )}
        </DetailSection>
      ) : null}

      {statusMessage ? (
        <Text size="sm" color="secondary">
          {statusMessage}
        </Text>
      ) : null}
    </VStack>
  );
}
