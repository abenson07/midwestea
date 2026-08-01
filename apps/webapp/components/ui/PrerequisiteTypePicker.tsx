"use client";

import { useState } from "react";
import type { PrerequisiteInputType, PrerequisiteType } from "@midwestea/types";
import { PREREQUISITE_INPUT_TYPES, PREREQUISITE_INPUT_TYPE_LABELS } from "@midwestea/types";
import { createPrerequisiteType } from "@/lib/prerequisites";

interface PrerequisiteTypePickerProps {
  prerequisiteTypes: PrerequisiteType[];
  excludeIds?: string[];
  onSelect: (type: PrerequisiteType) => void;
  onCreated?: (type: PrerequisiteType) => void;
  placeholder?: string;
}

export function PrerequisiteTypePicker({
  prerequisiteTypes,
  excludeIds = [],
  onSelect,
  onCreated,
  placeholder = "Search prerequisites...",
}: PrerequisiteTypePickerProps) {
  const [query, setQuery] = useState("");
  const [selectedInputType, setSelectedInputType] = useState<PrerequisiteInputType>("file_upload");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  const lowerQuery = trimmedQuery.toLowerCase();

  const matches = trimmedQuery
    ? prerequisiteTypes.filter(
        (type) => !excludeIds.includes(type.id) && type.name.toLowerCase().includes(lowerQuery)
      )
    : [];

  const showCreateNew = trimmedQuery.length > 0 && matches.length === 0;

  const handleSelect = (type: PrerequisiteType) => {
    onSelect(type);
    setQuery("");
    setCreateError(null);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const result = await createPrerequisiteType(trimmedQuery, selectedInputType);
      if (result.success && result.prerequisiteType) {
        onCreated?.(result.prerequisiteType);
        onSelect(result.prerequisiteType);
        setQuery("");
      } else {
        setCreateError(result.error || "Failed to create prerequisite type.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setCreateError(null);
        }}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      {matches.length > 0 && (
        <div className="mt-2 space-y-1">
          {matches.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleSelect(type)}
              className="w-full text-left px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
            >
              {type.name}
            </button>
          ))}
        </div>
      )}

      {showCreateNew && (
        <div className="mt-2 space-y-2 rounded-md border border-gray-200 p-3">
          <p className="text-sm text-gray-700">{`No match for "${trimmedQuery}". Create it:`}</p>
          <select
            value={selectedInputType}
            onChange={(e) => setSelectedInputType(e.target.value as PrerequisiteInputType)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            {PREREQUISITE_INPUT_TYPES.map((inputType) => (
              <option key={inputType} value={inputType}>
                {PREREQUISITE_INPUT_TYPE_LABELS[inputType]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="bg-black text-white hover:bg-gray-800 disabled:opacity-50 rounded-md px-3 py-2 text-sm font-medium"
          >
            {isCreating ? "Creating..." : `Create "${trimmedQuery}"`}
          </button>
          {createError && <p className="text-sm text-red-600">{createError}</p>}
        </div>
      )}
    </div>
  );
}
