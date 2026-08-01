"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStudentClassPrerequisiteSummaries, type ClassPrerequisiteSummary } from "@/lib/prerequisites";

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

export function StudentClassRequirements({ studentId }: StudentClassRequirementsProps) {
  const [summaries, setSummaries] = useState<ClassPrerequisiteSummary[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const { summaries: result } = await getStudentClassPrerequisiteSummaries(studentId);
      if (!cancelled) {
        setSummaries(result);
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6 max-w-lg">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Class requirements</h2>

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {!loading && summaries && summaries.length === 0 && (
        <p className="text-sm text-gray-500">You&apos;re not enrolled in any classes yet.</p>
      )}

      {!loading && summaries && summaries.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {summaries.map((summary) => (
            <li key={summary.classId} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">{summary.className}</p>
                {summary.hasAnyPrerequisites ? (
                  <p className={`text-sm ${summaryColorClass(summary)}`}>{summary.summaryLabel}</p>
                ) : (
                  <p className="text-sm text-gray-500">No requirements for this class.</p>
                )}
              </div>
              {summary.hasAnyPrerequisites && (
                <Link
                  href={`/student/prerequisites/${summary.classCode}?from=profile`}
                  className="text-sm font-medium text-gray-900 underline whitespace-nowrap"
                >
                  {summary.outstandingCount > 0 ? "Continue" : "View"}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
