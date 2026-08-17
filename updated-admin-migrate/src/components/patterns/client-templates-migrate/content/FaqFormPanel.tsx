"use client";

import { useState } from "react";
import { Button } from "@/components/patterns/primitives/Button";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { FAQ_PAGE_OPTIONS } from "schemas/faqs";
import type { Faq } from "./types";

export type FaqFormPanelProps = {
  faq: Faq;
  isNew?: boolean;
  onSave: (faq: Faq) => void;
  onClose: () => void;
};

export function FaqFormPanel({ faq, isNew = false, onSave, onClose }: FaqFormPanelProps) {
  const [draft, setDraft] = useState<Faq>(faq);

  function togglePage(slug: string, isChecked: boolean) {
    setDraft((d) => ({
      ...d,
      pages: isChecked ? [...d.pages, slug] : d.pages.filter((p) => p !== slug),
    }));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input
        value={draft.question}
        onChange={(event) => setDraft((d) => ({ ...d, question: event.target.value }))}
        placeholder="Question"
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

      <textarea
        value={draft.answer}
        onChange={(event) => setDraft((d) => ({ ...d, answer: event.target.value }))}
        placeholder="Write the answer…"
        rows={4}
        style={{
          all: "unset",
          boxSizing: "border-box",
          width: "100%",
          resize: "vertical",
          fontSize: 14,
          lineHeight: "22px",
          color: "var(--linear-color-ink)",
        }}
      />

      <VStack gap={2}>
        <Text weight="semibold">Shown on pages</Text>
        <Text color="secondary" size="sm">
          Choose which marketing pages display this FAQ.
        </Text>
        <div
          style={{
            boxSizing: "border-box",
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            borderRadius: "var(--linear-radius-md)",
            padding: 16,
            marginTop: 8,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {FAQ_PAGE_OPTIONS.map((option) => (
            <Checkbox
              key={option.slug}
              label={option.label}
              value={draft.pages.includes(option.slug)}
              onChange={(isChecked) => togglePage(option.slug, isChecked)}
            />
          ))}
        </div>
      </VStack>

      <HStack gap={2} justify="end">
        <Button label="Close" variant="secondary" onClick={onClose} />
        <Button label={isNew ? "Create FAQ" : "Save"} variant="primary" onClick={() => onSave(draft)} />
      </HStack>
    </div>
  );
}
