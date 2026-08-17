"use client";

import { HelpCircle } from "lucide-react";
import { ContentListRow } from "./ContentListRow";
import type { Faq } from "./types";

export type FaqCardProps = {
  faq: Faq;
  onClick: () => void;
};

export function FaqCard({ faq, onClick }: FaqCardProps) {
  return (
    <ContentListRow
      icon={<HelpCircle size={16} strokeWidth={1.75} />}
      title={faq.question || "Untitled question"}
      subtitle={faq.answer || "No answer yet"}
      onClick={onClick}
    />
  );
}
