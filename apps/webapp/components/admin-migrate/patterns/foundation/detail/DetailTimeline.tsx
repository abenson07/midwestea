"use client";

import { MapPin } from "lucide-react";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";

export type DetailTimelineStep = {
  label: string;
  meta?: string;
  /** Renders a location-pin marker instead of a dot — the current destination. */
  isDestination?: boolean;
  /** Marker fill/stroke. Defaults to the theme accent. */
  markerColor?: string;
};

export type DetailTimelineProps = {
  steps: DetailTimelineStep[];
};

/**
 * Vertical progression visualization — dot + connecting hairline per step,
 * with the terminal "destination" step marked by a pin instead of a dot.
 * Modeled on Mercury's transfer/invoice activity timeline.
 */
export function DetailTimeline({ steps }: DetailTimelineProps) {
  return (
    <div>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const markerColor = step.markerColor ?? "var(--linear-color-accent)";
        return (
          <div key={`${step.label}-${index}`} style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: 16,
                flexShrink: 0,
              }}
            >
              {step.isDestination ? (
                <MapPin
                  size={14}
                  strokeWidth={1.75}
                  style={{ color: markerColor, flexShrink: 0 }}
                />
              ) : (
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: markerColor,
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                />
              )}
              {!isLast ? (
                <span
                  style={{
                    width: 1,
                    flex: 1,
                    minHeight: 8,
                    background: "var(--linear-color-hairline)",
                    marginTop: 2,
                  }}
                />
              ) : null}
            </div>
            <div style={{ minWidth: 0, paddingBottom: isLast ? 0 : 14 }}>
              <Text size="sm" weight="medium" display="block">
                {step.label}
              </Text>
              {step.meta ? (
                <Text size="sm" color="secondary" display="block">
                  {step.meta}
                </Text>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
