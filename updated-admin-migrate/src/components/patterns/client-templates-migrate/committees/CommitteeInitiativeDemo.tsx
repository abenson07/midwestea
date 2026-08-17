"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { Text } from "@/components/patterns/primitives/Text";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import {
  sampleInitiatives,
  type CommitteeInitiative,
  type CommitteeInitiativeTask,
} from "@/data/mocks/committees";
import { getDemoInitiative, upsertDemoInitiative } from "@/lib/demo/demoInitiatives";
import { COMMITTEE_LABELS } from "schemas/committee_meetings";
import { useCommitteeInitiative } from "hooks";
import { resolveCommitteeSlug } from "./committeeSlug";
import { CommitteeInitiativeDetailPage } from "./CommitteeInitiativeDetailPage";

function cloneInitiative(init: CommitteeInitiative): CommitteeInitiative {
  return { ...init, tasks: init.tasks.map((t) => ({ ...t })) };
}

function resolveDemoInitiative(initiativeId: string): CommitteeInitiative | null {
  const fromSample = sampleInitiatives.find((i) => i.id === initiativeId);
  if (fromSample) return cloneInitiative(fromSample);
  const fromStore = getDemoInitiative(initiativeId);
  return fromStore ? cloneInitiative(fromStore) : null;
}

export function CommitteeInitiativeDemo() {
  const params = useParams<{ committeeId: string; initiativeId: string }>();
  const router = useRouter();
  const { enabled: demo } = useDemoModeOptional();
  const rawCommitteeId =
    typeof params?.committeeId === "string" ? params.committeeId : "events";
  const initiativeId =
    typeof params?.initiativeId === "string" ? params.initiativeId : "";
  const slug = resolveCommitteeSlug(rawCommitteeId);

  const sample = useMemo(
    () => (initiativeId ? resolveDemoInitiative(initiativeId) : null),
    [initiativeId],
  );

  const [demoInitiative, setDemoInitiative] = useState<CommitteeInitiative | null>(() =>
    sample ? cloneInitiative(sample) : null,
  );

  useEffect(() => {
    setDemoInitiative(sample ? cloneInitiative(sample) : null);
  }, [sample]);

  const {
    initiative: liveInitiative,
    loading,
    createTask,
    updateTask,
    updateInitiative,
    replaceLocalTasks,
  } = useCommitteeInitiative(!demo && initiativeId ? initiativeId : null);

  const initiative = demo ? demoInitiative : liveInitiative;

  const onUpdateMeta = useCallback(
    async (patch: { title?: string; description?: string }) => {
      if (demo) {
        setDemoInitiative((prev) => {
          if (!prev) return prev;
          const next = { ...prev, ...patch };
          upsertDemoInitiative(next);
          return next;
        });
        return;
      }
      await updateInitiative(patch);
    },
    [demo, updateInitiative],
  );

  const onUpdateTasks = useCallback(
    async (tasks: CommitteeInitiativeTask[]) => {
      if (demo) {
        setDemoInitiative((prev) => {
          if (!prev) return prev;
          const next = { ...prev, tasks };
          upsertDemoInitiative(next);
          return next;
        });
        return;
      }
      if (!initiative) return;

      const prevIds = new Set(initiative.tasks.map((t) => t.id));

      for (const task of tasks) {
        if (!prevIds.has(task.id)) {
          await createTask({
            title: task.title,
            assignee_person_id: task.assigneeId,
            due_at: task.dueAt,
          });
          return;
        }
      }

      for (const task of tasks) {
        const prev = initiative.tasks.find((t) => t.id === task.id);
        if (!prev) continue;
        if (
          prev.title !== task.title ||
          prev.assigneeId !== task.assigneeId ||
          prev.dueAt !== task.dueAt ||
          prev.status !== task.status
        ) {
          await updateTask(task.id, {
            title: task.title,
            assignee_person_id: task.assigneeId,
            due_at: task.dueAt,
            status: task.status,
          });
          replaceLocalTasks?.(tasks);
          return;
        }
      }
    },
    [demo, initiative, createTask, updateTask, replaceLocalTasks],
  );

  const committeeLabel = slug ? COMMITTEE_LABELS[slug] : "Committee";

  if (!initiativeId || (!demo && loading && !initiative)) {
    return (
      <div style={{ height: "100%" }}>
        <FoundationLayout
          navigation={<LinearSidebar />}
          contentMaxWidth={1200}
          header={<CanvasHeader topbar={{ title: "Initiative" }} />}
        >
          <div style={{ padding: 32 }}>
            <Text color="secondary">{loading ? "Loading…" : "Initiative not found"}</Text>
          </div>
        </FoundationLayout>
      </div>
    );
  }

  if (!initiative) {
    return (
      <div style={{ height: "100%" }}>
        <FoundationLayout
          navigation={<LinearSidebar />}
          contentMaxWidth={1200}
          header={<CanvasHeader topbar={{ title: "Initiative" }} />}
        >
          <div style={{ padding: 32 }}>
            <Text color="secondary">Initiative not found</Text>
          </div>
        </FoundationLayout>
      </div>
    );
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        contentMaxWidth={1200}
        header={
          <CanvasHeader
            topbar={{
              title: initiative.title,
              breadcrumbs: [
                {
                  label: "Committees",
                  onClick: () => router.push("/admin/committees"),
                },
                {
                  label: `${committeeLabel} Committee`,
                  onClick: () =>
                    router.push(
                      `/admin/committees/${encodeURIComponent(rawCommitteeId)}?view=initiatives`,
                    ),
                },
              ],
            }}
          />
        }
      >
        <CommitteeInitiativeDetailPage
          initiative={initiative}
          onUpdateMeta={onUpdateMeta}
          onUpdateTasks={onUpdateTasks}
        />
      </FoundationLayout>
    </div>
  );
}
