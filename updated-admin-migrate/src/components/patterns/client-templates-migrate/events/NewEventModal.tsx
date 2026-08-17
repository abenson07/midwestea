"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import type { EventSummary } from "@/data/mocks/events";

export type NewEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (event: Omit<EventSummary, "id">) => void;
  /** Prefill / lock committee when creating from a committee page. */
  defaultCommittee?: CommitteeSlug;
  committeeLocked?: boolean;
};

const COMMITTEE_OPTIONS = Object.entries(COMMITTEE_LABELS) as [CommitteeSlug, string][];

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;
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

/** Starter form for a new event — just enough to create the record and open its detail page. */
export function NewEventModal({
  isOpen,
  onClose,
  onCreate,
  defaultCommittee = "events",
  committeeLocked = false,
}: NewEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [committee, setCommittee] = useState<CommitteeSlug>(defaultCommittee);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setDate("");
    setLocation("");
    setCommittee(defaultCommittee);
    setDescription("");
  }, [isOpen, defaultCommittee]);

  function handleSubmit() {
    if (!title.trim() || !date) return;
    onCreate?.({
      title: title.trim(),
      date,
      location: location.trim(),
      committee,
      description: description.trim(),
    });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New event"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Create event" variant="primary" onClick={handleSubmit} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Event title" value={title} onChange={setTitle} />

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            style={selectStyle}
          />
        </label>

        <TextInput label="Location" value={location} onChange={setLocation} />

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Committee</span>
          <select
            value={committee}
            disabled={committeeLocked}
            onChange={(event) => setCommittee(event.target.value as CommitteeSlug)}
            style={{
              ...selectStyle,
              opacity: committeeLocked ? 0.7 : 1,
              cursor: committeeLocked ? "not-allowed" : undefined,
            }}
          >
            {COMMITTEE_OPTIONS.map(([slug, label]) => (
              <option key={slug} value={slug}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <TextInput
          label="Description"
          value={description}
          onChange={setDescription}
          multiline
          rows={3}
        />
      </div>
    </Modal>
  );
}
