"use client";

import { useState, useEffect } from "react";
import type { PrerequisiteType } from "@midwestea/types";
import { PREREQUISITE_INPUT_TYPE_LABELS } from "@midwestea/types";
import { getPrerequisiteTypes, archivePrerequisiteType } from "@/lib/prerequisites";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { PrerequisiteTypePicker } from "@/components/ui/PrerequisiteTypePicker";

export default function PrerequisitesPage() {
  const [prerequisiteTypes, setPrerequisiteTypes] = useState<PrerequisiteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alreadyExistsName, setAlreadyExistsName] = useState<string | null>(null);

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

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setAlreadyExistsName(null);
  };

  const handleSelectExisting = (type: PrerequisiteType) => {
    setAlreadyExistsName(type.name);
  };

  const handleCreated = async () => {
    await loadPrerequisiteTypes();
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

  const columns = [
    { header: "Name", accessorKey: "name" as keyof PrerequisiteType, className: "font-medium" },
    {
      header: "Input type",
      cell: (item: PrerequisiteType) => PREREQUISITE_INPUT_TYPE_LABELS[item.input_type],
    },
    {
      header: "Created",
      cell: (item: PrerequisiteType) =>
        item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
    },
    {
      header: "Actions",
      cell: (item: PrerequisiteType) => (
        <button
          onClick={() => handleArchive(item)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Archive
        </button>
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
          onClick={() => setIsSidebarOpen(true)}
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

      <DetailSidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} title="Add prerequisite">
        <div className="space-y-4">
          <PrerequisiteTypePicker
            prerequisiteTypes={prerequisiteTypes}
            onSelect={handleSelectExisting}
            onCreated={handleCreated}
          />
          {alreadyExistsName && (
            <p className="text-sm text-gray-600">{`${alreadyExistsName} already exists in the catalog.`}</p>
          )}
        </div>
      </DetailSidebar>
    </div>
  );
}
