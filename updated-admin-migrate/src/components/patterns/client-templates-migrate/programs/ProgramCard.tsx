"use client";

import { GraduationCap } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";

export type ProgramCardData = {
  id: string;
  name: string;
  description: string;
  length?: string;
};

export type ProgramCardProps = {
  program: ProgramCardData;
};

export function ProgramCard({ program }: ProgramCardProps) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} align="center">
          <Icon icon={GraduationCap} size="sm" color="secondary" />
          <Text weight="semibold" display="block" style={{ flex: 1 }}>
            {program.name}
          </Text>
        </HStack>
        <Text color="secondary">{program.description}</Text>
        {program.length ? (
          <HStack gap={2}>
            <Badge label={program.length} />
          </HStack>
        ) : null}
      </VStack>
    </Card>
  );
}
