"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClassesByStudentId, type Class } from "@/lib/classes";
import { getStudentById, updateStudent, type StudentWithEmail } from "@/lib/students";
import { getPaymentsByStudentId, type PaymentWithDetails, getTransactionsByEnrollment, type TransactionWithDetails } from "@/lib/payments";
import { getEnrollmentByStudentAndClass } from "@/lib/enrollments";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { LogDisplay } from "@/components/ui/LogDisplay";
import { formatCurrency, formatPhone } from "@midwestea/utils";
import { createSupabaseClient } from "@midwestea/utils";
import type { Enrollment } from "@midwestea/types";

// Extended class type with enrollment and payment info
type ClassWithEnrollment = Class & {
    enrollment_id: string;
    enrolled_at: string | null;
    payment_status: string;
};

function StudentDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const studentId = params?.id as string;

    const [student, setStudent] = useState<StudentWithEmail | null>(null);
    const [originalStudent, setOriginalStudent] = useState<StudentWithEmail | null>(null);
    const [classes, setClasses] = useState<ClassWithEnrollment[]>([]);
    const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Enrollment detail sidebar state
    const [isEnrollmentSidebarOpen, setIsEnrollmentSidebarOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [enrollmentTransactions, setEnrollmentTransactions] = useState<TransactionWithDetails[]>([]);
    const [loadingEnrollment, setLoadingEnrollment] = useState(false);

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

    const calculatePaymentStatus = (transactions: TransactionWithDetails[]): string => {
        if (!transactions || transactions.length === 0) {
            return "No payments yet";
        }

        const regFee = transactions.find(t => t.transaction_type === 'registration_fee');
        const tuitionA = transactions.find(t => t.transaction_type === 'tuition_a');
        const tuitionB = transactions.find(t => t.transaction_type === 'tuition_b');

        const now = new Date();
        
        // Check for past due transactions
        const checkPastDue = (transaction: TransactionWithDetails | undefined): boolean => {
            if (!transaction) return false;
            if (transaction.transaction_status === 'paid') return false;
            if (!transaction.due_date) return false;
            return new Date(transaction.due_date) < now;
        };

        const regFeePastDue = checkPastDue(regFee);
        const tuitionAPastDue = checkPastDue(tuitionA);
        const tuitionBPastDue = checkPastDue(tuitionB);

        if (regFeePastDue) return "Registration fee past due";
        if (tuitionAPastDue) return "Tuition A past due";
        if (tuitionBPastDue) return "Tuition B past due";

        const regFeePaid = regFee?.transaction_status === 'paid';
        const tuitionAPaid = tuitionA?.transaction_status === 'paid';
        const tuitionBPaid = tuitionB?.transaction_status === 'paid';

        // Check if all are paid
        const allTransactions = [regFee, tuitionA, tuitionB].filter(Boolean);
        const allPaid = allTransactions.every(t => t.transaction_status === 'paid');

        if (allPaid) {
            return "All paid";
        }

        // Check if registration fee and tuition A are paid
        if (regFeePaid && tuitionAPaid && !tuitionBPaid) {
            return "First payment paid";
        }

        // Check if only registration fee is paid
        if (regFeePaid && !tuitionAPaid) {
            return "Registration fee paid";
        }

        return "Pending";
    };

    const loadClasses = async () => {
        if (!studentId) return;
        setLoadingClasses(true);
        
        // Fetch enrollments with classes
        const supabase = await createSupabaseClient();
        const { data: enrollments, error: enrollmentError } = await supabase
            .from("enrollments")
            .select(`
                id,
                enrolled_at,
                class_id,
                classes (*)
            `)
            .eq("student_id", studentId)
            .order("enrolled_at", { ascending: false });

        if (enrollmentError) {
            console.error("Error fetching enrollments:", enrollmentError);
            setClasses([]);
            setLoadingClasses(false);
            return;
        }

        if (!enrollments || enrollments.length === 0) {
            setClasses([]);
            setLoadingClasses(false);
            return;
        }

        // Fetch transactions for each enrollment and calculate payment status
        const classesWithStatus: ClassWithEnrollment[] = await Promise.all(
            enrollments.map(async (enrollment: any) => {
                const classRecord = enrollment.classes;
                if (!classRecord) return null;

                // Fetch transactions for this enrollment
                const { transactions } = await getTransactionsByEnrollment(enrollment.id);
                const paymentStatus = calculatePaymentStatus(transactions || []);

                return {
                    ...(classRecord as Class),
                    enrollment_id: enrollment.id,
                    enrolled_at: enrollment.enrolled_at,
                    payment_status: paymentStatus,
                };
            })
        );

        const validClasses = classesWithStatus.filter((c): c is ClassWithEnrollment => c !== null);
        setClasses(validClasses);
        setLoadingClasses(false);
    };

    const getNextDueDate = async (enrollmentId: string): Promise<string | null> => {
        const { transactions } = await getTransactionsByEnrollment(enrollmentId);
        if (!transactions || transactions.length === 0) return null;
        
        const now = new Date();
        const unpaidTransactions = transactions.filter(t => t.transaction_status !== 'paid' && t.due_date);
        
        if (unpaidTransactions.length === 0) return null;
        
        // Sort by due date and get the earliest one
        const sortedByDueDate = unpaidTransactions
            .map(t => ({ dueDate: new Date(t.due_date!), transaction: t }))
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
        
        return sortedByDueDate[0]?.dueDate.toISOString() || null;
    };

    const loadPayments = async () => {
        if (!studentId) return;
        setLoadingPayments(true);
        const { payments: fetchedPayments, error: fetchError } = await getPaymentsByStudentId(studentId);
        if (fetchError) {
            console.error("Error fetching payments:", fetchError);
            setPayments([]);
            setLoadingPayments(false);
            return;
        }
        
        if (!fetchedPayments || fetchedPayments.length === 0) {
            setPayments([]);
            setLoadingPayments(false);
            return;
        }

        // Add next due date and due date info to each payment
        const paymentsWithDueDate = await Promise.all(
            fetchedPayments.map(async (payment) => {
                const nextDueDate = await getNextDueDate(payment.enrollment_id);
                // Get transactions to find the due date for this specific payment
                const { transactions } = await getTransactionsByEnrollment(payment.enrollment_id);
                // Find the transaction that matches this payment (by amount or payment intent)
                const matchingTransaction = transactions?.find(
                    t => t.stripe_payment_intent_id === payment.stripe_payment_intent_id ||
                         (t.amount_due === payment.amount_cents && !payment.stripe_payment_intent_id)
                );
                
                return {
                    ...payment,
                    next_due_date: nextDueDate,
                    due_date: matchingTransaction?.due_date || null,
                };
            })
        );

        setPayments(paymentsWithDueDate);
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

    const handleClassClick = async (classItem: Class) => {
        if (!studentId) return;
        
        setLoadingEnrollment(true);
        setIsEnrollmentSidebarOpen(true);
        setSelectedClass(classItem);
        
        // Fetch enrollment
        const { enrollment, error: enrollmentError } = await getEnrollmentByStudentAndClass(studentId, classItem.id);
        
        if (enrollmentError) {
            console.error("Error fetching enrollment:", enrollmentError);
            setSelectedEnrollment(null);
            setEnrollmentTransactions([]);
        } else if (enrollment) {
            setSelectedEnrollment(enrollment);
            
            // Fetch transactions for this enrollment
            const { transactions, error: transactionsError } = await getTransactionsByEnrollment(enrollment.id);
            
            if (transactionsError) {
                console.error("Error fetching transactions:", transactionsError);
                setEnrollmentTransactions([]);
            } else {
                setEnrollmentTransactions(transactions || []);
            }
        } else {
            setSelectedEnrollment(null);
            setEnrollmentTransactions([]);
        }
        
        setLoadingEnrollment(false);
    };
    
    const handleCloseEnrollmentSidebar = () => {
        setIsEnrollmentSidebarOpen(false);
        setSelectedEnrollment(null);
        setSelectedClass(null);
        setEnrollmentTransactions([]);
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
            student.full_name,
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
                { key: "full_name", label: "full_name" },
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
        { header: "Class ID", accessorKey: "class_id" as keyof ClassWithEnrollment, className: "font-medium" },
        { header: "Class Name", accessorKey: "class_name" as keyof ClassWithEnrollment },
        {
            header: "Enrolled Date",
            accessorKey: "enrolled_at" as keyof ClassWithEnrollment,
            cell: (item: ClassWithEnrollment) => formatDate(item.enrolled_at)
        },
        {
            header: "Payment Status",
            accessorKey: "payment_status" as keyof ClassWithEnrollment,
            cell: (item: ClassWithEnrollment) => {
                const status = item.payment_status;
                const isPastDue = status.includes("past due");
                const isAllPaid = status === "All paid";
                const isFirstPaid = status === "First payment paid";
                
                return (
                    <span className={`text-sm ${
                        isPastDue 
                            ? "text-red-600 font-medium" 
                            : isAllPaid 
                                ? "text-green-600 font-medium"
                                : isFirstPaid
                                    ? "text-blue-600 font-medium"
                                    : "text-gray-600"
                    }`}>
                        {status}
                    </span>
                );
            }
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
            accessorKey: "paid_at" as keyof PaymentWithDetails & { due_date?: string | null },
            cell: (item: PaymentWithDetails & { due_date?: string | null }) => {
                if (item.paid_at) {
                    return formatDate(item.paid_at);
                }
                
                // Check if overdue
                if (item.due_date) {
                    const dueDate = new Date(item.due_date);
                    const now = new Date();
                    if (dueDate < now) {
                        return (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                                Past due
                            </span>
                        );
                    }
                }
                
                // Show pending chip
                return (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">
                        Pending
                    </span>
                );
            }
        },
        {
            header: "Next Due Date",
            accessorKey: "next_due_date" as keyof PaymentWithDetails & { next_due_date?: string | null },
            cell: (item: PaymentWithDetails & { next_due_date?: string | null }) => 
                formatDate(item.next_due_date)
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
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                value={student.full_name || ''}
                                onChange={(e) => setStudent({ ...student, full_name: e.target.value })}
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

            {/* Enrollment Detail Sidebar */}
            <DetailSidebar
                isOpen={isEnrollmentSidebarOpen}
                onClose={handleCloseEnrollmentSidebar}
                title={selectedClass ? selectedClass.class_name || "Enrollment Details" : "Enrollment Details"}
            >
                {loadingEnrollment ? (
                    <div className="flex justify-center py-8">
                        <p className="text-gray-500">Loading enrollment details...</p>
                    </div>
                ) : selectedClass && selectedEnrollment ? (
                    <div className="space-y-6">
                        {/* Class Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Class Information</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Class Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedClass.class_name || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Class ID</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedClass.class_id || "—"}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Class Start Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedClass.class_start_date)}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Class End Date</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedClass.class_close_date)}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500">Date Enrolled</label>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedEnrollment.enrolled_at)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Payments Section */}
                        <div className="pt-4 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payments</h3>
                            {enrollmentTransactions.length === 0 ? (
                                <p className="text-sm text-gray-500">No transactions found for this enrollment.</p>
                            ) : (
                                <div className="space-y-4">
                                    {enrollmentTransactions.map((transaction) => {
                                        const transactionTypeLabel = 
                                            transaction.transaction_type === 'registration_fee' ? 'Registration Fee' :
                                            transaction.transaction_type === 'tuition_a' ? 'Tuition A' :
                                            transaction.transaction_type === 'tuition_b' ? 'Tuition B' :
                                            transaction.transaction_type || 'Unknown';
                                        
                                        const isPaid = transaction.transaction_status === 'paid';
                                        const dateLabel = isPaid ? 'Paid Date' : 'Due Date';
                                        const dateValue = isPaid ? transaction.payment_date : transaction.due_date;
                                        
                                        return (
                                            <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-sm font-medium text-gray-900">{transactionTypeLabel}</h4>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        isPaid 
                                                            ? "bg-green-100 text-green-800" 
                                                            : "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                        {isPaid ? "Paid" : "Pending"}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500">Amount Due</label>
                                                        <p className="mt-1 text-sm text-gray-900">
                                                            {transaction.amount_due ? formatCurrency(transaction.amount_due) : "—"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500">{dateLabel}</label>
                                                        <p className="mt-1 text-sm text-gray-900">{formatDate(dateValue)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ) : selectedClass ? (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No enrollment found for this class.</p>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No class selected.</p>
                    </div>
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

