"use client";

import { Mail, MapPin } from "lucide-react";
import { SideContentSection, SideContentField } from "@/components/patterns/foundation/side-content";
import { Text } from "@/components/patterns/primitives/Text";
import type { LeafletDelivererRow } from "@/data/mocks/leaflets";

export type DelivererPersonPanelProps = {
  deliverer: LeafletDelivererRow;
};

/** Slim person sidebar for leaflet deliverers (People contact pattern). */
export function DelivererPersonPanel({ deliverer }: DelivererPersonPanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "8px 4px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Text weight="semibold" size="md">
          {deliverer.name}
        </Text>
        <Text size="sm" color="secondary">
          Leaflet deliverer · {deliverer.status}
        </Text>
      </div>
      <SideContentSection title="Contact">
        <SideContentField
          icon={<Mail size={16} strokeWidth={1.75} />}
          label={deliverer.email || "—"}
        />
        <SideContentField
          icon={<MapPin size={16} strokeWidth={1.75} />}
          label={deliverer.address || "—"}
        />
      </SideContentSection>
      <SideContentSection title="Routes on this leaflet">
        {deliverer.routes.map((route) => (
          <SideContentField
            key={route.id}
            label={`${route.name} · ${route.leafletCount} leaflets`}
          />
        ))}
      </SideContentSection>
    </div>
  );
}
