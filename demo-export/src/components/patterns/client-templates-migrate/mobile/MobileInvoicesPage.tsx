"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { STRIPE_INVOICES_QUERY_KEY, useEvents, useStripeInvoices, useDemoGuard } from "hooks";
import { getApiBase } from "@/lib/apiBase";
import {
  formatDueDate,
  formatUsd,
  mercuryInvoiceDisplayStatus,
} from "@/components/billing/invoiceUtils";
import type { StripeInvoiceTableRow } from "@/components/billing/InvoicesListTable";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { MobileBottomSheet } from "./MobileBottomSheet";
import {
  mobileEmptyStyle,
  mobileFabStyle,
  mobileFieldLabelStyle,
  mobileHeaderStyle,
  mobileInputStyle,
  mobileListRowStyle,
  mobilePageStyle,
  mobilePrimaryBtnStyle,
  mobileScrollStyle,
  mobileSecondaryBtnStyle,
  mobileSearchInputStyle,
  mobileTitleStyle,
} from "./mobileStyles";

function isDueInvoice(inv: StripeInvoiceTableRow): boolean {
  const status = (inv.status ?? "").toLowerCase();
  return status === "open" || status === "uncollectible" || status === "draft";
}

export function MobileInvoicesPage() {
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get("invoice");
  const { invoices, loading, error, refetch } = useStripeInvoices();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StripeInvoiceTableRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const due = useMemo(() => {
    const term = search.trim().toLowerCase();
    return invoices
      .filter(isDueInvoice)
      .filter((inv) => {
        if (!term) return true;
        const hay = [
          inv.number ?? "",
          inv.customer_email ?? "",
          inv.event_name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      })
      .sort((a, b) => (a.due_date ?? a.created) - (b.due_date ?? b.created));
  }, [invoices, search]);

  useEffect(() => {
    if (!deepLinkId) return;
    const match = invoices.find((i) => i.id === deepLinkId);
    if (match) setSelected(match);
  }, [deepLinkId, invoices]);

  return (
    <div style={{ ...mobilePageStyle, position: "relative" }}>
      <header style={mobileHeaderStyle}>
        <h1 style={mobileTitleStyle}>Invoices</h1>
        <div style={{ marginTop: 4, fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>
          Due / unpaid
        </div>
        <div style={{ marginTop: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoices…"
            style={mobileSearchInputStyle}
          />
        </div>
      </header>

      <div style={mobileScrollStyle}>
        {error ? (
          <div style={mobileEmptyStyle}>{error}</div>
        ) : loading ? (
          <div style={mobileEmptyStyle}>Loading…</div>
        ) : due.length === 0 ? (
          <div style={mobileEmptyStyle}>No due invoices</div>
        ) : (
          due.map((inv) => (
            <button
              key={inv.id}
              type="button"
              style={mobileListRowStyle}
              onClick={() => setSelected(inv)}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>
                  {inv.customer_email ?? inv.number ?? inv.id}
                </div>
                <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)", marginTop: 2 }}>
                  {formatUsd(inv.amount_due)} · Due {formatDueDate(inv.due_date)} ·{" "}
                  {mercuryInvoiceDisplayStatus(inv)}
                  {inv.event_name ? ` · ${inv.event_name}` : ""}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <button type="button" style={mobileFabStyle} onClick={() => setCreateOpen(true)}>
        <Plus size={18} strokeWidth={2} />
        New
      </button>

      <MobileInvoiceSheet
        invoice={selected}
        onClose={() => setSelected(null)}
        onChanged={async () => {
          await refetch();
        }}
      />
      <MobileCreateInvoice
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false);
          await refetch();
        }}
      />
    </div>
  );
}

function MobileInvoiceSheet({
  invoice,
  onClose,
  onChanged,
}: {
  invoice: StripeInvoiceTableRow | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const queryClient = useQueryClient();
  const { enabled: demo } = useDemoGuard();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmMethod, setConfirmMethod] = useState<"cash" | "check" | null>(null);

  const isOpen = invoice?.status === "open";

  async function markPaid(method: "cash" | "check") {
    if (!invoice) return;
    setBusy(true);
    setMessage(null);
    if (demo) {
      const { patchDemoEntity } = await import("@/lib/demo/demoStore");
      patchDemoEntity("invoices", invoice.id, { status: "paid", payment_method: method });
      setConfirmMethod(null);
      setMessage(`Marked paid by ${method} — demo mode, saved locally only`);
      setBusy(false);
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
      if (!res.ok) throw new Error(data.error ?? "Could not mark paid.");
      setConfirmMethod(null);
      setMessage(`Marked paid by ${method}.`);
      await queryClient.invalidateQueries({ queryKey: STRIPE_INVOICES_QUERY_KEY });
      await onChanged();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not mark paid.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileBottomSheet
      open={invoice != null}
      onClose={() => {
        setMessage(null);
        setConfirmMethod(null);
        onClose();
      }}
      title={invoice?.number ? `Invoice ${invoice.number}` : "Invoice"}
    >
      {invoice ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Customer</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{invoice.customer_email ?? "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Amount due</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{formatUsd(invoice.amount_due)}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Status</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>
              {mercuryInvoiceDisplayStatus(invoice)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Due</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{formatDueDate(invoice.due_date)}</div>
          </div>
          {invoice.event_name ? (
            <div>
              <div style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Event</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{invoice.event_name}</div>
            </div>
          ) : null}

          {message ? (
            <div style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>{message}</div>
          ) : null}

          {isOpen && !confirmMethod ? (
            <button
              type="button"
              style={mobilePrimaryBtnStyle}
              onClick={() => setConfirmMethod("cash")}
            >
              Mark paid (cash / check)
            </button>
          ) : null}

          {confirmMethod ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 13, color: "var(--linear-color-ink-subtle)" }}>
                How did they pay?
              </div>
              <button
                type="button"
                style={mobilePrimaryBtnStyle}
                disabled={busy}
                onClick={() => markPaid("cash")}
              >
                Cash
              </button>
              <button
                type="button"
                style={mobileSecondaryBtnStyle}
                disabled={busy}
                onClick={() => markPaid("check")}
              >
                Check
              </button>
              <button
                type="button"
                style={mobileSecondaryBtnStyle}
                onClick={() => setConfirmMethod(null)}
              >
                Cancel
              </button>
            </div>
          ) : null}

          {invoice.hosted_invoice_url ? (
            <a
              href={invoice.hosted_invoice_url}
              target="_blank"
              rel="noreferrer"
              style={{
                ...mobileSecondaryBtnStyle,
                textDecoration: "none",
                boxSizing: "border-box",
              }}
            >
              Open hosted invoice
            </a>
          ) : null}
        </div>
      ) : null}
    </MobileBottomSheet>
  );
}

function MobileCreateInvoice({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const { events } = useEvents({ autoFetch: open });
  const { enabled: demo, sendDemoEmail } = useDemoGuard();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Invoice");
  const [memo, setMemo] = useState("");
  const [eventId, setEventId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setEmail("");
    setName("");
    setAmount("");
    setDescription("Invoice");
    setMemo("");
    setEventId("");
    setError(null);
  }

  async function submit() {
    const cents = Math.round(parseFloat(amount) * 100);
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!Number.isFinite(cents) || cents <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    if (!eventId) {
      setError("Select an event (required for Stripe invoices).");
      return;
    }
    setBusy(true);
    setError(null);
    if (demo) {
      try {
        await sendDemoEmail({
          subject: `Invoice — ${description.trim() || "Invoice"}`,
          text: `An invoice for ${amount} would have been issued to ${email.trim()}.`,
          context: email.trim(),
        });
        reset();
        onClose();
        await onCreated();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not send demo invoice email.");
      } finally {
        setBusy(false);
      }
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/stripe/invoices/issue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          category: "event",
          eventId,
          memo: memo.trim() || undefined,
          lineItems: [
            {
              description: description.trim() || "Invoice",
              amountCents: cents,
            },
          ],
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not create invoice.");
      reset();
      await onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create invoice.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <MobileBottomSheet
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="New invoice"
      size="tall"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextInput label="Customer email" value={email} onChange={setEmail} />
        <TextInput label="Customer name" value={name} onChange={setName} />
        <TextInput label="Amount (USD)" value={amount} onChange={setAmount} />
        <TextInput label="Line description" value={description} onChange={setDescription} />
        <TextInput label="Memo" value={memo} onChange={setMemo} multiline rows={2} />
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={mobileFieldLabelStyle}>Event</span>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            style={mobileInputStyle}
          >
            <option value="">Select event…</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </label>
        {error ? <div style={{ fontSize: 13, color: "#eb5757" }}>{error}</div> : null}
        <button type="button" style={mobilePrimaryBtnStyle} disabled={busy} onClick={submit}>
          {busy ? "Sending…" : "Create & send"}
        </button>
      </div>
    </MobileBottomSheet>
  );
}
