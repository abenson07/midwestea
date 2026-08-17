"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text } from "@/components/patterns/primitives/Text";
import { createCommitteeMeetingApi, useDemoGuard } from "hooks";
import type { CommitteeSlug } from "schemas/committee_meetings";
import { newDemoId, upsertDemoEntity } from "@/lib/demo/demoStore";
import { committeeDisplayName } from "./committeeSlug";

export type ScheduleCommitteeMeetingModalProps = {
  isOpen: boolean;
  committee: CommitteeSlug;
  onClose: () => void;
  onCreated: (meeting: { id: string; event_id: string }) => void;
};

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

export function ScheduleCommitteeMeetingModal({
  isOpen,
  committee,
  onClose,
  onCreated,
}: ScheduleCommitteeMeetingModalProps) {
  const { enabled: demo } = useDemoGuard();
  const [startsAt, setStartsAt] = useState("");
  const [locationType, setLocationType] = useState<"in_person" | "remote" | "hybrid">("in_person");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setStartsAt("");
    setLocationType("in_person");
    setLocation("");
    setError(null);
  }, [isOpen]);

  async function handleSubmit() {
    if (!startsAt) {
      setError("Start date/time is required");
      return;
    }
    if (demo) {
      const id = newDemoId("meeting");
      const eventId = newDemoId("evt");
      upsertDemoEntity("committeeMeetings", {
        id,
        event_id: eventId,
        committee,
        starts_at: new Date(startsAt).toISOString(),
        location_type: locationType,
        location: location.trim() || null,
      });
      toast.success("Meeting scheduled — demo mode, saved locally only");
      onCreated({ id, event_id: eventId });
      onClose();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const iso = new Date(startsAt).toISOString();
      const result = await createCommitteeMeetingApi({
        committee,
        starts_at: iso,
        location_type: locationType,
        location: location.trim() || null,
      });
      onCreated({ id: result.meeting.id, event_id: result.event.id });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule meeting");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedule ${committeeDisplayName(committee)} meeting`}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          <Button
            label={submitting ? "Scheduling…" : "Schedule"}
            variant="primary"
            onClick={() => {
              void handleSubmit();
            }}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={fieldLabelStyle}>Starts at</span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            style={selectStyle}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={fieldLabelStyle}>Location type</span>
          <select
            value={locationType}
            onChange={(e) => setLocationType(e.target.value as typeof locationType)}
            style={selectStyle}
          >
            <option value="in_person">In person</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
        <TextInput
            label="Location / Meet link"
            value={location}
            onChange={setLocation}
          />
        {error ? (
          <Text size="sm" color="secondary">
            {error}
          </Text>
        ) : null}
      </div>
    </Modal>
  );
}
