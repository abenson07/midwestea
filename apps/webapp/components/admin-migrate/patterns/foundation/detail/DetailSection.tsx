"use client";

import type { ReactNode } from "react";
import { VStack } from "@/components/admin-migrate/patterns/primitives/Stack";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";

export type DetailSectionProps = {
  /** Optional section header. Omit for an ungrouped run of rows (e.g. plain facts). */
  title?: string;
  children: ReactNode;
  /** Suppress the top hairline + padding — set on the first section in a panel. */
  isFirst?: boolean;
};

/**
 * Structural grouping for the reworked detail panel — a hairline-separated
 * block of `DetailRow` / `DetailField` / `DetailSelectField` rows, modeled on
 * Mercury's side-panel sections.
 */
export function DetailSection({ title, children, isFirst = false }: DetailSectionProps) {
  return (
    <div
      style={{
        paddingTop: isFirst ? 0 : 16,
        marginTop: isFirst ? 0 : 16,
        borderTop: isFirst
          ? "none"
          : "var(--linear-border-width) solid var(--linear-color-hairline)",
      }}
    >
      <VStack gap={3}>
        {title ? (
          <Text type="label" color="secondary">
            {title}
          </Text>
        ) : null}
        <VStack gap={0}>{children}</VStack>
      </VStack>
    </div>
  );
}
