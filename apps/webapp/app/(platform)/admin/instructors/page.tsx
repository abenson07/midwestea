"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function InstructorsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadInstructors();
    }, []);

    // Handle URL params for deep linking
    useEffect(() => {
        const instructorId = searchParams.get("instructorId");
        if (instructorId) {
            const instructor = instructors.find(i => i.id === instructorId);
            if (instructor) {
                setSelectedInstructor(instructor);
                setIsSidebarOpen(true);
            }
        } else {
            setIsSidebarOpen(false);
            setSelectedInstructor(null);
        }
    }, [searchParams, instructors]);

    const loadInstructors = async () => {
        setLoading(true);
        // TODO: Replace with actual API call when instructors table is implemented
        // For now, use placeholder data
        setInstructors([]);
        setLoading(false);
    };

    const handleRowClick = (instructor: Instructor) => {
        router.push(`/instructors/${instructor.id}`);
    };

    const handleEditClick = (instructor: Instructor, e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/instructors?instructorId=${instructor.id}`);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push("/instructors");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInstructor) return;

        setSaving(true);
        // TODO: Implement save when API is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadInstructors();
        handleCloseSidebar();
        setSaving(false);
    };

    const columns = [
        { header: "Name", accessorKey: "name" as keyof Instructor, className: "font-medium" },
        { header: "Email", accessorKey: "email" as keyof Instructor },
        { header: "Phone", accessorKey: "phone" as keyof Instructor },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage instructor profiles</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            {instructors.length === 0 && !loading ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No instructors</h3>
                    <p className="mt-1 text-sm text-gray-500">Instructors will be displayed here once the instructors table is implemented.</p>
                </div>
            ) : (
                <DataTable
                    data={instructors}
                    columns={columns}
                    isLoading={loading}
                    onRowClick={handleRowClick}
                    onEditClick={handleEditClick}
                    emptyMessage="No instructors found."
                />
            )}

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={selectedInstructor ? `Edit ${selectedInstructor.name}` : "Instructor Details"}
            >
                {selectedInstructor ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={selectedInstructor.name}
                                onChange={(e) => setSelectedInstructor({ ...selectedInstructor, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={selectedInstructor.email}
                                onChange={(e) => setSelectedInstructor({ ...selectedInstructor, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={selectedInstructor.phone || ''}
                                onChange={(e) => setSelectedInstructor({ ...selectedInstructor, phone: formatPhone(e.target.value) })}
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

export default function InstructorsPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Instructors</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage instructor profiles</p>
                    </div>
                </div>
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <InstructorsPageContent />
        </Suspense>
    );
}
