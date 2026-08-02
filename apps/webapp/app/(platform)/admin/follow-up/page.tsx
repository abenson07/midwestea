"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { PrerequisiteStatusBadge } from "@/components/ui/PrerequisiteStatusBadge";
import { getSession } from "@/lib/auth";
import type { FollowUpReason, FollowUpRow } from "@/lib/admin-prerequisites";
import { FOLLOW_UP_REASON_LABELS } from "@/lib/admin-prerequisites";

type Row = FollowUpRow & { id: string };

const REASONS: FollowUpReason[] = ["rejected", "expired", "expiring_before_class", "missing", "expiring_soon"];
const WINDOW_OPTIONS = [30, 60, 90] as const;

function csvEscape(value: string): string {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

function formatDate(value: string | null): string {
    if (!value) return "—";
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString();
}

export default function FollowUpPage() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeReasons, setActiveReasons] = useState<Set<FollowUpReason>>(new Set(REASONS));
    const [expiryWindow, setExpiryWindow] = useState<number>(60);

    const loadRows = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { session } = await getSession();
            if (!session) {
                setError("Not authenticated.");
                setLoading(false);
                return;
            }

            const response = await fetch("/api/admin/prerequisites/follow-up", {
                headers: { Authorization: `Bearer ${session.access_token}` },
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                setError(result.error || "Failed to load follow-up list.");
                setRows([]);
                setLoading(false);
                return;
            }

            setRows((result.rows as FollowUpRow[]).map((row, index) => ({ ...row, id: `${row.student_id}-${row.class_id}-${row.prerequisite_type_id}-${row.reason}-${index}` })));
        } catch (err: any) {
            setError(err.message || "Failed to load follow-up list.");
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRows();
    }, [loadRows]);

    const toggleReason = (reason: FollowUpReason) => {
        setActiveReasons((prev) => {
            const isActive = prev.has(reason);
            const nextList = isActive
                ? Array.from(prev).filter((r) => r !== reason)
                : [...Array.from(prev), reason];
            return new Set(nextList);
        });
    };

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            if (!activeReasons.has(row.reason)) return false;
            if (row.reason === "expiring_soon") {
                return row.days_until_expiry !== null && row.days_until_expiry <= expiryWindow;
            }
            return true;
        });
    }, [rows, activeReasons, expiryWindow]);

    const handleExportCsv = () => {
        const headers = ["Student", "Email", "Class", "Class start", "Prerequisite", "Reason", "Expires"];
        const lines = [headers.join(",")];
        for (const row of filteredRows) {
            const reasonLabel =
                row.reason === "expiring_soon"
                    ? `Expires in ${row.days_until_expiry}d`
                    : FOLLOW_UP_REASON_LABELS[row.reason];
            lines.push(
                [
                    csvEscape(row.student_name),
                    csvEscape(row.student_email || ""),
                    csvEscape(row.class_name || ""),
                    csvEscape(row.class_start_date || ""),
                    csvEscape(row.prerequisite_type_name),
                    csvEscape(reasonLabel),
                    csvEscape(row.expires_at || ""),
                ].join(",")
            );
        }
        const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `prerequisite-follow-up-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Follow-up</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Students with incomplete or expiring prerequisites before class starts.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
                >
                    Export CSV
                </button>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap gap-2">
                    {REASONS.map((reason) => (
                        <button
                            key={reason}
                            type="button"
                            onClick={() => toggleReason(reason)}
                            className={`px-3 py-1 text-sm rounded-md border ${
                                activeReasons.has(reason)
                                    ? "bg-black text-white border-black"
                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {FOLLOW_UP_REASON_LABELS[reason]}
                        </button>
                    ))}
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                    Expiring soon window:
                    <select
                        value={expiryWindow}
                        onChange={(e) => setExpiryWindow(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    >
                        {WINDOW_OPTIONS.map((w) => (
                            <option key={w} value={w}>
                                {w} days
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <p className="text-sm text-gray-500">
                {filteredRows.length} of {rows.length} items
            </p>

            <DataTable
                data={filteredRows}
                isLoading={loading}
                emptyMessage="No follow-up needed right now."
                rowClassName={(row) => (row.days_until_class !== null && row.days_until_class <= 7 ? "bg-red-50" : "")}
                columns={[
                    { header: "Student", accessorKey: "student_name", className: "font-medium" },
                    { header: "Class", cell: (row) => row.class_name || "—" },
                    {
                        header: "Starts",
                        cell: (row) => (
                            <div>
                                <div>{formatDate(row.class_start_date)}</div>
                                {row.days_until_class !== null && (
                                    <div className="text-xs text-gray-500">{row.days_until_class}d</div>
                                )}
                            </div>
                        ),
                    },
                    { header: "Prerequisite", accessorKey: "prerequisite_type_name" },
                    {
                        header: "Reason",
                        cell: (row) =>
                            row.reason === "expiring_soon" ? (
                                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">
                                    Expires in {row.days_until_expiry}d
                                </span>
                            ) : (
                                <PrerequisiteStatusBadge status={row.status} />
                            ),
                    },
                    {
                        header: "Actions",
                        cell: (row) => (
                            <div className="flex items-center gap-3">
                                <a href={`/admin/classes/${row.class_id}`} className="text-sm text-blue-600 hover:underline">
                                    View class
                                </a>
                                <a href={`/admin/students/${row.student_id}`} className="text-sm text-blue-600 hover:underline">
                                    View student
                                </a>
                            </div>
                        ),
                    },
                ]}
            />
        </div>
    );
}
