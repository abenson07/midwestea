"use client";

import { useState } from "react";
import type { StudentCredential } from "@midwestea/types";
import { getSession } from "@/lib/auth";

interface CredentialReviewActionsProps {
  credential: StudentCredential;
  onReviewed: () => void;
}

/**
 * Approve/Reject controls for a single credential. Mounted inside the
 * `data-review-actions` slot StudentClassPrerequisiteReview.tsx (BEN-867)
 * renders for every entry, on both the latest row and each history row.
 * Renders nothing for a superseded row -- there is nothing to review.
 */
export function CredentialReviewActions({ credential, onReviewed }: CredentialReviewActionsProps) {
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (credential.review_status === "superseded") {
    return null;
  }

  const submitReview = async (decision: "approved" | "rejected", rejectionReason?: string) => {
    setError(null);
    setSubmitting(decision === "approved" ? "approve" : "reject");
    try {
      const { session } = await getSession();
      if (!session) {
        setError("Not authenticated.");
        setSubmitting(null);
        return;
      }

      const response = await fetch("/api/admin/prerequisites/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          credentialId: credential.id,
          decision,
          rejectionReason,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Failed to save review.");
        setSubmitting(null);
        return;
      }

      setSubmitting(null);
      setShowReasonInput(false);
      setReason("");
      onReviewed();
    } catch (err: any) {
      setError(err.message || "Failed to save review.");
      setSubmitting(null);
    }
  };

  const handleApprove = () => submitReview("approved");
  const handleConfirmRejection = () => submitReview("rejected", reason);

  const isApproved = credential.review_status === "approved";
  const isRejected = credential.review_status === "rejected";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isApproved || submitting !== null}
          className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting === "approve" ? "Saving..." : isApproved ? "Approved" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => setShowReasonInput((prev) => !prev)}
          disabled={isRejected || submitting !== null}
          className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting === "reject" ? "Saving..." : isRejected ? "Rejected" : "Reject"}
        </button>
      </div>

      {showReasonInput && (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this being rejected?"
            className="w-full text-sm border border-gray-300 rounded-md p-2"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleConfirmRejection}
              disabled={reason.trim() === "" || submitting !== null}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting === "reject" ? "Saving..." : "Confirm rejection"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowReasonInput(false);
                setReason("");
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
