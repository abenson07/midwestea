"use client";

export type TextInputProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  multiline?: boolean;
  rows?: number;
};

export function TextInput({ label, value, onChange, multiline = false, rows = 4 }: TextInputProps) {
  const sharedStyle = {
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

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={rows}
          style={{ ...sharedStyle, paddingBlock: 8, resize: "vertical" }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          style={{ ...sharedStyle, height: 32 }}
        />
      )}
    </label>
  );
}
