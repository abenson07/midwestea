"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClassById, updateClass, deleteClass, getPrograms, getCourses, getCourseById, type Class, type Course } from "@/lib/classes";
import { getStudentsByClassId, getStudents, getStudentEmailFromAuth } from "@/lib/students";
import { getTransactionsByEnrollment, type TransactionWithDetails } from "@/lib/payments";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { EnrollmentPaymentDetail } from "@/components/ui/EnrollmentPaymentDetail";
import { LogDisplay } from "@/components/ui/LogDisplay";
import { UndoToast } from "@/components/ui/UndoToast";
import { CreateClassModal, type ClassFormData } from "@/components/ui/CreateClassModal";
import { ViewMarketingPageLink } from "@/components/ui/ViewMarketingPageLink";
import { getClassPrerequisites } from "@/lib/prerequisites";
import { formatCurrency, formatPhone } from "@midwestea/utils";
import { createSupabaseClient } from "@midwestea/utils";
import type { Enrollment, ClassPrerequisiteWithType } from "@midwestea/types";
import { PREREQUISITE_INPUT_TYPE_LABELS } from "@midwestea/types";

// Client-safe/RLS replacement for lib/enrollments.ts's getEnrollmentByStudentAndClass,
// which uses the service-role admin client and throws when called from the browser
// (no SUPABASE_SERVICE_ROLE_KEY client-side) — that throw gets swallowed internally,
// silently returning enrollment: null, which breaks both the roster's payment-status
// column and the remove-student refund-prompt logic below (BEN-1178/1181).
async function fetchEnrollmentClientSafe(
    studentId: string,
    classId: string
): Promise<{ enrollment: Enrollment | null; error: string | null }> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", studentId)
        .eq("class_id", classId)
        .maybeSingle();
    if (error) {
        return { enrollment: null, error: error.message };
    }
    return { enrollment: (data as Enrollment) ?? null, error: null };
}

const formatClassDate = (dateString: string): { rendered: string; strategy: "date-only" | "timestamp"; parsedIso: string } => {
    // Date-only values should display as literal calendar dates, independent of viewer timezone.
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split("-").map(Number);
        return {
            rendered: `${month}/${day}/${year}`,
            strategy: "date-only",
            parsedIso: "n/a",
        };
    }

    const date = new Date(dateString);
    return {
        rendered: Number.isNaN(date.getTime())
            ? "Invalid Date"
            : date.toLocaleDateString("en-US", { timeZone: "America/Chicago" }),
        strategy: "timestamp",
        parsedIso: Number.isNaN(date.getTime()) ? "invalid" : date.toISOString(),
    };
};

const calculateStudentPaymentStatus = (transactions: TransactionWithDetails[]): string => {
    if (!transactions || transactions.length === 0) return "No invoices yet";
    const now = new Date();
    const isPastDue = (t: TransactionWithDetails) =>
        t.transaction_status !== 'paid' && !!t.due_date && new Date(t.due_date) < now;
    if (transactions.some(isPastDue)) return "Past due";
    if (transactions.every((t) => t.transaction_status === 'paid')) return "All paid";
    if (transactions.some((t) => t.transaction_status === 'paid')) return "Partially paid";
    return "Pending";
};

// Student type for UI display
type Student = {
    id: string;
    name: string;
    email: string;
};

type StudentWithBilling = Student & {
    paymentStatus: string;
    transactions: TransactionWithDetails[];
};

type PendingUndoRemoval = {
    studentId: string;
    studentName: string;
};

function ClassDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const classId = params?.id as string;

    const [classData, setClassData] = useState<Class | null>(null);
    const [originalClassData, setOriginalClassData] = useState<Class | null>(null);
    const [classPrerequisites, setClassPrerequisites] = useState<ClassPrerequisiteWithType[]>([]);
    const [loadingClassPrerequisites, setLoadingClassPrerequisites] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [studentsWithBilling, setStudentsWithBilling] = useState<StudentWithBilling[]>([]);
    const [isInvoiceSidebarOpen, setIsInvoiceSidebarOpen] = useState(false);
    const [selectedStudentBilling, setSelectedStudentBilling] = useState<StudentWithBilling | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<string>("");
    const [addingStudent, setAddingStudent] = useState(false);
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
    const studentDropdownRef = useRef<HTMLDivElement>(null);

    // Add new student form (in sidebar)
    const [newStudentName, setNewStudentName] = useState("");
    const [newStudentEmail, setNewStudentEmail] = useState("");
    const [newStudentPhone, setNewStudentPhone] = useState("");
    const [creatingStudent, setCreatingStudent] = useState(false);
    const [createStudentError, setCreateStudentError] = useState<string | null>(null);

    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [programs, setPrograms] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    
    // Navigation context
    const [fromContext, setFromContext] = useState<'course' | 'program' | 'classes' | null>(null);
    const [parentEntity, setParentEntity] = useState<Course | null>(null);
    const [pendingUndoRemoval, setPendingUndoRemoval] = useState<PendingUndoRemoval | null>(null);
    const [undoingRemoval, setUndoingRemoval] = useState(false);

    // Remove-student refund modal state
    const [removeStudentModal, setRemoveStudentModal] = useState<{
        studentId: string;
        studentName: string;
        hasPaidTransactions: boolean;
        paidTotal: number;
    } | null>(null);
    const [refundPercentageInput, setRefundPercentageInput] = useState<string>("");
    const [isRemovingStudent, setIsRemovingStudent] = useState(false);

    useEffect(() => {
        if (classId) {
            loadClass();
            loadStudents();
            loadClassPrerequisites();
        }
        loadPrograms();
        loadCourses();
    }, [classId]);

    // Close student dropdown when clicking outside
    useEffect(() => {
        if (!studentDropdownOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) {
                setStudentDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [studentDropdownOpen]);

    // Load navigation context from query params
    useEffect(() => {
        const from = searchParams.get("from");
        const courseId = searchParams.get("courseId");
        const programId = searchParams.get("programId");
        
        if (from === 'course' && courseId) {
            setFromContext('course');
            loadParentEntity(courseId);
        } else if (from === 'program' && programId) {
            setFromContext('program');
            loadParentEntity(programId);
        } else {
            setFromContext('classes');
        }
    }, [searchParams]);

    const loadParentEntity = async (id: string) => {
        const { course } = await getCourseById(id);
        if (course) {
            setParentEntity(course);
        }
    };

    const loadPrograms = async () => {
        const { programs: fetchedPrograms } = await getPrograms();
        if (fetchedPrograms) {
            setPrograms(fetchedPrograms);
        }
    };

    const loadCourses = async () => {
        const { courses: fetchedCourses } = await getCourses();
        if (fetchedCourses) {
            setCourses(fetchedCourses);
        }
    };

    // Handle URL params for modal
    useEffect(() => {
        const editParam = searchParams.get("edit");
        if (editParam === "true" && classData) {
            setIsEditModalOpen(true);
        }
    }, [searchParams, classData]);

    const loadClass = async () => {
        if (!classId) return;
        setLoading(true);
        const { class: fetchedClass, error: fetchError } = await getClassById(classId);
        if (fetchError) {
            setError(fetchError);
        } else if (fetchedClass) {
            setClassData(fetchedClass);
            setOriginalClassData(fetchedClass); // Store original for comparison
        }
        setLoading(false);
    };

    const loadClassPrerequisites = async () => {
        if (!classId) return;
        setLoadingClassPrerequisites(true);
        const { classPrerequisites: fetched, error: fetchError } = await getClassPrerequisites(classId);
        if (!fetchError && fetched) {
            setClassPrerequisites(fetched);
        }
        setLoadingClassPrerequisites(false);
    };

    const loadStudents = async () => {
        if (!classId) return;
        setLoadingStudents(true);
        try {
            console.log("[ClassDetailContent] Loading students for class:", classId);
            const { students: fetchedStudents, error: fetchError } = await getStudentsByClassId(classId);
            console.log("[ClassDetailContent] Students response for class:", { fetchedStudents, fetchError, classId });
            if (fetchError) {
                console.error("[ClassDetailContent] Error loading students:", fetchError);
                setStudents([]);
            } else if (fetchedStudents) {
                const emailsFromAuth = await Promise.all(
                    fetchedStudents.map((s) => getStudentEmailFromAuth(s.id))
                );
                const transformedStudents: Student[] = fetchedStudents.map((s, i) => ({
                    id: s.id,
                    name: s.name || "Unknown Student",
                    email: emailsFromAuth[i] ?? s.email ?? "N/A",
                }));
                console.log("[ClassDetailContent] Transformed students for class:", transformedStudents);
                setStudents(transformedStudents);
                loadStudentsWithBilling(transformedStudents);
            } else {
                console.log("[ClassDetailContent] No students returned for class");
                setStudents([]);
            }
        } catch (err: any) {
            console.error("[ClassDetailContent] Exception loading students:", err);
            setStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    const loadStudentsWithBilling = async (roster: Student[]) => {
        const withBilling = await Promise.all(
            roster.map(async (student) => {
                const { enrollment } = await fetchEnrollmentClientSafe(student.id, classId);
                if (!enrollment) {
                    return { ...student, paymentStatus: "No invoices yet", transactions: [] };
                }
                const { transactions } = await getTransactionsByEnrollment(enrollment.id);
                return {
                    ...student,
                    paymentStatus: calculateStudentPaymentStatus(transactions || []),
                    transactions: transactions || [],
                };
            })
        );
        setStudentsWithBilling(withBilling);
    };

    const handleViewInvoices = (student: StudentWithBilling) => {
        setSelectedStudentBilling(student);
        setIsInvoiceSidebarOpen(true);
    };
    const handleCloseInvoiceSidebar = () => {
        setIsInvoiceSidebarOpen(false);
        setSelectedStudentBilling(null);
    };

    const loadAllStudents = async () => {
        const { students: fetchedStudents } = await getStudents();
        if (fetchedStudents) {
            const emailsFromAuth = await Promise.all(
                fetchedStudents.map((s) => getStudentEmailFromAuth(s.id))
            );
            setAllStudents(fetchedStudents.map((s, i) => ({
                id: s.id,
                name: s.name || "Unknown Student",
                email: emailsFromAuth[i] ?? s.email ?? "N/A",
            })));
        }
    };

    const handleAddStudent = async () => {
        if (!selectedStudentId || !classId) return;
        setAddingStudent(true);
        try {
            const supabase = await createSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Not authenticated");
                return;
            }

            const basePath = typeof window !== 'undefined' 
                ? (window.location.pathname.startsWith('/app') ? '/app' : '')
                : '';

            // Create enrollment
            const { error: enrollError } = await supabase
                .from("enrollments")
                .insert({
                    student_id: selectedStudentId,
                    class_id: classId,
                    enrollment_status: "registered",
                });

            if (enrollError) {
                alert(`Failed to add student: ${enrollError.message}`);
                return;
            }

            // Log the action
            await fetch(`/api/logs/student-enrollment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    student_id: selectedStudentId,
                    class_id: classId,
                    action: 'add',
                }),
            });

            await loadStudents();
            await loadAllStudents();
            setIsAddStudentOpen(false);
            setSelectedStudentId("");
            setStudentSearchQuery("");
        } catch (err: any) {
            alert(`Failed to add student: ${err.message}`);
        } finally {
            setAddingStudent(false);
        }
    };

    const handleCreateNewStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudentName.trim() || !newStudentEmail.trim() || !classId) return;
        setCreatingStudent(true);
        setCreateStudentError(null);
        try {
            const supabase = await createSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setCreateStudentError("Not authenticated");
                return;
            }
            const basePath = typeof window !== 'undefined' 
                ? (window.location.pathname.startsWith('/app') ? '/app' : '')
                : '';
            const res = await fetch(`${basePath}/api/students/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    email: newStudentEmail.trim(),
                    fullName: newStudentName.trim(),
                    phone: newStudentPhone.trim() || undefined,
                    classId,
                }),
            });
            const data = await res.json();
            if (!data.success) {
                setCreateStudentError(data.error || "Failed to create student");
                return;
            }
            setNewStudentName("");
            setNewStudentEmail("");
            setNewStudentPhone("");
            setCreateStudentError(null);
            await loadStudents();
            await loadAllStudents();
        } catch (err: any) {
            setCreateStudentError(err.message || "Failed to create student");
        } finally {
            setCreatingStudent(false);
        }
    };

    const availableStudents = useMemo(() => 
        allStudents.filter(s => !students.some(es => es.id === s.id)),
        [allStudents, students]
    );
    const searchLower = studentSearchQuery.trim().toLowerCase();
    const filteredStudents = useMemo(() => {
        if (!searchLower) return availableStudents;
        return availableStudents.filter(
            s => (s.name?.toLowerCase().includes(searchLower)) || (s.email?.toLowerCase().includes(searchLower))
        );
    }, [availableStudents, searchLower]);

    const openRemoveStudentModal = async (studentId: string) => {
        const student = students.find((s) => s.id === studentId);
        const studentName = student?.name ?? "Student";

        const { enrollment } = await fetchEnrollmentClientSafe(studentId, classId);
        let paidTotal = 0;
        if (enrollment) {
            const { transactions } = await getTransactionsByEnrollment(enrollment.id);
            paidTotal = (transactions || [])
                .filter((t) => t.transaction_status === 'paid')
                .reduce((sum, t) => sum + (t.amount_due || 0) * (t.quantity || 1), 0);
        }

        setRefundPercentageInput("");
        setRemoveStudentModal({
            studentId,
            studentName,
            hasPaidTransactions: paidTotal > 0,
            paidTotal,
        });
    };

    const handleConfirmRemoveStudent = async () => {
        if (!removeStudentModal) return;
        const { studentId, studentName, hasPaidTransactions } = removeStudentModal;

        let refundPercentage: number | null = null;
        if (hasPaidTransactions) {
            const pct = parseFloat(refundPercentageInput);
            if (Number.isNaN(pct) || pct < 0 || pct > 100) {
                alert("Enter a refund percentage between 0 and 100.");
                return;
            }
            refundPercentage = pct;
        }

        setIsRemovingStudent(true);
        try {
            const supabase = await createSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Not authenticated");
                return;
            }

            const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/app') ? '/app' : '';

            const removeResponse = await fetch(`${basePath}/api/enrollments/remove`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    student_id: studentId,
                    class_id: classId,
                    refund_percentage: refundPercentage,
                }),
            });

            const removeResult = await removeResponse.json().catch(() => ({}));

            if (!removeResponse.ok || !removeResult.success) {
                alert(`Failed to remove student: ${removeResult.error || 'Unknown error'}`);
                return;
            }

            await loadStudents();
            setPendingUndoRemoval({ studentId, studentName });
            setRemoveStudentModal(null);
        } catch (err: any) {
            alert(`Failed to remove student: ${err.message}`);
        } finally {
            setIsRemovingStudent(false);
        }
    };

    const handleUndoRemoveStudent = async () => {
        if (!pendingUndoRemoval || undoingRemoval) return;

        const { studentId } = pendingUndoRemoval;
        setUndoingRemoval(true);
        setPendingUndoRemoval(null);

        try {
            const supabase = await createSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Not authenticated");
                return;
            }

            const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/app') ? '/app' : '';

            const restoreResponse = await fetch(`${basePath}/api/enrollments/restore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    student_id: studentId,
                    class_id: classId,
                }),
            });

            const restoreResult = await restoreResponse.json().catch(() => ({}));

            if (!restoreResponse.ok || !restoreResult.success) {
                alert(`Failed to undo removal: ${restoreResult.error || 'Unknown error'}`);
                return;
            }

            await loadStudents();
        } catch (err: any) {
            alert(`Failed to undo removal: ${err.message}`);
        } finally {
            setUndoingRemoval(false);
        }
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleDelete = async () => {
        if (!classData) return;

        setDeleting(true);
        setIsEditModalOpen(false);
        const result = await deleteClass(classData.id);

        if (result.success) {
            // Navigate back based on context
            if (fromContext === 'course' && parentEntity) {
                router.push(`/admin/courses/${parentEntity.id}`);
            } else if (fromContext === 'program' && parentEntity) {
                router.push(`/admin/programs/${parentEntity.id}`);
            } else {
                router.push('/admin/classes');
            }
        } else {
            alert(`Failed to delete class: ${result.error}`);
            setDeleting(false);
        }
    };

    const handleStudentClick = (student: Student) => {
        router.push(`/admin/students/${student.id}`);
    };

    const handleUpdateClass = async (formData: ClassFormData) => {
        if (!classData || !originalClassData) return;

        setSaving(true);

        // Generate batch_id for this save operation
        const batchId = crypto.randomUUID();

        // Helper functions for parsing
        const parseDollars = (value: string): number | null => {
            if (!value) return null;
            const dollars = parseFloat(value);
            if (isNaN(dollars)) return null;
            return Math.round(dollars * 100);
        };

        const parsePercentage = (value: string): number | null => {
            if (!value) return null;
            const percent = parseFloat(value);
            if (isNaN(percent)) return null;
            return Math.round(percent * 100);
        };

        // Perform update
        const { success, error } = await updateClass(
            classData.id,
            formData.enrollmentOpenDate || null,
            formData.enrollmentCloseDate || null,
            formData.classStartDate || null,
            formData.classEndDate || null,
            formData.classType === 'online',
            formData.programmingOffering || null,
            classData.class_image || null,
            null, // length_of_class
            formData.certificateLength ? parseInt(formData.certificateLength, 10) : null,
            formData.registrationLimit ? parseInt(formData.registrationLimit, 10) : null,
            parseDollars(formData.price),
            parseDollars(formData.registrationFee),
            undefined,
            formData.locationId
        );

        if (success) {
            // Reload class data
            await loadClass();
            setIsEditModalOpen(false);
        } else {
            alert(`Failed to save: ${error}`);
        }
        setSaving(false);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "—";
        const formatted = formatClassDate(dateString);
        return formatted.rendered;
    };

    const studentColumns = [
        { header: "Name", accessorKey: "name" as keyof Student, className: "font-medium" },
        { header: "Email", accessorKey: "email" as keyof Student },
        {
            header: "Invoice Status",
            accessorKey: "id" as keyof Student,
            cell: (item: Student) => {
                const withBilling = studentsWithBilling.find((s) => s.id === item.id);
                const status = withBilling?.paymentStatus || "Loading...";
                return (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (withBilling) handleViewInvoices(withBilling);
                        }}
                        className={`text-sm font-medium hover:underline ${
                            status === "Past due" ? "text-red-600" :
                            status === "All paid" ? "text-green-600" :
                            status === "Partially paid" ? "text-blue-600" :
                            "text-gray-600"
                        }`}
                    >
                        {status}
                    </button>
                );
            },
        },
        {
            header: "Actions",
            accessorKey: "id" as keyof Student,
            cell: (item: Student) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        openRemoveStudentModal(item.id);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                    Remove
                </button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading class details...</p>
                </div>
            </div>
        );
    }

    if (!classData) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 items-center py-8">
                    <p className="text-red-600">{error || "Class not found"}</p>
                    <Link
                        href="/admin/classes"
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                        Back to Classes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    {fromContext === 'course' && parentEntity ? (
                        <Link
                            href={`/admin/courses/${parentEntity.id}`}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                        >
                            ← Back to {parentEntity.course_name}
                        </Link>
                    ) : fromContext === 'program' && parentEntity ? (
                        <Link
                            href={`/admin/programs/${parentEntity.id}`}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                        >
                            ← Back to {parentEntity.course_name}
                        </Link>
                    ) : (
                        <Link
                            href="/admin/classes"
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                        >
                            ← Back to Classes
                        </Link>
                    )}
                    <ViewMarketingPageLink
                        courseCode={classData.course_code}
                        classId={classData.class_id}
                    />
                    <h1 className="text-2xl font-bold text-gray-900">{classData.class_id}</h1>
                    <p className="text-sm text-gray-500 mt-1">{classData.class_name}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleEdit}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Edit
                    </button>
                </div>
            </div>

            {/* Details Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Class Name</label>
                        <p className="mt-1 text-sm text-gray-900">{classData.class_name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Class ID</label>
                        <p className="mt-1 text-sm text-gray-900">{classData.class_id}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Course Code</label>
                        <p className="mt-1 text-sm text-gray-900">{classData.course_code}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Online</label>
                        <p className="mt-1 text-sm text-gray-900">{classData.is_online ? "Yes" : "No"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Location</label>
                        <p className="mt-1 text-sm text-gray-900">{classData.location || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Enrollment Start</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(classData.enrollment_start)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Enrollment Close</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(classData.enrollment_close)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Class Start Date</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(classData.class_start_date)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Class End Date</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(classData.class_close_date)}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Length of Class</label>
                        <p className="mt-1 text-sm text-gray-900">{classData.length_of_class || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Registration Limit</label>
                        <p className="mt-1 text-sm text-gray-900">{classData.registration_limit || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Certification Length</label>
                        <p className="mt-1 text-sm text-gray-900">{classData.certification_length || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Price</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {formatCurrency(classData.price)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Registration Fee</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {formatCurrency(classData.registration_fee)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Prerequisites Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Prerequisites</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Copied from the template when this class was created. Editing the template does not change this list.
                </p>
                <DataTable
                    data={classPrerequisites}
                    isLoading={loadingClassPrerequisites}
                    emptyMessage="No prerequisites on this class."
                    columns={[
                        {
                            header: "Prerequisite",
                            cell: (item: ClassPrerequisiteWithType) => item.prerequisite_type.name,
                            className: "font-medium",
                        },
                        {
                            header: "Input type",
                            cell: (item: ClassPrerequisiteWithType) =>
                                PREREQUISITE_INPUT_TYPE_LABELS[item.prerequisite_type.input_type],
                        },
                        {
                            header: "Required",
                            cell: (item: ClassPrerequisiteWithType) => (item.is_required ? "Yes" : "No"),
                        },
                    ]}
                />
            </div>

            {/* Students Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Students</h2>
                    <button
                        onClick={() => setIsAddStudentOpen(true)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
                    >
                        Add Student
                    </button>
                </div>
                {students.length === 0 && !loadingStudents ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No students enrolled</h3>
                        <p className="mt-1 text-sm text-gray-500">Student enrollments will be displayed here once the enrollments table is implemented.</p>
                    </div>
                ) : (
                    <DataTable
                        data={students}
                        columns={studentColumns}
                        isLoading={loadingStudents}
                        onRowClick={handleStudentClick}
                        emptyMessage="No students enrolled in this class."
                    />
                )}
            </div>

            {/* Activity Log Section */}
            <LogDisplay referenceId={classData.id} referenceType="class" />

            {/* Add Student Sidebar */}
            <DetailSidebar
                isOpen={isAddStudentOpen}
                onClose={() => {
                    setIsAddStudentOpen(false);
                    setSelectedStudentId("");
                    setStudentSearchQuery("");
                    setStudentDropdownOpen(false);
                    setCreateStudentError(null);
                }}
                title="Add Student to Class"
            >
                <div className="space-y-6">
                    {/* Select existing student - searchable */}
                    <div ref={studentDropdownRef} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={studentSearchQuery}
                            onChange={(e) => {
                                setStudentSearchQuery(e.target.value);
                                setStudentDropdownOpen(true);
                            }}
                            onFocus={() => {
                                loadAllStudents();
                                setStudentDropdownOpen(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Escape") setStudentDropdownOpen(false);
                            }}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            aria-label="Search students by name or email"
                        />
                        {studentDropdownOpen && (
                            <div
                                className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg max-h-60 overflow-auto"
                                role="listbox"
                            >
                                {filteredStudents.length === 0 ? (
                                    <div className="px-3 py-2 text-sm text-gray-500">
                                        {availableStudents.length === 0 ? "No students available to add." : "No matches."}
                                    </div>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <button
                                            key={student.id}
                                            type="button"
                                            role="option"
                                            aria-selected={selectedStudentId === student.id}
                                            onClick={() => {
                                                setSelectedStudentId(student.id);
                                                setStudentSearchQuery("");
                                                setStudentDropdownOpen(false);
                                            }}
                                            className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${selectedStudentId === student.id ? "bg-gray-50 font-medium" : ""}`}
                                        >
                                            {student.name} ({student.email})
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                        {selectedStudentId && (
                            <p className="mt-1 text-xs text-gray-500">
                                Selected: {availableStudents.find(s => s.id === selectedStudentId)?.name}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddStudentOpen(false);
                                setSelectedStudentId("");
                                setStudentSearchQuery("");
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAddStudent}
                            disabled={!selectedStudentId || addingStudent}
                            className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                        >
                            {addingStudent ? "Adding..." : "Add Student"}
                        </button>
                    </div>

                    {/* Add new student */}
                    <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Add new student</h3>
                        {createStudentError && (
                            <div className="mb-3 bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                                {createStudentError}
                            </div>
                        )}
                        <form onSubmit={handleCreateNewStudent} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name *</label>
                                <input
                                    type="text"
                                    value={newStudentName}
                                    onChange={(e) => setNewStudentName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email *</label>
                                <input
                                    type="email"
                                    value={newStudentEmail}
                                    onChange={(e) => setNewStudentEmail(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    value={newStudentPhone}
                                    onChange={(e) => setNewStudentPhone(formatPhone(e.target.value))}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={creatingStudent || !newStudentName.trim() || !newStudentEmail.trim()}
                                className="w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                            >
                                {creatingStudent ? "Creating..." : "Create & Enroll Student"}
                            </button>
                        </form>
                    </div>
                </div>
            </DetailSidebar>

            {/* Invoice Detail Sidebar */}
            <DetailSidebar
                isOpen={isInvoiceSidebarOpen}
                onClose={handleCloseInvoiceSidebar}
                title={selectedStudentBilling ? `${selectedStudentBilling.name} — Invoices` : "Invoices"}
            >
                <EnrollmentPaymentDetail transactions={selectedStudentBilling?.transactions || []} />
            </DetailSidebar>

            {/* Edit Class Modal */}
            {isEditModalOpen && classData && (
                <CreateClassModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleUpdateClass}
                    onDelete={handleDelete}
                    context="classes"
                    editingClass={classData}
                    programs={programs}
                    courses={courses}
                />
            )}
            {pendingUndoRemoval && (
                <UndoToast
                    title={pendingUndoRemoval.studentName}
                    description="Removed from class"
                    onUndo={handleUndoRemoveStudent}
                    onExpire={() => setPendingUndoRemoval(null)}
                />
            )}

            {/* Remove Student modal */}
            {removeStudentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold text-black mb-4">Remove {removeStudentModal.studentName}</h2>
                        <p className="text-gray-700 mb-4">
                            Remove this student from the class? This can be undone immediately after.
                        </p>
                        {removeStudentModal.hasPaidTransactions && (
                            <div className="mb-4 space-y-3">
                                <p className="text-sm text-gray-700">
                                    This student has paid {formatCurrency(removeStudentModal.paidTotal)} for this class.
                                </p>
                                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-md p-3">
                                    Refunds are handled case-by-case. As a general guide: a full refund is typical if the
                                    student withdraws well before the class starts; a partial or no refund is typical
                                    closer to or after the start date. Confirm with your manager if you're unsure.
                                </p>
                                <div className="flex gap-2">
                                    {[100, 50, 0].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setRefundPercentageInput(String(preset))}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            {preset}%
                                        </button>
                                    ))}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Refund Percentage</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={refundPercentageInput}
                                        onChange={(e) => setRefundPercentageInput(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setRemoveStudentModal(null)}
                                disabled={isRemovingStudent}
                                className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmRemoveStudent}
                                disabled={isRemovingStudent || (removeStudentModal.hasPaidTransactions && !refundPercentageInput)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {isRemovingStudent ? "Removing..." : "Remove Student"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ClassDetailPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <ClassDetailContent />
        </Suspense>
    );
}

