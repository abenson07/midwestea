"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, FileText, User } from "lucide-react";
import { useBusinesses, useEvents, usePeople, useStripeInvoices } from "hooks";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared/useAdminBasePath";
import { formatUsd } from "@/components/billing/invoiceUtils";
import {
  mobileEmptyStyle,
  mobileListRowStyle,
  mobileSearchInputStyle,
} from "./mobileStyles";

export type MobileSearchOverlayProps = {
  open: boolean;
  onClose: () => void;
};

type Hit =
  | { kind: "person"; id: string; title: string; subtitle: string }
  | { kind: "business"; id: string; title: string; subtitle: string }
  | { kind: "event"; id: string; title: string; subtitle: string }
  | { kind: "invoice"; id: string; title: string; subtitle: string };

export function MobileSearchOverlay({ open, onClose }: MobileSearchOverlayProps) {
  const router = useRouter();
  const base = useAdminBasePath();
  const [q, setQ] = useState("");

  const { people } = usePeople({
    autoFetch: open,
    filters: { search: q.trim() || undefined },
  });
  const { businesses } = useBusinesses({
    autoFetch: open,
    filters: { search: q.trim() || undefined },
  });
  const { events } = useEvents({ autoFetch: open });
  const { invoices } = useStripeInvoices();

  const hits = useMemo((): Hit[] => {
    const term = q.trim().toLowerCase();
    if (!term) return [];

    const personHits: Hit[] = people.slice(0, 8).map((p) => ({
      kind: "person",
      id: p.id,
      title: p.full_name,
      subtitle: p.email ?? "Person",
    }));

    const businessHits: Hit[] = businesses.slice(0, 8).map((b) => ({
      kind: "business",
      id: b.id,
      title: b.business_name ?? "Untitled business",
      subtitle: b.contact_name ?? b.email ?? "Business",
    }));

    const eventHits: Hit[] = events
      .filter((e) => e.title.toLowerCase().includes(term) || e.location.toLowerCase().includes(term))
      .slice(0, 8)
      .map((e) => ({
        kind: "event" as const,
        id: e.id,
        title: e.title,
        subtitle: e.date || e.location || "Event",
      }));

    const invoiceHits: Hit[] = invoices
      .filter((inv) => {
        const hay = [
          inv.number ?? "",
          inv.customer_email ?? "",
          inv.event_name ?? "",
          inv.created_by_name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      })
      .slice(0, 8)
      .map((inv) => ({
        kind: "invoice" as const,
        id: inv.id,
        title: inv.number ? `Invoice ${inv.number}` : inv.id,
        subtitle: `${inv.customer_email ?? "No email"} · ${formatUsd(inv.amount_due)}`,
      }));

    return [...personHits, ...businessHits, ...eventHits, ...invoiceHits];
  }, [q, people, businesses, events, invoices]);

  if (!open) return null;

  function go(hit: Hit) {
    onClose();
    setQ("");
    if (hit.kind === "event") {
      router.push(`${base}/events/${hit.id}`);
      return;
    }
    if (hit.kind === "invoice") {
      router.push(`${base}/invoices?invoice=${encodeURIComponent(hit.id)}`);
      return;
    }
    if (hit.kind === "business") {
      router.push(`${base}/database?tab=businesses&id=${encodeURIComponent(hit.id)}`);
      return;
    }
    router.push(`${base}/database?tab=people&id=${encodeURIComponent(hit.id)}`);
  }

  const iconFor = (kind: Hit["kind"]) => {
    if (kind === "business") return Building2;
    if (kind === "event") return CalendarDays;
    if (kind === "invoice") return FileText;
    return User;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        background: "var(--linear-color-background)",
        paddingTop: "max(8px, env(safe-area-inset-top))",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px 12px",
          borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
        }}
      >
        <button
          type="button"
          aria-label="Close search"
          onClick={() => {
            setQ("");
            onClose();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            border: "none",
            borderRadius: 10,
            background: "transparent",
            color: "var(--linear-color-ink)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={20} strokeWidth={1.75} />
        </button>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people, businesses, events…"
          style={{ ...mobileSearchInputStyle, flex: 1 }}
        />
      </div>

      <div style={{ flex: 1, overflow: "auto", WebkitOverflowScrolling: "touch" }}>
        {!q.trim() ? (
          <div style={mobileEmptyStyle}>Search the database, events, and invoices</div>
        ) : hits.length === 0 ? (
          <div style={mobileEmptyStyle}>No matches</div>
        ) : (
          hits.map((hit) => {
            const Icon = iconFor(hit.kind);
            return (
              <button
                key={`${hit.kind}-${hit.id}`}
                type="button"
                onClick={() => go(hit)}
                style={mobileListRowStyle}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <Icon size={18} strokeWidth={1.75} style={{ flexShrink: 0, opacity: 0.7 }} />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {hit.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--linear-color-ink-subtle)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {hit.subtitle}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
