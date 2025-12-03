"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getClassById, type Class } from "@/lib/classes";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatCurrency } from "@midwestea/utils";

// Placeholder types - will be replaced when types are defined
type Student = {
    id: string;
    name: string;
    email: string;
};

type Payment = {
    id: string;
    amount: number;
    status: string;
    date: string;
};

function StudentClassDetailContent() {
    const router = useRouter();
    const params = useParams();
    const studentId = params?.id as string;
    const classId = params?.classId as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [classData, setClassData] = useState<Class | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Payment sidebar state
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isPaymentSidebarOpen, setIsPaymentSidebarOpen] = useState(false);

    useEffect(() => {
        if (studentId && classId) {
            loadData();
        }
    }, [studentId, classId]);

    const loadData = async () => {
        setLoading(true);
        // TODO: Replace with actual API calls when tables are implemented
        // For now, use placeholders
        setStudent({
            id: studentId,
            name: "Student Name",
            email: "student@example.com"
        });

        const { class: fetchedClass, error: fetchError } = await getClassById(classId);
        if (fetchError) {
            setError(fetchError);
        } else if (fetchedClass) {
            setClassData(fetchedClass);
        }

        // TODO: Load payments for this student-class combination
        setPayments([]);

        setLoading(false);
    };

    const handlePaymentClick = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsPaymentSidebarOpen(true);
    };

    const handleClosePaymentSidebar = () => {
        setIsPaymentSidebarOpen(false);
        setSelectedPayment(null);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };


    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading student class details...</p>
                </div>
            </div>
        );
    }

    if (!student || !classData) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 items-center py-8">
                    <p className="text-red-600">{error || "Student or class not found"}</p>
                    <Link
                        href={`/dashboard/students/${studentId}`}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                        Back to Student
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Link
                        href={`/dashboard/students/${studentId}`}
                        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                    >
                        ← Back to {student.name}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{student.name} - {classData.class_name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{classData.class_id}</p>
                </div>
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Student</label>
                        <p className="mt-1 text-sm text-gray-900">{student.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Class</label>
                        <p className="mt-1 text-sm text-gray-900">{classData.class_name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Enrollment Date</label>
                        <p className="mt-1 text-sm text-gray-900">—</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Status</label>
                        <p className="mt-1 text-sm text-gray-900">—</p>
                    </div>
                </div>
            </div>

            {/* Attendance Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h2>
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-sm text-gray-500">Attendance tracking will be displayed here once the attendance table is implemented.</p>
                </div>
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Completion</label>
                        <p className="mt-1 text-sm text-gray-900">—</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Last Activity</label>
                        <p className="mt-1 text-sm text-gray-900">—</p>
                    </div>
                </div>
            </div>

            {/* Payments Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
                {payments.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <p className="text-sm text-gray-500">No payments found. Payments will be displayed here once the payments table is implemented.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                onClick={() => handlePaymentClick(payment)}
                                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                                    <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                    payment.status === "paid" ? "bg-green-100 text-green-800" :
                                    payment.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {payment.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800">
                        Mark Attendance
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        Send Message
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                        View Class
                    </button>
                </div>
            </div>

            {/* Payment Detail Sidebar */}
            <DetailSidebar
                isOpen={isPaymentSidebarOpen}
                onClose={handleClosePaymentSidebar}
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
                            <p className="mt-1 text-sm text-gray-900">{selectedPayment.status}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Date</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPayment.date)}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                            <Link
                                href={`/payments?paymentId=${selectedPayment.id}`}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                View Full Payment Details →
                            </Link>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">Payment not found.</p>
                )}
            </DetailSidebar>
        </div>
    );
}

export default function StudentClassDetailPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <StudentClassDetailContent />
        </Suspense>
    );
}

