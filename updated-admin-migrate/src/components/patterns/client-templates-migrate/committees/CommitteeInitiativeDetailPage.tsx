"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ClassContentPage } from "@/components/patterns/client-templates/shared";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import { RichTextEditor } from "@/components/patterns/client-templates-migrate/content/RichTextEditor";
import { usePeople } from "hooks";
import {
  sampleCommitteeMembers,
  type CommitteeInitiative,
  type CommitteeInitiativeTask,
} from "@/data/mocks/committees";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";

export type CommitteeInitiativeDetailPageProps = {
  initiative: CommitteeInitiative;
  onUpdateMeta: (patch: { title?: string; description?: string }) => Promise<void>;
  onUpdateTasks: (tasks: CommitteeInitiativeTask[]) => Promise<void>;
};

const cellInputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  padding: "6px 8px",
  borderRadius: "var(--linear-radius-sm)",
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

const titleInputStyle: CSSProperties = {
  all: "unset",
  boxSizing: "border-box",
  width: "100%",
  fontSize: 28,
  fontWeight: 600,
  lineHeight: "34px",
  color: "var(--linear-color-ink)",
};

const tableGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 160px 130px 120px",
  gap: 8,
  alignItems: "center",
};

function toEditorHtml(description: string): string {
  if (!description) return "";
  if (description.startsWith("<")) return description;
  return `<p>${description}</p>`;
}

function TaskRow({
  task,
  people,
  busy,
  onPatch,
}: {
  task: CommitteeInitiativeTask;
  people: Array<{ id: string; full_name: string }>;
  busy: boolean;
  onPatch: (id: string, patch: Partial<CommitteeInitiativeTask>) => void;
}) {
  const [titleDraft, setTitleDraft] = useState(task.title);

  useEffect(() => {
    setTitleDraft(task.title);
  }, [task.id, task.title]);

  return (
    <div
      style={{
        ...tableGrid,
        padding: "8px 0",
        borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      <input
        value={titleDraft}
        disabled={busy}
        onChange={(e) => setTitleDraft(e.target.value)}
        onBlur={() => {
          const next = titleDraft.trim();
          if (!next || next === task.title) {
            setTitleDraft(task.title);
            return;
          }
          onPatch(task.id, { title: next });
        }}
        style={{ ...cellInputStyle, border: "none", background: "transparent", paddingInline: 0 }}
        aria-label="Task"
      />
      <select
        value={task.assigneeId ?? ""}
        disabled={busy}
        onChange={(e) => {
          const id = e.target.value || null;
          const person = people.find((p) => p.id === id);
          onPatch(task.id, {
            assigneeId: id,
            assigneeName: person?.full_name ?? null,
          });
        }}
        style={cellInputStyle}
      >
        <option value="">Unassigned</option>
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.full_name}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={task.dueAt?.slice(0, 10) ?? ""}
        disabled={busy}
        onChange={(e) => onPatch(task.id, { dueAt: e.target.value || null })}
        style={cellInputStyle}
      />
      <select
        value={task.status}
        disabled={busy}
        onChange={(e) =>
          onPatch(task.id, { status: e.target.value as CommitteeInitiativeTask["status"] })
        }
        style={cellInputStyle}
      >
        <option value="open">Open</option>
        <option value="done">Done</option>
        <option value="canceled">Canceled</option>
      </select>
    </div>
  );
}

/**
 * Initiative detail — story-style editable title + rich description,
 * then a plain tasks table underneath (no card chrome).
 */
export function CommitteeInitiativeDetailPage({
  initiative,
  onUpdateMeta,
  onUpdateTasks,
}: CommitteeInitiativeDetailPageProps) {
  const { enabled: demo } = useDemoModeOptional();
  const { people } = usePeople({ autoFetch: !demo });
  const [newTitle, setNewTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initiative.title);
  const descriptionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitleDraft(initiative.title);
  }, [initiative.id, initiative.title]);

  const peopleOptions = useMemo(() => {
    const fromPeople = (people ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
    }));
    const fromSample = demo
      ? sampleCommitteeMembers.map((m) => ({ id: m.id, full_name: m.name }))
      : [];
    const extras = initiative.tasks
      .filter((t) => t.assigneeId && t.assigneeName)
      .map((t) => ({ id: t.assigneeId!, full_name: t.assigneeName! }));
    const map = new Map<string, { id: string; full_name: string }>();
    for (const p of [...fromPeople, ...fromSample, ...extras]) map.set(p.id, p);
    return Array.from(map.values());
  }, [people, initiative.tasks, demo]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  function queueDescription(html: string) {
    if (descriptionTimer.current) clearTimeout(descriptionTimer.current);
    descriptionTimer.current = setTimeout(() => {
      void onUpdateMeta({ description: html });
    }, 400);
  }

  useEffect(() => {
    return () => {
      if (descriptionTimer.current) clearTimeout(descriptionTimer.current);
    };
  }, []);

  return (
    <ClassContentPage>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 760 }}>
        <input
          value={titleDraft}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={() => {
            const next = titleDraft.trim();
            if (!next || next === initiative.title) {
              setTitleDraft(initiative.title);
              return;
            }
            void run(async () => {
              await onUpdateMeta({ title: next });
            });
          }}
          placeholder="Untitled initiative"
          style={titleInputStyle}
          aria-label="Initiative title"
        />

        <div style={{ minHeight: 280 }}>
          <RichTextEditor
            key={initiative.id}
            bare
            content={toEditorHtml(initiative.description)}
            placeholder="Describe the goal of this initiative…"
            onChange={queueDescription}
          />
        </div>
      </div>

      <section style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 32 }}>
        <Text weight="semibold" color="secondary">
          Tasks
        </Text>

        <div style={{ ...tableGrid, paddingBottom: 4 }}>
          <Text size="sm" color="secondary">
            Task
          </Text>
          <Text size="sm" color="secondary">
            Assignee
          </Text>
          <Text size="sm" color="secondary">
            Due
          </Text>
          <Text size="sm" color="secondary">
            Status
          </Text>
        </div>

        {initiative.tasks.length === 0 ? (
          <Text size="sm" color="secondary" style={{ padding: "8px 0" }}>
            No tasks yet.
          </Text>
        ) : (
          initiative.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              people={peopleOptions}
              busy={busy}
              onPatch={(id, patch) => {
                void run(async () => {
                  const next = initiative.tasks.map((t) =>
                    t.id === id ? { ...t, ...patch } : t,
                  );
                  await onUpdateTasks(next);
                });
              }}
            />
          ))
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a task…"
            disabled={busy}
            style={{ ...cellInputStyle, flex: 1 }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || !newTitle.trim() || busy) return;
              e.preventDefault();
              void run(async () => {
                const task: CommitteeInitiativeTask = {
                  id: `task-${Date.now()}`,
                  title: newTitle.trim(),
                  assigneeId: null,
                  assigneeName: null,
                  dueAt: null,
                  status: "open",
                };
                await onUpdateTasks([...initiative.tasks, task]);
                setNewTitle("");
              });
            }}
          />
          <Button
            label="Add"
            disabled={busy || !newTitle.trim()}
            onClick={() => {
              void run(async () => {
                const task: CommitteeInitiativeTask = {
                  id: `task-${Date.now()}`,
                  title: newTitle.trim(),
                  assigneeId: null,
                  assigneeName: null,
                  dueAt: null,
                  status: "open",
                };
                await onUpdateTasks([...initiative.tasks, task]);
                setNewTitle("");
              });
            }}
          />
        </div>
      </section>
    </ClassContentPage>
  );
}
