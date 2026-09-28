"use client";

import { BookOpen, GraduationCap } from "lucide-react";
import type { CatalogTemplate } from "./catalogMocks";

export type CatalogInfoBoxProps = {
  template: CatalogTemplate;
};

/** Catalog overview header — title, kind, code, and description, no card chrome. */
export function CatalogInfoBox({ template }: CatalogInfoBoxProps) {
  const KindIcon = template.kind === "Program" ? GraduationCap : BookOpen;

  return (
    <header
      data-slot="catalog-info-box"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            lineHeight: "28px",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: "var(--linear-color-ink)",
          }}
        >
          {template.name}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--linear-color-ink-subtle)",
              fontSize: 13,
              lineHeight: "20px",
            }}
          >
            <KindIcon size={14} strokeWidth={1.75} />
            {template.code}
          </span>
          {template.description ? (
            <span
              style={{
                color: "var(--linear-color-ink-subtle)",
                fontSize: 13,
                lineHeight: "20px",
              }}
            >
              {template.description}
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
