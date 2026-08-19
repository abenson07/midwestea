export type PrerequisiteInputType = "file" | "date" | "text" | "checkbox";

export type PrerequisiteExpiration = "never" | "fixed_date" | "duration_from_issue";

export type PrerequisiteRow = {
  id: string;
  name: string;
  description: string;
  inputType: PrerequisiteInputType;
  requiredByDefault: boolean;
  expiration: PrerequisiteExpiration;
  /** Set when expiration is `duration_from_issue`. */
  validMonths: number | null;
  /** YYYY-MM-DD */
  createdOn: string;
  archived: boolean;
};

export const INPUT_TYPE_OPTIONS: { value: PrerequisiteInputType; label: string }[] = [
  { value: "file", label: "File upload" },
  { value: "date", label: "Date" },
  { value: "text", label: "Text" },
  { value: "checkbox", label: "Checkbox" },
];

export const EXPIRATION_OPTIONS: { value: PrerequisiteExpiration; label: string }[] = [
  { value: "never", label: "Never expires" },
  { value: "fixed_date", label: "Expiration date provided by student" },
  { value: "duration_from_issue", label: "Expires a set number of months after the issue date" },
];

export function inputTypeLabel(type: PrerequisiteInputType): string {
  return INPUT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function expirationLabel(row: Pick<PrerequisiteRow, "expiration" | "validMonths">): string {
  if (row.expiration === "fixed_date") return "Student-provided date";
  if (row.expiration === "duration_from_issue") {
    const months = row.validMonths ?? 0;
    return `${months} month${months === 1 ? "" : "s"}`;
  }
  return "Never";
}

export type PrerequisiteDraft = {
  name: string;
  description: string;
  inputType: PrerequisiteInputType;
  requiredByDefault: boolean;
  expiration: PrerequisiteExpiration;
  validMonths: string;
};

export function emptyPrerequisiteDraft(): PrerequisiteDraft {
  return {
    name: "",
    description: "",
    inputType: "file",
    requiredByDefault: true,
    expiration: "never",
    validMonths: "12",
  };
}

export function draftFromPrerequisite(row: PrerequisiteRow): PrerequisiteDraft {
  return {
    name: row.name,
    description: row.description,
    inputType: row.inputType,
    requiredByDefault: row.requiredByDefault,
    expiration: row.expiration,
    validMonths: String(row.validMonths ?? 12),
  };
}
