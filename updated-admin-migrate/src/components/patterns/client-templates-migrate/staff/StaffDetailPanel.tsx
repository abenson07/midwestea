"use client";

import { useState, type CSSProperties } from "react";
import { X } from "lucide-react";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import { Button } from "@/components/patterns/primitives/Button";
import { cardSurfaceStyle } from "@/components/patterns/primitives/Card";
import { IconButton } from "@/components/patterns/shared/IconButton";
import { DetailActionBar, DetailToggleRow } from "@/components/patterns/foundation/detail";
import { hasAdmin, hasTrainer, type StaffRole, type StaffRow } from "./types";

export type StaffDetailPanelProps = {
  person: StaffRow;
  onSave: (next: StaffRow) => void;
  onClose: () => void;
};

type StaffDraft = {
  name: string;
  email: string;
  isTrainer: boolean;
  isAdmin: boolean;
};

const sectionStyle: CSSProperties = {
  ...cardSurfaceStyle,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  padding: 14,
};

function draftFromPerson(person: StaffRow): StaffDraft {
  return {
    name: person.name,
    email: person.email,
    isTrainer: hasTrainer(person),
    isAdmin: hasAdmin(person),
  };
}

function draftsEqual(a: StaffDraft, b: StaffDraft): boolean {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.isTrainer === b.isTrainer &&
    a.isAdmin === b.isAdmin
  );
}

function rolesFromDraft(draft: StaffDraft): StaffRole[] {
  const roles: StaffRole[] = [];
  if (draft.isTrainer) roles.push("trainer");
  if (draft.isAdmin) roles.push("admin");
  return roles;
}

export function StaffDetailPanel({ person, onSave, onClose }: StaffDetailPanelProps) {
  const baseline = draftFromPerson(person);
  const [draft, setDraft] = useState<StaffDraft>(baseline);
  const dirty = !draftsEqual(draft, baseline);
  const hasRole = draft.isTrainer || draft.isAdmin;

  function patch(next: Partial<StaffDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  function discard() {
    setDraft(draftFromPerson(person));
  }

  function save() {
    const roles = rolesFromDraft(draft);
    if (!roles.length) return;
    const next: StaffRow = {
      ...person,
      name: draft.name.trim() || person.name,
      email: draft.email.trim() || person.email,
      roles,
    };
    onSave(next);
    setDraft(draftFromPerson(next));
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
        <Text weight="semibold">Staff Details</Text>
        <IconButton
          label="Close staff"
          variant="ghost"
          size="sm"
          icon={<X size={14} strokeWidth={1.75} />}
          onClick={onClose}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <TextInput label="Name" value={draft.name} onChange={(name) => patch({ name })} />
        <TextInput label="Email" value={draft.email} onChange={(email) => patch({ email })} />
        <DetailToggleRow
          label="Trainer"
          value={draft.isTrainer}
          onChange={(isTrainer) => patch({ isTrainer })}
          badge={
            <Text size="sm" color="secondary">
              {draft.isTrainer ? "On" : "Off"}
            </Text>
          }
        />
        <DetailToggleRow
          label="Admin"
          value={draft.isAdmin}
          onChange={(isAdmin) => patch({ isAdmin })}
          badge={
            <Text size="sm" color="secondary">
              {draft.isAdmin ? "On" : "Off"}
            </Text>
          }
        />
      </div>
      <DetailActionBar>
        <Button label="Save" variant="primary" disabled={!dirty || !hasRole} onClick={save} />
        <Button label="Discard Changes" variant="secondary" disabled={!dirty} onClick={discard} />
      </DetailActionBar>
    </section>
  );
}
