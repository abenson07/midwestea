"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getSession } from "@/lib/auth";
import { StudentClassRequirements } from "@/components/ui/StudentClassRequirements";
import {
  formatClassDate,
  getMyClassEnrollments,
  type StudentClassEnrollment,
} from "@/lib/student-classes";
import { getStudentExternalLearningLinks } from "@/lib/externalLearningLinks";
import type { ExternalLearningLink } from "@/lib/externalLearningLinks";
import {
  getMyProgramInvoices,
  getInvoiceDisplayStatus,
  payInvoice,
  payAllRemaining,
  type StudentInvoice,
} from "@/lib/student-billing";
import { formatCurrency } from "@midwestea/utils";

function formatDueDate(dateString: string | null | undefined) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
}

export default function StudentClassDetailPage() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId;
  const [studentId, setStudentId] = useState<string | null>(null);
  const [row, setRow] = useState<StudentClassEnrollment | null>(null);
  const [links, setLinks] = useState<ExternalLearningLink[]>([]);
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payingAll, setPayingAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { session } = await getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setStudentId(session.user.id);

      const [{ enrollments, error: enrollError }, { groups }, { invoices: fetchedInvoices }] =
        await Promise.all([
          getMyClassEnrollments(),
          getStudentExternalLearningLinks(session.user.id),
          getMyProgramInvoices(),
        ]);

      if (enrollError) {
        setError(enrollError);
        setLoading(false);
        return;
      }

      const match = (enrollments || []).find((item) => item.class.id === classId) || null;
      setRow(match);
      const group = (groups || []).find((item) => item.classId === classId);
      setLinks(group?.links || []);
      setInvoices((fetchedInvoices || []).filter((invoice) => invoice.class_id === classId));
      setLoading(false);
    };
    load();
  }, [classId]);

  const openInvoices = invoices.filter((invoice) => {
    const status = getInvoiceDisplayStatus(invoice);
    return status === "pending" || status === "past_due";
  });

  async function handlePay(transactionId: string) {
    setPayingId(transactionId);
    const { checkoutUrl, error: payError } = await payInvoice(transactionId);
    if (payError || !checkoutUrl) {
      alert(payError || "Failed to start payment");
    } else {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }
    setPayingId(null);
  }

  async function handlePayAll() {
    if (!row) return;
    setPayingAll(true);
    const { checkoutUrl, error: payError } = await payAllRemaining(row.enrollmentId);
    if (payError || !checkoutUrl) {
      alert(payError || "Failed to start payment");
    } else {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }
    setPayingAll(false);
  }

  if (loading) {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (!row) {
    return <p className="text-gray-500">Class not found.</p>;
  }

  const classRecord = row.class;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {classRecord.class_name || classRecord.course_code || "Class"}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {classRecord.location || (classRecord.is_online ? "Online" : "Location TBD")}
            </p>
            <p className="text-sm text-gray-500">
              {formatClassDate(classRecord.class_start_date)}
              {classRecord.class_close_date ? ` – ${formatClassDate(classRecord.class_close_date)}` : ""}
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Status: {row.enrollmentStatus || "registered"}
            </p>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            {links.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-end gap-2 text-sm font-medium text-gray-900 underline"
              >
                {link.label}
                <ExternalLink className="h-4 w-4" />
              </a>
            ))}
            {openInvoices.length > 0 && (
              <button
                type="button"
                onClick={handlePayAll}
                disabled={payingAll}
                className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
              >
                {payingAll ? "Redirecting..." : openInvoices.length > 1 ? "Pay remaining" : "Pay"}
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-gray-500">No invoices for this class.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {invoices.map((invoice) => {
              const status = getInvoiceDisplayStatus(invoice);
              const isOpen = status === "pending" || status === "past_due";
              return (
                <li key={invoice.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency((invoice.amount_due || 0) * (invoice.quantity || 1))}
                    </p>
                    <p className={`text-xs ${status === "past_due" ? "text-red-600 font-medium" : "text-gray-500"}`}>
                      Due {formatDueDate(invoice.due_date)}
                      {status === "past_due" ? " · Past due" : ` · ${status}`}
                    </p>
                  </div>
                  {isOpen && (
                    <button
                      type="button"
                      onClick={() => handlePay(invoice.id)}
                      disabled={payingId === invoice.id}
                      className="px-3 py-1 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                    >
                      {payingId === invoice.id ? "Redirecting..." : "Pay"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {studentId && <StudentClassRequirements studentId={studentId} classId={classId} />}
    </div>
  );
}
