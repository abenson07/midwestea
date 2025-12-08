"use client";

console.log("[students/page.tsx] Module loaded");

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { getStudents } from "@/lib/students";
import { formatPhone } from "@midwestea/utils";

// Student type for UI display
type Student = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
};

function StudentsPageContent() {
    console.log("[StudentsPageContent] Component rendering");
    const router = useRouter();
    const searchParams = useSearchParams();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        console.log("[StudentsPageContent] useEffect running, calling loadStudents");
        loadStudents();
    }, []);

    // Handle URL params for deep linking
    useEffect(() => {
        const studentId = searchParams.get("studentId");
        if (studentId) {
            const student = students.find(s => s.id === studentId);
            if (student) {
                setSelectedStudent(student);
                setIsSidebarOpen(true);
            }
        } else {
            setIsSidebarOpen(false);
            setSelectedStudent(null);
        }
    }, [searchParams, students]);

    const loadStudents = async () => {
        setLoading(true);
        setError("");
        try {
            console.log("Loading students...");
            const { students: fetchedStudents, error: fetchError } = await getStudents();
            console.log("Students response:", { fetchedStudents, fetchError });
            if (fetchError) {
                console.error("Error loading students:", fetchError);
                setError(fetchError);
                setStudents([]);
            } else if (fetchedStudents) {
                // Transform to match UI Student type
                const transformedStudents: Student[] = fetchedStudents.map((s) => ({
                    id: s.id,
                    name: s.name || "Unknown Student",
                    email: s.email || "N/A",
                    phone: s.phone,
                }));
                console.log("Transformed students:", transformedStudents);
                setStudents(transformedStudents);
            } else {
                console.log("No students returned");
                setStudents([]);
            }
        } catch (err: any) {
            console.error("Exception loading students:", err);
            setError(err.message || "Failed to load students");
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (student: Student) => {
        router.push(`/students/${student.id}`);
    };

    const handleEditClick = (student: Student, e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/students?studentId=${student.id}`);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push("/students");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setSaving(true);
        // TODO: Implement save when API is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadStudents();
        handleCloseSidebar();
        setSaving(false);
    };

    const columns = [
        { header: "Name", accessorKey: "name" as keyof Student, className: "font-medium" },
        { header: "Email", accessorKey: "email" as keyof Student },
        { header: "Phone", accessorKey: "phone" as keyof Student },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage student records</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            {students.length === 0 && !loading ? (
                <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No students</h3>
                    <p className="mt-1 text-sm text-gray-500">Students will be displayed here once the students table is implemented.</p>
                </div>
            ) : (
                <DataTable
                    data={students}
                    columns={columns}
                    isLoading={loading}
                    onRowClick={handleRowClick}
                    onEditClick={handleEditClick}
                    emptyMessage="No students found."
                />
            )}

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={selectedStudent ? `Edit ${selectedStudent.name}` : "Student Details"}
            >
                {selectedStudent ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                value={selectedStudent.name}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={selectedStudent.email}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, email: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={selectedStudent.phone || ''}
                                onChange={(e) => setSelectedStudent({ ...selectedStudent, phone: formatPhone(e.target.value) })}
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

export default function StudentsPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage student records</p>
                    </div>
                </div>
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <StudentsPageContent />
        </Suspense>
    );
}
