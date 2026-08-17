"use client";

import { Suspense, useState } from "react";
import { useShirtPreorderItems } from "@/hooks/useShirtPreorderItems";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { ViewTab } from "@/components/patterns/foundation/ViewTab";
import { ViewTabs } from "@/components/patterns/foundation/ViewTabs";
import { Text } from "@/components/patterns/primitives/Text";
import { ShirtSizeBarChart } from "./ShirtSizeBarChart";
import { OrdersTable } from "./OrdersTable";
import { PeopleTable } from "./PeopleTable";

type ShirtPreordersView = "orders" | "people";

const VIEW_TABS: { key: ShirtPreordersView; label: string }[] = [
  { key: "orders", label: "Orders" },
  { key: "people", label: "By Person" },
];

function ShirtPreordersDemoInner() {
  const [view, setView] = useState<ShirtPreordersView>("orders");
  const { items, personOrders, sizeCounts, loading, error } = useShirtPreorderItems();

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={
          <CanvasHeader
            topbar={{ title: "Shirt Preorders" }}
            controls={
              <ViewTabs aria-label="Shirt preorder views">
                {VIEW_TABS.map((tab) => (
                  <ViewTab
                    key={tab.key}
                    label={tab.label}
                    selected={view === tab.key}
                    onClick={() => setView(tab.key)}
                  />
                ))}
              </ViewTabs>
            }
          />
        }
      >
        {error ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Couldn&apos;t load shirt preorders: {error}</Text>
          </div>
        ) : loading ? (
          <div style={{ padding: 24 }}>
            <Text color="secondary">Loading…</Text>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "16px 8px" }}>
            <ShirtSizeBarChart sizeCounts={sizeCounts} />
            {view === "orders" ? <OrdersTable data={items} /> : <PeopleTable data={personOrders} />}
          </div>
        )}
      </FoundationLayout>
    </div>
  );
}

export function ShirtPreordersDemo() {
  return (
    <Suspense fallback={null}>
      <ShirtPreordersDemoInner />
    </Suspense>
  );
}
