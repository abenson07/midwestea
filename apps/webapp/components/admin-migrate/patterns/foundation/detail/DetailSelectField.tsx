"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Dropdown } from "@/components/patterns/shared/dropdown/Dropdown";
import { DropdownItem } from "@/components/patterns/shared/dropdown/DropdownItem";

export type DetailSelectOption = {
  value: string;
  label: string;
};

export type DetailSelectFieldProps = {
  label: string;
  value: string | null;
  options: DetailSelectOption[];
  onCommit: (next: string) => void | Promise<void>;
  placeholder?: string;
};

/**
 * Editable fixed-option row — label above, bordered trigger box below that
 * opens a `Dropdown` of `DropdownItem`s. Selecting an option commits
 * immediately and closes, matching a native `<select>`.
 */
export function DetailSelectField({
  label,
  value,
  options,
  onCommit,
  placeholder = "Select…",
}: DetailSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Case-insensitive match — stored values aren't consistently cased
  // (e.g. membership tier/status columns mix "Household" and "household").
  const current = options.find(
    (option) => option.value.toLowerCase() === (value ?? "").toLowerCase()
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>{label}</span>
      {/* `display: grid` blockifies the Popover's inline-flex root so it
          stretches to fill this row instead of shrink-wrapping its trigger. */}
      <div style={{ display: "grid" }}>
        <Dropdown
          label={label}
          open={isOpen}
          onOpenChange={setIsOpen}
          width="100%"
          trigger={
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              style={{
                all: "unset",
                boxSizing: "border-box",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                width: "100%",
                height: 32,
                paddingInline: 8,
                borderRadius: 6,
                border: "var(--linear-border-width) solid var(--linear-color-hairline)",
                background: "var(--linear-color-canvas)",
                color: current ? "var(--linear-color-ink)" : "var(--linear-color-ink-subtle)",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              <span
                style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {current?.label ?? placeholder}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.75}
                style={{ flexShrink: 0, color: "var(--linear-color-ink-subtle)" }}
              />
            </button>
          }
        >
          {options.map((option) => {
            const isSelected = option.value.toLowerCase() === (value ?? "").toLowerCase();
            return (
              <DropdownItem
                key={option.value}
                label={option.label}
                selected={isSelected}
                icon={isSelected ? <Check size={16} strokeWidth={1.75} /> : undefined}
                onSelect={() => {
                  setIsOpen(false);
                  if (!isSelected) void onCommit(option.value);
                }}
              />
            );
          })}
        </Dropdown>
      </div>
    </div>
  );
}
