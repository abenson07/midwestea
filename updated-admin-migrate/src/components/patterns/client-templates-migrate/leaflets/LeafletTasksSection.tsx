"use client";

import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { Text } from "@/components/patterns/primitives/Text";
import type { LeafletTaskRow } from "@/data/mocks/leaflets";

export type LeafletTasksSectionProps = {
  tasks: LeafletTaskRow[];
  onToggleTask: (id: string) => void;
  onSeeAllTasks?: () => void;
};

const PREVIEW_LIMIT = 4;

/** Short task preview for the Overview page. Mirrors `EventTasksSection`. */
export function LeafletTasksSection({ tasks, onToggleTask, onSeeAllTasks }: LeafletTasksSectionProps) {
  const openTasks = tasks.filter((task) => !task.isComplete);
  const preview = openTasks.slice(0, PREVIEW_LIMIT);

  return (
    <section
      data-slot="leaflet-tasks-section"
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <Text weight="semibold">Tasks</Text>
        <Text size="sm" color="secondary">
          {openTasks.length} open task{openTasks.length === 1 ? "" : "s"}
        </Text>
      </div>

      {preview.length === 0 ? (
        <Text size="sm" color="secondary">
          No open tasks — you&apos;re all caught up.
        </Text>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {preview.map((task) => (
            <label
              key={task.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 4px",
                borderRadius: "var(--linear-radius-sm)",
                cursor: "pointer",
              }}
            >
              <Checkbox
                label={task.title}
                isLabelHidden
                value={task.isComplete}
                onChange={() => onToggleTask(task.id)}
              />
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Text size="sm">{task.title}</Text>
                <Text
                  size="sm"
                  color={task.isOverdue ? "accent" : "secondary"}
                  style={task.isOverdue ? { color: "#eb5757" } : undefined}
                >
                  {task.dueLabel}
                </Text>
              </span>
            </label>
          ))}
        </div>
      )}

      {onSeeAllTasks ? (
        <button
          type="button"
          onClick={onSeeAllTasks}
          style={{
            all: "unset",
            cursor: "pointer",
            marginTop: 8,
            fontSize: 13,
            fontWeight: 500,
            color: "var(--linear-color-accent)",
          }}
        >
          See all tasks
        </button>
      ) : null}
    </section>
  );
}
