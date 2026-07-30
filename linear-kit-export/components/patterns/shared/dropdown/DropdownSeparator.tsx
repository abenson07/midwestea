"use client";

export function DropdownSeparator() {
  return (
    <div
      role="separator"
      style={{
        height: 1,
        marginBlock: 4,
        marginInline: 8,
        background: "var(--linear-color-hairline)",
      }}
    />
  );
}
