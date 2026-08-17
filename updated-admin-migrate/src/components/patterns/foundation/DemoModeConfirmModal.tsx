"use client";

import { Loader2 } from "lucide-react";
import { useIsFetching } from "@tanstack/react-query";
import { Modal } from "@/components/patterns/shared/Modal";
import { Text } from "@/components/patterns/primitives/Text";

export type DemoModeConfirmModalTarget = "demo" | "live";

export type DemoModeConfirmModalProps = {
  isOpen: boolean;
  target: DemoModeConfirmModalTarget;
  onCancel: () => void;
  onConfirm: () => void;
};

const copy: Record<DemoModeConfirmModalTarget, { title: string; body: string; confirmLabel: string }> = {
  demo: {
    title: "Enter demo mode?",
    body: "You're about to switch to demo mode. Everything you see from here on — events, people, committees, and more — is sample data. Changes are saved on this device only and never written to the database. Exiting demo mode clears them.",
    confirmLabel: "Enter demo mode",
  },
  live: {
    title: "Exit demo mode?",
    body: "You're about to switch back to live mode. Local demo changes on this device will be cleared. You'll be working with real data again, and any changes you make will be saved to the database.",
    confirmLabel: "Exit demo mode",
  },
};

/**
 * Confirms a demo/live mode switch. While the modal is open, whatever real
 * data the destination mode needs keeps loading in the background (react-query
 * hooks are always mounted regardless of demo state) — the confirm button
 * turns into a spinner until no queries are in flight, so data is ready the
 * moment the user commits to the switch.
 */
export function DemoModeConfirmModal({ isOpen, target, onCancel, onConfirm }: DemoModeConfirmModalProps) {
  const isFetching = useIsFetching();
  const ready = isFetching === 0;
  const { title, body, confirmLabel } = copy[target];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      width={400}
      footer={
        <>
          <button
            type="button"
            onClick={onCancel}
            style={{
              all: "unset",
              boxSizing: "border-box",
              cursor: "pointer",
              height: 28,
              paddingInline: 12,
              borderRadius: 6,
              fontSize: 13,
              lineHeight: "26px",
              fontWeight: 500,
              textAlign: "center",
              color: "var(--linear-color-ink)",
              background: "var(--linear-color-icon-button-secondary)",
              border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={ready ? onConfirm : undefined}
            disabled={!ready}
            aria-busy={!ready}
            style={{
              all: "unset",
              boxSizing: "border-box",
              cursor: ready ? "pointer" : "not-allowed",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              height: 28,
              minWidth: 96,
              paddingInline: 12,
              borderRadius: 6,
              fontSize: 13,
              lineHeight: "20px",
              fontWeight: 500,
              textAlign: "center",
              color: "var(--linear-color-on-accent)",
              background: "var(--linear-color-accent)",
              opacity: ready ? 1 : 0.7,
            }}
          >
            {ready ? confirmLabel : <Loader2 className="demo-mode-spin" size={14} strokeWidth={2} />}
          </button>
        </>
      }
    >
      <Text color="secondary" size="sm">
        {body}
      </Text>
    </Modal>
  );
}
