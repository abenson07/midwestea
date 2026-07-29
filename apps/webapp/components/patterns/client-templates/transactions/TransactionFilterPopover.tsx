"use client";

import { useEffect, useRef } from "react";
import { DropdownItem, DropdownSeparator } from "@/components/patterns/shared/dropdown";

export type TransactionFilterValue = {
  classCode: string | "all";
  status: "all" | "past_due" | "due_soon";
};

export type TransactionFilterOption = {
  code: string;
  label: string;
};

export type TransactionFilterPopoverProps = {
  classes: TransactionFilterOption[];
  value: TransactionFilterValue;
  onChange: (next: TransactionFilterValue) => void;
  onClose: () => void;
};

const STATUS_OPTIONS: { value: TransactionFilterValue["status"]; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "past_due", label: "Past Due" },
  { value: "due_soon", label: "Due Soon" },
];

/**
 * Class + status filter panel for the Overview's Past Due/Due Soon table.
 * Positioned by the caller (absolute, anchored near the table's Filter icon)
 * rather than using the Popover primitive's own trigger-wrapping, since it's
 * toggled via NestedGroupedTable's `onFilterClick` rather than a local trigger.
 */
export function TransactionFilterPopover({
  classes,
  value,
  onChange,
  onClose,
}: TransactionFilterPopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [onClose]);

  return (
    <div
      ref={containerRef}
      role="menu"
      aria-label="Filter transactions"
      style={{
        boxSizing: "border-box",
        width: 200,
        padding: 4,
        borderRadius: 8,
        background: "var(--linear-color-canvas)",
        border: "var(--linear-border-width) solid var(--linear-color-canvas-border)",
        boxShadow: "var(--linear-shadow-canvas)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <DropdownItem
        label="All classes"
        selected={value.classCode === "all"}
        onSelect={() => onChange({ ...value, classCode: "all" })}
      />
      {classes.map((option) => (
        <DropdownItem
          key={option.code}
          label={option.label}
          selected={value.classCode === option.code}
          onSelect={() => onChange({ ...value, classCode: option.code })}
        />
      ))}
      <DropdownSeparator />
      {STATUS_OPTIONS.map((option) => (
        <DropdownItem
          key={option.value}
          label={option.label}
          selected={value.status === option.value}
          onSelect={() => onChange({ ...value, status: option.value })}
        />
      ))}
    </div>
  );
}
