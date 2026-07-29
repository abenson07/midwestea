"use client";

export type MenuItemCountProps = {
  value: number;
  label?: string;
};

export function MenuItemCount({ value, label }: MenuItemCountProps) {
  return (
    <span
      aria-label={label ?? String(value)}
      style={{
        marginLeft: "auto",
        fontSize: 13,
        lineHeight: "20px",
        color: "var(--linear-color-ink-subtle)",
        flexShrink: 0,
      }}
    >
      {value}
    </span>
  );
}
