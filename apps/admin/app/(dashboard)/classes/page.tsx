"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClasses, getClassById, updateClass, type Class } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

export default function ClassesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadClasses();
    }, []);

    // Handle URL params for deep linking
    useEffect(() => {
        const classId = searchParams.get("classId");
        if (classId) {
            loadClassDetail(classId);
        } else {
            setIsSidebarOpen(false);
            setSelectedClass(null);
        }
    }, [searchParams]);

    const loadClasses = async () => {
        setLoading(true);
        const { classes: fetchedClasses, error: fetchError } = await getClasses();

        if (fetchError) {
            setError(fetchError);
        } else if (fetchedClasses) {
            setClasses(fetchedClasses);
        }
        setLoading(false);
    };

    const loadClassDetail = async (id: string) => {
        setLoadingDetail(true);
        setIsSidebarOpen(true);
        const { class: fetchedClass, error } = await getClassById(id);
        if (fetchedClass) {
            setSelectedClass(fetchedClass);
        }
        setLoadingDetail(false);
    };

    const handleRowClick = (classItem: Class) => {
        router.push(`/classes?classId=${classItem.id}`);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push("/classes");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;

        setSaving(true);
        const { success, error } = await updateClass(
            selectedClass.id,
            selectedClass.enrollment_start,
            selectedClass.enrollment_close,
            selectedClass.class_start_date,
            selectedClass.class_close_date,
            selectedClass.is_online,
            selectedClass.length_of_class,
            selectedClass.certification_length,
            selectedClass.graduation_rate,
            selectedClass.registration_limit,
            selectedClass.price,
            selectedClass.registration_fee
        );

        if (success) {
            await loadClasses(); // Refresh list
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

    const columns = [
        { header: "Class ID", accessorKey: "class_id" as keyof Class, className: "font-medium" },
        { header: "Class Name", accessorKey: "class_name" as keyof Class },
        { header: "Course Code", accessorKey: "course_code" as keyof Class },
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage scheduled classes</p>
                </div>
                <Link
                    href="/add_class_test"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
                >
                    Add Class
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <DataTable
                data={classes}
                columns={columns}
                isLoading={loading}
                onRowClick={handleRowClick}
                emptyMessage="No classes found."
            />


            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={selectedClass ? `Edit ${selectedClass.class_id}` : "Class Details"}
            >
                {loadingDetail ? (
                    <div className="flex justify-center py-8">
                        <p className="text-gray-500">Loading details...</p>
                    </div>
                ) : selectedClass ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class Name</label>
                            <input
                                type="text"
                                value={selectedClass.class_name}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2"
                            />
                            <p className="text-xs text-gray-500 mt-1">Inherited from Course</p>
                        </div>

                        {/* Enrollment Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Enrollment Start</label>
                                <input
                                    type="date"
                                    value={selectedClass.enrollment_start ? new Date(selectedClass.enrollment_start).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, enrollment_start: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Enrollment Close</label>
                                <input
                                    type="date"
                                    value={selectedClass.enrollment_close ? new Date(selectedClass.enrollment_close).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, enrollment_close: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        {/* Class Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class Start</label>
                                <input
                                    type="date"
                                    value={selectedClass.class_start_date ? new Date(selectedClass.class_start_date).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, class_start_date: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class End</label>
                                <input
                                    type="date"
                                    value={selectedClass.class_close_date ? new Date(selectedClass.class_close_date).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, class_close_date: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        {/* Online Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isOnline"
                                checked={selectedClass.is_online}
                                onChange={(e) => setSelectedClass({ ...selectedClass, is_online: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor="isOnline" className="text-sm font-medium text-gray-700">Online Class</label>
                        </div>

                        {/* Class Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Length of Class</label>
                                <input
                                    type="text"
                                    value={selectedClass.length_of_class || ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, length_of_class: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Limit</label>
                                <input
                                    type="number"
                                    value={selectedClass.registration_limit || ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, registration_limit: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cert. Length</label>
                                <input
                                    type="number"
                                    value={selectedClass.certification_length || ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, certification_length: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Graduation Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={selectedClass.graduation_rate ? (selectedClass.graduation_rate / 100).toFixed(2) : ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, graduation_rate: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={selectedClass.price ? (selectedClass.price / 100).toFixed(2) : ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, price: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reg. Fee ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={selectedClass.registration_fee ? (selectedClass.registration_fee / 100).toFixed(2) : ''}
                                    onChange={(e) => setSelectedClass({ ...selectedClass, registration_fee: parseFloat(e.target.value) * 100 || null })}
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

