"use client";

import { useMemo, useState } from "react";
import type { DeliveryWithRelations } from "hooks";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";

const MAX_RESULTS = 8;

export type AddRouteModalProps = {
  isOpen: boolean;
  delivererName: string;
  openDeliveries: DeliveryWithRelations[];
  onClose: () => void;
  onSelect: (delivery: DeliveryWithRelations) => void | Promise<void>;
};

export function AddRouteModal({
  isOpen,
  delivererName,
  openDeliveries,
  onClose,
  onSelect,
}: AddRouteModalProps) {
  const [search, setSearch] = useState("");
  const [selecting, setSelecting] = useState(false);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? openDeliveries.filter((d) => (d.routes?.route_name ?? "").toLowerCase().includes(q))
      : openDeliveries;
    return filtered.slice(0, MAX_RESULTS);
  }, [openDeliveries, search]);

  async function handleSelect(delivery: DeliveryWithRelations) {
    setSelecting(true);
    try {
      await onSelect(delivery);
      setSearch("");
      onClose();
    } finally {
      setSelecting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add route for ${delivererName}`}
      width={420}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextInput label="Search open routes" value={search} onChange={setSearch} />
        {openDeliveries.length === 0 ? (
          <Text size="sm" color="secondary">
            No open routes available.
          </Text>
        ) : candidates.length === 0 ? (
          <Text size="sm" color="secondary">
            No matching routes.
          </Text>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {candidates.map((d) => (
              <button
                key={d.id}
                type="button"
                disabled={selecting}
                onClick={() => {
                  void handleSelect(d);
                }}
                style={{
                  all: "unset",
                  boxSizing: "border-box",
                  cursor: selecting ? "default" : "pointer",
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                  color: "var(--linear-color-ink)",
                  fontSize: 13,
                }}
              >
                {d.routes?.route_name ?? "—"}
                {d.routes?.route_type ? (
                  <span style={{ color: "var(--linear-color-ink-subtle)" }}>
                    {" "}
                    · {d.routes.route_type}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
