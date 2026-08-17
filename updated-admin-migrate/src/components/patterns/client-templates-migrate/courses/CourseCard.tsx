"use client";

import { BookOpen } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";

export type CourseCardData = {
  id: string;
  name: string;
  description: string;
  length?: string;
};

export type CourseCardProps = {
  course: CourseCardData;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} align="center">
          <Icon icon={BookOpen} size="sm" color="secondary" />
          <Text weight="semibold" display="block" style={{ flex: 1 }}>
            {course.name}
          </Text>
        </HStack>
        <Text color="secondary">{course.description}</Text>
        {course.length ? (
          <HStack gap={2}>
            <Badge label={course.length} />
          </HStack>
        ) : null}
      </VStack>
    </Card>
  );
}
