"use client";

import { useEffect, useState } from "react";
import { ListFilter, Search } from "lucide-react";
import { Dropdown, DropdownItem, DropdownSeparator, DropdownSubmenu } from "@/components/patterns/shared/dropdown";
import { IconButton } from "@/components/patterns/shared/IconButton";

export type ListToolbarFilterOption = {
  value: string;
  label: string;
};

export type ListToolbarFilterGroup = {
  label: string;
  options: ListToolbarFilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  /** Render as a `{label} >` flyout instead of a flat list. */
  submenu?: boolean;
};

export type ListToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterGroups?: ListToolbarFilterGroup[];
};

function toggleValue(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((v) => v !== value)
    : [...selected, value];
}

/**
 * Linear-style search input + filter-icon dropdown, meant to sit in
 * `ViewTabs`'s `endContent` slot (same row as the view tabs).
 */
export function ListToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filterGroups = [],
}: ListToolbarProps) {
  const [draft, setDraft] = useState(searchValue);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setDraft(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const t = setTimeout(() => onSearchChange(draft.trim()), 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const activeFilterCount = filterGroups.reduce((sum, g) => sum + g.selected.length, 0);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            display: "inline-flex",
            color: "var(--linear-color-ink-subtle)",
            pointerEvents: "none",
          }}
        >
          <Search size={14} strokeWidth={1.75} />
        </span>
        <input
          type="text"
          value={draft}
          placeholder={searchPlaceholder}
          onChange={(event) => setDraft(event.target.value)}
          style={{
            boxSizing: "border-box",
            width: 200,
            height: 28,
            paddingInline: "28px 8px",
            borderRadius: 6,
            border: "var(--linear-border-width) solid var(--linear-color-hairline)",
            background: "var(--linear-color-canvas)",
            color: "var(--linear-color-ink)",
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />
      </span>

      {filterGroups.length ? (
        <Dropdown
          label="Filter"
          placement="below"
          alignment="end"
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          width={filterGroups.some((group) => group.submenu) ? 160 : 240}
          trigger={
            <IconButton
              label="Filter"
              variant="ghost"
              isActive={isFilterOpen || activeFilterCount > 0}
              icon={<ListFilter size={14} strokeWidth={1.75} />}
            />
          }
        >
          {filterGroups.map((group, groupIndex) => {
            const items = group.options.map((option) => (
              <DropdownItem
                key={option.value}
                label={option.label}
                selected={group.selected.includes(option.value)}
                onSelect={() => group.onChange(toggleValue(group.selected, option.value))}
              />
            ));
            return (
              <div key={group.label}>
                {groupIndex > 0 ? <DropdownSeparator /> : null}
                {group.submenu ? <DropdownSubmenu label={group.label}>{items}</DropdownSubmenu> : items}
              </div>
            );
          })}
        </Dropdown>
      ) : null}
    </div>
  );
}
