"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";
import { getApiBase } from "@/lib/apiBase";
import { COMMITTEE_LABELS, type CommitteeSlug } from "schemas/committee_meetings";
import { useEvents, useDemoGuard, type VolunteerAskWithSignups } from "hooks";
import type { VolunteerCommitmentType, VolunteerCommitmentUnit } from "@/types/database";
import type { SampleVolunteerAsk } from "@/data/mocks/committees";
import { upsertDemoVolunteerAsk } from "@/lib/demo/demoVolunteerAsks";

export type CreateVolunteerAskModalProps = {
  isOpen: boolean;
  committee: CommitteeSlug;
  ask?: VolunteerAskWithSignups | null;
  /** When creating from an event page, lock event_id. */
  eventId?: string | null;
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  title: string;
  description: string;
  commitment_type: VolunteerCommitmentType;
  commitment_unit: VolunteerCommitmentUnit;
  commitment_quantity: string;
  quantity: string;
  event_id: string;
  auto_accept: boolean;
  auto_response_body: string;
};

const initialForm = (committee: CommitteeSlug, eventId?: string | null): FormState => ({
  title: "",
  description: "",
  commitment_type: "one_off",
  commitment_unit: "hours",
  commitment_quantity: "1",
  quantity: "1",
  event_id: eventId ?? "",
  auto_accept: false,
  auto_response_body: "",
});

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

export function CreateVolunteerAskModal({
  isOpen,
  committee,
  ask = null,
  eventId = null,
  onClose,
  onSaved,
}: CreateVolunteerAskModalProps) {
  const isEdit = ask != null;
  const { enabled: demo } = useDemoGuard();
  const { events } = useEvents({ autoFetch: isOpen });
  const [form, setForm] = useState<FormState>(() => initialForm(committee, eventId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventOptions = useMemo(
    () =>
      events
        .filter((e) => e.kind !== "committee_meeting")
        .map((e) => ({ id: e.id, label: e.title || "Untitled event" })),
    [events],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (ask) {
      setForm({
        title: ask.title,
        description: ask.description ?? "",
        commitment_type: ask.commitment_type,
        commitment_unit: ask.commitment_unit,
        commitment_quantity: String(ask.commitment_quantity),
        quantity: String(ask.quantity),
        event_id: ask.event_id ?? eventId ?? "",
        auto_accept: ask.auto_accept ?? false,
        auto_response_body: ask.auto_response_body ?? "",
      });
    } else {
      setForm(initialForm(committee, eventId));
    }
    setError(null);
  }, [isOpen, ask, committee, eventId]);

  async function handleSubmit() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    if (form.auto_accept && !form.auto_response_body.trim()) {
      setError("Add auto-response details when auto-accept is on");
      return;
    }

    if (demo) {
      const askRow: SampleVolunteerAsk = {
        id: isEdit && ask ? ask.id : `demo-ask-${committee}-${Date.now()}`,
        committee,
        title: form.title.trim(),
        description: form.description.trim(),
        quantity: Math.max(1, Number.parseInt(form.quantity, 10) || 1),
      };
      upsertDemoVolunteerAsk(askRow);
      toast.success(`${isEdit ? "Ask updated" : "Ask created"} — demo mode, saved locally only`);
      onSaved();
      onClose();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        commitment_type: form.commitment_type,
        commitment_unit: form.commitment_unit,
        commitment_quantity: Number(form.commitment_quantity),
        quantity: Number.parseInt(form.quantity, 10),
        committee,
        event_id: form.event_id.trim() || null,
        auto_accept: form.auto_accept,
        auto_response_body: form.auto_accept ? form.auto_response_body.trim() : null,
      };

      const url = isEdit
        ? `${getApiBase()}/api/volunteers/asks/${encodeURIComponent(ask!.id)}`
        : `${getApiBase()}/api/volunteers/asks`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to save volunteer ask");
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit volunteer ask" : "New volunteer ask"}
      width={480}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", width: "100%" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          <Button
            label={submitting ? "Saving…" : isEdit ? "Save" : "Create"}
            variant="primary"
            onClick={() => {
              if (!submitting) void handleSubmit();
            }}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text size="sm" color="secondary">
          Committee: {COMMITTEE_LABELS[committee]}
        </Text>
        <TextInput
          label="Title"
          value={form.title}
          onChange={(title) => setForm((f) => ({ ...f, title }))}
        />
        <TextInput
          label="Description"
          value={form.description}
          onChange={(description) => setForm((f) => ({ ...f, description }))}
          multiline
          rows={3}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={fieldLabelStyle}>Type</span>
            <select
              value={form.commitment_type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  commitment_type: e.target.value as VolunteerCommitmentType,
                }))
              }
              style={selectStyle}
            >
              <option value="one_off">One-off</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={fieldLabelStyle}>Unit</span>
            <select
              value={form.commitment_unit}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  commitment_unit: e.target.value as VolunteerCommitmentUnit,
                }))
              }
              style={selectStyle}
            >
              <option value="hours">Hours</option>
              <option value="minutes">Minutes</option>
            </select>
          </label>
          <TextInput
            label="Amount"
            value={form.commitment_quantity}
            onChange={(commitment_quantity) => setForm((f) => ({ ...f, commitment_quantity }))}
          />
        </div>

        <TextInput
          label="Slots needed"
          value={form.quantity}
          onChange={(quantity) => setForm((f) => ({ ...f, quantity }))}
        />

        {!eventId ? (
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={fieldLabelStyle}>Event (optional)</span>
            <select
              value={form.event_id}
              onChange={(e) => setForm((f) => ({ ...f, event_id: e.target.value }))}
              style={selectStyle}
            >
              <option value="">No event</option>
              {eventOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.auto_accept}
            onChange={(e) => setForm((f) => ({ ...f, auto_accept: e.target.checked }))}
            style={{ marginTop: 3 }}
          />
          <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Text weight="medium" size="sm">
              Auto-accept signups
            </Text>
            <Text size="sm" color="secondary">
              Thank them automatically and include where/when to show up.
            </Text>
          </span>
        </label>

        {form.auto_accept ? (
          <TextInput
            label="Auto-response details"
            value={form.auto_response_body}
            onChange={(auto_response_body) => setForm((f) => ({ ...f, auto_response_body }))}
            multiline
            rows={5}
          />
        ) : null}

        {error ? (
          <Text size="sm" style={{ color: "#eb5757" }}>
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}
