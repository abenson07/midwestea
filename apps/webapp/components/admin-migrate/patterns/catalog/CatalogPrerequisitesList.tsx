"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { Switch } from "@/components/admin-migrate/patterns/primitives/Switch";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";
import { ClassSidebarSection } from "../classes/ClassSidebarSection";
import { INITIAL_PREREQUISITES } from "../prerequisites/prerequisiteData";
import type { StagingPrerequisiteType } from "@/lib/admin-migrate/prerequisites";
import {
  addTemplatePrerequisite,
  removeTemplatePrerequisite,
  updateTemplatePrerequisite,
} from "@/lib/prerequisites";
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
  /** Present only for a real (non-demo) template — enables real persistence. */
  courseUuid?: string;
  /** Real prerequisite catalog for the add-search. Falls back to sample data when omitted (demo mode). */
  catalogTypes?: StagingPrerequisiteType[];
};

/** Template-level prerequisites: typeahead add, reorder, per-item required toggle. */
export function CatalogPrerequisitesList({
  assignments,
  onChange,
  courseUuid,
  catalogTypes,
}: CatalogPrerequisitesListProps) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const isLive = Boolean(courseUuid);

  const searchPool = catalogTypes ?? INITIAL_PREREQUISITES;
  const assignedIds = useMemo(
    () => new Set(assignments.map((item) => item.prerequisiteTypeId)),
    [assignments],
  );
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return searchPool.filter((type) => {
      const archived = "archived" in type ? type.archived : Boolean((type as StagingPrerequisiteType).archivedAt);
      return !archived && !assignedIds.has(type.id) && (!q || type.name.toLowerCase().includes(q));
    });
  }, [query, assignedIds, searchPool]);

  async function addType(typeId: string, name: string) {
    if (isLive && courseUuid) {
      setBusy(true);
      const result = await addTemplatePrerequisite(courseUuid, typeId, true, assignments.length);
      setBusy(false);
      if (!result.success) {
        toast.error(result.error || "Failed to add prerequisite");
        return;
      }
      // Server generates the real id; re-fetch not needed for name/required flag,
      // but this assignment's id is unknown until reload — use the type id as a
      // stand-in key until the page's next server fetch replaces it.
      onChange([...assignments, { id: `${courseUuid}-${typeId}`, prerequisiteTypeId: typeId, name, required: true }]);
    } else {
      onChange([...assignments, { id: `assign-${Date.now()}`, prerequisiteTypeId: typeId, name, required: true }]);
    }
    toast.success(`Added ${name}`);
    setAdding(false);
    setQuery("");
  }

  async function remove(id: string) {
    const item = assignments.find((row) => row.id === id);
    if (isLive && item && !item.id.startsWith(`${courseUuid}-`)) {
      // Real assignment id from the server (not a just-added stand-in key).
      setBusy(true);
      const result = await removeTemplatePrerequisite(id);
      setBusy(false);
      if (!result.success) {
        toast.error(result.error || "Failed to remove prerequisite");
        return;
      }
    }
    onChange(assignments.filter((row) => row.id !== id));
  }

  async function setRequired(id: string, required: boolean) {
    if (isLive && !id.startsWith(`${courseUuid}-`)) {
      setBusy(true);
      const result = await updateTemplatePrerequisite(id, { is_required: required });
      setBusy(false);
      if (!result.success) {
        toast.error(result.error || "Failed to update prerequisite");
        return;
      }
    }
    onChange(assignments.map((item) => (item.id === id ? { ...item, required } : item)));
  }

  async function reorder(index: number, delta: number) {
    const next = moveItem(assignments, index, delta);
    if (isLive) {
      setBusy(true);
      const results = await Promise.all(
        next.map((item, sortOrder) =>
          item.id.startsWith(`${courseUuid}-`) ? Promise.resolve({ success: true }) : updateTemplatePrerequisite(item.id, { sort_order: sortOrder }),
        ),
      );
      setBusy(false);
      if (results.some((r) => !r.success)) {
        toast.error("Failed to save new order");
        return;
      }
    }
    onChange(next);
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
          isDisabled={busy}
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
                  onClick={() => void addType(type.id, type.name)}
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
                  isDisabled={index === 0 || busy}
                  onClick={() => void reorder(index, -1)}
                />
                <IconButton
                  label="Move down"
                  variant="ghost"
                  size="sm"
                  icon={<ChevronDown size={12} strokeWidth={2} />}
                  isDisabled={index === assignments.length - 1 || busy}
                  onClick={() => void reorder(index, 1)}
                />
              </div>
              <Text size="sm" color="secondary" style={{ flex: 1, minWidth: 0 }}>
                {item.name}
              </Text>
              <Switch
                label="Required"
                isLabelHidden
                value={item.required}
                onChange={(required) => void setRequired(item.id, required)}
              />
              <IconButton
                label={`Remove ${item.name}`}
                variant="ghost"
                size="sm"
                icon={<X size={13} strokeWidth={1.75} />}
                onClick={() => void remove(item.id)}
                isDisabled={busy}
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
