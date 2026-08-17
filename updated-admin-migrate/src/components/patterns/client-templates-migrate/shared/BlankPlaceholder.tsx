"use client";

import type { ReactNode } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { Text } from "@/components/patterns/primitives/Text";

export type BlankPlaceholderProps = {
  title: string;
  icon?: ReactNode;
};

/** Empty canvas for admin-preview nav items that don't have a real page yet. */
export function BlankPlaceholder({ title, icon }: BlankPlaceholderProps) {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={<CanvasHeader topbar={{ title, icon }} />}
      >
        <div style={{ padding: 24 }}>
          <Text color="secondary">Nothing here yet.</Text>
        </div>
      </FoundationLayout>
    </div>
  );
}
