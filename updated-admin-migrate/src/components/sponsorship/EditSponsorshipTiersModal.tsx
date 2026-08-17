"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { Modal } from "@/components/ui/modal";
import type { SponsorshipTierSeed } from "@/lib/sponsorship/tierPlaceholders";

type TierRow = {
  key: string;
  name: string;
  quantity: string;
  amount: string;
};

type EditSponsorshipTiersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTiers: SponsorshipTierSeed[];
  onSave: (tiers: SponsorshipTierSeed[]) => Promise<void>;
};

function toRows(tiers: SponsorshipTierSeed[]): TierRow[] {
  return tiers.map((tier, index) => ({
    key: `${tier.name}-${index}`,
    name: tier.name,
    quantity: String(tier.quantity),
    amount: String(tier.amount),
  }));
}

function parseRows(rows: TierRow[]): SponsorshipTierSeed[] {
  return rows
    .map((row) => {
      const name = row.name.trim();
      const quantity = Number(row.quantity);
      const amount = Number(row.amount);
      if (!name || !Number.isFinite(quantity) || quantity < 1) return null;
      if (!Number.isFinite(amount) || amount <= 0) return null;
      return { name, quantity: Math.round(quantity), amount };
    })
    .filter((tier): tier is SponsorshipTierSeed => tier != null);
}

export default function EditSponsorshipTiersModal({
  isOpen,
  onClose,
  initialTiers,
  onSave,
}: EditSponsorshipTiersModalProps) {
  const [rows, setRows] = useState<TierRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRows(toRows(initialTiers));
      setError(null);
    }
  }, [isOpen, initialTiers]);

  const updateRow = (key: string, patch: Partial<TierRow>) => {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      { key: `new-${Date.now()}`, name: "", quantity: "1", amount: "" },
    ]);
  };

  const removeRow = (key: string) => {
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tiers = parseRows(rows);
    if (tiers.length === 0) {
      setError("Add at least one sponsorship level with a name, quantity, and price.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(tiers);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sponsorship levels.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-400";

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
      <form onSubmit={(e) => void handleSubmit(e)}>
        <h2 className="lf-h2" style={{ marginBottom: 8 }}>
          Edit sponsorship levels
        </h2>
        <p className="lf-meta" style={{ marginBottom: 16 }}>
          Set the sponsorship line items, quantities, and prices for this leaflet run.
        </p>

        {error ? <p className="lf-text-red" style={{ marginBottom: 12 }}>{error}</p> : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rows.map((row) => (
            <div
              key={row.key}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr auto",
                gap: 12,
                alignItems: "end",
              }}
            >
              <div>
                <Label>Name</Label>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateRow(row.key, { name: e.target.value })}
                  placeholder="Gold Sponsor"
                  className={inputClass}
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  step={1}
                  value={row.quantity}
                  onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  min="1"
                  step={1}
                  value={row.amount}
                  onChange={(e) => updateRow(row.key, { amount: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="lf-link"
                onClick={() => removeRow(row.key)}
                disabled={rows.length <= 1}
                style={{ paddingBottom: 10 }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="lf-link" onClick={addRow} style={{ marginTop: 16 }}>
          + Add level
        </button>

        <div className="flex items-center justify-end gap-3" style={{ marginTop: 24 }}>
          <Button type="button" size="sm" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? "Saving…" : "Save levels"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
