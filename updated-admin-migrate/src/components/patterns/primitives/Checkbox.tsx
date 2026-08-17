"use client";

import { Check } from "lucide-react";

export type CheckboxProps = {
  label: string;
  isLabelHidden?: boolean;
  value: boolean;
  onChange?: (next: boolean) => void;
  isDisabled?: boolean;
};

export function Checkbox({
  label,
  isLabelHidden = false,
  value,
  onChange,
  isDisabled = false,
}: CheckboxProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        role="checkbox"
        aria-checked={value}
        aria-label={label}
        disabled={isDisabled}
        onClick={() => onChange?.(!value)}
        style={{
          all: "unset",
          boxSizing: "border-box",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          borderRadius: 4,
          flexShrink: 0,
          cursor: isDisabled ? "default" : "pointer",
          opacity: isDisabled ? 0.5 : 1,
          background: value ? "var(--linear-color-accent)" : "transparent",
          border: value
            ? "var(--linear-border-width) solid transparent"
            : "var(--linear-border-width) solid var(--linear-color-hairline-strong)",
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
      >
        {value ? <Check size={12} strokeWidth={3} color="#ffffff" /> : null}
      </button>
      {!isLabelHidden ? (
        <span style={{ fontSize: 13, color: "var(--linear-color-ink)" }}>{label}</span>
      ) : null}
    </span>
  );
}
