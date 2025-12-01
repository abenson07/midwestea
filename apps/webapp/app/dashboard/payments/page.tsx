"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

// Placeholder type for Payment - will be replaced when types are defined
type Payment = {
    id: string;
    amount: number;
    status: string;
    date: string;
    student_name: string;
    class_name: string;
    instructor_name: string;
};

function PaymentsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        loadPayments();
    }, []);

    // Handle URL params for deep linking
    useEffect(() => {
        const paymentId = searchParams.get("paymentId");
        if (paymentId) {
            const payment = payments.find(p => p.id === paymentId);
            if (payment) {
                setSelectedPayment(payment);
                setIsSidebarOpen(true);
            }
        } else {
            setIsSidebarOpen(false);
            setSelectedPayment(null);
        }
    }, [searchParams, payments]);

    const loadPayments = async () => {
        setLoading(true);
        // TODO: Replace with actual API call when payments table is implemented
        // For now, use placeholder data
        setPayments([]);
        setLoading(false);
    };

    const handleRowClick = (payment: Payment) => {
        router.push(`/payments?paymentId=${payment.id}`);
        setSelectedPayment(payment);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push("/payments");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const formatCurrency = (cents: number) => {
        return `$${(cents / 100).toFixed(2)}`;
    };

    const columns = [
        { 
            header: "Amount", 
            accessorKey: "amount" as keyof Payment,
            cell: (item: Payment) => formatCurrency(item.amount),
            className: "font-medium"
        },
        { 
            header: "Date", 
            accessorKey: "date" as keyof Payment,
            cell: (item: Payment) => formatDate(item.date)
        },
        { 
            header: "Status", 
            accessorKey: "status" as keyof Payment,
            cell: (item: Payment) => (
                <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === "paid" ? "bg-green-100 text-green-800" :
                    item.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                }`}>
                    {item.status}
                </span>
            )
        },
        { header: "Student", accessorKey: "student_name" as keyof Payment },
        { header: "Class", accessorKey: "class_name" as keyof Payment },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                    <p className="text-sm text-gray-500 mt-1">List of payments</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            {payments.length === 0 && !loading ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No payments</h3>
                    <p className="mt-1 text-sm text-gray-500">Payments will be displayed here once the payments table is implemented.</p>
                </div>
            ) : (
                <DataTable
                    data={payments}
                    columns={columns}
                    isLoading={loading}
                    onRowClick={handleRowClick}
                    emptyMessage="No payments found."
                />
            )}

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={selectedPayment ? `Payment Details` : "Payment"}
            >
                {selectedPayment ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Amount</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(selectedPayment.amount)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Status</label>
                            <p className="mt-1 text-sm text-gray-900">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    selectedPayment.status === "paid" ? "bg-green-100 text-green-800" :
                                    selectedPayment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {selectedPayment.status}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Date</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPayment.date)}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Student</label>
                                <a
                                    href={`/students/${selectedPayment.student_name}`}
                                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {selectedPayment.student_name} →
                                </a>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Class</label>
                                <a
                                    href={`/dashboard/classes/${selectedPayment.class_name}`}
                                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {selectedPayment.class_name} →
                                </a>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Instructor</label>
                                <a
                                    href={`/instructors/${selectedPayment.instructor_name}`}
                                    className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    {selectedPayment.instructor_name} →
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Payment not found.</p>
                )}
            </DetailSidebar>
        </div>
    );
}

export default function PaymentsPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                        <p className="text-sm text-gray-500 mt-1">List of payments</p>
                    </div>
                </div>
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <PaymentsPageContent />
        </Suspense>
    );
}

