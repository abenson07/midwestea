"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/patterns/shared/Modal";
import { Button } from "@/components/patterns/primitives/Button";
import { Checkbox } from "@/components/patterns/primitives/Checkbox";
import { Text } from "@/components/patterns/primitives/Text";
import { TextInput } from "@/components/patterns/primitives/TextInput";
import {
  EXPIRATION_OPTIONS,
  INPUT_TYPE_OPTIONS,
  draftFromPrerequisite,
  emptyPrerequisiteDraft,
  type PrerequisiteDraft,
  type PrerequisiteExpiration,
  type PrerequisiteInputType,
  type PrerequisiteRow,
} from "./types";

const fieldLabelStyle = { fontSize: 12, color: "var(--linear-color-ink-subtle)" } as const;
const selectStyle = {
  boxSizing: "border-box" as const,
  width: "100%",
  height: 32,
  paddingInline: 8,
  borderRadius: 6,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 13,
  fontFamily: "inherit",
};

export type PrerequisiteFormValues = Omit<PrerequisiteRow, "id" | "createdOn" | "archived">;

export type PrerequisiteFormModalProps = {
  isOpen: boolean;
  editing?: PrerequisiteRow | null;
  onClose: () => void;
  onSubmit: (values: PrerequisiteFormValues) => void;
};

function parseDraft(draft: PrerequisiteDraft): PrerequisiteFormValues | string {
  const name = draft.name.trim();
  if (!name) return "Name is required.";

  let validMonths: number | null = null;
  if (draft.expiration === "duration_from_issue") {
    const parsed = Number.parseInt(draft.validMonths.trim(), 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return "Valid for (months) must be at least 1.";
    }
    validMonths = parsed;
  }

  return {
    name,
    description: draft.description.trim(),
    inputType: draft.inputType,
    requiredByDefault: draft.requiredByDefault,
    expiration: draft.expiration,
    validMonths,
  };
}

export function PrerequisiteFormModal({
  isOpen,
  editing = null,
  onClose,
  onSubmit,
}: PrerequisiteFormModalProps) {
  const [draft, setDraft] = useState<PrerequisiteDraft>(emptyPrerequisiteDraft);

  useEffect(() => {
    if (!isOpen) return;
    setDraft(editing ? draftFromPrerequisite(editing) : emptyPrerequisiteDraft());
  }, [isOpen, editing]);

  function patch(next: Partial<PrerequisiteDraft>) {
    setDraft((prev) => ({ ...prev, ...next }));
  }

  function handleSubmit() {
    const parsed = parseDraft(draft);
    if (typeof parsed === "string") {
      toast.error(parsed);
      return;
    }
    onSubmit(parsed);
    onClose();
  }

  const title = editing ? "Edit prerequisite" : "Add prerequisite";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={520}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, width: "100%" }}>
          <Button label="Cancel" variant="ghost" onClick={onClose} />
          <Button label={editing ? "Save" : "Add"} variant="primary" onClick={handleSubmit} />
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <TextInput label="Name" value={draft.name} onChange={(name) => patch({ name })} />

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Input type</span>
          <select
            aria-label="Input type"
            style={selectStyle}
            value={draft.inputType}
            onChange={(event) => patch({ inputType: event.target.value as PrerequisiteInputType })}
          >
            {INPUT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <TextInput
          label="Description"
          value={draft.description}
          onChange={(description) => patch({ description })}
          multiline
          rows={3}
        />
        <Text size="sm" color="secondary" style={{ marginTop: -8 }}>
          Shown to students when they complete this prerequisite.
        </Text>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Checkbox
            label="Required by default"
            value={draft.requiredByDefault}
            onChange={(requiredByDefault) => patch({ requiredByDefault })}
          />
          <Text size="sm" color="secondary">
            Templates can override this per assignment.
          </Text>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={fieldLabelStyle}>Expiration</span>
          <select
            aria-label="Expiration"
            style={selectStyle}
            value={draft.expiration}
            onChange={(event) =>
              patch({ expiration: event.target.value as PrerequisiteExpiration })
            }
          >
            {EXPIRATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {draft.expiration === "duration_from_issue" ? (
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={fieldLabelStyle}>Valid for (months)</span>
            <input
              type="number"
              min={1}
              aria-label="Valid for (months)"
              value={draft.validMonths}
              onChange={(event) => patch({ validMonths: event.target.value })}
              style={selectStyle}
            />
          </label>
        ) : null}
      </div>
    </Modal>
  );
}
