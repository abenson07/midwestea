"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { useQrCodes, useDemoGuard } from "hooks";
import {
  buildEventQrUrl,
  eventPageUrl,
  type EventQrLink,
} from "@/lib/events/eventQr";
import { normalizeUrl } from "@/lib/qr";

const fieldStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 10,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block" as const,
  marginBottom: 6,
  fontSize: 12,
  fontWeight: 500 as const,
  color: "var(--linear-color-ink-secondary)",
};

export type AddEventQrCodeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  eventSlug: string | null;
  eventName: string;
  /** Existing linked QRs — new code is appended. */
  existingLinks: EventQrLink[];
  onCreated: (links: EventQrLink[]) => Promise<void>;
};

export function AddEventQrCodeModal({
  isOpen,
  onClose,
  eventSlug,
  eventName,
  existingLinks,
  onCreated,
}: AddEventQrCodeModalProps) {
  const { create } = useQrCodes({ autoFetch: false });
  const { enabled: demo } = useDemoGuard();
  const defaultUrl = eventPageUrl(eventSlug) ?? "";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState(defaultUrl);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setDescription("");
    setUrl(defaultUrl);
    setError(null);
    setSubmitting(false);
  }, [isOpen, defaultUrl]);

  async function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    if (demo) {
      const { newDemoId, upsertDemoEntity } = await import("@/lib/demo/demoStore");
      upsertDemoEntity("qrCodes", {
        id: newDemoId("qr"),
        name: trimmedName,
        url: url.trim() || defaultUrl,
        eventSlug,
      });
      toast.success("QR code created — demo mode, saved locally only");
      onClose();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const normalized = normalizeUrl(url);
      const trackedUrl = buildEventQrUrl({
        baseUrl: normalized,
        campaign: eventSlug,
        content: trimmedName,
      });
      const row = await create({
        name: trimmedName,
        url: trackedUrl,
      });
      if (!row) {
        throw new Error("Failed to create QR code.");
      }
      const nextLinks: EventQrLink[] = [
        ...existingLinks,
        {
          id: row.id,
          description: description.trim() || undefined,
        },
      ];
      await onCreated(nextLinks);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create QR code.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add QR code"
      width={440}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button label="Cancel" onClick={onClose} />
          <Button
            label={submitting ? "Creating…" : "Create"}
            variant="primary"
            onClick={() => {
              if (!submitting) void handleSubmit();
            }}
          />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Text size="sm" color="secondary">
          Tracking params (`utm_source=event`, campaign = event slug, content = QR
          name) are added to the link so scans can be attributed to this code
          {eventName ? ` for ${eventName}` : ""}.
        </Text>

        {error ? <Text color="accent">{error}</Text> : null}

        <div>
          <label style={labelStyle} htmlFor="event-qr-name">
            Name
          </label>
          <input
            id="event-qr-name"
            style={fieldStyle}
            value={name}
            placeholder="e.g. Park flyer"
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="event-qr-description">
            Description
          </label>
          <textarea
            id="event-qr-description"
            style={{ ...fieldStyle, height: 64, paddingBlock: 8, resize: "vertical" }}
            value={description}
            placeholder="Where this code will be used"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label style={labelStyle} htmlFor="event-qr-url">
            Link
          </label>
          <input
            id="event-qr-url"
            style={fieldStyle}
            value={url}
            placeholder="https://mapleleafcommunity.org/events/…"
            onChange={(e) => setUrl(e.target.value)}
          />
          <Text size="sm" color="secondary" style={{ marginTop: 6 }}>
            Defaults to the event page. UTM params are appended on create.
          </Text>
        </div>
      </div>
    </Modal>
  );
}
