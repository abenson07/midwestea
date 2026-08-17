"use client";

import type { ReactNode } from "react";
import { Text } from "@/components/patterns/primitives/Text";
import { Button } from "@/components/patterns/primitives/Button";
import { EmptyStateCard } from "@/components/patterns/client-templates/shared/EmptyStateCard";

export type CommitteeHubSectionProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  emptyLabel?: string;
  isEmpty?: boolean;
};

/**
 * Section header + body. Empty state uses Linear’s pattern: title row above a
 * bordered empty frame (not nested inside another card).
 */
export function CommitteeHubSection({
  title,
  actionLabel,
  onAction,
  children,
  emptyLabel,
  isEmpty,
}: CommitteeHubSectionProps) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingInline: 2,
        }}
      >
        <Text weight="semibold" color="secondary">
          {title}
        </Text>
        {actionLabel && onAction ? (
          <Button label={actionLabel} variant="ghost" size="sm" onClick={onAction} />
        ) : null}
      </div>
      {isEmpty ? (
        <EmptyStateCard
          variant="plain"
          label={emptyLabel ?? "Nothing here yet"}
          onClick={onAction}
        />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 16,
            background: "var(--linear-color-panel)",
            border: "var(--linear-border-width) solid var(--linear-color-panel-border)",
            borderRadius: "var(--linear-radius-md)",
            boxShadow: "var(--linear-shadow-panel)",
          }}
        >
          {children}
        </div>
      )}
    </section>
  );
}
