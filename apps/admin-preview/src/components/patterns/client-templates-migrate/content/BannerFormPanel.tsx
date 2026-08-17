"use client";

import { useState } from "react";
import { Button } from "@/components/patterns/primitives/Button";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import type { Banner } from "./types";

export type BannerFormPanelProps = {
  banner: Banner;
  isNew?: boolean;
  onSave: (banner: Banner) => void;
  onClose: () => void;
};

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;
const fieldInputStyle = {
  all: "unset" as const,
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

/** `expiresAt` is a full ISO datetime; the date input only edits the date portion. */
function toDateInputValue(isoDate: string | null): string {
  if (!isoDate) return "";
  const ms = Date.parse(isoDate);
  if (Number.isNaN(ms)) return "";
  return new Date(ms).toISOString().slice(0, 10);
}

function fromDateInputValue(value: string): string | null {
  if (!value) return null;
  return `${value}T23:59:59.000Z`;
}

export function BannerFormPanel({ banner, isNew = false, onSave, onClose }: BannerFormPanelProps) {
  const [draft, setDraft] = useState<Banner>(banner);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input
        value={draft.title}
        onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
        placeholder="Title"
        autoFocus={isNew}
        style={{
          all: "unset",
          boxSizing: "border-box",
          width: "100%",
          fontSize: 28,
          fontWeight: 600,
          lineHeight: "34px",
          color: "var(--linear-color-ink)",
        }}
      />

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={fieldLabelStyle}>CTA text</span>
        <input
          value={draft.ctaText}
          onChange={(event) => setDraft((d) => ({ ...d, ctaText: event.target.value }))}
          placeholder="e.g. Learn more"
          style={fieldInputStyle}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={fieldLabelStyle}>Link</span>
        <input
          value={draft.link}
          onChange={(event) => setDraft((d) => ({ ...d, link: event.target.value }))}
          placeholder="https://…"
          style={fieldInputStyle}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={fieldLabelStyle}>Active until</span>
        <input
          type="date"
          value={toDateInputValue(draft.expiresAt)}
          onChange={(event) =>
            setDraft((d) => ({ ...d, expiresAt: fromDateInputValue(event.target.value) }))
          }
          style={fieldInputStyle}
        />
      </label>

      <VStack gap={2}>
        <Checkbox
          label="Active"
          value={draft.active}
          onChange={(next) => setDraft((d) => ({ ...d, active: next }))}
        />
        <Text color="secondary" size="sm">
          Inactive banners, and active banners past their end date, are hidden from the site.
        </Text>
      </VStack>

      <HStack gap={2} justify="end">
        <Button label="Close" variant="secondary" onClick={onClose} />
        <Button label={isNew ? "Create banner" : "Save"} variant="primary" onClick={() => onSave(draft)} />
      </HStack>
    </div>
  );
}
