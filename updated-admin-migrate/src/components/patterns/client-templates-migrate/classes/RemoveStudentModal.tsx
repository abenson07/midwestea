"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";
import type { StudentToRemove } from "./classMocks";

function paidAmountToInput(amount: string): string {
  return amount.replace(/[^0-9.]/g, "");
}

function parseRefundAmount(value: string): number | null {
  const trimmed = value.trim().replace(/^\$/, "");
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export type RemoveStudentModalProps = {
  student: StudentToRemove | null;
  onClose: () => void;
  onConfirm: (student: StudentToRemove, refundAmount: number) => void;
};

export function RemoveStudentModal({ student, onClose, onConfirm }: RemoveStudentModalProps) {
  const [refundAmount, setRefundAmount] = useState("");

  useEffect(() => {
    if (student) setRefundAmount(paidAmountToInput(student.paidAmount));
  }, [student]);

  const parsed = parseRefundAmount(refundAmount);

  function handleConfirm() {
    if (!student || parsed == null) {
      toast.error("Enter a refund amount");
      return;
    }
    onConfirm(student, parsed);
  }

  return (
    <Modal
      isOpen={student != null}
      onClose={onClose}
      title={student ? `Remove ${student.name}` : "Remove student"}
      width={440}
      footer={
        <>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          <Button
            label="Remove student"
            variant="primary"
            disabled={parsed == null}
            onClick={handleConfirm}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Text size="sm" color="secondary">
          Remove{" "}
          <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{student?.name}</span>{" "}
          from {student?.className}? This can be undone immediately after.
        </Text>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Text size="sm" color="secondary">
            Refund amount
          </Text>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text size="sm" color="secondary">
              $
            </Text>
            <input
              type="number"
              min="0"
              step="0.01"
              value={refundAmount}
              onChange={(event) => setRefundAmount(event.target.value)}
              placeholder="0.00"
              style={{
                boxSizing: "border-box",
                flex: 1,
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
          </div>
        </label>
      </div>
    </Modal>
  );
}
