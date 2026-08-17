"use client";

import { useState } from "react";
import { CalendarCheck, User } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";
import { HStack } from "@/components/patterns/primitives/Stack";
import { Text } from "@/components/patterns/primitives/Text";
import { PropertyChip } from "@/components/patterns/client-templates/shared";
import { RichTextEditor } from "./RichTextEditor";
import { todayISODate } from "./adapters";
import type { Story } from "./types";

export type StoryFormPanelProps = {
  story: Story;
  isNew?: boolean;
  onSave: (story: Story) => void;
  onClose: () => void;
};

export function StoryFormPanel({ story, isNew = false, onSave, onClose }: StoryFormPanelProps) {
  const [draft, setDraft] = useState<Story>(story);

  function togglePublished() {
    setDraft((d) =>
      d.status === "Published"
        ? { ...d, status: "Draft" }
        : {
            ...d,
            status: "Published",
            publishedAt: new Date(`${todayISODate()}T00:00:00`).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          },
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16 }}>
      {draft.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- demo-only external asset from the live marketing site
        <img
          src={draft.imageUrl}
          alt=""
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: "var(--linear-radius-md)",
          }}
        />
      ) : null}

      <input
        value={draft.title}
        onChange={(event) => setDraft((d) => ({ ...d, title: event.target.value }))}
        placeholder="Untitled story"
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

      {draft.description ? (
        <Text color="secondary" size="sm">
          {draft.description}
        </Text>
      ) : null}

      <div style={{ flex: 1, minHeight: 0 }}>
        <RichTextEditor
          bare
          content={draft.body}
          placeholder="Start writing the story…"
          onChange={(body) => setDraft((d) => ({ ...d, body }))}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Text type="label" color="secondary">
          Featured image
        </Text>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: 10,
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            borderRadius: "var(--linear-radius-md)",
          }}
        >
          {draft.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- demo-only external asset from the live marketing site
            <img
              src={draft.imageUrl}
              alt=""
              style={{
                width: 56,
                height: 56,
                objectFit: "cover",
                borderRadius: "var(--linear-radius-sm)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 56,
                height: 56,
                flexShrink: 0,
                borderRadius: "var(--linear-radius-sm)",
                background: "var(--linear-color-sidebar-item-selected)",
              }}
            />
          )}
          <input
            value={draft.imageUrl ?? ""}
            onChange={(event) => setDraft((d) => ({ ...d, imageUrl: event.target.value }))}
            placeholder="https://…"
            style={{
              all: "unset",
              boxSizing: "border-box",
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              color: "var(--linear-color-ink)",
            }}
          />
        </div>
      </div>

      <div
        style={{
          borderTop: "var(--linear-border-width) solid var(--linear-color-hairline)",
          paddingTop: 12,
        }}
      >
        <HStack gap={1} style={{ flexWrap: "wrap" }}>
          <PropertyChip id="author" label={draft.author} icon={<User size={14} strokeWidth={1.75} />} />
          <PropertyChip
            id="status"
            label={draft.status === "Published" ? `Published · ${draft.publishedAt}` : "Draft"}
            icon={<CalendarCheck size={14} strokeWidth={1.75} />}
            onClick={togglePublished}
          />
        </HStack>
      </div>

      <HStack gap={2} justify="end">
        <Button label="Close" variant="secondary" onClick={onClose} />
        <Button label={isNew ? "Create story" : "Save"} variant="primary" onClick={() => onSave(draft)} />
      </HStack>
    </div>
  );
}
