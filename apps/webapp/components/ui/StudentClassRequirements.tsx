"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Lock } from "lucide-react";
import type { EvaluatedPrerequisite } from "@midwestea/types";
import { getStudentClassPrerequisiteSummaries, type ClassPrerequisiteSummary } from "@/lib/prerequisites";
import { PrerequisiteStatusBadge } from "@/components/ui/PrerequisiteStatusBadge";

interface StudentClassRequirementsProps {
  studentId: string;
}

function summaryColorClass(summary: ClassPrerequisiteSummary): string {
  if (summary.outstandingCount > 0) {
    return "text-amber-700";
  }
  if (summary.summaryLabel === "Awaiting review") {
    return "text-gray-500";
  }
  if (summary.summaryLabel === "All requirements complete") {
    return "text-green-700";
  }
  return "text-gray-500";
}

function nextActionLabel(status: EvaluatedPrerequisite["status"]): string | null {
  if (status === "rejected") return "Resubmit";
  if (status === "missing") return "Start";
  if (status === "expired" || status === "expiring_before_class") return "Renew";
  return null;
}

function PrerequisiteItemRow({
  item,
  classCode,
  classStartDate,
}: {
  item: EvaluatedPrerequisite;
  classCode: string;
  classStartDate: string | null;
}) {
  const detailParts: string[] = [];
  if (item.expires_at) {
    detailParts.push(`Expires ${new Date(item.expires_at).toLocaleDateString()}`);
  }
  if (
    (item.status === "satisfied" || item.status === "rejected") &&
    item.credential?.reviewed_at
  ) {
    detailParts.push(`Reviewed ${new Date(item.credential.reviewed_at).toLocaleDateString()}`);
  }
  if (item.status === "expiring_before_class" && classStartDate) {
    detailParts.push(`Class starts ${new Date(classStartDate).toLocaleDateString()}`);
  }

  const actionLabel = nextActionLabel(item.status);
  const rejectionReason =
    item.status === "rejected" && item.credential?.rejection_reason ? item.credential.rejection_reason : null;

  return (
    <li className="py-3 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{item.prerequisite_type.name}</p>
        {detailParts.length > 0 && (
          <p className="text-xs text-gray-500">{detailParts.join(" · ")}</p>
        )}
        {rejectionReason && <p className="text-xs text-red-600">Reason: {rejectionReason}</p>}
      </div>
      <div className="flex flex-col items-end gap-1">
        <PrerequisiteStatusBadge status={item.status} />
        {actionLabel && (
          <Link
            href={`/student/prerequisites/${classCode}?from=profile`}
            className="text-sm font-medium text-gray-900 underline whitespace-nowrap"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </li>
  );
}

function ClassMaterialsSection({ summary }: { summary: ClassPrerequisiteSummary }) {
  const access = summary.access;
  if (!access || access.reason === "not_enrolled") {
    return null;
  }

  if (access.reason === "granted" && access.materialsUrl) {
    return (
      <div className="pt-3">
        <a
          href={access.materialsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
        >
          Open class materials
        </a>
      </div>
    );
  }

  if (access.reason === "prerequisites_incomplete") {
    const anyPendingReview = access.blockingItems.some((item) => item.status === "pending_review");
    return (
      <div className="pt-3">
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-500 shrink-0" />
            <p className="text-sm text-gray-700">
              Class materials unlock once your required prerequisites are approved.
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {access.blockingItems.map((item) => item.prerequisite_type.name).join(", ")}
            {anyPendingReview ? " Some items are still under review." : ""}
          </p>
        </div>
      </div>
    );
  }

  if (access.reason === "no_materials") {
    return (
      <div className="pt-3">
        <p className="text-sm text-gray-500">Materials aren&apos;t posted for this class yet.</p>
      </div>
    );
  }

  return null;
}

export function StudentClassRequirements({ studentId }: StudentClassRequirementsProps) {
  const [summaries, setSummaries] = useState<ClassPrerequisiteSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    const { summaries: result } = await getStudentClassPrerequisiteSummaries(studentId);
    setSummaries(result);
    setExpanded((prev) => {
      const next = { ...prev };
      for (const summary of result) {
        if (!(summary.classId in next)) {
          next[summary.classId] = summary.outstandingCount > 0;
        }
      }
      return next;
    });
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    refresh();

    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  const toggle = (classId: string) => {
    setExpanded((prev) => ({ ...prev, [classId]: !prev[classId] }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6 max-w-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Class requirements</h2>

      {loading && !summaries && <p className="text-sm text-gray-500">Loading...</p>}

      {!loading && summaries && summaries.length === 0 && (
        <p className="text-sm text-gray-500">You&apos;re not enrolled in any classes yet.</p>
      )}

      {summaries && summaries.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {summaries.map((summary) => {
            const isExpanded = !!expanded[summary.classId];
            return (
              <li key={summary.classId} className="py-1">
                {/*
                  A native <button> cannot legally contain an <a>/<Link>
                  (nested interactive content is invalid HTML and some
                  browsers auto-close the button early). Using a
                  role="button" div reproduces the plan's "full-width
                  toggle button with a propagation-stopped link inside it"
                  behavior without that nesting problem.
                */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => summary.hasAnyPrerequisites && toggle(summary.classId)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && summary.hasAnyPrerequisites) {
                      e.preventDefault();
                      toggle(summary.classId);
                    }
                  }}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between gap-4 py-2 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {summary.hasAnyPrerequisites ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                      )
                    ) : (
                      <span className="h-4 w-4 shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{summary.className}</p>
                      {summary.hasAnyPrerequisites ? (
                        <p className={`text-sm ${summaryColorClass(summary)}`}>{summary.summaryLabel}</p>
                      ) : (
                        <p className="text-sm text-gray-500">No requirements for this class.</p>
                      )}
                    </div>
                  </div>
                  {summary.hasAnyPrerequisites && (
                    <Link
                      href={`/student/prerequisites/${summary.classCode}?from=profile`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-medium text-gray-900 underline whitespace-nowrap"
                    >
                      {summary.outstandingCount > 0 ? "Continue" : "View"}
                    </Link>
                  )}
                </div>

                {isExpanded && summary.hasAnyPrerequisites && (
                  <div className="border-t border-gray-200 pl-6">
                    {summary.evaluation ? (
                      <ul className="divide-y divide-gray-100">
                        {summary.evaluation.items.map((item) => (
                          <PrerequisiteItemRow
                            key={item.class_prerequisite_id}
                            item={item}
                            classCode={summary.classCode}
                            classStartDate={summary.classStartDate}
                          />
                        ))}
                      </ul>
                    ) : (
                      <p className="py-3 text-sm text-gray-500">Status unavailable</p>
                    )}
                    <ClassMaterialsSection summary={summary} />
                  </div>
                )}
                {/*
                  Classes with no prerequisites have no expand affordance at
                  all, but materials access (BEN-864) must still be visible
                  for them -- render the section here too in that case.
                */}
                {!summary.hasAnyPrerequisites && (
                  <div className="pl-6">
                    <ClassMaterialsSection summary={summary} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
