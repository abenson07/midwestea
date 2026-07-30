"use client";

import type { ReactNode } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { PayoutsPage } from "./PayoutsPage";

export type PayoutsDemoProps = {
  navigation?: ReactNode;
};

export function PayoutsDemo({ navigation }: PayoutsDemoProps = {}) {
  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={navigation ?? <LinearSidebar />}
        contentMaxWidth={1200}
        header={<CanvasHeader topbar={{ title: "Payouts" }} />}
      >
        <PayoutsPage />
      </FoundationLayout>
    </div>
  );
}
