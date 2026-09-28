"use client";

import { useState } from "react";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

export interface ExternalLearningLinksValues {
  jbLearningLabel: string | null;
  jbLearningUrl: string | null;
  platinumEdLabel: string | null;
  platinumEdUrl: string | null;
}

interface ExternalLearningLinksCardProps {
  values: ExternalLearningLinksValues;
  inherited?: ExternalLearningLinksValues | null;
  onSave: (values: ExternalLearningLinksValues) => Promise<{ success: boolean; error?: string }>;
}

export function ExternalLearningLinksCard({ values, inherited, onSave }: ExternalLearningLinksCardProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [form, setForm] = useState<ExternalLearningLinksValues>(values);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openSidebar = () => {
    setForm(values);
    setError(null);
    setIsSidebarOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const result = await onSave(form);
    setSaving(false);
    if (!result.success) {
      setError(result.error || "Failed to save external learning links.");
      return;
    }
    setIsSidebarOpen(false);
  };

  const jbUrlPlaceholder = inherited ? `Inherits: ${inherited.jbLearningUrl || "platform default"}` : "https://";
  const platinumUrlPlaceholder = inherited ? `Inherits: ${inherited.platinumEdUrl || "platform default"}` : "https://";

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">External Learning Links</h2>
        <button
          onClick={openSidebar}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">JB Learning Label</label>
          <p className="mt-1 text-sm text-gray-900">
            {values.jbLearningLabel || (inherited ? "Inherits from course" : "—")}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">JB Learning URL</label>
          <p className="mt-1 text-sm text-gray-900">
            {values.jbLearningUrl || (inherited ? `Inherits: ${inherited.jbLearningUrl || "platform default"}` : "—")}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Platinum ED Label</label>
          <p className="mt-1 text-sm text-gray-900">
            {values.platinumEdLabel || (inherited ? "Inherits from course" : "—")}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Platinum ED URL</label>
          <p className="mt-1 text-sm text-gray-900">
            {values.platinumEdUrl || (inherited ? `Inherits: ${inherited.platinumEdUrl || "platform default"}` : "—")}
          </p>
        </div>
      </div>

      <DetailSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} title="Edit External Learning Links">
        <form onSubmit={handleSave} className="space-y-6">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700">JB Learning Label</label>
            <input
              type="text"
              value={form.jbLearningLabel ?? ""}
              onChange={(e) => setForm({ ...form, jbLearningLabel: e.target.value || null })}
              placeholder={inherited ? (inherited.jbLearningLabel || "JB Learning") : "JB Learning"}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">JB Learning URL</label>
            <input
              type="text"
              value={form.jbLearningUrl ?? ""}
              onChange={(e) => setForm({ ...form, jbLearningUrl: e.target.value || null })}
              placeholder={jbUrlPlaceholder}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Platinum ED Label</label>
            <input
              type="text"
              value={form.platinumEdLabel ?? ""}
              onChange={(e) => setForm({ ...form, platinumEdLabel: e.target.value || null })}
              placeholder={inherited ? (inherited.platinumEdLabel || "Platinum ED") : "Platinum ED"}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Platinum ED URL</label>
            <input
              type="text"
              value={form.platinumEdUrl ?? ""}
              onChange={(e) => setForm({ ...form, platinumEdUrl: e.target.value || null })}
              placeholder={platinumUrlPlaceholder}
              className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setIsSidebarOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </DetailSidebar>
    </div>
  );
}
