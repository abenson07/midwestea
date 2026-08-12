"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { getLocations, createLocation, updateLocation, type Location } from "@/lib/locations";
import { X } from "lucide-react";

function LocationsPageContent() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formStreet, setFormStreet] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formState, setFormState] = useState("");
  const [formZip, setFormZip] = useState("");
  const [formMapsUrl, setFormMapsUrl] = useState("");

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setLoading(true);
    setError("");
    const { success, locations: list, error: err } = await getLocations();
    if (err) {
      setError(err);
      setLocations([]);
    } else if (list) {
      setLocations(list);
    } else {
      setLocations([]);
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingLocation(null);
    setFormName("");
    setFormStreet("");
    setFormCity("");
    setFormState("");
    setFormZip("");
    setFormMapsUrl("");
    setSaveError(null);
    setModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLocation(loc);
    setFormName(loc.location_name || "");
    setFormStreet(loc.street || "");
    setFormCity(loc.city || "");
    setFormState(loc.state || "");
    setFormZip(loc.zip || "");
    setFormMapsUrl(loc.google_maps_url || "");
    setSaveError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLocation(null);
    setSaveError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      if (editingLocation) {
        const result = await updateLocation(editingLocation.id, {
          locationName: formName.trim() || null,
          street: formStreet.trim() || null,
          city: formCity.trim() || null,
          state: formState.trim() || null,
          zip: formZip.trim() || null,
          googleMapsUrl: formMapsUrl.trim() || null,
        });
        if (result.success) {
          await loadLocations();
          closeModal();
        } else {
          setSaveError(result.error || "Failed to update location");
        }
      } else {
        const result = await createLocation(
          formName.trim(),
          formStreet.trim() || null,
          formCity.trim() || null,
          formState.trim() || null,
          formZip.trim() || null,
          formMapsUrl.trim() || null
        );
        if (result.success) {
          await loadLocations();
          closeModal();
        } else {
          setSaveError(result.error || "Failed to create location");
        }
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { header: "Name", accessorKey: "location_name" as keyof Location },
    {
      header: "Street",
      cell: (item: Location) => item.street || "—",
    },
    {
      header: "City",
      cell: (item: Location) => item.city || "—",
    },
    {
      header: "State",
      cell: (item: Location) => item.state || "—",
    },
    {
      header: "Zip",
      cell: (item: Location) => item.zip || "—",
    },
    {
      header: "Maps URL",
      cell: (item: Location) =>
        item.google_maps_url ? (
          <a
            href={item.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline truncate max-w-[120px] block"
          >
            Link
          </a>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Add location
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <DataTable<Location>
        data={locations}
        columns={columns}
        onEditClick={(item) => openEditModal(item)}
        isLoading={loading}
        emptyMessage="No locations yet. Add one to get started."
      />

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingLocation ? "Edit location" : "Add location"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {saveError && (
                <div className="rounded-md bg-red-50 p-3 text-red-700 text-sm">
                  {saveError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 text-sm"
                  placeholder="e.g. Raytown, MO"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street
                </label>
                <input
                  type="text"
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 text-sm"
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 text-sm"
                    placeholder="e.g. MO"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zip
                </label>
                <input
                  type="text"
                  value={formZip}
                  onChange={(e) => setFormZip(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={formMapsUrl}
                  onChange={(e) => setFormMapsUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : editingLocation ? "Save" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LocationsPage() {
  return <LocationsPageContent />;
}
