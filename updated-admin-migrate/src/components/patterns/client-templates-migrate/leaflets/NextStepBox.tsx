"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/patterns/primitives/Button";
import { Text } from "@/components/patterns/primitives/Text";

export type NextStepBoxProps = {
  title?: string;
  description?: string;
  sendLabel?: string;
  onSend?: () => void;
};

/**
 * Narrow call-to-action box for the Overview's five-column budget row —
 * sits opposite the budget chart, same shape as `SponsorshipLevelsPanel`.
 */
export function NextStepBox({
  title = "Reminder",
  description = "3 sponsors still owe payment before this issue goes to print.",
  sendLabel = "Send",
  onSend,
}: NextStepBoxProps) {
  return (
    <section
      data-slot="next-step-box"
      style={{
        boxSizing: "border-box",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 20,
        background: "var(--linear-color-panel)",
        border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
        borderRadius: "var(--linear-radius-md)",
        boxShadow: "var(--linear-shadow-panel)",
      }}
    >
      <Text type="label" color="secondary">
        Next step
      </Text>
      <Text weight="semibold">{title}</Text>
      <Text size="sm" color="secondary" style={{ flex: 1 }}>
        {description}
      </Text>
      <Button
        label={sendLabel}
        variant="secondary"
        size="sm"
        width="100%"
        icon={<Send size={14} strokeWidth={1.75} />}
        onClick={onSend}
      />
    </section>
  );
}
