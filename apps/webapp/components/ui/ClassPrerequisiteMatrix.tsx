"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { EvaluatedPrerequisite } from "@midwestea/types";
import { getSession } from "@/lib/auth";
import { PrerequisiteStatusBadge } from "@/components/ui/PrerequisiteStatusBadge";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { StudentClassPrerequisiteReview } from "@/components/ui/StudentClassPrerequisiteReview";
import type { ClassMatrixPayload, ClassMatrixStudentRow } from "@/lib/admin-prerequisites";

interface ClassPrerequisiteMatrixProps {
  classId: string;
}

type FilterKey = "all" | "outstanding" | "pending_review" | "expiring";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "outstanding", label: "Outstanding" },
  { key: "pending_review", label: "Pending review" },
  { key: "expiring", label: "Expiring" },
];

function rowMatchesFilter(row: ClassMatrixStudentRow, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "outstanding") return row.evaluation.outstanding.length > 0;
  if (filter === "pending_review") {
    return row.evaluation.items.some((item) => item.status === "pending_review");
  }
  if (filter === "expiring") {
    return row.evaluation.items.some((item) => item.status === "expiring_before_class");
  }
  return true;
}

function truncateName(name: string, max = 20): string {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

export function ClassPrerequisiteMatrix({ classId }: ClassPrerequisiteMatrixProps) {
  const [payload, setPayload] = useState<ClassMatrixPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedStudent, setSelectedStudent] = useState<ClassMatrixStudentRow | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      const response = await fetch(`/api/admin/prerequisites/class-matrix?classId=${encodeURIComponent(classId)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Failed to load prerequisite matrix.");
        setPayload(null);
        setLoading(false);
        return;
      }

      setPayload(result.payload as ClassMatrixPayload);
    } catch (err: any) {
      setError(err.message || "Failed to load prerequisite matrix.");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filteredRows = useMemo(() => {
    if (!payload) return [];
    return payload.rows.filter((row) => rowMatchesFilter(row, filter));
  }, [payload, filter]);

  const filterCounts = useMemo(() => {
    if (!payload) return { all: 0, outstanding: 0, pending_review: 0, expiring: 0 };
    return {
      all: payload.rows.length,
      outstanding: payload.rows.filter((row) => rowMatchesFilter(row, "outstanding")).length,
      pending_review: payload.rows.filter((row) => rowMatchesFilter(row, "pending_review")).length,
      expiring: payload.rows.filter((row) => rowMatchesFilter(row, "expiring")).length,
    };
  }, [payload]);

  const handleCellClick = (row: ClassMatrixStudentRow) => {
    setSelectedStudent(row);
    setIsSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Prerequisite status by student</h2>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      {loading && !payload && <p className="text-sm text-gray-500">Loading...</p>}

      {!loading && payload && payload.rows.length === 0 && (
        <p className="text-sm text-gray-500">No students enrolled in this class.</p>
      )}

      {!loading && payload && payload.rows.length > 0 && payload.columns.length === 0 && (
        <p className="text-sm text-gray-500">This class has no prerequisites.</p>
      )}

      {!loading && payload && payload.rows.length > 0 && payload.columns.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm mb-4">
            <span className="text-green-700">{payload.summary.fully_approved} fully approved</span>
            <span className="text-gray-400">·</span>
            <span className="text-blue-700">{payload.summary.awaiting_review} awaiting review</span>
            <span className="text-gray-400">·</span>
            <span className="text-amber-700">{payload.summary.outstanding} with outstanding requirements</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1 text-sm rounded-md ${
                  filter === f.key
                    ? "bg-black text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {f.label} ({filterCounts[f.key]})
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="sticky left-0 bg-white px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  {payload.columns.map((col) => (
                    <th
                      key={col.prerequisite_type_id}
                      title={col.name}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {truncateName(col.name)}
                      {col.is_required ? "*" : ""}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Materials
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.map((row) => (
                  <tr key={row.student_id}>
                    <td className="sticky left-0 bg-white px-3 py-2 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {row.student_name}
                    </td>
                    {payload.columns.map((col) => {
                      const item = row.evaluation.items.find(
                        (i: EvaluatedPrerequisite) => i.prerequisite_type_id === col.prerequisite_type_id
                      );
                      return (
                        <td key={col.prerequisite_type_id} className="px-3 py-2 text-sm whitespace-nowrap">
                          {item ? (
                            <button type="button" onClick={() => handleCellClick(row)}>
                              <PrerequisiteStatusBadge status={item.status} />
                            </button>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-sm whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.evaluation.allRequiredSatisfied
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {row.evaluation.allRequiredSatisfied ? "Unlocked" : "Locked"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
        title={selectedStudent ? `${selectedStudent.student_name} · ${payload?.class_name ?? ""}` : ""}
      >
        {selectedStudent && (
          <StudentClassPrerequisiteReview
            studentId={selectedStudent.student_id}
            classId={classId}
            onChanged={refresh}
          />
        )}
      </DetailSidebar>
    </div>
  );
}
