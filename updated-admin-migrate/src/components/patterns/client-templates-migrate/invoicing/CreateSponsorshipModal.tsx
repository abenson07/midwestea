"use client";

import { useState } from "react";
import { useEvents, useLeaflets } from "hooks";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import AddSponsorModal from "@/components/sponsorship/AddSponsorModal";
import type { SponsorshipsInsert } from "@/types/database";

type ParentSelection = { type: "event" | "leaflet"; id: string } | null;

const selectStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

export type CreateSponsorshipModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
  createSponsorship: (args: {
    eventId?: string | null;
    leafletId?: string | null;
    payload: Omit<SponsorshipsInsert, "event_id" | "leaflet_id">;
  }) => Promise<unknown>;
};

export function CreateSponsorshipModal({
  isOpen,
  onClose,
  onCreated,
  createSponsorship,
}: CreateSponsorshipModalProps) {
  const { events } = useEvents();
  const { leaflets } = useLeaflets();
  const [parent, setParent] = useState<ParentSelection>(null);

  function handleClose() {
    setParent(null);
    onClose();
  }

  if (!isOpen) return null;

  if (!parent) {
    const options = [
      ...events.map((e) => ({ type: "event" as const, id: e.id, label: e.title })),
      ...leaflets.map((l) => ({ type: "leaflet" as const, id: l.id, label: l.title })),
    ];

    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="New sponsorship">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>
              Which event or leaflet is this sponsorship for?
            </span>
            <select
              style={selectStyle}
              defaultValue=""
              onChange={(event) => {
                const [type, id] = event.target.value.split(":");
                if (type === "event" || type === "leaflet") setParent({ type, id });
              }}
            >
              <option value="" disabled>
                Select a parent…
              </option>
              {options.map((option) => (
                <option key={`${option.type}:${option.id}`} value={`${option.type}:${option.id}`}>
                  {option.label} ({option.type})
                </option>
              ))}
            </select>
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button label="Cancel" variant="ghost" onClick={handleClose} />
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <AddSponsorModal
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={async (payload) => {
        await createSponsorship({
          eventId: parent.type === "event" ? parent.id : null,
          leafletId: parent.type === "leaflet" ? parent.id : null,
          payload,
        });
        setParent(null);
        await onCreated();
      }}
    />
  );
}
