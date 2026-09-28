"use client";

import { FormEvent, useState } from "react";
import type { EvaluatedPrerequisite } from "@midwestea/types";
import { getSession } from "@/lib/auth";

interface PrerequisiteStepFormProps {
  item: EvaluatedPrerequisite;
  classId: string; // classes.id UUID, for submitted_for_class_id
  onSubmitted: () => void; // called after a successful POST
  onSkip?: () => void; // omitted => no skip link rendered
  submitLabel?: string; // default 'Continue'
  skipLabel?: string; // default 'Skip for now'
}

/**
 * Renders the input for a single outstanding prerequisite and submits it to
 * POST /api/prerequisites/credentials. Reused by both the post-payment
 * wizard (BEN-855) and the profile-based completion path (BEN-856) — do not
 * duplicate this form elsewhere.
 */
export function PrerequisiteStepForm({
  item,
  classId,
  onSubmitted,
  onSkip,
  submitLabel = "Continue",
  skipLabel = "Skip for now",
}: PrerequisiteStepFormProps) {
  const { prerequisite_type: type } = item;

  const [valueText, setValueText] = useState("");
  const [valueDate, setValueDate] = useState("");
  const [valueBoolean, setValueBoolean] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [issuedAt, setIssuedAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showIssuedAt = type.expiration_rule === "duration_from_issue";
  const showExpiresAt = type.expiration_rule === "fixed_date" && type.input_type !== "date";
  const rejectionReason =
    item.status === "rejected" && item.credential?.rejection_reason ? item.credential.rejection_reason : null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { session } = await getSession();
      if (!session) {
        setError("Not authenticated. Please log in.");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.set("prerequisiteTypeId", type.id);
      formData.set("submittedForClassId", classId);

      if (type.input_type === "file_upload" && file) {
        formData.set("file", file);
      }
      if (type.input_type === "text") {
        formData.set("valueText", valueText);
      }
      if (type.input_type === "date") {
        formData.set("valueDate", valueDate);
      }
      if (type.input_type === "checkbox") {
        formData.set("valueBoolean", String(valueBoolean));
      }
      if (showIssuedAt && issuedAt) {
        formData.set("issuedAt", issuedAt);
      }
      if (showExpiresAt && expiresAt) {
        formData.set("expiresAt", expiresAt);
      }

      const response = await fetch("/api/prerequisites/credentials", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        setError(result.error || "Failed to submit. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      onSubmitted();
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to submit. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">{type.name}</h2>
      {type.description && <p className="text-sm text-gray-500">{type.description}</p>}
      {rejectionReason && (
        <p className="text-sm text-red-600">Rejected: {rejectionReason}</p>
      )}

      {type.input_type === "file_upload" && (
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
      )}
      {type.input_type === "date" && (
        <input
          type="date"
          value={valueDate}
          onChange={(e) => setValueDate(e.target.value)}
          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
        />
      )}
      {type.input_type === "text" && (
        <input
          type="text"
          value={valueText}
          onChange={(e) => setValueText(e.target.value)}
          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
        />
      )}
      {type.input_type === "checkbox" && (
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={valueBoolean}
            onChange={(e) => setValueBoolean(e.target.checked)}
            className="rounded border-gray-300 text-black focus:ring-black"
          />
          {type.name}
        </label>
      )}

      {showIssuedAt && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue date</label>
          <input
            type="date"
            value={issuedAt}
            onChange={(e) => setIssuedAt(e.target.value)}
            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
          />
        </div>
      )}
      {showExpiresAt && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiration date</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-gray-900 text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : submitLabel}
      </button>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
        >
          {skipLabel}
        </button>
      )}
    </form>
  );
}
