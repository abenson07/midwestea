"use client";

import { useState, useEffect } from "react";
import { createSupabaseClient } from "@midwestea/utils";
import { formatLogMessage, type LogRecord } from "@/lib/logFormatting";

interface LogDisplayProps {
  referenceId: string;
  referenceType: "program" | "course" | "class" | "student";
  additionalFilters?: {
    studentId?: string;
  };
}

export function LogDisplay({ referenceId, referenceType, additionalFilters }: LogDisplayProps) {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, [referenceId, referenceType, additionalFilters]);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = await createSupabaseClient();

      // First, fetch logs without joins to avoid PostgREST join issues
      let query = supabase
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false });

      // For student detail page, we need two types of logs
      if (additionalFilters?.studentId && referenceType === "student") {
        query = query.or(`and(reference_type.eq.student,reference_id.eq.${referenceId}),student_id.eq.${additionalFilters.studentId}`);
      } else {
        query = query
          .eq("reference_type", referenceType)
          .eq("reference_id", referenceId);
      }

      const { data: logsData, error: queryError } = await query;

      if (queryError) {
        setError(queryError.message);
        setLogs([]);
        return;
      }

      if (!logsData || logsData.length === 0) {
        setLogs([]);
        return;
      }

      // Filter student logs if needed
      let filteredLogs = logsData;
      if (additionalFilters?.studentId && referenceType === "student") {
        filteredLogs = logsData.filter(
          (log: any) =>
            (log.reference_type === "student" && log.reference_id === referenceId) ||
            (log.student_id === additionalFilters.studentId &&
              ["student_added", "student_removed", "student_registered", "payment_success"].includes(log.action_type))
        );
      }

      // Now enrich with admin and student data separately
      const enrichedLogs = await Promise.all(
        filteredLogs.map(async (log: any) => {
          const enriched: any = { ...log };

          // Fetch admin data if admin_user_id exists
          if (log.admin_user_id) {
            const { data: adminData } = await supabase
              .from("admins")
              .select("display_name")
              .eq("id", log.admin_user_id)
              .is("deleted_at", null)
              .single();
            enriched.admins = adminData || null;
          } else {
            enriched.admins = null;
          }

          // Fetch student data if student_id exists
          if (log.student_id) {
            const { data: studentData } = await supabase
              .from("students")
              .select("first_name, last_name")
              .eq("id", log.student_id)
              .single();
            
            // Email is not in students table (it's in auth.users)
            // We'll set it to null and handle it in formatting if needed
            enriched.students = studentData ? { ...studentData, email: null } : null;
          } else {
            enriched.students = null;
          }

          return enriched;
        })
      );

      setLogs(enrichedLogs as LogRecord[]);
    } catch (err: any) {
      setError(err.message || "Failed to load logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
        <p className="text-sm text-gray-500">Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
        <p className="text-sm text-red-600">Error loading logs: {error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
        <p className="text-sm text-gray-500">No activity logged yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
            <p className="text-sm text-gray-900">{formatLogMessage(log)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

