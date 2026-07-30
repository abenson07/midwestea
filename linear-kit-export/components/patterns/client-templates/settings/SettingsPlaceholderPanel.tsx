"use client";

import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export type SettingsPlaceholderPanelProps = {
  label: string;
};

/** Stand-in for every settings nav item not yet built out. */
export function SettingsPlaceholderPanel({ label }: SettingsPlaceholderPanelProps) {
  return (
    <VStack gap={2}>
      <Heading level={1}>{label}</Heading>
      <Text color="secondary">Nothing here yet.</Text>
    </VStack>
  );
}
