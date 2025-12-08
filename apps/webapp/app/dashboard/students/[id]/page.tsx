"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClassesByStudentId, type Class } from "@/lib/classes";
import { getStudentById, updateStudent, type StudentWithEmail } from "@/lib/students";
import { getPaymentsByStudentId, type PaymentWithDetails } from "@/lib/payments";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { LogDisplay } from "@/components/ui/LogDisplay";
import { formatCurrency, formatPhone } from "@midwestea/utils";
import { createSupabaseClient } from "@midwestea/utils";

function StudentDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const studentId = params?.id as string;

    const [student, setStudent] = useState<StudentWithEmail | null>(null);
    const [originalStudent, setOriginalStudent] = useState<StudentWithEmail | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (studentId) {
            loadStudent();
            loadClasses();
            loadPayments();
        }
    }, [studentId]);

    // Handle URL params for sidebar
    useEffect(() => {
        const editParam = searchParams.get("edit");
        if (editParam === "true" && student) {
            setIsSidebarOpen(true);
        }
    }, [searchParams, student]);

    const loadStudent = async () => {
        if (!studentId) return;
        setLoading(true);
        const { student: fetchedStudent, error: fetchError } = await getStudentById(studentId);
        if (fetchError) {
            setError(fetchError);
        } else if (fetchedStudent) {
            setStudent(fetchedStudent);
            setOriginalStudent(fetchedStudent); // Store original for comparison
        }
        setLoading(false);
    };

    const loadClasses = async () => {
        if (!studentId) return;
        setLoadingClasses(true);
        const { classes: fetchedClasses, error: fetchError } = await getClassesByStudentId(studentId);
        if (fetchError) {
            console.error("Error fetching classes:", fetchError);
            setClasses([]);
        } else if (fetchedClasses) {
            setClasses(fetchedClasses);
        } else {
            setClasses([]);
        }
        setLoadingClasses(false);
    };

    const loadPayments = async () => {
        if (!studentId) return;
        setLoadingPayments(true);
        const { payments: fetchedPayments, error: fetchError } = await getPaymentsByStudentId(studentId);
        if (fetchError) {
            console.error("Error fetching payments:", fetchError);
            setPayments([]);
        } else if (fetchedPayments) {
            setPayments(fetchedPayments);
        } else {
            setPayments([]);
        }
        setLoadingPayments(false);
    };

    const handleEdit = () => {
        router.push(`/dashboard/students/${studentId}?edit=true`);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push(`/dashboard/students/${studentId}`);
    };

    const handleClassClick = (classItem: Class) => {
        router.push(`/dashboard/classes/${classItem.id}`);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student || !originalStudent) return;

        setSaving(true);

        // Generate batch_id for this save operation
        const batchId = crypto.randomUUID();

        // Perform update
        const { success, error } = await updateStudent(
            student.id,
            student.first_name,
            student.last_name,
            student.phone,
            student.t_shirt_size,
            student.emergency_contact_name,
            student.emergency_contact_phone,
            student.has_required_info,
            student.email
        );

        if (success) {
            // Log field changes
            const fieldChanges: Array<{ field_name: string; old_value: string | null; new_value: string | null }> = [];

            // Compare all editable fields
            const fieldsToCompare = [
                { key: "first_name", label: "first_name" },
                { key: "last_name", label: "last_name" },
                { key: "email", label: "email" },
                { key: "phone", label: "phone" },
                { key: "t_shirt_size", label: "t_shirt_size" },
                { key: "emergency_contact_name", label: "emergency_contact_name" },
                { key: "emergency_contact_phone", label: "emergency_contact_phone" },
                { key: "has_required_info", label: "has_required_info" },
            ];

            fieldsToCompare.forEach(({ key, label }) => {
                const oldVal = originalStudent[key as keyof StudentWithEmail];
                const newVal = student[key as keyof StudentWithEmail];
                
                // Handle different types
                let oldValue: string | null = null;
                let newValue: string | null = null;
                
                if (oldVal !== null && oldVal !== undefined) {
                    if (typeof oldVal === 'boolean') {
                        oldValue = oldVal ? 'true' : 'false';
                    } else {
                        oldValue = String(oldVal);
                    }
                }
                
                if (newVal !== null && newVal !== undefined) {
                    if (typeof newVal === 'boolean') {
                        newValue = newVal ? 'true' : 'false';
                    } else {
                        newValue = String(newVal);
                    }
                }

                if (oldValue !== newValue) {
                    fieldChanges.push({
                        field_name: label,
                        old_value: oldValue,
                        new_value: newValue,
                    });
                }
            });

            // Log changes if any
            if (fieldChanges.length > 0) {
                try {
                    const supabase = await createSupabaseClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const basePath = typeof window !== 'undefined' 
                            ? (window.location.pathname.startsWith('/app') ? '/app' : '')
                            : '';
                        await fetch(`${basePath}/api/logs/detail-update`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`,
                            },
                            body: JSON.stringify({
                                reference_id: student.id,
                                reference_type: 'student',
                                field_changes: fieldChanges,
                                batch_id: batchId,
                            }),
                        });
                    }
                } catch (logError) {
                    console.error('Failed to log changes:', logError);
                    // Don't fail the save if logging fails
                }
            }

            // Reload student data and update original
            await loadStudent();
            // Small delay to show success before closing
            setTimeout(() => {
                handleCloseSidebar();
            }, 300);
        } else {
            alert(`Failed to save: ${error}`);
        }
        setSaving(false);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const classColumns = [
        { header: "Class ID", accessorKey: "class_id" as keyof Class, className: "font-medium" },
        { header: "Class Name", accessorKey: "class_name" as keyof Class },
        {
            header: "Start Date",
            accessorKey: "class_start_date" as keyof Class,
            cell: (item: Class) => formatDate(item.class_start_date)
        },
        {
            header: "End Date",
            accessorKey: "class_close_date" as keyof Class,
            cell: (item: Class) => formatDate(item.class_close_date)
        },
        {
            header: "Online",
            accessorKey: "is_online" as keyof Class,
            cell: (item: Class) => item.is_online ? "Yes" : "No"
        },
    ];

    const paymentColumns = [
        {
            header: "Amount",
            accessorKey: "amount_cents" as keyof PaymentWithDetails,
            cell: (item: PaymentWithDetails) => formatCurrency(item.amount_cents)
        },
        {
            header: "Class",
            accessorKey: "class_name" as keyof PaymentWithDetails,
            cell: (item: PaymentWithDetails) => item.class_name || "—"
        },
        {
            header: "Status",
            accessorKey: "payment_status" as keyof PaymentWithDetails,
            cell: (item: PaymentWithDetails) => item.payment_status || "—"
        },
        {
            header: "Paid At",
            accessorKey: "paid_at" as keyof PaymentWithDetails,
            cell: (item: PaymentWithDetails) => formatDate(item.paid_at)
        },
        {
            header: "Receipt",
            accessorKey: "stripe_receipt_url" as keyof PaymentWithDetails,
            cell: (item: PaymentWithDetails) => 
                item.stripe_receipt_url ? (
                    <a 
                        href={item.stripe_receipt_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        View
                    </a>
                ) : "—"
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading student details...</p>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 items-center py-8">
                    <p className="text-red-600">{error || "Student not found"}</p>
                    <Link
                        href="/dashboard/students"
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                        Back to Students
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
                        href="/dashboard/students"
                        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                    >
                        ← Back to Students
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{student.email}</p>
                </div>
                <button
                    onClick={handleEdit}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Edit
                </button>
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{student.name || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{student.email || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{student.phone || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">T-Shirt Size</label>
                        <p className="mt-1 text-sm text-gray-900">{student.t_shirt_size || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Emergency Contact Name</label>
                        <p className="mt-1 text-sm text-gray-900">{student.emergency_contact_name || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Emergency Contact Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{student.emergency_contact_phone || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Has Required Info</label>
                        <p className="mt-1 text-sm text-gray-900">{student.has_required_info ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Stripe Customer ID</label>
                        <p className="mt-1 text-sm text-gray-900">{student.stripe_customer_id || "—"}</p>
                    </div>
                </div>
            </div>

            {/* Classes Section */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Classes</h2>
                <DataTable
                    data={classes}
                    columns={classColumns}
                    isLoading={loadingClasses}
                    onRowClick={handleClassClick}
                    emptyMessage="No classes found for this student."
                />
            </div>

            {/* Payments Section */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payments</h2>
                <DataTable
                    data={payments}
                    columns={paymentColumns}
                    isLoading={loadingPayments}
                    emptyMessage="No payments found for this student."
                />
            </div>

            {/* Activity Log Section */}
            <LogDisplay 
                referenceId={student.id} 
                referenceType="student" 
                additionalFilters={{ studentId: student.id }}
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={`Edit ${student.name}`}
            >
                {student ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text"
                                value={student.first_name || ''}
                                onChange={(e) => setStudent({ ...student, first_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text"
                                value={student.last_name || ''}
                                onChange={(e) => setStudent({ ...student, last_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={student.email || ''}
                                onChange={(e) => setStudent({ ...student, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={student.phone || ''}
                                onChange={(e) => setStudent({ ...student, phone: formatPhone(e.target.value) })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">T-Shirt Size</label>
                            <input
                                type="text"
                                value={student.t_shirt_size || ''}
                                onChange={(e) => setStudent({ ...student, t_shirt_size: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                            <input
                                type="text"
                                value={student.emergency_contact_name || ''}
                                onChange={(e) => setStudent({ ...student, emergency_contact_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                            <input
                                type="tel"
                                value={student.emergency_contact_phone || ''}
                                onChange={(e) => setStudent({ ...student, emergency_contact_phone: formatPhone(e.target.value) })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="hasRequiredInfo"
                                checked={student.has_required_info || false}
                                onChange={(e) => setStudent({ ...student, has_required_info: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor="hasRequiredInfo" className="text-sm font-medium text-gray-700">Has Required Info</label>
                        </div>

                        <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseSidebar}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-500">Student not found.</p>
                )}
            </DetailSidebar>
        </div>
    );
}

export default function StudentDetailPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <StudentDetailContent />
        </Suspense>
    );
}

