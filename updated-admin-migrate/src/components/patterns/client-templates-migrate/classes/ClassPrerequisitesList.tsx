"use client";

import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Text } from "@/components/patterns/primitives/Text";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { ClassSidebarSection } from "./ClassSidebarSection";
import { ClassAddPrerequisiteModal } from "./ClassAddPrerequisiteModal";

export type ClassPrerequisitesListProps = {
  items: string[];
};

/** Required items as an activity-style list, with add from the header. */
export function ClassPrerequisitesList({ items: initialItems }: ClassPrerequisitesListProps) {
  const [items, setItems] = useState(initialItems);
  const [addOpen, setAddOpen] = useState(false);

  function handleAdd(name: string) {
    setItems((prev) => (prev.includes(name) ? prev : [...prev, name]));
    toast.success(`Added ${name} — demo mode, saved locally only`);
  }

  return (
    <>
      <ClassSidebarSection
        title="Prerequisites"
        action={
          <IconButton
            label="Add prerequisite"
            variant="ghost"
            size="sm"
            icon={<Plus size={14} strokeWidth={2} />}
            onClick={() => setAddOpen(true)}
          />
        }
      >
        {items.length ? (
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {items.map((item) => (
              <li
                key={item}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                }}
              >
                <CheckCircle2
                  size={14}
                  strokeWidth={1.75}
                  style={{
                    color: "var(--linear-color-ink-subtle)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <Text size="sm" color="secondary">
                  {item}
                </Text>
              </li>
            ))}
          </ul>
        ) : (
          <Text size="sm" color="secondary">
            No prerequisites yet.
          </Text>
        )}
      </ClassSidebarSection>
      <ClassAddPrerequisiteModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAdd}
      />
    </>
  );
}
