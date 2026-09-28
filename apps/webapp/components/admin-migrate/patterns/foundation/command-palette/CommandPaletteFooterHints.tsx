"use client";

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <kbd
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 18,
          height: 18,
          paddingInline: 4,
          borderRadius: 4,
          fontSize: 11,
          fontFamily: "inherit",
          color: "var(--linear-color-ink-subtle)",
          background: "var(--linear-color-surface-1, rgba(0,0,0,0.05))",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
        }}
      >
        {keys}
      </kbd>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span>
    </span>
  );
}

export function CommandPaletteFooterHints() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        paddingInline: 16,
        paddingBlock: 8,
        borderTop: "var(--linear-border-width) solid var(--linear-color-hairline)",
        flex: "0 0 auto",
      }}
    >
      <Hint keys="↑↓" label="Navigate" />
      <Hint keys="↵" label="Select" />
      <Hint keys="esc" label="Close" />
    </div>
  );
}
