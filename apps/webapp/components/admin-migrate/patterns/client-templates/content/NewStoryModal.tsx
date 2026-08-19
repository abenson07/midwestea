"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { availableTopics, type ContentStatus, type Story } from "@/data/mocks/content";

export type NewStoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (story: Omit<Story, "id">) => void;
};

const STATUSES: ContentStatus[] = ["Draft", "Published"];

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;
const selectStyle = {
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

/** Starter form for a new story — title, byline, and status; the body gets written in the full editor. */
export function NewStoryModal({ isOpen, onClose, onCreate }: NewStoryModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<ContentStatus>("Draft");

  useEffect(() => {
    if (!isOpen) return;
    setTitle("");
    setAuthor("");
    setStatus("Draft");
  }, [isOpen]);

  function handleSubmit() {
    if (!title.trim()) return;
    onCreate?.({
      title: title.trim(),
      author: author.trim(),
      topic: availableTopics[0],
      status,
      publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      imageUrl: "",
      description: "",
      body: "",
    });
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New story"
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button label="Create story" variant="primary" onClick={handleSubmit} />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Title" value={title} onChange={setTitle} />
        <TextInput label="Author" value={author} onChange={setAuthor} />

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ContentStatus)}
            style={selectStyle}
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  );
}
