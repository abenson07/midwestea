"use client";

import { useRef, useState } from "react";

export type DetailFieldProps = {
  label: string;
  value: string;
  /** Fired on blur (or Enter, for single-line fields) when the value changed. */
  onCommit: (next: string) => void | Promise<void>;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
};

const sharedInputStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

/**
 * Editable free-text row — label above, bordered input box below, committing
 * on blur/Enter rather than on every keystroke (fields now write to real
 * mutations, not just local state).
 */
export function DetailField({
  label,
  value,
  onCommit,
  multiline = false,
  rows = 3,
  placeholder,
}: DetailFieldProps) {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const savedTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Adjust state during render so external refetches update the field, but
  // never while the user is actively typing in it.
  if (value !== syncedValue && !isEditing) {
    setSyncedValue(value);
    setDraft(value);
  }

  async function commit() {
    if (draft === value) return;
    setStatus("saving");
    await onCommit(draft);
    setStatus("saved");
    if (savedTimeout.current) clearTimeout(savedTimeout.current);
    savedTimeout.current = setTimeout(() => setStatus("idle"), 1500);
  }

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span>
        {status !== "idle" ? (
          <span style={{ fontSize: 11, color: "var(--linear-color-ink-subtle)" }}>
            {status === "saving" ? "Saving…" : "Saved"}
          </span>
        ) : null}
      </span>
      {multiline ? (
        <textarea
          value={draft}
          placeholder={placeholder}
          rows={rows}
          onFocus={() => setIsEditing(true)}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            setIsEditing(false);
            void commit();
          }}
          style={{ ...sharedInputStyle, paddingBlock: 8, resize: "vertical" }}
        />
      ) : (
        <input
          type="text"
          value={draft}
          placeholder={placeholder}
          onFocus={() => setIsEditing(true)}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            setIsEditing(false);
            void commit();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          style={{ ...sharedInputStyle, height: 32 }}
        />
      )}
    </label>
  );
}
