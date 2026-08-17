"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Plus, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Text, Heading } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { Dropdown, DropdownItem } from "@/components/patterns/shared/dropdown";
import {
  LEAFLET_TASK_GROUP_ORDER,
  type LeafletTaskGroupLabel,
  type LeafletTaskRow,
} from "@/data/mocks/leaflets";

const panelCardStyle: CSSProperties = {
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: 20,
  background: "var(--linear-color-panel)",
  border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
  borderRadius: "var(--linear-radius-md)",
  boxShadow: "var(--linear-shadow-panel)",
};

function TaskGroupCard({
  label,
  accent,
  children,
}: {
  label: string;
  accent?: boolean;
  children: ReactNode;
}) {
  return (
    <section style={panelCardStyle}>
      <Text
        weight="semibold"
        color="secondary"
        style={{
          marginBottom: 8,
          ...(accent ? { color: "#eb5757" } : undefined),
        }}
      >
        {label}
      </Text>
      {children}
    </section>
  );
}

export type LeafletSchedulePageProps = {
  tasks: LeafletTaskRow[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: { title: string; dueDate: string }) => void;
  onRemoveTask: (id: string) => void;
};

function groupTasks(tasks: LeafletTaskRow[], complete: boolean) {
  const filtered = tasks.filter((task) => task.isComplete === complete);
  const groups = new Map<LeafletTaskGroupLabel, LeafletTaskRow[]>();
  for (const task of filtered) {
    const list = groups.get(task.group) ?? [];
    list.push(task);
    groups.set(task.group, list);
  }
  const order = LEAFLET_TASK_GROUP_ORDER;
  return order.filter((label) => groups.has(label)).map((label) => ({ label, tasks: groups.get(label)! }));
}

function TaskRow({ task, onToggle, onRemove }: { task: LeafletTaskRow; onToggle: () => void; onRemove: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", borderRadius: "var(--linear-radius-sm)" }}>
      <Checkbox label={task.title} isLabelHidden value={task.isComplete} onChange={onToggle} />
      <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <Text
          size="sm"
          color={task.isComplete ? "secondary" : "primary"}
          style={task.isComplete ? { textDecoration: "line-through" } : undefined}
        >
          {task.title}
        </Text>
        <Text size="sm" color="secondary" style={task.isOverdue ? { color: "#eb5757" } : undefined}>
          {task.dueLabel}
        </Text>
      </span>
      <Dropdown
        label="Task actions"
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        placement="below"
        alignment="end"
        trigger={
          <IconButton
            label="Task actions"
            variant="ghost"
            size="sm"
            icon={<MoreHorizontal size={16} strokeWidth={1.75} />}
            isActive={isMenuOpen}
          />
        }
      >
        <DropdownItem
          label="Remove task"
          onSelect={() => {
            setIsMenuOpen(false);
            onRemove();
          }}
        />
      </Dropdown>
    </div>
  );
}

function AddTaskRow({ onAdd }: { onAdd: (task: { title: string; dueDate: string }) => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  if (!isAdding) {
    return (
      <button
        type="button"
        onClick={() => setIsAdding(true)}
        style={{
          all: "unset",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 4px",
          fontSize: 13,
          fontWeight: 500,
          color: "var(--linear-color-ink-subtle)",
        }}
      >
        <Plus size={14} strokeWidth={1.75} />
        Add task
      </button>
    );
  }

  function handleSave() {
    if (!title.trim() || !dueDate) return;
    onAdd({ title: title.trim(), dueDate });
    setTitle("");
    setDueDate("");
    setIsAdding(false);
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: "8px 4px" }}>
      <div style={{ flex: 1 }}>
        <TextInput label="Task title" value={title} onChange={setTitle} />
      </div>
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>Due date</span>
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          style={{
            boxSizing: "border-box",
            height: 32,
            paddingInline: 8,
            borderRadius: 6,
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            background: "var(--linear-color-canvas)",
            color: "var(--linear-color-ink)",
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />
      </label>
      <Button label="Save" variant="primary" size="sm" onClick={handleSave} />
      <IconButton
        label="Cancel"
        variant="ghost"
        size="sm"
        icon={<X size={14} strokeWidth={1.75} />}
        onClick={() => {
          setIsAdding(false);
          setTitle("");
          setDueDate("");
        }}
      />
    </div>
  );
}

/**
 * Full-width Schedule/To-do view — active tasks grouped by "days out" from
 * distribution, then a Completed section. Mirrors `EventTasksPage`.
 */
export function LeafletSchedulePage({ tasks, onToggleTask, onAddTask, onRemoveTask }: LeafletSchedulePageProps) {
  const openCount = tasks.filter((t) => !t.isComplete).length;
  const completeCount = tasks.filter((t) => t.isComplete).length;
  const activeGroups = groupTasks(tasks, false);
  const completedGroups = groupTasks(tasks, true);

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        boxSizing: "border-box",
        padding: "32px 24px 64px",
      }}
    >
      <div style={{ maxWidth: 720, marginInline: "auto", display: "flex", flexDirection: "column", gap: 32 }}>
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Heading level={2}>Active tasks</Heading>
            <Text size="sm" color="secondary">
              {openCount} open task{openCount === 1 ? "" : "s"}
            </Text>
          </div>

          {activeGroups.length === 0 ? (
            <section style={panelCardStyle}>
              <Text size="sm" color="secondary">
                No open tasks for this leaflet.
              </Text>
            </section>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {activeGroups.map(({ label, tasks: groupTasksList }) => (
                <TaskGroupCard key={label} label={label} accent={label === "Past due"}>
                  {groupTasksList.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTask(task.id)}
                      onRemove={() => onRemoveTask(task.id)}
                    />
                  ))}
                  <AddTaskRow onAdd={onAddTask} />
                </TaskGroupCard>
              ))}
            </div>
          )}
        </section>

        {completeCount > 0 ? (
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <Heading level={2}>Completed</Heading>
              <Text size="sm" color="secondary">
                {completeCount} completed task{completeCount === 1 ? "" : "s"}
              </Text>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {completedGroups.map(({ label, tasks: groupTasksList }) => (
                <TaskGroupCard key={label} label={label}>
                  {groupTasksList.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => onToggleTask(task.id)}
                      onRemove={() => onRemoveTask(task.id)}
                    />
                  ))}
                </TaskGroupCard>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
