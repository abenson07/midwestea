"use client";

export type DescriptionSectionProps = {
  title?: string;
  placeholder?: string;
  onClick?: () => void;
};

export function DescriptionSection({
  title = "Description",
  placeholder = "Add description...",
  onClick,
}: DescriptionSectionProps) {
  return (
    <section
      data-slot="description-section"
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: "20px",
          fontWeight: 500,
          color: "var(--linear-color-ink-subtle)",
        }}
      >
        {title}
      </h2>
      <button
        type="button"
        onClick={onClick}
        style={{
          all: "unset",
          cursor: "text",
          minHeight: 48,
          color: "var(--linear-color-ink-subtle)",
          fontSize: 14,
          lineHeight: "22px",
        }}
      >
        {placeholder}
      </button>
    </section>
  );
}
