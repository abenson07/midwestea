"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import type { EventPromotionItem, EventPromotionType } from "@/data/mocks/events";

export type AddPromotionModalProps = {
  type: EventPromotionType | null;
  onClose: () => void;
  onAdd: (item: Omit<EventPromotionItem, "id">) => void;
};

const EMAIL_LISTS = ["Newsletter", "Members", "Volunteers", "Sponsors"];
const SOCIAL_PLATFORMS = ["Instagram", "Facebook", "Twitter / X", "TikTok"];

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
const textareaStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  minHeight: 72,
  padding: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
  resize: "vertical" as const,
};

/**
 * Add-promotion form, split by type since an email and a social post ask
 * for different specifics (send list + subject vs. platform + caption).
 */
export function AddPromotionModal({ type, onClose, onAdd }: AddPromotionModalProps) {
  const [title, setTitle] = useState("");
  const [list, setList] = useState(EMAIL_LISTS[0]);
  const [platform, setPlatform] = useState(SOCIAL_PLATFORMS[0]);
  const [previewText, setPreviewText] = useState("");
  const [caption, setCaption] = useState("");
  const [sendDate, setSendDate] = useState("");

  useEffect(() => {
    if (!type) return;
    setTitle("");
    setList(EMAIL_LISTS[0]);
    setPlatform(SOCIAL_PLATFORMS[0]);
    setPreviewText("");
    setCaption("");
    setSendDate("");
  }, [type]);

  function handleSubmit() {
    if (!title.trim() || !sendDate) return;
    onAdd({
      type: type === "social" ? "social" : "email",
      channel: type === "social" ? platform : list,
      title: title.trim(),
      description: type === "social" ? caption.trim() : previewText.trim(),
      sendDate,
      status: "Draft",
    });
    onClose();
  }

  if (!type) return null;

  const isSocial = type === "social";

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={isSocial ? "Add social post" : "Add email"}
      footer={
        <>
          <Button label="Cancel" variant="secondary" onClick={onClose} />
          <Button
            label={isSocial ? "Add social post" : "Add email"}
            variant="primary"
            onClick={handleSubmit}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput
          label={isSocial ? "Post title" : "Subject line"}
          value={title}
          onChange={setTitle}
        />

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>{isSocial ? "Platform" : "Send list / send-from"}</span>
          <select
            value={isSocial ? platform : list}
            onChange={(event) =>
              isSocial ? setPlatform(event.target.value) : setList(event.target.value)
            }
            style={selectStyle}
          >
            {(isSocial ? SOCIAL_PLATFORMS : EMAIL_LISTS).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>{isSocial ? "Caption / copy" : "Preview text"}</span>
          <textarea
            value={isSocial ? caption : previewText}
            onChange={(event) =>
              isSocial ? setCaption(event.target.value) : setPreviewText(event.target.value)
            }
            style={textareaStyle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Send date</span>
          <input
            type="date"
            value={sendDate}
            onChange={(event) => setSendDate(event.target.value)}
            style={selectStyle}
          />
        </label>
      </div>
    </Modal>
  );
}
