"use client";

import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import { useAdminBasePath } from "@/components/patterns/client-templates/shared";

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
  const router = useRouter();
  const basePath = useAdminBasePath();
  const href = `${basePath}/courses/${course.id}`;

  return (
    <Card padding={4} style={{ cursor: "pointer" }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(href)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(href);
          }
        }}
      >
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
      </div>
    </Card>
  );
}
