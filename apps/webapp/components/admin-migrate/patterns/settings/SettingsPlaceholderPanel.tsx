"use client";

import { Heading, Text } from "@/components/patterns/primitives/Text";
import { VStack } from "@/components/patterns/primitives/Stack";

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
