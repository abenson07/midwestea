"use client";

export type ViewTabProps = {
  label: string;
  /** Selected / active pill fill. */
  selected?: boolean;
  onClick?: () => void;
  /** Optional trailing count inside the pill. */
  count?: number;
  disabled?: boolean;
};

/**
 * Linear-style view tab pill — filled when selected, outlined when idle.
 */
export function ViewTab({
  label,
  selected = false,
  onClick,
  count,
  disabled = false,
}: ViewTabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      disabled={disabled}
      onClick={onClick}
      style={{
        all: "unset",
        boxSizing: "border-box",
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        height: 28,
        paddingInline: 10,
        borderRadius: 999,
        fontSize: 13,
        lineHeight: "20px",
        fontWeight: selected ? 500 : 400,
        opacity: disabled ? 0.5 : 1,
        color: selected
          ? "var(--linear-color-ink)"
          : "var(--linear-color-sidebar-item-idle)",
        background: selected
          ? "var(--linear-color-sidebar-item-selected)"
          : "transparent",
        border: selected
          ? "var(--linear-border-width) solid transparent"
          : "var(--linear-border-width) solid var(--linear-color-hairline)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      {count != null ? (
        <span
          style={{
            fontSize: 12,
            lineHeight: "16px",
            color: "var(--linear-color-ink-subtle)",
          }}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
