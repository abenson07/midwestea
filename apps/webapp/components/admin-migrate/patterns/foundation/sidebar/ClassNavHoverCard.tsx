"use client";

import type { ReactNode } from "react";
import { HoverCard } from "@/components/patterns/client-templates/shared";
import {
  openClassHoverDateLabel,
  openClassStudentLabel,
  type StagingOpenClass,
} from "@/lib/staging/openClasses";

export function ClassNavHoverCard({
  item,
  children,
}: {
  item: StagingOpenClass;
  children: ReactNode;
}) {
  const dateLabel = openClassHoverDateLabel(item);

  return (
    <HoverCard
      content={
        <>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              lineHeight: "18px",
              color: "var(--linear-color-ink)",
            }}
          >
            {item.label}
          </span>
          <span
            style={{
              fontSize: 12,
              lineHeight: "16px",
              color: "var(--linear-color-ink-subtle)",
            }}
          >
            {item.templateName}
          </span>
          {dateLabel ? (
            <span
              style={{
                fontSize: 12,
                lineHeight: "16px",
                color: "var(--linear-color-ink-subtle)",
              }}
            >
              {dateLabel}
            </span>
          ) : null}
          <span
            style={{
              fontSize: 12,
              lineHeight: "16px",
              color: "var(--linear-color-ink-subtle)",
            }}
          >
            {openClassStudentLabel(item.enrolledCount)}
          </span>
        </>
      }
    >
      {children}
    </HoverCard>
  );
}
