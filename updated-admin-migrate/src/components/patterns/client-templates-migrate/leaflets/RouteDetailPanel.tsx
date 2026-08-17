"use client";

import { Button } from "@/components/patterns/primitives/Button";
import { VStack } from "@/components/patterns/primitives/Stack";
import { List } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { MapPin, User } from "lucide-react";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import type { LeafletRouteRow } from "@/data/mocks/leaflets";

export type RouteDetailPanelProps = {
  route: LeafletRouteRow;
};

/** Route detail — shown in the outlined side panel when a route row is selected. */
export function RouteDetailPanel({ route }: RouteDetailPanelProps) {
  const isSkipped = route.status === "skipped";
  const isAssigned = route.status === "in-progress";

  return (
    <VStack gap={5}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Text size="sm" color="secondary">
          {isSkipped ? "Skipped route" : isAssigned ? "Assigned route" : "Open route"}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>{route.name}</Text>
      </div>

      <List
        density="compact"
        header={
          <Text type="label" color="secondary">
            Route
          </Text>
        }
      >
        <SideContentField icon={<MapPin size={16} strokeWidth={1.75} />} label={route.detail} />
        <SideContentField
          icon={<User size={16} strokeWidth={1.75} />}
          label={
            isSkipped
              ? "Needs a substitute deliverer"
              : isAssigned
                ? "Assigned"
                : "Unassigned"
          }
        />
      </List>

      <Button
        label={
          isSkipped ? "Find substitute" : isAssigned ? "Change deliverer" : "Assign deliverer"
        }
        variant="secondary"
        size="sm"
        width="100%"
      />
    </VStack>
  );
}
