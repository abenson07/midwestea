"use client";

import { useMemo } from "react";
import { useAllActionItems } from "hooks";
import { DraftsSection } from "@/components/patterns/client-templates/drafts/DraftsSection";
import { Text } from "@/components/patterns/primitives/Text";
import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { sampleActionItems } from "@/data/mocks/action-items";
import { ActionItemCard } from "./ActionItemCard";
import { toActionItem } from "./adapters";

/** Action Items body — stacked list of open task cards. */
export function ActionItemsPage() {
  const { enabled: demo } = useDemoModeOptional();
  const { items, loading, error } = useAllActionItems();

  const openItems = useMemo(() => {
    if (demo) {
      return sampleActionItems.filter((item) => item.status === "open" || item.status === "canceled");
    }
    return items.filter((item) => item.status === "open" || item.status === "canceled").map(toActionItem);
  }, [demo, items]);

  if (!demo && error) {
    return <Text color="secondary">Couldn&apos;t load action items: {error}</Text>;
  }
  if (!demo && loading) {
    return <Text color="secondary">Loading…</Text>;
  }

  return (
    <DraftsSection title="Action Items" columns={1}>
      {openItems.map((item) => (
        <ActionItemCard key={item.id} item={item} />
      ))}
    </DraftsSection>
  );
}
