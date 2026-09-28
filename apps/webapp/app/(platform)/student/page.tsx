"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStudentById, type StudentWithEmail } from "@/lib/students";
import { getStudentClassPrerequisiteSummaries } from "@/lib/prerequisites";
import { getMyProgramInvoices, getInvoiceDisplayStatus } from "@/lib/student-billing";

type ActionItem = {
  id: string;
  label: string;
  href: string;
};

export default function StudentPage() {
  const [student, setStudent] = useState<StudentWithEmail | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const { session } = await getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setEmail(session.user.email || "");
      const { student: fetchedStudent } = await getStudentById(session.user.id);
      setStudent(fetchedStudent);

      const [prereqResult, invoiceResult] = await Promise.all([
        getStudentClassPrerequisiteSummaries(session.user.id),
        getMyProgramInvoices(),
      ]);

      const items: ActionItem[] = [];
      for (const summary of prereqResult.summaries) {
        if (summary.outstandingCount > 0) {
          items.push({
            id: `prereq-${summary.classId}`,
            label: `${summary.outstandingCount} requirement${summary.outstandingCount === 1 ? "" : "s"} outstanding for ${summary.className}`,
            href: `/student/classes/${summary.classId}`,
          });
        }
      }
      for (const invoice of invoiceResult.invoices || []) {
        const status = getInvoiceDisplayStatus(invoice);
        if (status !== "pending" && status !== "past_due") continue;
        const classLabel = invoice.class_name || "an invoice";
        items.push({
          id: `invoice-${invoice.id}`,
          label:
            status === "past_due"
              ? `Past due payment for ${classLabel}`
              : `Payment due for ${classLabel}`,
          href: "/student/invoices",
        });
      }
      setActionItems(items);
      setLoading(false);
    };
    load();
  }, []);

  const displayName = student?.full_name || email || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">
            {loading ? "Welcome" : displayName ? `Welcome, ${displayName}` : "Welcome"}
          </h1>
        </div>
        {!loading && actionItems.length > 0 && (
          <aside className="w-full shrink-0 rounded-lg border border-amber-200 bg-amber-50 p-4 lg:w-80">
            <p className="text-sm font-semibold text-amber-900">
              {actionItems.length} {actionItems.length === 1 ? "item" : "items"} to complete or that need your attention
            </p>
            <ul className="mt-3 space-y-2">
              {actionItems.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="text-sm text-amber-900 underline">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-medium text-gray-900">{displayName || "Your profile"}</p>
            <p className="mt-1 text-sm text-gray-500">{email || "—"}</p>
          </div>
          <Link href="/student/profile" className="text-sm font-medium text-gray-900 underline whitespace-nowrap">
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
}
