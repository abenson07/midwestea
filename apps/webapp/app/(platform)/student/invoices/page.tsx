"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getMyProgramInvoices,
  getInvoiceDisplayStatus,
  payInvoice,
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
  refunded: "bg-blue-100 text-gray-800",
};

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
}

function transactionTypeLabel(type: string | null) {
  if (type === "registration_fee") return "Registration Fee";
  if (type === "tuition_a") return "First Tuition Payment";
  if (type === "tuition_b") return "Second Tuition Payment";
  return type || "Invoice";
}

function statusRank(status: string): number {
  if (status === "past_due") return 0;
  if (status === "pending") return 1;
  return 2;
}

function StudentInvoicesPageContent() {
  const searchParams = useSearchParams();
  const justPaid = searchParams.get("paid") === "1";

  const [invoices, setInvoices] = useState<StudentInvoice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
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

  const sorted = [...(invoices || [])].sort((a, b) => {
    const rank = statusRank(getInvoiceDisplayStatus(a)) - statusRank(getInvoiceDisplayStatus(b));
    if (rank !== 0) return rank;
    return (a.due_date || "").localeCompare(b.due_date || "");
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Invoices</h1>
      {justPaid && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          Payment received — it may take a moment to appear below.
        </div>
      )}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : sorted.length === 0 ? (
        <p className="text-gray-500">You don't have any invoices yet.</p>
      ) : (
        <div className="space-y-3">
          {sorted.map((invoice) => {
            const status = getInvoiceDisplayStatus(invoice);
            const isOpen = status === "pending" || status === "past_due";
            return (
              <div
                key={invoice.id}
                className={`bg-white border rounded-lg p-6 ${
                  status === "past_due" ? "border-red-300" : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-medium text-gray-900">
                      {invoice.class_name || "Invoice"} · {transactionTypeLabel(invoice.transaction_type)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatCurrency((invoice.amount_due || 0) * (invoice.quantity || 1))}
                      {isOpen ? ` · Due ${formatDate(invoice.due_date)}` : ` · ${formatDate(invoice.due_date)}`}
                    </p>
                    {status === "past_due" && (
                      <p className="mt-1 text-sm font-semibold text-red-700">Past due</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${STATUS_CLASSES[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                    {isOpen && (
                      <button
                        onClick={() => handlePay(invoice.id)}
                        disabled={payingId === invoice.id}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                      >
                        {payingId === invoice.id ? "Redirecting..." : "Pay"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StudentInvoicesPage() {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading...</p>}>
      <StudentInvoicesPageContent />
    </Suspense>
  );
}
