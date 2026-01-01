"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClassById, updateClass, deleteClass, getPrograms, getCourses, getCourseById, type Class, type Course } from "@/lib/classes";
import { getStudentsByClassId, getStudents } from "@/lib/students";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { LogDisplay } from "@/components/ui/LogDisplay";
import { CreateClassModal, type ClassFormData } from "@/components/ui/CreateClassModal";
import { formatCurrency } from "@midwestea/utils";
import { createSupabaseClient } from "@midwestea/utils";

// Student type for UI display
type Student = {
    id: string;
    name: string;
    email: string;
};

function ClassDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const classId = params?.id as string;

    const [classData, setClassData] = useState<Class | null>(null);
    const [originalClassData, setOriginalClassData] = useState<Class | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
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
    
    // Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [programs, setPrograms] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    
    // Navigation context
    const [fromContext, setFromContext] = useState<'course' | 'program' | 'classes' | null>(null);
    const [parentEntity, setParentEntity] = useState<Course | null>(null);

    useEffect(() => {
        if (classId) {
            loadClass();
            loadStudents();
        }
        loadPrograms();
        loadCourses();
    }, [classId]);

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
                // Transform to match UI Student type
                const transformedStudents: Student[] = fetchedStudents.map((s) => ({
                    id: s.id,
                    name: s.name || "Unknown Student",
                    email: s.email || "N/A",
                }));
                console.log("[ClassDetailContent] Transformed students for class:", transformedStudents);
                setStudents(transformedStudents);
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

    const loadAllStudents = async () => {
        const { students: fetchedStudents } = await getStudents();
        if (fetchedStudents) {
            setAllStudents(fetchedStudents.map((s) => ({
                id: s.id,
                name: s.name || "Unknown Student",
                email: s.email || "N/A",
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
            const basePath = typeof window !== 'undefined' 
                ? (window.location.pathname.startsWith('/app') ? '/app' : '')
                : '';
            await fetch(`${basePath}/api/logs/student-enrollment`, {
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
            setIsAddStudentOpen(false);
            setSelectedStudentId("");
        } catch (err: any) {
            alert(`Failed to add student: ${err.message}`);
        } finally {
            setAddingStudent(false);
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!confirm("Are you sure you want to remove this student from the class?")) return;
        
        try {
            const supabase = await createSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("Not authenticated");
                return;
            }

            // Remove enrollment
            const { error: removeError } = await supabase
                .from("enrollments")
                .delete()
                .eq("student_id", studentId)
                .eq("class_id", classId);

            if (removeError) {
                alert(`Failed to remove student: ${removeError.message}`);
                return;
            }

            // Log the action
            const basePath = typeof window !== 'undefined' 
                ? (window.location.pathname.startsWith('/app') ? '/app' : '')
                : '';
            await fetch(`${basePath}/api/logs/student-enrollment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    student_id: studentId,
                    class_id: classId,
                    action: 'remove',
                }),
            });

            await loadStudents();
        } catch (err: any) {
            alert(`Failed to remove student: ${err.message}`);
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
                router.push(`/dashboard/courses/${parentEntity.id}`);
            } else if (fromContext === 'program' && parentEntity) {
                router.push(`/dashboard/programs/${parentEntity.id}`);
            } else {
                router.push('/dashboard/classes');
            }
        } else {
            alert(`Failed to delete class: ${result.error}`);
            setDeleting(false);
        }
    };

    const handleStudentClick = (student: Student) => {
        router.push(`/dashboard/students/${student.id}`);
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
            null, // length_of_class
            formData.certificateLength ? parseInt(formData.certificateLength, 10) : null,
            formData.registrationLimit ? parseInt(formData.registrationLimit, 10) : null,
            parseDollars(formData.price),
            parseDollars(formData.registrationFee)
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
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const studentColumns = [
        { header: "Name", accessorKey: "name" as keyof Student, className: "font-medium" },
        { header: "Email", accessorKey: "email" as keyof Student },
        {
            header: "Actions",
            accessorKey: "id" as keyof Student,
            cell: (item: Student) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStudent(item.id);
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
                        href="/dashboard/classes"
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
                            href={`/dashboard/courses/${parentEntity.id}`}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                        >
                            ← Back to {parentEntity.course_name}
                        </Link>
                    ) : fromContext === 'program' && parentEntity ? (
                        <Link
                            href={`/dashboard/programs/${parentEntity.id}`}
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                        >
                            ← Back to {parentEntity.course_name}
                        </Link>
                    ) : (
                        <Link
                            href="/dashboard/classes"
                            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                        >
                            ← Back to Classes
                        </Link>
                    )}
                    <h1 className="text-2xl font-bold text-gray-900">{classData.class_id}</h1>
                    <p className="text-sm text-gray-500 mt-1">{classData.class_name}</p>
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
                }}
                title="Add Student to Class"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            onFocus={loadAllStudents}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                        >
                            <option value="">-- Select a student --</option>
                            {allStudents
                                .filter(s => !students.find(es => es.id === s.id))
                                .map((student) => (
                                    <option key={student.id} value={student.id}>
                                        {student.name} ({student.email})
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddStudentOpen(false);
                                setSelectedStudentId("");
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
                </div>
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

