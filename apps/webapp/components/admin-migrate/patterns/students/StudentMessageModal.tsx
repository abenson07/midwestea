"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { postAdminMessage } from "@/lib/admin-messages-client";

export type StudentMessageModalProps = {
  isOpen: boolean;
  studentId: string;
  studentName: string;
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

/** Compose a plain-text email to this student — opened from the profile topbar. */
export function StudentMessageModal({ isOpen, studentId, studentName, onClose }: StudentMessageModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setMessage("");
    }
  }, [isOpen]);

  async function handleSend() {
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
    setSending(true);
    try {
      const result = await postAdminMessage({ studentId }, subject, message);
      if (result.sent > 0) {
        toast.success(`Message emailed to ${studentName}`);
        onClose();
      } else {
        toast.error(result.failed[0]?.error || "The message could not be sent");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  }

  function handleClose() {
    if (!inFlight.current) onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Message ${studentName}`}
      width={480}
      footer={
        <>
          <Button label="Cancel" variant="secondary" disabled={sending} onClick={handleClose} />
          <Button
            label={sending ? "Sending…" : "Send email"}
            variant="primary"
            disabled={sending}
            onClick={handleSend}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Subject"
          maxLength={200}
          disabled={sending}
          autoFocus
          style={{ ...fieldStyle, padding: "8px 12px" }}
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={`Write a plain-text message to ${studentName}…`}
          rows={6}
          maxLength={10000}
          disabled={sending}
          style={{ ...fieldStyle, minHeight: 140, resize: "vertical" }}
        />
      </div>
    </Modal>
  );
}
