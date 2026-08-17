"use client";

import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ComingSoon } from "@/components/patterns/client-templates/shared";

export function CommsDemo() {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={<CanvasHeader topbar={{ title: "Comms" }} />}
      >
        <ComingSoon label="Comms" fullPage />
      </FoundationLayout>
    </div>
  );
}
