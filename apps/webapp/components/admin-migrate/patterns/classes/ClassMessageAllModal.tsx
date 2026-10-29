"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { postAdminMessage } from "@/lib/admin-messages-client";

export type ClassMessageAllModalProps = {
  isOpen: boolean;
  classId: string;
  onClose: () => void;
};

const fieldStyle = {
  boxSizing: "border-box",
  width: "100%",
  padding: 12,
  borderRadius: "var(--linear-radius-md)",
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
  lineHeight: 1.45,
} as const;

/**
 * Broadcast compose — opened from the class topbar. Two steps: compose, then
 * an explicit confirm that shows how many students will be emailed (from a
 * server dry run that sends nothing).
 */
export function ClassMessageAllModal({ isOpen, classId, onClose }: ClassMessageAllModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmCount, setConfirmCount] = useState<number | null>(null);
  const inFlight = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setMessage("");
      setConfirmCount(null);
    }
  }, [isOpen]);

  async function handleReview() {
    if (inFlight.current) return;
    if (!subject.trim()) {
      toast.error("Add a subject before sending");
      return;
    }
    if (!message.trim()) {
      toast.error("Write a message before sending");
      return;
    }
    inFlight.current = true;
    setBusy(true);
    try {
      const result = await postAdminMessage({ classId }, subject, message, { dryRun: true });
      setConfirmCount(result.recipients);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not check recipients");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function handleSend() {
    if (inFlight.current || confirmCount === null) return;
    inFlight.current = true;
    setBusy(true);
    try {
      const result = await postAdminMessage({ classId }, subject, message, {
        expectedRecipients: confirmCount,
      });
      const noun = (n: number) => `${n} student${n === 1 ? "" : "s"}`;
      if (result.failed.length === 0) {
        toast.success(`Sent to ${noun(result.sent)}`);
        onClose();
      } else if (result.sent > 0) {
        toast.warning(`Sent to ${noun(result.sent)}, but ${result.failed.length} failed to send`);
        onClose();
      } else {
        toast.error(`The message could not be sent to ${noun(result.failed.length)}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  function handleClose() {
    if (!inFlight.current) onClose();
  }

  const confirming = confirmCount !== null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Message all students"
      width={480}
      footer={
        confirming ? (
          <>
            <Button label="Back" variant="secondary" disabled={busy} onClick={() => setConfirmCount(null)} />
            <Button
              label={busy ? "Sending…" : `Send to ${confirmCount} student${confirmCount === 1 ? "" : "s"}`}
              variant="primary"
              disabled={busy}
              onClick={handleSend}
            />
          </>
        ) : (
          <>
            <Button label="Cancel" variant="secondary" disabled={busy} onClick={handleClose} />
            <Button label={busy ? "Checking…" : "Review"} variant="primary" disabled={busy} onClick={handleReview} />
          </>
        )
      }
    >
      {confirming ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "var(--linear-color-ink)" }}>
          <strong>This will email {confirmCount} student{confirmCount === 1 ? "" : "s"}.</strong>
          <span>Subject: {subject.trim()}</span>
          <span style={{ whiteSpace: "pre-wrap" }}>{message.trim()}</span>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Subject"
            maxLength={200}
            disabled={busy}
            autoFocus
            style={{ ...fieldStyle, padding: "8px 12px" }}
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write a plain-text message to everyone enrolled in this class…"
            rows={6}
            maxLength={10000}
            disabled={busy}
            style={{ ...fieldStyle, minHeight: 140, resize: "vertical" }}
          />
        </div>
      )}
    </Modal>
  );
}
