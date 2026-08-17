"use client";

import { useRouter } from "next/navigation";
import { Users2 } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";

export type CommitteeCardData = {
  id: string;
  name: string;
  description: string;
  chair?: string;
  memberCount?: number;
  cadence?: string;
};

export type CommitteeCardProps = {
  committee: CommitteeCardData;
};

export function CommitteeCard({ committee }: CommitteeCardProps) {
  const router = useRouter();

  return (
    <Card padding={4} style={{ cursor: "pointer" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/admin/committees/${committee.id}`)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            router.push(`/admin/committees/${committee.id}`);
          }
        }}
      >
        <VStack gap={3}>
          <HStack gap={2} align="center">
            <Icon icon={Users2} size="sm" color="secondary" />
            <Text weight="semibold" display="block" style={{ flex: 1 }}>
              {committee.name}
            </Text>
          </HStack>
          <Text color="secondary">{committee.description}</Text>
          {committee.cadence ? (
            <HStack gap={2}>
              <Badge label={committee.cadence} />
            </HStack>
          ) : null}
        </VStack>
      </div>
    </Card>
  );
}
