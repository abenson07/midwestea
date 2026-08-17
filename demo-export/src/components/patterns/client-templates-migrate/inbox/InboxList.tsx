"use client";

import { useMemo } from "react";
import { Avatar } from "@/components/patterns/primitives/Avatar";
import { Text } from "@/components/patterns/primitives/Text";
import type { InboxMessage } from "@/data/mocks/inbox";

export type InboxListProps = {
  messages: InboxMessage[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

function relativeTime(iso: string): string {
  const date = new Date(iso);
  const days = Math.round((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function InboxList({ messages, selectedId, onSelect }: InboxListProps) {
  const sorted = useMemo(
    () => [...messages].sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()),
    [messages],
  );

  return (
    <div
      style={{
        boxSizing: "border-box",
        width: 340,
        flexShrink: 0,
        height: "100%",
        overflow: "auto",
        borderInlineEnd: "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      {sorted.map((message) => {
        const selected = message.id === selectedId;
        const unread = message.status === "unread";
        return (
          <button
            key={message.id}
            type="button"
            onClick={() => onSelect(message.id)}
            style={{
              all: "unset",
              boxSizing: "border-box",
              display: "flex",
              width: "100%",
              alignItems: "flex-start",
              gap: 10,
              padding: "12px 16px",
              cursor: "pointer",
              background: selected ? "var(--linear-color-sidebar-item-selected)" : "transparent",
              borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
            }}
          >
            <Avatar name={message.fromName} size="sm" />
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                <Text size="sm" weight={unread ? "semibold" : "regular"} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {message.fromName}
                </Text>
                <Text size="sm" color="secondary" style={{ flexShrink: 0 }}>
                  {relativeTime(message.receivedAt)}
                </Text>
              </div>
              <Text size="sm" weight={unread ? "medium" : "regular"} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {message.subject}
              </Text>
              <Text size="sm" color="secondary" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {message.preview}
              </Text>
            </div>
            {unread ? (
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--linear-color-accent)",
                  flexShrink: 0,
                  marginTop: 6,
                }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
