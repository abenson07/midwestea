"use client";

import type { ReactNode } from "react";
import { Grid } from "@/components/admin-migrate/patterns/primitives/Grid";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { VStack } from "@/components/admin-migrate/patterns/primitives/Stack";

export type DraftsSectionProps = {
  title: string;
  /** Cards per row within this section. */
  columns: 1 | 2 | 3 | 4 | 5;
  children: ReactNode;
};

/**
 * A titled row of draft cards. `columns` controls how many cards sit
 * side by side (1 = full width, up to 5 across).
 */
export function DraftsSection({ title, columns, children }: DraftsSectionProps) {
  return (
    <VStack gap={3}>
      <Text type="label" color="secondary">
        {title}
      </Text>
      <Grid columns={columns} gap={4}>
        {children}
      </Grid>
    </VStack>
  );
}
