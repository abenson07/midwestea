"use client";

import { FileText } from "lucide-react";
import { ContentListRow } from "./ContentListRow";
import type { Story } from "./types";

export type StoryCardProps = {
  story: Story;
  onClick: () => void;
};

function excerpt(html: string): string {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return "No content yet";
  const firstSentence = text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
  return firstSentence.length > 100 ? `${firstSentence.slice(0, 100)}…` : firstSentence;
}

export function StoryCard({ story, onClick }: StoryCardProps) {
  return (
    <ContentListRow
      icon={
        story.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- demo-only external asset from the live marketing site
          <img
            src={story.imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
          />
        ) : (
          <FileText size={16} strokeWidth={1.75} />
        )
      }
      title={story.title || "Untitled story"}
      subtitle={story.description || excerpt(story.body)}
      onClick={onClick}
    />
  );
}
