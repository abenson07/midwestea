"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClasses, type Class } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

// Placeholder type for Student - will be replaced when types are defined
type Student = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
};

function StudentDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const studentId = params?.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (studentId) {
            loadStudent();
            loadClasses();
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
        // TODO: Replace with actual API call when students table is implemented
        // For now, use placeholder
        setStudent({
            id: studentId,
            name: "Student Name",
            email: "student@example.com",
            phone: "555-1234"
        });
        setLoading(false);
    };

    const loadClasses = async () => {
        if (!studentId) return;
        setLoadingClasses(true);
        const { classes: fetchedClasses, error: fetchError } = await getClasses();
        if (fetchError) {
            console.error("Error fetching classes:", fetchError);
        } else if (fetchedClasses) {
            // TODO: Filter classes for this student when enrollments table is implemented
            // For now, show empty
            setClasses([]);
        }
        setLoadingClasses(false);
    };

    const handleEdit = () => {
        router.push(`/students/${studentId}?edit=true`);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push(`/students/${studentId}`);
    };

    const handleClassClick = (classItem: Class) => {
        router.push(`/students/${studentId}/classes/${classItem.id}`);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!student) return;

        setSaving(true);
        // TODO: Implement save when API is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadStudent();
        handleCloseSidebar();
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
                        <p className="mt-1 text-sm text-gray-900">{student.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{student.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{student.phone || "—"}</p>
                    </div>
                </div>
            </div>

            {/* Classes Section */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Classes</h2>
                {classes.length === 0 && !loadingClasses ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No classes</h3>
                        <p className="mt-1 text-sm text-gray-500">Classes will be displayed here once the enrollments table is implemented.</p>
                    </div>
                ) : (
                    <DataTable
                        data={classes}
                        columns={classColumns}
                        isLoading={loadingClasses}
                        onRowClick={handleClassClick}
                        emptyMessage="No classes found for this student."
                    />
                )}
            </div>

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={`Edit ${student.name}`}
            >
                {student ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={student.name}
                                onChange={(e) => setStudent({ ...student, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={student.email}
                                onChange={(e) => setStudent({ ...student, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={student.phone || ''}
                                onChange={(e) => setStudent({ ...student, phone: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
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

