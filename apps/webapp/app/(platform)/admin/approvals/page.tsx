"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { StudentClassPrerequisiteReview } from "@/components/ui/StudentClassPrerequisiteReview";
import { getSession } from "@/lib/auth";
import type { PendingReviewRow } from "@/lib/admin-prerequisites";

function formatSubmittedAt(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
}

type QueueRow = PendingReviewRow & { id: string };

export default function ApprovalsPage() {
    const [rows, setRows] = useState<QueueRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRow, setSelectedRow] = useState<QueueRow | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const loadQueue = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { session } = await getSession();
            if (!session) {
                setError("Not authenticated.");
                setLoading(false);
                return;
            }

            const response = await fetch("/api/admin/prerequisites/queue", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(result.error || "Failed to load approvals queue.");
                setRows([]);
                setLoading(false);
                return;
            }

            setRows((result.rows as PendingReviewRow[]).map((row) => ({ ...row, id: row.credential_id })));
        } catch (err: any) {
            setError(err.message || "Failed to load approvals queue.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadQueue();
    }, [loadQueue]);

    const handleRowClick = (row: QueueRow) => {
        setSelectedRow(row);
        setIsSidebarOpen(true);
    };

    const handleClose = () => {
        setIsSidebarOpen(false);
        setSelectedRow(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
                    <p className="text-sm text-gray-500 mt-1">Prerequisite submissions awaiting review</p>
                </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <DataTable
                data={rows}
                isLoading={loading}
                emptyMessage="No submissions awaiting review."
                onRowClick={handleRowClick}
                columns={[
                    { header: "Student", accessorKey: "student_name", className: "font-medium" },
                    { header: "Class", cell: (row) => row.class_name || "—" },
                    { header: "Prerequisite", accessorKey: "prerequisite_type_name" },
                    { header: "Submitted", cell: (row) => formatSubmittedAt(row.submitted_at) },
                ]}
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleClose}
                title={selectedRow ? `${selectedRow.student_name} · ${selectedRow.class_name || "—"}` : ""}
            >
                {selectedRow && !selectedRow.class_id && (
                    <p className="text-sm text-gray-500">This submission isn&apos;t tied to a class.</p>
                )}
                {selectedRow && selectedRow.class_id && (
                    <StudentClassPrerequisiteReview
                        studentId={selectedRow.student_id}
                        classId={selectedRow.class_id}
                        onChanged={loadQueue}
                    />
                )}
            </DetailSidebar>
        </div>
    );
}
