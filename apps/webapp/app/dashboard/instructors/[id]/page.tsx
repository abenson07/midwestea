"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClasses, type Class } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatPhone } from "@midwestea/utils";

// Placeholder type for Instructor - will be replaced when types are defined
type Instructor = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
};

function InstructorDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const instructorId = params?.id as string;

    const [instructor, setInstructor] = useState<Instructor | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (instructorId) {
            loadInstructor();
            loadClasses();
        }
    }, [instructorId]);

    // Handle URL params for sidebar
    useEffect(() => {
        const editParam = searchParams.get("edit");
        if (editParam === "true" && instructor) {
            setIsSidebarOpen(true);
        }
    }, [searchParams, instructor]);

    const loadInstructor = async () => {
        if (!instructorId) return;
        setLoading(true);
        // TODO: Replace with actual API call when instructors table is implemented
        // For now, use placeholder
        setInstructor({
            id: instructorId,
            name: "Instructor Name",
            email: "instructor@example.com",
            phone: "555-1234"
        });
        setLoading(false);
    };

    const loadClasses = async () => {
        if (!instructorId) return;
        setLoadingClasses(true);
        const { classes: fetchedClasses, error: fetchError } = await getClasses();
        if (fetchError) {
            console.error("Error fetching classes:", fetchError);
        } else if (fetchedClasses) {
            // TODO: Filter classes for this instructor when join table is implemented
            // For now, show empty
            setClasses([]);
        }
        setLoadingClasses(false);
    };

    const handleEdit = () => {
        router.push(`/instructors/${instructorId}?edit=true`);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push(`/instructors/${instructorId}`);
    };

    const handleClassClick = (classItem: Class) => {
        router.push(`/dashboard/classes/${classItem.id}`);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instructor) return;

        setSaving(true);
        // TODO: Implement save when API is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadInstructor();
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
                    <p className="text-gray-500">Loading instructor details...</p>
                </div>
            </div>
        );
    }

    if (!instructor) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 items-center py-8">
                    <p className="text-red-600">{error || "Instructor not found"}</p>
                    <Link
                        href="/dashboard/instructors"
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                        Back to Instructors
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
                        href="/dashboard/instructors"
                        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                    >
                        ← Back to Instructors
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{instructor.name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{instructor.email}</p>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Instructor Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Name</label>
                        <p className="mt-1 text-sm text-gray-900">{instructor.name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Email</label>
                        <p className="mt-1 text-sm text-gray-900">{instructor.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">{instructor.phone || "—"}</p>
                    </div>
                </div>
            </div>

            {/* Classes Section */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Classes</h2>
                {classes.length === 0 && !loadingClasses ? (
                    <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No classes</h3>
                        <p className="mt-1 text-sm text-gray-500">Classes will be displayed here once the instructor-class join table is implemented.</p>
                    </div>
                ) : (
                    <DataTable
                        data={classes}
                        columns={classColumns}
                        isLoading={loadingClasses}
                        onRowClick={handleClassClick}
                        emptyMessage="No classes found for this instructor."
                    />
                )}
            </div>

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={`Edit ${instructor.name}`}
            >
                {instructor ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={instructor.name}
                                onChange={(e) => setInstructor({ ...instructor, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={instructor.email}
                                onChange={(e) => setInstructor({ ...instructor, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={instructor.phone || ''}
                                onChange={(e) => setInstructor({ ...instructor, phone: formatPhone(e.target.value) })}
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
                    <p className="text-gray-500">Instructor not found.</p>
                )}
            </DetailSidebar>
        </div>
    );
}

export default function InstructorDetailPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <InstructorDetailContent />
        </Suspense>
    );
}

