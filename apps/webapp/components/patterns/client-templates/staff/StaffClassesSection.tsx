"use client";

import { useMemo, useState } from "react";
import { GraduationCap, Plus } from "lucide-react";
import { List, ListItem } from "@/components/patterns/primitives/List";
import { Text } from "@/components/patterns/primitives/Text";
import { Popover } from "@/components/patterns/primitives/Popover";
import { SideContentField } from "@/components/patterns/foundation/side-content";
import { STAFF_CLASS_OPTIONS, type StaffRow } from "@/data/mocks/staff";

export type StaffClassesSectionProps = {
  staff: StaffRow;
  onAddClass: (classCode: string) => void;
};

/** Trainer's assigned classes, plus a static picker to add more (local state only). */
export function StaffClassesSection({ staff, onAddClass }: StaffClassesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableOptions = useMemo(
    () => STAFF_CLASS_OPTIONS.filter((code) => !staff.classes.includes(code)),
    [staff.classes],
  );

  return (
    <List
      density="compact"
      header={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text type="label" color="secondary">
            Classes
          </Text>
          <Popover
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            alignment="end"
            width={160}
            content={
              <div
                style={{
                  boxSizing: "border-box",
                  background: "var(--linear-color-canvas)",
                  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                  borderRadius: "var(--linear-radius-md)",
                  boxShadow: "var(--linear-shadow-canvas)",
                  padding: 4,
                }}
              >
                {availableOptions.length > 0 ? (
                  availableOptions.map((code) => (
                    <ListItem
                      key={code}
                      label={code}
                      onClick={() => {
                        onAddClass(code);
                        setIsOpen(false);
                      }}
                    />
                  ))
                ) : (
                  <div style={{ padding: 8 }}>
                    <Text size="sm" color="secondary">
                      All classes assigned
                    </Text>
                  </div>
                )}
              </div>
            }
          >
            <button
              type="button"
              aria-label="Add class"
              style={{
                all: "unset",
                boxSizing: "border-box",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: 4,
                color: "var(--linear-color-ink-subtle)",
              }}
            >
              <Plus size={14} strokeWidth={2} />
            </button>
          </Popover>
        </div>
      }
    >
      {staff.classes.length === 0 ? (
        <div style={{ padding: "4px 4px" }}>
          <Text size="sm" color="secondary">
            No classes assigned
          </Text>
        </div>
      ) : (
        staff.classes.map((code) => (
          <SideContentField
            key={code}
            icon={<GraduationCap size={16} strokeWidth={1.75} />}
            label={code}
          />
        ))
      )}
    </List>
  );
}
