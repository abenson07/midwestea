"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClassById, updateClass, type Class } from "@/lib/classes";
import { getStudentsByClassId } from "@/lib/students";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

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
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (classId) {
            loadClass();
            loadStudents();
        }
    }, [classId]);

    // Handle URL params for sidebar
    useEffect(() => {
        const editParam = searchParams.get("edit");
        if (editParam === "true" && classData) {
            setIsSidebarOpen(true);
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

    const handleEdit = () => {
        router.push(`/dashboard/classes/${classId}?edit=true`);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push(`/dashboard/classes/${classId}`);
    };

    const handleStudentClick = (student: Student) => {
        router.push(`/students/${student.id}`);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classData) return;

        setSaving(true);
        const { success, error } = await updateClass(
            classData.id,
            classData.enrollment_start,
            classData.enrollment_close,
            classData.class_start_date,
            classData.class_close_date,
            classData.is_online,
            classData.length_of_class,
            classData.certification_length,
            classData.graduation_rate,
            classData.registration_limit,
            classData.price,
            classData.registration_fee
        );

        if (success) {
            await loadClass();
            handleCloseSidebar();
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
                    <Link
                        href="/dashboard/classes"
                        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                    >
                        ← Back to Classes
                    </Link>
                    <p className="text-sm text-gray-500">{classData.class_name}</p>
                    <h1 className="text-2xl font-bold text-gray-900 mt-1">{classData.class_id}</h1>
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
                        <label className="block text-sm font-medium text-gray-500">Graduation Rate</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {classData.graduation_rate ? `${(classData.graduation_rate / 100).toFixed(2)}%` : "—"}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Price</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {classData.price ? `$${(classData.price / 100).toFixed(2)}` : "—"}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Registration Fee</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {classData.registration_fee ? `$${(classData.registration_fee / 100).toFixed(2)}` : "—"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Students Section */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Students</h2>
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

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={classData ? `Edit ${classData.class_id}` : "Class Details"}
            >
                {classData ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class Name</label>
                            <input
                                type="text"
                                value={classData.class_name}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">Inherited from Course</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Enrollment Start</label>
                                <input
                                    type="date"
                                    value={classData.enrollment_start ? new Date(classData.enrollment_start).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setClassData({ ...classData, enrollment_start: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Enrollment Close</label>
                                <input
                                    type="date"
                                    value={classData.enrollment_close ? new Date(classData.enrollment_close).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setClassData({ ...classData, enrollment_close: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class Start</label>
                                <input
                                    type="date"
                                    value={classData.class_start_date ? new Date(classData.class_start_date).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setClassData({ ...classData, class_start_date: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class End</label>
                                <input
                                    type="date"
                                    value={classData.class_close_date ? new Date(classData.class_close_date).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setClassData({ ...classData, class_close_date: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isOnline"
                                checked={classData.is_online}
                                onChange={(e) => setClassData({ ...classData, is_online: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor="isOnline" className="text-sm font-medium text-gray-700">Online Class</label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Length of Class</label>
                                <input
                                    type="text"
                                    value={classData.length_of_class || ''}
                                    onChange={(e) => setClassData({ ...classData, length_of_class: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Limit</label>
                                <input
                                    type="number"
                                    value={classData.registration_limit || ''}
                                    onChange={(e) => setClassData({ ...classData, registration_limit: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cert. Length</label>
                                <input
                                    type="number"
                                    value={classData.certification_length || ''}
                                    onChange={(e) => setClassData({ ...classData, certification_length: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Graduation Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={classData.graduation_rate ? (classData.graduation_rate / 100).toFixed(2) : ''}
                                    onChange={(e) => setClassData({ ...classData, graduation_rate: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={classData.price ? (classData.price / 100).toFixed(2) : ''}
                                    onChange={(e) => setClassData({ ...classData, price: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reg. Fee ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={classData.registration_fee ? (classData.registration_fee / 100).toFixed(2) : ''}
                                    onChange={(e) => setClassData({ ...classData, registration_fee: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
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
                    <p className="text-gray-500">Class not found.</p>
                )}
            </DetailSidebar>
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

