"use client";

import { useState, useEffect } from "react";
import type { PrerequisiteExpirationRule, PrerequisiteInputType, PrerequisiteType } from "@midwestea/types";
import {
  PREREQUISITE_EXPIRATION_RULE_LABELS,
  PREREQUISITE_EXPIRATION_RULES,
  PREREQUISITE_INPUT_TYPE_LABELS,
  PREREQUISITE_INPUT_TYPES,
} from "@midwestea/types";
import {
  archivePrerequisiteType,
  createPrerequisiteType,
  getPrerequisiteTypes,
  updatePrerequisiteType,
  type PrerequisiteTypeInput,
} from "@/lib/prerequisites";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

interface PrerequisiteFormState {
  name: string;
  input_type: PrerequisiteInputType;
  description: string;
  required_by_default: boolean;
  expiration_rule: PrerequisiteExpirationRule;
  expiration_duration_months: string;
}

const emptyFormState: PrerequisiteFormState = {
  name: "",
  input_type: "file_upload",
  description: "",
  required_by_default: true,
  expiration_rule: "none",
  expiration_duration_months: "",
};

function toFormState(type: PrerequisiteType): PrerequisiteFormState {
  return {
    name: type.name,
    input_type: type.input_type,
    description: type.description || "",
    required_by_default: type.required_by_default,
    expiration_rule: type.expiration_rule,
    expiration_duration_months:
      type.expiration_duration_months != null ? String(type.expiration_duration_months) : "",
  };
}

interface PrerequisiteTypeFormProps {
  formState: PrerequisiteFormState;
  onChange: (next: PrerequisiteFormState) => void;
  onSubmit: () => void;
  saving: boolean;
  submitLabel: string;
  submitLabelSaving: string;
  monthsError: string | null;
}

function PrerequisiteTypeForm({
  formState,
  onChange,
  onSubmit,
  saving,
  submitLabel,
  submitLabelSaving,
  monthsError,
}: PrerequisiteTypeFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">Name*</label>
        <input
          type="text"
          value={formState.name}
          onChange={(e) => onChange({ ...formState, name: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Input type</label>
        <select
          value={formState.input_type}
          onChange={(e) => onChange({ ...formState, input_type: e.target.value as PrerequisiteInputType })}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
        >
          {PREREQUISITE_INPUT_TYPES.map((inputType) => (
            <option key={inputType} value={inputType}>
              {PREREQUISITE_INPUT_TYPE_LABELS[inputType]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formState.description}
          onChange={(e) => onChange({ ...formState, description: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
        />
        <p className="mt-1 text-sm text-gray-500">Shown to students when they complete this prerequisite.</p>
      </div>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formState.required_by_default}
            onChange={(e) => onChange({ ...formState, required_by_default: e.target.checked })}
          />
          <span className="text-sm font-medium text-gray-700">Required by default</span>
        </label>
        <p className="mt-1 text-sm text-gray-500">Templates can override this per assignment.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Expiration</label>
        <select
          value={formState.expiration_rule}
          onChange={(e) => {
            const nextRule = e.target.value as PrerequisiteExpirationRule;
            onChange({
              ...formState,
              expiration_rule: nextRule,
              expiration_duration_months:
                nextRule === "duration_from_issue" ? formState.expiration_duration_months : "",
            });
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
        >
          {PREREQUISITE_EXPIRATION_RULES.map((rule) => (
            <option key={rule} value={rule}>
              {PREREQUISITE_EXPIRATION_RULE_LABELS[rule]}
            </option>
          ))}
        </select>
      </div>

      {formState.expiration_rule === "duration_from_issue" && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Valid for (months)</label>
          <input
            type="number"
            min="1"
            value={formState.expiration_duration_months}
            onChange={(e) => onChange({ ...formState, expiration_duration_months: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
          />
          {monthsError && <p className="mt-1 text-sm text-red-600">{monthsError}</p>}
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? submitLabelSaving : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function PrerequisitesPage() {
  const [prerequisiteTypes, setPrerequisiteTypes] = useState<PrerequisiteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Full create/edit form sidebar state
  const [isFormSidebarOpen, setIsFormSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<PrerequisiteFormState>(emptyFormState);
  const [saving, setSaving] = useState(false);
  const [monthsError, setMonthsError] = useState<string | null>(null);

  useEffect(() => {
    loadPrerequisiteTypes();
  }, []);

  const loadPrerequisiteTypes = async () => {
    setLoading(true);
    const { prerequisiteTypes: fetched, error: fetchError } = await getPrerequisiteTypes();
    if (fetchError) {
      setError(fetchError);
    } else if (fetched) {
      setPrerequisiteTypes(fetched);
    }
    setLoading(false);
  };

  const openCreateForm = () => {
    setEditingId(null);
    setFormState(emptyFormState);
    setMonthsError(null);
    setIsFormSidebarOpen(true);
  };

  const openEditForm = (type: PrerequisiteType) => {
    setEditingId(type.id);
    setFormState(toFormState(type));
    setMonthsError(null);
    setIsFormSidebarOpen(true);
  };

  const handleCloseFormSidebar = () => {
    setIsFormSidebarOpen(false);
    setEditingId(null);
    setMonthsError(null);
  };

  const handleFormSubmit = async () => {
    if (
      formState.expiration_rule === "duration_from_issue" &&
      (!formState.expiration_duration_months || parseInt(formState.expiration_duration_months, 10) < 1)
    ) {
      setMonthsError("Enter how many months this stays valid.");
      return;
    }
    setMonthsError(null);
    setSaving(true);

    const input: PrerequisiteTypeInput = {
      name: formState.name,
      input_type: formState.input_type,
      description: formState.description || null,
      required_by_default: formState.required_by_default,
      expiration_rule: formState.expiration_rule,
      expiration_duration_months:
        formState.expiration_rule === "duration_from_issue" && formState.expiration_duration_months
          ? parseInt(formState.expiration_duration_months, 10)
          : null,
    };

    const result = editingId
      ? await updatePrerequisiteType(editingId, input)
      : await createPrerequisiteType(input);

    if (result.success) {
      await loadPrerequisiteTypes();
      handleCloseFormSidebar();
    } else {
      alert(`Failed to save prerequisite type: ${result.error}`);
    }
    setSaving(false);
  };

  const handleArchive = async (item: PrerequisiteType) => {
    if (!window.confirm("Archive this prerequisite type? It stays on classes that already use it.")) {
      return;
    }
    const result = await archivePrerequisiteType(item.id);
    if (result.success) {
      await loadPrerequisiteTypes();
    } else {
      alert(`Failed to archive prerequisite type: ${result.error}`);
    }
  };

  const expirationLabel = (item: PrerequisiteType): string => {
    if (item.expiration_rule === "none") return "Never";
    if (item.expiration_rule === "fixed_date") return "Student-provided date";
    return `${item.expiration_duration_months} months`;
  };

  const columns = [
    { header: "Name", accessorKey: "name" as keyof PrerequisiteType, className: "font-medium" },
    {
      header: "Input type",
      cell: (item: PrerequisiteType) => PREREQUISITE_INPUT_TYPE_LABELS[item.input_type],
    },
    {
      header: "Required",
      cell: (item: PrerequisiteType) => (item.required_by_default ? "Yes" : "No"),
    },
    {
      header: "Expiration",
      cell: (item: PrerequisiteType) => expirationLabel(item),
    },
    {
      header: "Created",
      cell: (item: PrerequisiteType) =>
        item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
    },
    {
      header: "Actions",
      cell: (item: PrerequisiteType) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => openEditForm(item)}
            className="text-gray-700 hover:text-gray-900 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => handleArchive(item)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Archive
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prerequisites</h1>
          <p className="text-sm text-gray-500 mt-1">
            Reusable prerequisite types for programs, course templates, and classes.
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
        >
          Add prerequisite
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <DataTable
        data={prerequisiteTypes}
        columns={columns}
        isLoading={loading}
        emptyMessage="No prerequisite types yet."
      />

      <DetailSidebar
        isOpen={isFormSidebarOpen}
        onClose={handleCloseFormSidebar}
        title={editingId ? "Edit prerequisite" : "Add prerequisite"}
      >
        <PrerequisiteTypeForm
          formState={formState}
          onChange={setFormState}
          onSubmit={handleFormSubmit}
          saving={saving}
          submitLabel={editingId ? "Save" : "Create prerequisite"}
          submitLabelSaving={editingId ? "Saving..." : "Creating..."}
          monthsError={monthsError}
        />
      </DetailSidebar>
    </div>
  );
}
