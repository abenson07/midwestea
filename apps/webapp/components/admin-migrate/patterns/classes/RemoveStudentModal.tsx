"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin-migrate/patterns/shared/Modal";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import type { StudentToRemove } from "./classMocks";

function parsePaidTotal(amount: string): number {
  const parsed = Number(amount.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

const REFUND_PRESETS = [100, 50, 0] as const;

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export type RemoveStudentModalProps = {
  student: StudentToRemove | null;
  onClose: () => void;
  /**
   * May return a promise; the modal disables its buttons until it settles. The parent closes
   * the modal on success and leaves it open (after toasting) on failure.
   */
  onConfirm: (student: StudentToRemove, refundAmount: number, refundPercent: number) => void | Promise<void>;
  /** Live wiring: refunds are issued through Stripe, so copy says so and undo is limited. */
  live?: boolean;
};

export function RemoveStudentModal({ student, onClose, onConfirm, live = false }: RemoveStudentModalProps) {
  const [refundPercent, setRefundPercent] = useState("100");
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    if (student) setRefundPercent("100");
  }, [student]);

  const paidTotal = student ? parsePaidTotal(student.paidAmount) : 0;
  const parsedPercent = Number(refundPercent);
  const percentValid =
    refundPercent.trim() !== "" && Number.isFinite(parsedPercent) && parsedPercent >= 0 && parsedPercent <= 100;
  const refundAmount = percentValid ? Math.round(paidTotal * (parsedPercent / 100) * 100) / 100 : null;

  async function handleConfirm() {
    if (inFlight.current) return;
    if (!student || refundAmount == null) {
      toast.error("Enter a refund percentage between 0 and 100");
      return;
    }
    inFlight.current = true;
    setSubmitting(true);
    try {
      await onConfirm(student, refundAmount, parsedPercent);
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={student != null}
      onClose={submitting ? () => {} : onClose}
      title={student ? `Remove ${student.name}` : "Remove student"}
      width={440}
      footer={
        <>
          <Button label="Cancel" variant="ghost" disabled={submitting} onClick={onClose} />
          <Button
            label={submitting ? "Removing…" : "Remove student"}
            variant="primary"
            disabled={refundAmount == null || submitting}
            onClick={handleConfirm}
          />
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Text size="sm" color="secondary">
          Remove{" "}
          <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>{student?.name}</span>{" "}
          from {student?.className}?{" "}
          {live && refundAmount != null && refundAmount > 0
            ? "A refund cannot be undone once it is issued."
            : "This can be undone immediately after."}
        </Text>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderRadius: 6,
            background: "var(--linear-color-canvas)",
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          }}
        >
          <Text size="sm" color="secondary">
            Paid total
          </Text>
          <Text size="sm" weight="medium">
            {student ? student.paidAmount : "$0.00"}
          </Text>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Text size="sm" color="secondary">
            Refund percentage
          </Text>
          <div style={{ display: "flex", gap: 6 }}>
            {REFUND_PRESETS.map((preset) => (
              <Button
                key={preset}
                label={`${preset}%`}
                variant={parsedPercent === preset ? "primary" : "secondary"}
                size="sm"
                onClick={() => setRefundPercent(String(preset))}
              />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={refundPercent}
              onChange={(event) => setRefundPercent(event.target.value)}
              placeholder="0"
              style={{
                boxSizing: "border-box",
                width: 80,
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
            <Text size="sm" color="secondary">
              % of paid total ={" "}
              <span style={{ color: "var(--linear-color-ink)", fontWeight: 500 }}>
                {refundAmount != null ? formatUsd(refundAmount) : "—"}
              </span>
            </Text>
          </div>
        </div>

        <Text size="sm" color="secondary">
          {live
            ? refundAmount != null && refundAmount > 0
              ? `${formatUsd(refundAmount)} will be refunded to the student’s card through Stripe when you confirm. This cannot be undone. Any payment not made through Stripe will be flagged so you can refund it by hand.`
              : "No money will be refunded."
            : "Refunds are handled case-by-case — adjust the percentage as needed before confirming."}
        </Text>
      </div>
    </Modal>
  );
}
