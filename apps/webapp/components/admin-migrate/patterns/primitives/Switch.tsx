"use client";

export type SwitchProps = {
  label: string;
  isLabelHidden?: boolean;
  value: boolean;
  onChange: (next: boolean) => void;
};

export function Switch({ label, isLabelHidden = false, value, onChange }: SwitchProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        style={{
          all: "unset",
          boxSizing: "border-box",
          position: "relative",
          width: 28,
          height: 16,
          borderRadius: 999,
          flexShrink: 0,
          cursor: "pointer",
          background: value
            ? "var(--linear-color-accent)"
            : "var(--linear-color-hairline-strong)",
          transition: "background 0.15s ease",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 2,
            left: value ? 14 : 2,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ffffff",
            transition: "left 0.15s ease",
          }}
        />
      </button>
      {!isLabelHidden ? (
        <span style={{ fontSize: 13, color: "var(--linear-color-ink)" }}>{label}</span>
      ) : null}
    </span>
  );
}
