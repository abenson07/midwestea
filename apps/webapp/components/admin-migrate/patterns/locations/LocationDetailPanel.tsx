"use client";

import { useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import { Text } from "@/components/admin-migrate/patterns/primitives/Text";
import { TextInput } from "@/components/admin-migrate/patterns/primitives/TextInput";
import { Button } from "@/components/admin-migrate/patterns/primitives/Button";
import { cardSurfaceStyle } from "@/components/admin-migrate/patterns/primitives/Card";
import { IconButton } from "@/components/admin-migrate/patterns/shared/IconButton";
import { DetailActionBar } from "@/components/admin-migrate/patterns/foundation/detail";
import { StateAutocomplete } from "./StateAutocomplete";
import { normalizeMapsUrl } from "./locationData";
import type { LocationRow } from "./types";

export type LocationDetailPanelProps = {
  location: LocationRow;
  onSave: (next: LocationRow) => void;
  onClose: () => void;
};

type LocationDraft = {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  mapsUrl: string;
};

const sectionStyle: CSSProperties = {
  ...cardSurfaceStyle,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 14,
};

function draftFromLocation(location: LocationRow): LocationDraft {
  return {
    name: location.name,
    street: location.street,
    city: location.city,
    state: location.state,
    zip: location.zip,
    mapsUrl: location.mapsUrl,
  };
}

function draftsEqual(a: LocationDraft, b: LocationDraft): boolean {
  return (
    a.name === b.name &&
    a.street === b.street &&
    a.city === b.city &&
    a.state === b.state &&
    a.zip === b.zip &&
    a.mapsUrl === b.mapsUrl
  );
}

export function LocationDetailPanel({ location, onSave, onClose }: LocationDetailPanelProps) {
  const baseline = draftFromLocation(location);
  const [draft, setDraft] = useState<LocationDraft>(baseline);
  const dirty = !draftsEqual(draft, baseline);

  function patch(next: Partial<LocationDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  function discard() {
    setDraft(draftFromLocation(location));
  }

  function save() {
    const next: LocationRow = {
      ...location,
      name: draft.name.trim() || location.name,
      street: draft.street.trim(),
      city: draft.city.trim(),
      state: draft.state,
      zip: draft.zip.trim(),
      mapsUrl: normalizeMapsUrl(draft.mapsUrl),
    };
    onSave(next);
    setDraft(draftFromLocation(next));
  }

  return (
    <section style={sectionStyle}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          minHeight: 20,
        }}
      >
        <Text weight="semibold">Location Details</Text>
        <IconButton
          label="Close location"
          variant="ghost"
          size="sm"
          icon={<X size={14} strokeWidth={1.75} />}
          onClick={onClose}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <TextInput label="Location name" value={draft.name} onChange={(name) => patch({ name })} />
        <TextInput label="Street" value={draft.street} onChange={(street) => patch({ street })} />
        <TextInput label="City" value={draft.city} onChange={(city) => patch({ city })} />
        <StateAutocomplete value={draft.state} onChange={(state) => patch({ state })} />
        <TextInput label="Zip" value={draft.zip} onChange={(zip) => patch({ zip })} />
        <TextInput
          label="Google Maps URL"
          value={draft.mapsUrl}
          onChange={(mapsUrl) => patch({ mapsUrl })}
          autoComplete="off"
        />
      </div>
      <DetailActionBar>
        <Button label="Save" variant="primary" disabled={!dirty} onClick={save} />
        <Button label="Discard Changes" variant="secondary" disabled={!dirty} onClick={discard} />
      </DetailActionBar>
    </section>
  );
}
