"use client";

import { Plus, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared";
import {
  Dropdown,
  DropdownItem,
} from "@/components/patterns/shared/dropdown";
import { useState } from "react";
import type { EventTaskRow } from "@/data/mocks/events";

export type EventTasksSectionProps = {
  tasks: EventTaskRow[];
  onToggleTask: (id: string) => void;
  onSeeAllTasks?: () => void;
  onAddTask?: () => void;
};

const PREVIEW_LIMIT = 4;

export function EventTasksSection({
  tasks,
  onToggleTask,
  onSeeAllTasks,
  onAddTask,
}: EventTasksSectionProps) {
  const openTasks = tasks.filter((task) => !task.isComplete);
  const preview = openTasks.slice(0, PREVIEW_LIMIT);

  return (
    <section
      data-slot="event-tasks-section"
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
        {onAddTask ? (
          <IconButton
            label="Add task"
            variant="ghost"
            size="sm"
            icon={<Plus size={16} strokeWidth={1.75} />}
            onClick={onAddTask}
          />
        ) : null}
      </div>

      {preview.length === 0 ? (
        <EmptyStateCard
          variant="pill"
          label="Add new task"
          onClick={onAddTask}
          minHeight={72}
        />
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

      {onSeeAllTasks && preview.length > 0 ? (
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
