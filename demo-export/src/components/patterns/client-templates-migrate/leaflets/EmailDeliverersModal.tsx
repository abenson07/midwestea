"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useDemoGuard } from "hooks";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { getApiBase } from "@/lib/apiBase";

export type EmailDeliverersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  leafletId: string;
  leafletTitle: string;
  distributionDate: string;
  /** Active comm step; defaults to initial confirmation. */
  stepKey?: string;
  recipientCount: number;
};

const DEFAULT_STEP = "initial_confirmation";

function previewBody(leafletTitle: string, distributionDate: string): string {
  const date = distributionDate
    ? new Date(`${distributionDate}T12:00:00`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "the distribution date";
  return `Hi {first name},\n\nYou're scheduled to help deliver the ${leafletTitle} leaflet on ${date}.\n\nPlease confirm your routes using the link in the email we send.`;
}

export function EmailDeliverersModal({
  isOpen,
  onClose,
  leafletId,
  leafletTitle,
  distributionDate,
  stepKey = DEFAULT_STEP,
  recipientCount,
}: EmailDeliverersModalProps) {
  const { enabled: demo, sendDemoEmail } = useDemoGuard();
  const [confirmText, setConfirmText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subject = `Confirm your routes — ${leafletTitle}`;
  const body = previewBody(leafletTitle, distributionDate);

  async function handleSend() {
    if (confirmText.trim().toLowerCase() !== "confirm") {
      setError('Type "confirm" to send.');
      return;
    }
    setSending(true);
    setError(null);
    try {
      if (demo) {
        await sendDemoEmail({
          subject,
          text: body,
          context: `${recipientCount} deliverer${recipientCount === 1 ? "" : "s"}`,
        });
        setConfirmText("");
        onClose();
        return;
      }
      const res = await fetch(
        `${getApiBase()}/api/leaflets/${encodeURIComponent(leafletId)}/comm/${encodeURIComponent(stepKey)}/send`,
        { method: "POST" },
      );
      const data = (await res.json()) as { error?: string; sent?: number };
      if (!res.ok) throw new Error(data.error ?? "Failed to send");
      toast.success(`Sent ${data.sent ?? 0} email${(data.sent ?? 0) === 1 ? "" : "s"}`);
      setConfirmText("");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Email deliverers"
      width={480}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          <Button
            label={sending ? "Sending…" : "Send"}
            variant="primary"
            onClick={() => {
              void handleSend();
            }}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Text size="sm" color="secondary">
          This will email {recipientCount} deliverer{recipientCount === 1 ? "" : "s"} who have not
          confirmed yet.
        </Text>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Text size="sm" color="secondary">
            Subject
          </Text>
          <Text weight="medium">{subject}</Text>
        </div>
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            background: "var(--linear-color-panel)",
            whiteSpace: "pre-wrap",
            fontSize: 13,
            lineHeight: 1.5,
            color: "var(--linear-color-ink)",
          }}
        >
          {body}
        </div>
        <TextInput
          label='Type "confirm" to send'
          value={confirmText}
          onChange={setConfirmText}
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
