"use client";

import { useState } from "react";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { getApiBase } from "@/lib/apiBase";
import { useDemoGuard } from "hooks";

type ManualPaymentMethod = "cash" | "check";

export type MarkAsPaidControlProps = {
  /** Real Stripe invoice id this row was built from. */
  invoiceId: string;
  isPaid: boolean;
  /** Called after a successful manual payment so the caller can refetch/invalidate. */
  onPaid?: () => Promise<void> | void;
};

/**
 * Records a manual (cash/check) payment against a Stripe invoice — same
 * endpoint and confirm flow as the Invoices page's InvoiceDetailPanel.
 * Shared by event and leaflet sponsorship-invoice panels.
 */
export function MarkAsPaidControl({ invoiceId, isPaid, onPaid }: MarkAsPaidControlProps) {
  const { enabled: demo } = useDemoGuard();
  const [confirmMethod, setConfirmMethod] = useState<ManualPaymentMethod | null>(null);
  const [recording, setRecording] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (isPaid) return null;

  async function recordPayment(method: ManualPaymentMethod) {
    setRecording(true);
    setStatusMessage(null);
    if (demo) {
      const { patchDemoEntity } = await import("@/lib/demo/demoStore");
      patchDemoEntity("invoices", invoiceId, { status: "paid", payment_method: method });
      setStatusMessage(`Marked paid by ${method} — demo mode, saved locally only`);
      setConfirmMethod(null);
      setRecording(false);
      return;
    }
    try {
      const res = await fetch(
        `${getApiBase()}/api/stripe/invoices/${encodeURIComponent(invoiceId)}/mark-paid`,
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
      await onPaid?.();
    } catch (e) {
      setStatusMessage(e instanceof Error ? e.message : "Could not record payment.");
    } finally {
      setRecording(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {confirmMethod ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 10,
            borderRadius: 8,
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          }}
        >
          <Text size="sm">
            Confirm: mark this invoice as paid via <strong>{confirmMethod}</strong>? This cannot be
            undone.
          </Text>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              label={recording ? "Recording…" : "Confirm"}
              variant="primary"
              size="sm"
              width="100%"
              onClick={() => void recordPayment(confirmMethod)}
            />
            <Button label="Cancel" variant="ghost" size="sm" onClick={() => setConfirmMethod(null)} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            label="Paid by cash"
            variant="secondary"
            size="sm"
            width="100%"
            onClick={() => setConfirmMethod("cash")}
          />
          <Button
            label="Paid by check"
            variant="secondary"
            size="sm"
            width="100%"
            onClick={() => setConfirmMethod("check")}
          />
        </div>
      )}
      {statusMessage ? (
        <Text size="sm" color="secondary">
          {statusMessage}
        </Text>
      ) : null}
    </div>
  );
}
