"use client";

import { Navigation2 } from "lucide-react";
import { MixedContentPage } from "./MixedContentPage";
import {
  MixedContentHeader,
  defaultInitiativeProperties,
} from "./MixedContentHeader";
import { DescriptionSection } from "./DescriptionSection";
import { NestedProjectsTable } from "./NestedProjectsTable";

export type MixedContentViewProps = {
  /** Group the nested Projects table. @default true */
  grouped?: boolean;
};

/**
 * Initiative-style mixed content: header + description + nested projects table.
 */
export function MixedContentView({ grouped = true }: MixedContentViewProps) {
  return (
    <MixedContentPage>
      <MixedContentHeader
        title="Midwest EA"
        icon={<Navigation2 size={14} strokeWidth={2} />}
        summaryPlaceholder="Add a short summary..."
        properties={defaultInitiativeProperties}
        resources={[
          {
            id: "doc-1",
            label: "MidwestEA Phase 3 Investigations and ...",
          },
        ]}
        ctaLabel="Write first initiative update"
      />
      <DescriptionSection />
      <NestedProjectsTable grouped={grouped} />
    </MixedContentPage>
  );
}
