"use client";

export type MenuItemCountProps = {
  value: number;
  label?: string;
  hiddenUntilHover?: boolean;
};

export function MenuItemCount({ value, label, hiddenUntilHover = false }: MenuItemCountProps) {
  return (
    <span
      className={hiddenUntilHover ? "sidebar-menu-item-count" : undefined}
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
