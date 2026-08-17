"use client";

import { useState } from "react";
import { useAllSponsorships, useDemoGuard, type SponsorshipWithParent } from "hooks";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { formatUsd } from "@/components/billing/invoiceUtils";

export type SponsorshipDetailPanelProps = {
  sponsorship: SponsorshipWithParent;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Text size="sm" color="secondary">
        {label}
      </Text>
      <Text weight="medium">{value}</Text>
    </div>
  );
}

export function SponsorshipDetailPanel({ sponsorship }: SponsorshipDetailPanelProps) {
  const { updateSponsorship } = useAllSponsorships();
  const { enabled: demo } = useDemoGuard();
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(sponsorship.status);

  async function markPaid() {
    setSaving(true);
    try {
      if (demo) {
        setStatus("paid");
        return;
      }
      await updateSponsorship(sponsorship.id, {
        status: "paid",
        paid_date: new Date().toISOString().slice(0, 10),
      });
      setStatus("paid");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Text weight="semibold">{sponsorship.businesses?.business_name ?? "Sponsorship"}</Text>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sponsorship.businesses?.email ? (
          <Field label="Contact" value={sponsorship.businesses.email} />
        ) : null}
        <Field label="Parent" value={sponsorship.parentLabel} />
        <Field label="Tier / item" value={sponsorship.description ?? "—"} />
        <Field label="Amount" value={formatUsd((sponsorship.amount ?? 0) * 100)} />
        <Field label="Status" value={status ?? "—"} />
      </div>

      {status !== "paid" ? (
        <Button
          label={saving ? "Saving…" : "Mark paid"}
          variant="secondary"
          onClick={() => void markPaid()}
        />
      ) : null}
    </div>
  );
}
