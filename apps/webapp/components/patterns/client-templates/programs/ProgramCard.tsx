"use client";

import { useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import type { ProgramCard as ProgramCardData } from "@/data/mocks/programs";

export type ProgramCardProps = {
  program: ProgramCardData;
};

export function ProgramCard({ program }: ProgramCardProps) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push("/admin-preview/program-settings")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          router.push("/admin-preview/program-settings");
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <Card padding={4}>
        <VStack gap={3}>
          <HStack gap={2} align="center">
            <Icon icon={GraduationCap} size="sm" color="secondary" />
            <Text weight="semibold" display="block" style={{ flex: 1 }}>
              {program.name}
            </Text>
            <Text color="secondary" size="sm">
              {program.code}
            </Text>
          </HStack>
          <Text color="secondary">{program.description}</Text>
          <HStack gap={2}>
            <Badge label={program.duration} />
            <Badge label={program.tuition} />
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}
