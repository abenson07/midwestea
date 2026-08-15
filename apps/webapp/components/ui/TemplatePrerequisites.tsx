"use client";

import { useEffect, useState } from "react";
import type { PrerequisiteType, TemplatePrerequisiteWithType } from "@midwestea/types";
import { PREREQUISITE_INPUT_TYPE_LABELS } from "@midwestea/types";
import {
  addTemplatePrerequisite,
  getPrerequisiteTypes,
  getTemplatePrerequisites,
  removeTemplatePrerequisite,
  reorderTemplatePrerequisites,
  updateTemplatePrerequisite,
} from "@/lib/prerequisites";
import { PrerequisiteTypePicker } from "@/components/ui/PrerequisiteTypePicker";

interface TemplatePrerequisitesProps {
  courseUuid: string;
  /** 'program' | 'course' — only affects the helper copy. */
  templateKind: "program" | "course";
}

function expirationLabel(row: TemplatePrerequisiteWithType): string {
  const type = row.prerequisite_type;
  if (type.expiration_rule === "none") return "Never expires";
  if (type.expiration_rule === "fixed_date") return "Student-provided expiration";
  return `Valid ${type.expiration_duration_months} months`;
}

export function TemplatePrerequisites({ courseUuid, templateKind }: TemplatePrerequisitesProps) {
  const [rows, setRows] = useState<TemplatePrerequisiteWithType[]>([]);
  const [catalog, setCatalog] = useState<PrerequisiteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRows();
    loadCatalog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseUuid]);

  const loadRows = async () => {
    setLoading(true);
    const { templatePrerequisites, error: fetchError } = await getTemplatePrerequisites(courseUuid);
    if (fetchError) {
      setError(fetchError);
    } else if (templatePrerequisites) {
      setRows(templatePrerequisites);
      setError("");
    }
    setLoading(false);
  };

  const loadCatalog = async () => {
    const { prerequisiteTypes } = await getPrerequisiteTypes();
    if (prerequisiteTypes) {
      setCatalog(prerequisiteTypes);
    }
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    const nextRows = [...rows];
    [nextRows[index], nextRows[targetIndex]] = [nextRows[targetIndex], nextRows[index]];
    setRows(nextRows);

    const result = await reorderTemplatePrerequisites(nextRows.map((row) => row.id));
    if (!result.success) {
      alert(`Failed to reorder prerequisites: ${result.error}`);
      await loadRows();
    }
  };

  const handleToggleRequired = async (row: TemplatePrerequisiteWithType, next: boolean) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_required: next } : r)));
    const result = await updateTemplatePrerequisite(row.id, { is_required: next });
    if (!result.success) {
      alert(`Failed to update prerequisite: ${result.error}`);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, is_required: row.is_required } : r)));
    }
  };

  const handleRemove = async (row: TemplatePrerequisiteWithType) => {
    if (!window.confirm("Remove this prerequisite from the template? Classes already created keep theirs.")) {
      return;
    }
    const result = await removeTemplatePrerequisite(row.id);
    if (result.success) {
      await loadRows();
    } else {
      alert(`Failed to remove prerequisite: ${result.error}`);
    }
  };

  const handleAdd = async (type: PrerequisiteType) => {
    const result = await addTemplatePrerequisite(courseUuid, type.id, type.required_by_default, rows.length);
    if (result.success) {
      await loadRows();
    } else {
      alert(`Failed to add prerequisite: ${result.error}`);
    }
  };

  const handleCreated = (type: PrerequisiteType) => {
    setCatalog((prev) => [...prev, type].sort((a, b) => a.name.localeCompare(b.name)));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h2>
      <p className="text-sm text-gray-500 mb-4">
        {`Classes created from this ${templateKind} will copy this list. Existing classes keep the list they were created with.`}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500 mb-4">No prerequisites assigned yet.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-3 border border-gray-200 rounded-md px-3 py-2"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm text-gray-900">{row.prerequisite_type.name}</p>
                <p className="text-xs text-gray-500">
                  {`${PREREQUISITE_INPUT_TYPE_LABELS[row.prerequisite_type.input_type]} · ${expirationLabel(row)}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <label className="flex items-center gap-1 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={row.is_required}
                    onChange={(e) => handleToggleRequired(row, e.target.checked)}
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => handleReorder(index, -1)}
                  disabled={index === 0}
                  className="text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(index, 1)}
                  disabled={index === rows.length - 1}
                  className="text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Move down"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(row)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PrerequisiteTypePicker
        prerequisiteTypes={catalog}
        excludeIds={rows.map((row) => row.prerequisite_type_id)}
        onSelect={handleAdd}
        onCreated={handleCreated}
        placeholder="Add a prerequisite..."
      />
    </div>
  );
}
