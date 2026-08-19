"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardCheck, X } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { Modal } from "@/components/patterns/shared/Modal";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";
import { ClassBanner } from "./ClassBanner";
import { ClassPrerequisiteViewer, type ClassPrerequisiteDecision } from "./ClassPrerequisiteViewer";
import type { ClassPrerequisiteSubmission } from "./classMocks";

/** Modal body: 8-column viewer, 4-column list on the right. */
const QUEUE_GRID = { columns: 12, viewer: 8, list: 4, gap: 16 } as const;

export type ClassPrerequisitesQueueProps = {
  classId?: string;
  submissions: ClassPrerequisiteSubmission[];
  /** Opens the review modal with this submission selected (roster Review). */
  reviewSubmissionId?: string | null;
  onReviewClose?: () => void;
  /** Called with decided submission ids when the lightbox closes. */
  onReviewed?: (ids: string[]) => void;
  hideBanner?: boolean;
};

/** Pending prerequisite approvals — banner opens a list + viewer modal for reviewing each one. */
export function ClassPrerequisitesQueue({
  classId,
  submissions,
  reviewSubmissionId = null,
  onReviewClose,
  onReviewed,
  hideBanner = false,
}: ClassPrerequisitesQueueProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();

  const [rows, setRows] = useState(submissions);
  const [decisions, setDecisions] = useState<Record<string, ClassPrerequisiteDecision>>({});
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = internalOpen || Boolean(reviewSubmissionId);

  useEffect(() => {
    if (!isOpen) return;
    if (reviewSubmissionId && rows.some((row) => row.id === reviewSubmissionId)) {
      setSelectedId(reviewSubmissionId);
      return;
    }
    if (selectedId && rows.some((row) => row.id === selectedId)) return;
    const firstPending = rows.find((row) => !decisions[row.id]);
    setSelectedId(firstPending?.id ?? rows[0]?.id ?? null);
    // Re-run when the modal opens or the roster asks to review a specific submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reviewSubmissionId]);

  function decide(row: ClassPrerequisiteSubmission, decision: ClassPrerequisiteDecision, reason?: string) {
    setDecisions((prev) => ({ ...prev, [row.id]: decision }));
    if (decision === "rejected" && reason) {
      setRejectReasons((prev) => ({ ...prev, [row.id]: reason }));
    }
    toast.success(`${decision === "approved" ? "Approved" : "Rejected"} ${row.student}'s ${row.type}`);
    const currentIndex = rows.findIndex((r) => r.id === row.id);
    const upcoming =
      rows.slice(currentIndex + 1).find((r) => !decisions[r.id]) ??
      rows.slice(0, currentIndex).find((r) => !decisions[r.id]);
    setSelectedId(upcoming?.id ?? null);
  }

  function undo(id: string) {
    setDecisions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setRejectReasons((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSelectedId(id);
  }

  function closeModal() {
    const decidedIds = Object.keys(decisions);
    setRows((prev) => prev.filter((row) => !decisions[row.id]));
    setDecisions({});
    setRejectReasons({});
    setSelectedId(null);
    setInternalOpen(false);
    if (decidedIds.length) onReviewed?.(decidedIds);
    onReviewClose?.();
  }

  function seeAll() {
    if (!classId) return;
    closeModal();
    router.push(`${basePath}/${classId}/prerequisites`);
  }

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  return (
    <div
      data-slot="class-prerequisites-queue"
      style={hideBanner ? { display: "contents" } : undefined}
    >
      {hideBanner ? null : (
        <ClassBanner
          icon={<ClipboardCheck size={16} strokeWidth={1.75} />}
          label={`${rows.length} Prerequisite${rows.length === 1 ? "" : "s"} to review`}
          onClick={() => setInternalOpen(true)}
        />
      )}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="Prerequisites"
        fullScreenInset={64}
        footer={
          classId ? <Button label="See all" variant="secondary" onClick={seeAll} /> : undefined
        }
      >
        {rows.length ? (
          <div
            style={{
              height: "100%",
              display: "grid",
              gridTemplateColumns: `repeat(${QUEUE_GRID.columns}, minmax(0, 1fr))`,
              gap: QUEUE_GRID.gap,
              alignItems: "stretch",
            }}
          >
            <div style={{ gridColumn: `span ${QUEUE_GRID.viewer}`, minWidth: 0, minHeight: 0 }}>
              {selected ? (
                <ClassPrerequisiteViewer
                  submission={selected}
                  decision={decisions[selected.id]}
                  rejectReason={rejectReasons[selected.id]}
                  onApprove={() => decide(selected, "approved")}
                  onReject={(reason) => decide(selected, "rejected", reason)}
                  onUndo={() => undo(selected.id)}
                  fill
                />
              ) : (
                <Text size="sm" color="secondary">
                  Select a prerequisite to review.
                </Text>
              )}
            </div>

            <div
              style={{
                gridColumn: `span ${QUEUE_GRID.list}`,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minHeight: 0,
                overflowY: "auto",
              }}
            >
              {rows.map((row) => {
                const decision = decisions[row.id];
                const isSelected = row.id === selectedId;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    style={{
                      all: "unset",
                      boxSizing: "border-box",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: "var(--linear-radius-md)",
                      background: isSelected ? "var(--linear-color-sidebar-item-selected)" : "transparent",
                    }}
                  >
                    <Avatar name={row.student} size="sm" />
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                      <Text
                        size="sm"
                        weight={isSelected ? "semibold" : "regular"}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.student}
                      </Text>
                      <Text
                        size="sm"
                        color="secondary"
                        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {row.type}
                      </Text>
                    </div>
                    {decision === "approved" ? (
                      <Check size={14} strokeWidth={2} color="#27a644" style={{ flexShrink: 0 }} />
                    ) : decision === "rejected" ? (
                      <X size={14} strokeWidth={2} color="var(--linear-color-ink-subtle)" style={{ flexShrink: 0 }} />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <Text size="sm" color="secondary">
            No prerequisites to review.
          </Text>
        )}
      </Modal>
    </div>
  );
}
