"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Modal } from "@/components/patterns/shared/Modal";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Text } from "@/components/patterns/primitives/Text";
import { downloadQrPng, generateQrPngDataUrl, qrDownloadFilename } from "@/lib/qr";
import type { QrCodes } from "@/types/database";

export type QrCodePreviewModalProps = {
  code: QrCodes | null;
  onClose: () => void;
};

/** Full-size preview of a single generated QR code, with copy-link and download actions. */
export function QrCodePreviewModal({ code, onClose }: QrCodePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    void generateQrPngDataUrl(code.url, 220).then((dataUrl) => {
      if (!cancelled) setPreviewUrl(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function handleCopy() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — no-op
    }
  }

  return (
    <Modal isOpen={code != null} onClose={onClose} title={code?.name ?? "QR code"} width={340}>
      {code ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 220,
              borderRadius: "var(--linear-radius-md)",
              background: "var(--linear-color-icon-button-secondary)",
              overflow: "hidden",
            }}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL, no benefit from next/image
              <img src={previewUrl} alt={`QR code for ${code.url}`} width={220} height={220} />
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Text
                size="sm"
                color="secondary"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {code.url}
              </Text>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <IconButton
                  label={copied ? "Copied" : "Copy link"}
                  variant="secondary"
                  size="sm"
                  icon={
                    copied ? (
                      <Check size={14} strokeWidth={1.75} color="#27a644" />
                    ) : (
                      <Copy size={14} strokeWidth={1.75} />
                    )
                  }
                  onClick={() => void handleCopy()}
                />
                <IconButton
                  label="Download PNG"
                  variant="secondary"
                  size="sm"
                  icon={<Download size={14} strokeWidth={1.75} />}
                  onClick={() => void downloadQrPng(code.url, qrDownloadFilename(code))}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
