"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";

export type StudentMessageModalProps = {
  isOpen: boolean;
  studentName: string;
  onClose: () => void;
};

/** Compose a message to this student — opened from the profile topbar. */
export function StudentMessageModal({ isOpen, studentName, onClose }: StudentMessageModalProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) setMessage("");
  }, [isOpen]);

  function handleSend() {
    const body = message.trim();
    if (!body) {
      toast.error("Write a message before sending");
      return;
    }
    toast.success(`Message sent to ${studentName} — demo mode, not delivered`);
    setMessage("");
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Message ${studentName}`}
      width={480}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Send" variant="primary" onClick={handleSend} />
        </>
      }
    >
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={`Write a message to ${studentName}…`}
        rows={6}
        autoFocus
        style={{
          boxSizing: "border-box",
          width: "100%",
          minHeight: 140,
          resize: "vertical",
          padding: 12,
          borderRadius: "var(--linear-radius-md)",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          background: "var(--linear-color-canvas)",
          color: "var(--linear-color-ink)",
          fontSize: 13,
          fontFamily: "inherit",
          lineHeight: 1.45,
        }}
      />
    </Modal>
  );
}
