"use client";

import { useEffect, useMemo, useState } from "react";
import { useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import {
  catalogTemplatesOfKind,
  type CatalogTemplate,
  type CatalogTemplateKind,
} from "./catalogMocks";

export type CatalogTemplateTypeaheadProps = {
  value: CatalogTemplate | null;
  onChange: (template: CatalogTemplate) => void;
};

const GROUPS: CatalogTemplateKind[] = ["Program", "Course"];

const inputStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

/** Searchable program/course picker with grouped results. */
export function CatalogTemplateTypeahead({ value, onChange }: CatalogTemplateTypeaheadProps) {
  const live = useIsNewAdminMigrate();
  const [query, setQuery] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value?.name ?? "");
  }, [value]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matchesName = (template: CatalogTemplate) =>
      !q ||
      template.name.toLowerCase().includes(q) ||
      template.code.toLowerCase().includes(q);
    return GROUPS.map((kind) => ({
      kind,
      items: (live ? [] : catalogTemplatesOfKind(kind)).filter(matchesName),
    })).filter((group) => group.items.length);
  }, [query, live]);

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Program or course</span>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label="Program or course"
        value={query}
        placeholder="Search programs and courses…"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onBlur={() => {
          setOpen(false);
          setQuery(value?.name ?? "");
        }}
        style={inputStyle}
      />
      {open ? (
        <div
          role="listbox"
          style={{
            boxSizing: "border-box",
            maxHeight: 240,
            overflow: "auto",
            padding: 4,
            borderRadius: 8,
            background: "var(--linear-color-canvas)",
            border: "var(--linear-border-width) solid var(--linear-color-canvas-border)",
            boxShadow: "var(--linear-shadow-canvas)",
          }}
        >
          {grouped.length ? (
            grouped.map((group) => (
              <div key={group.kind}>
                <div style={{ padding: "6px 10px 4px" }}>
                  <Text size="sm" color="secondary">
                    {group.kind === "Program" ? "Programs" : "Courses"}
                  </Text>
                </div>
                {group.items.map((template) => {
                  const selected = template.id === value?.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onChange(template);
                        setQuery(template.name);
                        setOpen(false);
                      }}
                      style={{
                        all: "unset",
                        boxSizing: "border-box",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        width: "100%",
                        height: 32,
                        paddingInline: 10,
                        borderRadius: 6,
                        color: "var(--linear-color-ink)",
                        background: selected
                          ? "var(--linear-color-sidebar-item-selected)"
                          : "transparent",
                        fontSize: 13,
                        lineHeight: "20px",
                      }}
                    >
                      <span>{template.name}</span>
                      <span style={{ color: "var(--linear-color-ink-subtle)" }}>{template.code}</span>
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div style={{ padding: "8px 10px" }}>
              <Text size="sm" color="secondary">
                No matching program or course
              </Text>
            </div>
          )}
        </div>
      ) : null}
    </label>
  );
}
