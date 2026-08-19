"use client";

import type { CSSProperties } from "react";
import { useIsNewAdminMigrate } from "@/components/admin-migrate/patterns/client-templates/shared";
import { locationNameOptions } from "./locationData";

export type LocationSelectProps = {
  value: string;
  onChange: (next: string) => void;
  options?: string[];
  style?: CSSProperties;
  "aria-label"?: string;
};

/** Locations catalog plus “No location”. Stores "—" when none is selected. */
export function LocationSelect({
  value,
  onChange,
  options,
  style,
  "aria-label": ariaLabel = "Location",
}: LocationSelectProps) {
  const live = useIsNewAdminMigrate();
  const names = options ?? (live ? [] : locationNameOptions());
  const current = value === "—" || !value ? "" : value;
  const extra = current && !names.includes(current) ? current : null;

  return (
    <select
      style={style}
      value={current}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value || "—")}
    >
      <option value="">No location</option>
      {names.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
      {extra ? <option value={extra}>{extra}</option> : null}
    </select>
  );
}
