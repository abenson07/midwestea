"use client";

export type TextInputProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
};

export function TextInput({ label, value, onChange }: TextInputProps) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          boxSizing: "border-box",
          width: "100%",
          height: 32,
          paddingInline: 8,
          borderRadius: 6,
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          background: "var(--linear-color-canvas)",
          color: "var(--linear-color-ink)",
          fontSize: 13,
          fontFamily: "inherit",
        }}
      />
    </label>
  );
}
