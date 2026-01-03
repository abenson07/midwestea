"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { 
    getTransactions, 
    updateTransactionStatus, 
    type TransactionWithDetails,
} from "@/lib/payments";
import { formatCurrency } from "@midwestea/utils";

function TransactionsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // Sidebar state
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithDetails | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, []);

    // Handle URL params for deep linking
    useEffect(() => {
        const transactionId = searchParams.get("transactionId");
        if (transactionId) {
            const transaction = transactions.find(t => t.id === transactionId);
            if (transaction) {
                setSelectedTransaction(transaction);
                setIsSidebarOpen(true);
            }
        } else {
            setIsSidebarOpen(false);
            setSelectedTransaction(null);
        }
    }, [searchParams, transactions]);

    const loadTransactions = async () => {
        setLoading(true);
        setError("");
        try {
            console.log("[TransactionsPageContent] Loading transactions...");
            const { transactions: fetchedTransactions, error: fetchError } = await getTransactions();
            console.log("[TransactionsPageContent] Transactions response:", { fetchedTransactions, fetchError });
            if (fetchError) {
                console.error("[TransactionsPageContent] Error loading transactions:", fetchError);
                setError(fetchError);
                setTransactions([]);
            } else if (fetchedTransactions) {
                console.log("[TransactionsPageContent] Transformed transactions:", fetchedTransactions);
                setTransactions(fetchedTransactions);
            } else {
                console.log("[TransactionsPageContent] No transactions returned");
                setTransactions([]);
            }
        } catch (err: any) {
            console.error("[TransactionsPageContent] Exception loading transactions:", err);
            setError(err.message || "Failed to load transactions");
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };


    const handleRowClick = (transaction: TransactionWithDetails) => {
        router.push(`/dashboard/payments?transactionId=${transaction.id}`);
        setSelectedTransaction(transaction);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push("/dashboard/payments");
    };

    const handleMarkAsPaid = async () => {
        if (!selectedTransaction) return;
        
        setIsUpdating(true);
        try {
            const { success, error } = await updateTransactionStatus(selectedTransaction.id, 'paid');
            if (error) {
                setError(error);
            } else if (success) {
                // Reload transactions to reflect the update
                await loadTransactions();
                // Update the selected transaction in state
                setSelectedTransaction({
                    ...selectedTransaction,
                    transaction_status: 'paid'
                });
            }
        } catch (err: any) {
            setError(err.message || "Failed to mark transaction as paid");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelInvoice = async () => {
        if (!selectedTransaction) return;
        
        if (!confirm('Are you sure you want to cancel this invoice?')) {
            return;
        }
        
        setIsUpdating(true);
        try {
            const { success, error } = await updateTransactionStatus(selectedTransaction.id, 'cancelled');
            if (error) {
                setError(error);
            } else if (success) {
                // Reload transactions to reflect the update
                await loadTransactions();
                // Update the selected transaction in state
                setSelectedTransaction({
                    ...selectedTransaction,
                    transaction_status: 'cancelled'
                });
            }
        } catch (err: any) {
            setError(err.message || "Failed to cancel invoice");
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };


    const getTransactionTypeLabel = (type: string | null): string => {
        if (type === 'registration_fee') return 'Registration Fee';
        if (type === 'tuition_a') return 'First Invoice';
        if (type === 'tuition_b') return 'Second Invoice';
        return type || 'N/A';
    };

    const calculateAmountDue = (transaction: TransactionWithDetails): number => {
        const quantity = transaction.quantity || 1;
        const amountDue = transaction.amount_due || 0;
        return quantity * amountDue;
    };

    const columns = [
        { 
            header: "Invoice Number", 
            accessorKey: "invoice_number" as keyof TransactionWithDetails,
            cell: (item: TransactionWithDetails) => item.invoice_number || "N/A",
            className: "font-medium"
        },
        { 
            header: "Student Name", 
            accessorKey: "student_name" as keyof TransactionWithDetails,
            cell: (item: TransactionWithDetails) => item.student_name || "Unknown Student"
        },
        { 
            header: "Student Email", 
            accessorKey: "student_email" as keyof TransactionWithDetails,
            cell: (item: TransactionWithDetails) => item.student_email || "N/A"
        },
        { 
            header: "Class ID", 
            accessorKey: "class_id_display" as keyof TransactionWithDetails,
            cell: (item: TransactionWithDetails) => item.class_id_display || "N/A"
        },
        { 
            header: "Type", 
            accessorKey: "transaction_type" as keyof TransactionWithDetails,
            cell: (item: TransactionWithDetails) => getTransactionTypeLabel(item.transaction_type)
        },
        { 
            header: "Amount Due", 
            accessorKey: "amount_due" as keyof TransactionWithDetails,
            cell: (item: TransactionWithDetails) => formatCurrency(calculateAmountDue(item)),
            className: "font-medium"
        },
        { 
            header: "Status", 
            accessorKey: "transaction_status" as keyof TransactionWithDetails,
            cell: (item: TransactionWithDetails) => (
                <span className={`px-2 py-1 text-xs rounded-full ${
                    item.transaction_status === "paid" ? "bg-green-100 text-green-800" :
                    item.transaction_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    item.transaction_status === "cancelled" ? "bg-gray-100 text-gray-800" :
                    item.transaction_status === "refunded" ? "bg-blue-100 text-blue-800" :
                    "bg-red-100 text-red-800"
                }`}>
                    {item.transaction_status || "N/A"}
                </span>
            )
        },
        { 
            header: "Due Date", 
            accessorKey: "due_date" as keyof TransactionWithDetails,
            cell: (item: TransactionWithDetails) => formatDate(item.due_date)
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                    <p className="text-sm text-gray-500 mt-1">List of transactions</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* All Transactions Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">All Transactions</h2>
                {transactions.length === 0 && !loading ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions</h3>
                        <p className="mt-1 text-sm text-gray-500">Transactions will be displayed here once they are created.</p>
                    </div>
                ) : (
                    <DataTable
                        data={transactions}
                        columns={columns}
                        isLoading={loading}
                        onRowClick={handleRowClick}
                        emptyMessage="No transactions found."
                    />
                )}
            </div>

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={selectedTransaction ? `Transaction Details` : "Transaction"}
            >
                {selectedTransaction ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Invoice Number</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{selectedTransaction.invoice_number || "N/A"}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Amount Due</label>
                            <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(calculateAmountDue(selectedTransaction))}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Status</label>
                            <p className="mt-1 text-sm text-gray-900">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    selectedTransaction.transaction_status === "paid" ? "bg-green-100 text-green-800" :
                                    selectedTransaction.transaction_status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                    selectedTransaction.transaction_status === "cancelled" ? "bg-gray-100 text-gray-800" :
                                    selectedTransaction.transaction_status === "refunded" ? "bg-blue-100 text-blue-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {selectedTransaction.transaction_status || "N/A"}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Type</label>
                            <p className="mt-1 text-sm text-gray-900">{getTransactionTypeLabel(selectedTransaction.transaction_type)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Due Date</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTransaction.due_date)}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Student Name</label>
                                {selectedTransaction.student_id ? (
                                    <a
                                        href={`/dashboard/students/${selectedTransaction.student_id}`}
                                        className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        {selectedTransaction.student_name || "N/A"} →
                                    </a>
                                ) : (
                                    <p className="mt-1 text-sm text-gray-900">{selectedTransaction.student_name || "N/A"}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Student Email</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedTransaction.student_email || "N/A"}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Class ID</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedTransaction.class_id_display || "N/A"}</p>
                            </div>
                        </div>
                        {(selectedTransaction.transaction_status !== 'paid' && selectedTransaction.transaction_status !== 'cancelled') && (
                            <div className="pt-4 border-t border-gray-200 space-y-3">
                                <button
                                    onClick={handleMarkAsPaid}
                                    disabled={isUpdating}
                                    className={`w-full px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                                        isUpdating
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-green-600 hover:bg-green-700"
                                    }`}
                                >
                                    {isUpdating ? "Marking as Paid..." : "Mark as Paid"}
                                </button>
                                <button
                                    onClick={handleCancelInvoice}
                                    disabled={isUpdating}
                                    className={`w-full px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                                        isUpdating
                                            ? "border-gray-300 text-gray-400 cursor-not-allowed"
                                            : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                                    }`}
                                >
                                    {isUpdating ? "Cancelling..." : "Cancel Invoice"}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">Transaction not found.</p>
                )}
            </DetailSidebar>
        </div>
    );
}

export default function TransactionsPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
                        <p className="text-sm text-gray-500 mt-1">List of transactions</p>
                    </div>
                </div>
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <TransactionsPageContent />
        </Suspense>
    );
}


