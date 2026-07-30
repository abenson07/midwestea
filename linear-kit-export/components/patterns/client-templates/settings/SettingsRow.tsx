"use client";

import type { ReactNode } from "react";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

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
