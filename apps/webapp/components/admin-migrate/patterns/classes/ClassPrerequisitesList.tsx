"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";
import { ClassSidebarSection } from "./ClassSidebarSection";
import { INITIAL_PREREQUISITES } from "../prerequisites/prerequisiteData";
import type { StagingPrerequisiteType } from "@/lib/admin-migrate/prerequisites";
import { addClassPrerequisite } from "@/lib/prerequisites";

export type ClassPrerequisitesListProps = {
  items: string[];
  editable?: boolean;
  /** Present only for a real (non-demo) class — enables real persistence. */
  classId?: string;
  /** Real prerequisite catalog for the add-search. Omitted in full demo mode. */
  catalogTypes?: StagingPrerequisiteType[];
  onAdd?: (name: string) => void;
};

/** Required items as an activity-style list, with a typeahead add from the header. */
export function ClassPrerequisitesList({
  items,
  editable = true,
  classId,
  catalogTypes,
  onAdd,
}: ClassPrerequisitesListProps) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const isLive = Boolean(classId);

  const searchPool = catalogTypes ?? INITIAL_PREREQUISITES;
  const assignedNames = useMemo(() => new Set(items.map((name) => name.toLowerCase())), [items]);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return searchPool.filter((type) => {
      const archived = "archived" in type ? type.archived : Boolean((type as StagingPrerequisiteType).archivedAt);
      if (archived) return false;
      if (assignedNames.has(type.name.toLowerCase())) return false;
      return !q || type.name.toLowerCase().includes(q);
    });
  }, [query, assignedNames, searchPool]);

  async function handleSelect(typeId: string, name: string) {
    if (isLive && classId) {
      setBusy(true);
      const result = await addClassPrerequisite(classId, typeId, true, items.length);
      setBusy(false);
      if (!result.success) {
        toast.error(result.error || "Failed to add prerequisite");
        return;
      }
    }
    onAdd?.(name);
    toast.success(`Added ${name}`);
    setAdding(false);
    setQuery("");
  }

  return (
    <ClassSidebarSection
      title="Prerequisites"
      action={
        editable ? (
          <IconButton
            label="Add prerequisite"
            variant="ghost"
            size="sm"
            icon={<Plus size={14} strokeWidth={2} />}
            onClick={() => setAdding((prev) => !prev)}
            isDisabled={busy}
          />
        ) : null
      }
    >
      {adding ? (
        <div style={{ marginBottom: 8, position: "relative" }}>
          <input
            autoFocus
            type="text"
            role="combobox"
            aria-expanded
            aria-autocomplete="list"
            aria-label="Search prerequisite catalog"
            value={query}
            placeholder="Search prerequisite catalog…"
            onChange={(event) => setQuery(event.target.value)}
            style={{
              boxSizing: "border-box",
              width: "100%",
              height: 30,
              paddingInline: 8,
              borderRadius: 6,
              border: "var(--linear-border-width) solid var(--linear-color-hairline)",
              background: "var(--linear-color-canvas)",
              color: "var(--linear-color-ink)",
              fontSize: 13,
              fontFamily: "inherit",
            }}
          />
          <div
            role="listbox"
            style={{
              boxSizing: "border-box",
              marginTop: 4,
              maxHeight: 200,
              overflow: "auto",
              padding: 4,
              borderRadius: 8,
              background: "var(--linear-color-canvas)",
              border: "var(--linear-border-width) solid var(--linear-color-canvas-border)",
              boxShadow: "var(--linear-shadow-canvas)",
            }}
          >
            {matches.length ? (
              matches.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  role="option"
                  onClick={() => void handleSelect(type.id, type.name)}
                  style={{
                    all: "unset",
                    boxSizing: "border-box",
                    cursor: "pointer",
                    display: "block",
                    width: "100%",
                    height: 30,
                    paddingInline: 10,
                    borderRadius: 6,
                    color: "var(--linear-color-ink)",
                    fontSize: 13,
                    lineHeight: "30px",
                  }}
                >
                  {type.name}
                </button>
              ))
            ) : (
              <div style={{ padding: "6px 10px" }}>
                <Text size="sm" color="secondary">
                  No matching prerequisite type
                </Text>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {items.length ? (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {items.map((item) => (
            <li
              key={item}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <CheckCircle2
                size={14}
                strokeWidth={1.75}
                style={{
                  color: "var(--linear-color-ink-subtle)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <Text size="sm" color="secondary">
                {item}
              </Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text size="sm" color="secondary">
          No prerequisites yet.
        </Text>
      )}
    </ClassSidebarSection>
  );
}
