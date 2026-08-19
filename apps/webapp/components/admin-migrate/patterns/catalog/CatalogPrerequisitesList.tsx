"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { Switch } from "@/components/admin-migrate/patterns/primitives/Switch";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";
import { ClassSidebarSection } from "../classes/ClassSidebarSection";
import { INITIAL_PREREQUISITES } from "../prerequisites/prerequisiteData";
import type { CatalogPrerequisiteAssignment } from "./catalogMocks";

function moveItem<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export type CatalogPrerequisitesListProps = {
  assignments: CatalogPrerequisiteAssignment[];
  onChange: (next: CatalogPrerequisiteAssignment[]) => void;
};

/** Template-level prerequisites: typeahead add, reorder, per-item required toggle. */
export function CatalogPrerequisitesList({ assignments, onChange }: CatalogPrerequisitesListProps) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");

  const assignedIds = useMemo(
    () => new Set(assignments.map((item) => item.prerequisiteTypeId)),
    [assignments],
  );
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INITIAL_PREREQUISITES.filter(
      (type) => !type.archived && !assignedIds.has(type.id) && (!q || type.name.toLowerCase().includes(q)),
    );
  }, [query, assignedIds]);

  function addType(typeId: string, name: string) {
    onChange([...assignments, { id: `assign-${Date.now()}`, prerequisiteTypeId: typeId, name, required: true }]);
    toast.success(`Added ${name}`);
    setAdding(false);
    setQuery("");
  }

  function remove(id: string) {
    onChange(assignments.filter((item) => item.id !== id));
  }

  function setRequired(id: string, required: boolean) {
    onChange(assignments.map((item) => (item.id === id ? { ...item, required } : item)));
  }

  function reorder(index: number, delta: number) {
    onChange(moveItem(assignments, index, delta));
  }

  return (
    <ClassSidebarSection
      title="Prerequisites"
      action={
        <IconButton
          label="Add prerequisite"
          variant="ghost"
          size="sm"
          icon={<Plus size={14} strokeWidth={2} />}
          onClick={() => setAdding((prev) => !prev)}
        />
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
                  onClick={() => addType(type.id, type.name)}
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

      {assignments.length ? (
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {assignments.map((item, index) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                minHeight: 32,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <IconButton
                  label="Move up"
                  variant="ghost"
                  size="sm"
                  icon={<ChevronUp size={12} strokeWidth={2} />}
                  isDisabled={index === 0}
                  onClick={() => reorder(index, -1)}
                />
                <IconButton
                  label="Move down"
                  variant="ghost"
                  size="sm"
                  icon={<ChevronDown size={12} strokeWidth={2} />}
                  isDisabled={index === assignments.length - 1}
                  onClick={() => reorder(index, 1)}
                />
              </div>
              <Text size="sm" color="secondary" style={{ flex: 1, minWidth: 0 }}>
                {item.name}
              </Text>
              <Switch
                label="Required"
                isLabelHidden
                value={item.required}
                onChange={(required) => setRequired(item.id, required)}
              />
              <IconButton
                label={`Remove ${item.name}`}
                variant="ghost"
                size="sm"
                icon={<X size={13} strokeWidth={1.75} />}
                onClick={() => remove(item.id)}
              />
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
