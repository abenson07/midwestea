"use client";

import { Button } from "@/components/patterns/primitives/Button";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { User, Calendar, Tag } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { LeafletStoryRow } from "@/data/mocks/leaflets";

export type StoryDetailPanelProps = {
  story: LeafletStoryRow;
};

/** Story detail — shown in the outlined side panel when a story row is selected. */
export function StoryDetailPanel({ story }: StoryDetailPanelProps) {
  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="sm" color="secondary">
          {story.type}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>{story.title}</Text>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Story
          </Text>
        }
      >
        <SideContentField icon={<User size={16} strokeWidth={1.75} />} label={story.author} />
        <SideContentField icon={<Calendar size={16} strokeWidth={1.75} />} label={`${story.date}, ${story.time}`} />
        <SideContentField icon={<Tag size={16} strokeWidth={1.75} />} label={story.status} />
      </List>

      <Button label="Open story" variant="secondary" size="sm" width="100%" />
    </VStack>
  );
}
