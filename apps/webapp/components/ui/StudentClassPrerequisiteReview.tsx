"use client";

import { useCallback, useEffect, useState } from "react";
import type { EvaluatedPrerequisite, StudentCredential } from "@midwestea/types";
import { PREREQUISITE_STATUS_LABELS } from "@midwestea/types";
import { getSession } from "@/lib/auth";
import { PrerequisiteStatusBadge } from "@/components/ui/PrerequisiteStatusBadge";

interface StudentClassPrerequisiteReviewProps {
  studentId: string;
  classId: string; // classes.id UUID
  onChanged?: () => void; // BEN-868 calls this after a review action
}

interface ReviewData {
  evaluation: {
    class_id: string;
    student_id: string;
    items: EvaluatedPrerequisite[];
    outstanding: EvaluatedPrerequisite[];
    allRequiredSatisfied: boolean;
  };
  history: Record<string, StudentCredential[]>;
  className: string | null;
}

function formatLocalDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function formatSubmittedAt(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function SubmittedValue({ credential, onViewFile }: { credential: StudentCredential | null; onViewFile: (credentialId: string) => void }) {
  if (!credential) return <>—</>;

  if (credential.value_text !== null) return <>{credential.value_text}</>;
  if (credential.value_date !== null) return <>{formatLocalDate(credential.value_date)}</>;
  if (credential.value_boolean !== null) return <>{credential.value_boolean ? "Confirmed" : "Not confirmed"}</>;
  if (credential.file_url !== null) {
    return (
      <button
        type="button"
        onClick={() => onViewFile(credential.id)}
        className="text-black underline hover:no-underline"
      >
        View file
      </button>
    );
  }

  return <>—</>;
}

function HistoryRow({ credential, onViewFile }: { credential: StudentCredential; onViewFile: (credentialId: string) => void }) {
  return (
    <div className="border border-gray-200 rounded-md p-3 text-xs space-y-1 bg-gray-50">
      <div className="flex items-center justify-between">
        <SubmittedValue credential={credential} onViewFile={onViewFile} />
        <PrerequisiteStatusBadge
          status={
            credential.review_status === "approved"
              ? "satisfied"
              : credential.review_status === "rejected"
              ? "rejected"
              : credential.review_status === "superseded"
              ? "not_required"
              : "pending_review"
          }
        />
      </div>
      <div className="text-gray-500">Submitted {formatSubmittedAt(credential.submitted_at)}</div>
      {credential.rejection_reason && (
        <div className="text-red-600">Rejected: {credential.rejection_reason}</div>
      )}
    </div>
  );
}

export function StudentClassPrerequisiteReview({ studentId, classId, onChanged }: StudentClassPrerequisiteReviewProps) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { session } = await getSession();
      if (!session) {
        setError("Not authenticated.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/admin/prerequisites/review?studentId=${encodeURIComponent(studentId)}&classId=${encodeURIComponent(classId)}`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Failed to load prerequisites.");
        setData(null);
        setLoading(false);
        return;
      }

      let className: string | null = null;
      try {
        const { createSupabaseClient } = await import("@midwestea/utils");
        const supabase = await createSupabaseClient();
        const { data: cls } = await supabase.from("classes").select("class_name").eq("id", classId).maybeSingle();
        className = cls?.class_name ?? null;
      } catch {
        // Non-fatal: the "Required for <class>" line falls back to generic copy.
      }

      setData({ evaluation: result.evaluation, history: result.history, className });
    } catch (err: any) {
      setError(err.message || "Failed to load prerequisites.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [studentId, classId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleViewFile = async (credentialId: string) => {
    try {
      const { session } = await getSession();
      if (!session) return;
      const response = await fetch(`/api/prerequisites/credentials/${credentialId}/file`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json();
      if (result.success && result.url) {
        window.open(result.url, "_blank");
      }
    } catch {
      // Non-fatal: the click simply does nothing on failure.
    }
  };

  const toggleHistory = (typeId: string) => {
    setExpandedHistory((prev) => ({ ...prev, [typeId]: !prev[typeId] }));
  };

  if (loading) {
    return <div className="text-sm text-gray-500 py-4">Loading prerequisites...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600 py-4">{error}</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      {data.evaluation.items.map((item) => {
        const history = data.history[item.prerequisite_type_id] || [];
        const earlierSubmissions = history.slice(1); // exclude the latest row
        const isExpanded = !!expandedHistory[item.prerequisite_type_id];

        return (
          <div key={item.class_prerequisite_id} className="border border-gray-200 rounded-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{item.prerequisite_type.name}</span>
              <PrerequisiteStatusBadge status={item.status} />
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div>
                <dt className="text-gray-500">Submitted value</dt>
                <dd className="text-gray-900 mt-0.5">
                  <SubmittedValue credential={item.credential} onViewFile={handleViewFile} />
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="text-gray-900 mt-0.5">{PREREQUISITE_STATUS_LABELS[item.status]}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Issued</dt>
                <dd className="text-gray-900 mt-0.5">{formatLocalDate(item.credential?.issued_at)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Expires</dt>
                <dd className="text-gray-900 mt-0.5">{item.credential?.expires_at ? formatLocalDate(item.credential.expires_at) : "Never"}</dd>
              </div>
            </dl>

            <div className="text-xs text-gray-500">
              {item.is_required ? `Required for ${data.className ?? "this class"}` : "Optional for this class"}
            </div>

            {item.credential?.rejection_reason && (
              <div className="text-xs text-red-600">Rejected: {item.credential.rejection_reason}</div>
            )}

            {/* eslint-disable-next-line react/no-unknown-property -- intentional data attribute, filled by BEN-868 */}
            <div data-review-actions />

            {earlierSubmissions.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => toggleHistory(item.prerequisite_type_id)}
                  className="text-xs text-gray-500 underline"
                >
                  {isExpanded ? "Hide earlier submissions" : `Show earlier submissions (${earlierSubmissions.length})`}
                </button>
                {isExpanded && (
                  <div className="mt-2 space-y-2">
                    {earlierSubmissions.map((credential) => (
                      <HistoryRow key={credential.id} credential={credential} onViewFile={handleViewFile} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {data.evaluation.items.length === 0 && (
        <div className="text-sm text-gray-500 py-4">No prerequisites for this class.</div>
      )}
    </div>
  );
}
