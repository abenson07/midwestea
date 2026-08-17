"use client";

import { Megaphone } from "lucide-react";
import { ContentListRow } from "./ContentListRow";
import type { Banner } from "./types";

export type BannerCardProps = {
  banner: Banner;
  onClick: () => void;
};

export function BannerCard({ banner, onClick }: BannerCardProps) {
  return (
    <ContentListRow
      icon={<Megaphone size={16} strokeWidth={1.75} />}
      title={banner.title || "Untitled banner"}
      subtitle={banner.ctaText || "No CTA text"}
      onClick={onClick}
    />
  );
}
