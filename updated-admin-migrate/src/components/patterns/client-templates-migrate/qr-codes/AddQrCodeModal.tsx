"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { normalizeUrl } from "@/lib/qr";
import type { QrCodesInsert } from "@/types/database";

export type AddQrCodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: QrCodesInsert) => Promise<void>;
};

export function AddQrCodeModal({ isOpen, onClose, onCreate }: AddQrCodeModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setName("");
    setUrl("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    let normalizedUrl: string;
    try {
      normalizedUrl = normalizeUrl(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Enter a valid URL.");
      return;
    }

    setSaving(true);
    try {
      await onCreate({ name: name.trim(), url: normalizedUrl });
      reset();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New QR code"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button label="Cancel" variant="ghost" onClick={handleClose} disabled={saving} />
          <Button label={saving ? "Creating…" : "Create"} variant="primary" onClick={() => void handleSubmit()} disabled={saving} />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <TextInput label="Name" value={name} onChange={setName} />
        <TextInput label="URL" value={url} onChange={setUrl} />
      </div>
    </Modal>
  );
}
