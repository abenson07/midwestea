"use client";

import type { ReactNode } from "react";
import { HStack, VStack } from "@/components/admin-migrate/patterns/primitives/Stack";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";

export type SettingsRowProps = {
  label: string;
  description?: string;
  control: ReactNode;
};

/** Label + description on the left, a control on the right. */
export function SettingsRow({ label, description, control }: SettingsRowProps) {
  return (
    <HStack justify="between" align="center" gap={4}>
      <VStack gap={0.5}>
        <Text weight="medium">{label}</Text>
        {description ? (
          <Text color="secondary" size="sm">
            {description}
          </Text>
        ) : null}
      </VStack>
      {control}
    </HStack>
  );
}
