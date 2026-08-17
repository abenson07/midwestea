"use client";

import { Mail } from "lucide-react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Badge } from "@/components/patterns/primitives/Badge";
import { Text } from "@/components/patterns/primitives/Text";
import type { InboxMessage } from "@/data/mocks/inbox";

export type InboxReadingPaneProps = {
  message: InboxMessage | null;
};

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function InboxReadingPane({ message }: InboxReadingPaneProps) {
  if (!message) {
    return (
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text color="secondary">Select a message to read it</Text>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: "100%",
        overflow: "auto",
        boxSizing: "border-box",
        padding: "24px 32px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <Text size="md" weight="semibold" as="h2">
          {message.subject}
        </Text>
        <Badge label={message.category} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Avatar name={message.fromName} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Text size="sm" weight="medium">
            {message.fromName}
          </Text>
          <Text size="sm" color="secondary">
            {message.fromEmail}
          </Text>
        </div>
        <Text size="sm" color="secondary" style={{ marginInlineStart: "auto" }}>
          {formatFullDate(message.receivedAt)}
        </Text>
      </div>
      <div style={{ whiteSpace: "pre-wrap" }}>
        <Text size="sm">{message.body}</Text>
      </div>
      <div
        style={{
          marginTop: 32,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--linear-color-ink-tertiary)",
        }}
      >
        <Mail size={13} strokeWidth={1.75} />
        <Text size="sm" color="disabled">
          Demo inbox — replying isn&apos;t wired up yet.
        </Text>
      </div>
    </div>
  );
}
