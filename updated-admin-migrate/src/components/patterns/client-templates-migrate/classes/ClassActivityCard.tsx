"use client";

import type { ReactNode } from "react";
import {
  FileCheck,
  Globe,
  Plus,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { ClassSidebarSection } from "./ClassSidebarSection";
import type { ClassActivityItem, ClassActivityKind } from "./classMocks";

export type ClassActivityCardProps = {
  items: ClassActivityItem[];
};

const ICONS: Record<ClassActivityKind, ReactNode> = {
  enroll: <UserPlus size={14} strokeWidth={1.75} />,
  publish: <Globe size={14} strokeWidth={1.75} />,
  create: <Plus size={14} strokeWidth={1.75} />,
  prereq: <FileCheck size={14} strokeWidth={1.75} />,
  update: <RefreshCw size={14} strokeWidth={1.75} />,
};

/** Chronological class activity — Linear project Activity list. */
export function ClassActivityCard({ items }: ClassActivityCardProps) {
  return (
    <ClassSidebarSection title="Activity">
      {items.length ? (
        <ul
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {items.map((item) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  color: "var(--linear-color-ink-subtle)",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {ICONS[item.kind]}
              </span>
              <Text size="sm" color="secondary" style={{ lineHeight: "18px" }}>
                {item.text}
                <span style={{ color: "var(--linear-color-ink-tertiary)" }}>
                  {" "}
                  · {item.date}
                </span>
              </Text>
            </li>
          ))}
        </ul>
      ) : (
        <Text size="sm" color="secondary">
          No activity yet.
        </Text>
      )}
    </ClassSidebarSection>
  );
}
