"use client";

import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Card } from "@/components/patterns/primitives/Card";
import { Badge } from "@/components/patterns/primitives/Badge";
import { HStack, VStack } from "@/components/patterns/primitives/Stack";
import { Icon } from "@/components/patterns/primitives/Icon";
import { Text } from "@/components/patterns/primitives/Text";
import type { CourseCard as CourseCardData } from "@/data/mocks/courses";

export type CourseCardProps = {
  course: CourseCardData;
};

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push("/admin-preview/course-settings")}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          router.push("/admin-preview/course-settings");
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <Card padding={4}>
        <VStack gap={3}>
          <HStack gap={2} align="center">
            <Icon icon={BookOpen} size="sm" color="secondary" />
            <Text weight="semibold" display="block" style={{ flex: 1 }}>
              {course.name}
            </Text>
            <Text color="secondary" size="sm">
              {course.code}
            </Text>
          </HStack>
          <Text color="secondary">{course.description}</Text>
          <HStack gap={2}>
            <Badge label={course.format} />
            <Badge label={course.price} />
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}
