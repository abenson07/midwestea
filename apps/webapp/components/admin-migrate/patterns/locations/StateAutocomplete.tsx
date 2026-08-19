"use client";

import { useEffect, useMemo, useState } from "react";
import { Text } from "@/components/patterns/primitives/Text";
import { US_STATES, usStateLabel } from "./usStates";

export type StateAutocompleteProps = {
  value: string;
  onChange: (next: string) => void;
};

export function StateAutocomplete({ value, onChange }: StateAutocompleteProps) {
  const [query, setQuery] = useState(usStateLabel(value) || value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(usStateLabel(value) || "");
  }, [value]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return US_STATES;
    return US_STATES.filter(
      (state) =>
        state.label.toLowerCase().includes(q) || state.value.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
      <span style={{ fontSize: 12, color: "var(--linear-color-ink-subtle)" }}>State</span>
      <input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-label="State"
        value={query}
        placeholder="Search states…"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          setOpen(true);
          if (!next.trim()) onChange("");
        }}
        onBlur={() => {
          setOpen(false);
          setQuery(usStateLabel(value) || "");
        }}
        style={{
          boxSizing: "border-box",
          width: "100%",
          height: 32,
          paddingInline: 8,
          borderRadius: 6,
          border: "var(--linear-border-width) solid var(--linear-color-hairline)",
          background: "var(--linear-color-canvas)",
          color: "var(--linear-color-ink)",
          fontSize: 13,
          fontFamily: "inherit",
        }}
      />
      {open ? (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: 220,
            overflow: "auto",
            boxSizing: "border-box",
            padding: 4,
            borderRadius: 8,
            background: "var(--linear-color-canvas)",
            border: "var(--linear-border-width) solid var(--linear-color-canvas-border)",
            boxShadow: "var(--linear-shadow-canvas)",
          }}
        >
          {matches.length ? (
            matches.map((state) => {
              const selected = state.value === value;
              return (
                <button
                  key={state.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(state.value);
                    setQuery(state.label);
                    setOpen(false);
                  }}
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
                    paddingInline: 10,
                    borderRadius: 6,
                    color: "var(--linear-color-ink)",
                    background: selected ? "var(--linear-color-sidebar-item-selected)" : "transparent",
                    fontSize: 13,
                    lineHeight: "20px",
                  }}
                >
                  <span>{state.label}</span>
                  <span style={{ color: "var(--linear-color-ink-subtle)" }}>{state.value}</span>
                </button>
              );
            })
          ) : (
            <div style={{ padding: "8px 10px" }}>
              <Text size="sm" color="secondary">
                No matching state
              </Text>
            </div>
          )}
        </div>
      ) : null}
    </label>
  );
}
