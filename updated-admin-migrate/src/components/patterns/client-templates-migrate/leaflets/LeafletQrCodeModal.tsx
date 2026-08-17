"use client";

import { useState } from "react";
import { Check, Copy, QrCode as QrCodeIcon } from "lucide-react";
import { Modal } from "@/components/patterns/shared/Modal";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Text } from "@/components/patterns/primitives/Text";
import type { LeafletQrCode } from "@/data/mocks/leaflets";

export type LeafletQrCodeModalProps = {
  code: LeafletQrCode | null;
  onClose: () => void;
};

/** Single QR code — shown after picking one from the topbar's QR dropdown. */
export function LeafletQrCodeModal({ code, onClose }: LeafletQrCodeModalProps) {
  const [copied, setCopied] = useState(false);

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
    <Modal isOpen={code != null} onClose={onClose} title={code?.label ?? "QR code"} width={340}>
      {code ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 160,
              borderRadius: "var(--linear-radius-md)",
              background: "var(--linear-color-icon-button-secondary)",
            }}
          >
            <QrCodeIcon size={64} strokeWidth={1} color="var(--linear-color-ink-subtle)" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {code.subtitle ? (
              <Text size="sm" color="secondary">
                {code.subtitle}
              </Text>
            ) : null}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <Text
                size="sm"
                color="secondary"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {code.url}
              </Text>
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
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
