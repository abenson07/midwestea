"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import type { ClassPrerequisiteSubmission } from "./classMocks";
import { PREREQUISITE_STATUS_COLOR, PREREQUISITE_STATUS_LABEL } from "./prerequisiteStatus";

export type ClassPrerequisiteDecision = "approved" | "rejected";

export type ClassPrerequisiteViewerProps = {
  submission: ClassPrerequisiteSubmission;
  decision?: ClassPrerequisiteDecision;
  rejectReason?: string;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onUndo: () => void;
  /** Fill the height of its parent instead of a fixed 420px — for the fullscreen modal. */
  fill?: boolean;
};

/** Certificate viewer + approve/reject — shared by the overview modal and the prerequisites page sidebar. */
export function ClassPrerequisiteViewer({
  submission,
  decision,
  rejectReason,
  onApprove,
  onReject,
  onUndo,
  fill = false,
}: ClassPrerequisiteViewerProps) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  function confirmReject() {
    const next = reason.trim();
    if (!next) return;
    onReject(next);
    setRejecting(false);
    setReason("");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: fill ? "100%" : undefined,
        minHeight: 0,
      }}
    >
      <div
        style={{
          boxSizing: "border-box",
          height: fill ? undefined : 420,
          flex: fill ? 1 : undefined,
          minHeight: 0,
          overflow: "hidden",
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          borderRadius: "var(--linear-radius-md)",
          background: "var(--linear-color-canvas)",
        }}
      >
        <iframe
          src={`/api/new-admin-migrate/prerequisite-submissions/${submission.id}/file#toolbar=0&navpanes=0`}
          title={`${submission.type} — ${submission.student}`}
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>

      {decision ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Text
              size="sm"
              weight="medium"
              style={{
                color:
                  decision === "approved"
                    ? PREREQUISITE_STATUS_COLOR.approved
                    : PREREQUISITE_STATUS_COLOR.needs_resubmission,
              }}
            >
              {decision === "approved"
                ? PREREQUISITE_STATUS_LABEL.approved
                : PREREQUISITE_STATUS_LABEL.needs_resubmission}
            </Text>
            <Button
              label="Undo"
              variant="secondary"
              size="sm"
              onClick={() => {
                setRejecting(false);
                setReason("");
                onUndo();
              }}
            />
          </div>
          {decision === "rejected" && rejectReason ? (
            <Text size="sm" color="secondary">
              {rejectReason}
            </Text>
          ) : null}
        </div>
      ) : rejecting ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <TextInput label="Rejection reason" value={reason} onChange={setReason} multiline rows={3} />
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              label="Confirm reject"
              variant="primary"
              size="sm"
              disabled={!reason.trim()}
              onClick={confirmReject}
            />
            <Button
              label="Cancel"
              variant="ghost"
              size="sm"
              onClick={() => {
                setRejecting(false);
                setReason("");
              }}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <Button
              label="Approve"
              variant="primary"
              size="sm"
              width="100%"
              icon={<Check size={14} strokeWidth={2} />}
              onClick={onApprove}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Button
              label="Reject"
              variant="secondary"
              size="sm"
              width="100%"
              icon={<X size={14} strokeWidth={2} />}
              onClick={() => setRejecting(true)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
