"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";
import { Button } from "@/components/patterns/primitives/Button";
import { useEventQrCodes } from "hooks";
import {
  downloadQrPng,
  generateQrPngDataUrl,
  qrDownloadFilename,
} from "@/lib/qr";
import {
  resolveEventQrLinks,
  withEventQrLinks,
  type EventQrLink,
} from "@/lib/events/eventQr";
import type { EventFieldData } from "@/lib/events/eventData";
import { AddEventQrCodeModal } from "./AddEventQrCodeModal";

function QrPreview({ url }: { url: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void generateQrPngDataUrl(url, 72).then((dataUrl) => {
      if (!cancelled) setSrc(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!src) {
    return (
      <div
        aria-hidden
        style={{
          width: 72,
          height: 72,
          borderRadius: 6,
          background: "var(--linear-color-icon-button-secondary)",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={72}
      height={72}
      style={{
        width: 72,
        height: 72,
        borderRadius: 6,
        border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        flexShrink: 0,
      }}
    />
  );
}

export type EventQrCodesSectionProps = {
  fieldData: EventFieldData;
  eventSlug: string | null;
  eventName: string;
  readOnly?: boolean;
  onUpdateFieldData: (next: Record<string, unknown>) => Promise<void>;
};

export function EventQrCodesSection({
  fieldData,
  eventSlug,
  eventName,
  readOnly = false,
  onUpdateFieldData,
}: EventQrCodesSectionProps) {
  const links = resolveEventQrLinks(fieldData);
  const { data: rows = [], isLoading, refetch } = useEventQrCodes(links);
  const [modalOpen, setModalOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreated(nextLinks: EventQrLink[]) {
    await onUpdateFieldData(
      withEventQrLinks({ ...fieldData }, nextLinks),
    );
    await refetch();
  }

  async function handleDownload(row: { id: string; name: string | null; url: string }) {
    setBusyId(row.id);
    setError(null);
    try {
      await downloadQrPng(row.url, qrDownloadFilename(row));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download QR");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <VStack gap={3}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text type="label" color="secondary">
          QR codes
        </Text>
        {!readOnly ? (
          <Button label="Add QR code" onClick={() => setModalOpen(true)} />
        ) : null}
      </div>

      <Card padding={4}>
        {isLoading && links.length > 0 ? (
          <Text color="secondary">Loading QR codes…</Text>
        ) : rows.length === 0 ? (
          <Text color="secondary">
            No QR codes yet. Add one for a flyer, poster, or other placement —
            tracking params are attached automatically.
          </Text>
        ) : (
          <VStack gap={0}>
            {rows.map((row, index) => (
              <div
                key={row.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  paddingBlock: 12,
                  borderTop:
                    index === 0
                      ? undefined
                      : "var(--linear-border-width) solid var(--linear-color-hairline)",
                  marginInline: -16,
                  paddingInline: 16,
                }}
              >
                <QrPreview url={row.url} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontWeight: 500 }}>
                    {row.name?.trim() || "Untitled QR"}
                  </Text>
                  {row.description ? (
                    <Text size="sm" color="secondary" style={{ marginTop: 2 }}>
                      {row.description}
                    </Text>
                  ) : null}
                  <Text
                    size="sm"
                    color="secondary"
                    style={{
                      marginTop: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.url}
                  </Text>
                </div>
                <Button
                  label={busyId === row.id ? "…" : "Download"}
                  icon={<Download size={14} strokeWidth={1.75} />}
                  onClick={() => {
                    if (busyId !== row.id) void handleDownload(row);
                  }}
                />
              </div>
            ))}
          </VStack>
        )}
        {error ? (
          <Text color="accent" style={{ marginTop: 8 }}>
            {error}
          </Text>
        ) : null}
      </Card>

      <AddEventQrCodeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventSlug={eventSlug}
        eventName={eventName}
        existingLinks={links}
        onCreated={handleCreated}
      />
    </VStack>
  );
}
