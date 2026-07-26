"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth";
import {
  getMyProgramInvoices,
  getInvoiceDisplayStatus,
  groupInvoicesByClass,
  type StudentInvoice,
} from "@/lib/student-billing";
import { formatCurrency } from "@midwestea/utils";

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  past_due: "Past due",
  pending: "Pending",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_CLASSES: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  past_due: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-gray-100 text-gray-800",
  refunded: "bg-blue-100 text-blue-800",
};

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
}

function transactionTypeLabel(type: string | null) {
  if (type === 'registration_fee') return 'Registration Fee';
  if (type === 'tuition_a') return 'First Tuition Payment';
  if (type === 'tuition_b') return 'Second Tuition Payment';
  return type || 'Invoice';
}

export default function StudentBillingPage() {
  const [invoices, setInvoices] = useState<StudentInvoice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { session } = await getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { invoices: fetched, error: fetchError } = await getMyProgramInvoices();
      if (fetchError) {
        setError(fetchError);
      } else {
        setInvoices(fetched);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Billing</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : !invoices || invoices.length === 0 ? (
        <p className="text-gray-500">You don't have any invoices yet.</p>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {groupInvoicesByClass(invoices).map((group) => (
            <div key={group.enrollmentId} className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-base font-medium text-gray-900 mb-3">{group.className}</h2>
              <div className="space-y-3">
                {group.invoices.map((invoice) => {
                  const status = getInvoiceDisplayStatus(invoice);
                  return (
                    <div key={invoice.id} className="flex items-center justify-between border-t border-gray-100 pt-3 first:border-t-0 first:pt-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transactionTypeLabel(invoice.transaction_type)}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency((invoice.amount_due || 0) * (invoice.quantity || 1))} · Due {formatDate(invoice.due_date)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${STATUS_CLASSES[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
