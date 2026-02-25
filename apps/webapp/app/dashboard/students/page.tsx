"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { getStudents, getStudentEmailFromAuth, updateStudent } from "@/lib/students";
import { formatPhone, createSupabaseClient } from "@midwestea/utils";

// Student type for UI display
type Student = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
};

function StudentsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Add student form state
    const [addFormName, setAddFormName] = useState("");
    const [addFormEmail, setAddFormEmail] = useState("");
    const [addFormPhone, setAddFormPhone] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
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
                setIsAddMode(false);
            }
        } else if (!isAddMode) {
            setIsSidebarOpen(false);
            setSelectedStudent(null);
        }
    }, [searchParams, students, isAddMode]);

    const loadStudents = async (): Promise<Student[]> => {
        setLoading(true);
        setError("");
        try {
            const supabase = await createSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            const basePath = typeof window !== "undefined" && window.location.pathname.startsWith("/app") ? "/app" : "";

            if (session?.access_token) {
                const res = await fetch(`${basePath}/api/students`, {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.students)) {
                        const transformed: Student[] = data.students.map((s: { id: string; name?: string; email?: string | null; phone?: string | null }) => ({
                            id: s.id,
                            name: s.name || "Unknown Student",
                            email: s.email ?? "N/A",
                            phone: s.phone ?? null,
                        }));
                        setStudents(transformed);
                        setLoading(false);
                        return transformed;
                    }
                }
            }

            const { students: fetchedStudents, error: fetchError } = await getStudents();
            if (fetchError) {
                setError(fetchError);
                setStudents([]);
                return [];
            }
            if (fetchedStudents) {
                const emailsFromAuth = await Promise.all(
                    fetchedStudents.map((s) => getStudentEmailFromAuth(s.id))
                );
                const transformedStudents: Student[] = fetchedStudents.map((s, i) => ({
                    id: s.id,
                    name: s.name || "Unknown Student",
                    email: emailsFromAuth[i] ?? s.email ?? "N/A",
                    phone: s.phone,
                }));
                setStudents(transformedStudents);
                return transformedStudents;
            }
            setStudents([]);
            return [];
        } catch (err: any) {
            console.error("[StudentsPageContent] Exception loading students:", err);
            setError(err.message || "Failed to load students");
            setStudents([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (student: Student) => {
        setSelectedStudent(student);
        setIsSidebarOpen(true);
        setSaveError(null);
        router.replace(`/dashboard/students?studentId=${student.id}`);
    };

    const handleEditClick = (student: Student, e: React.MouseEvent) => {
        e.stopPropagation();
        handleRowClick(student);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setSelectedStudent(null);
        setIsAddMode(false);
        setSaveError(null);
        setCreateError(null);
        setAddFormName("");
        setAddFormEmail("");
        setAddFormPhone("");
        router.replace("/dashboard/students");
    };

    const handleOpenAddStudent = () => {
        setIsAddMode(true);
        setSelectedStudent(null);
        setSaveError(null);
        setCreateError(null);
        setAddFormName("");
        setAddFormEmail("");
        setAddFormPhone("");
        setIsSidebarOpen(true);
    };

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addFormName.trim() || !addFormEmail.trim()) return;
        setCreating(true);
        setCreateError(null);
        try {
            const supabase = await createSupabaseClient();
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setCreateError("Not authenticated");
                return;
            }
            const basePath = typeof window !== "undefined" && window.location.pathname.startsWith("/app") ? "/app" : "";
            const res = await fetch(`${basePath}/api/students/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    email: addFormEmail.trim(),
                    fullName: addFormName.trim(),
                    phone: addFormPhone.trim() || undefined,
                }),
            });
            const data = await res.json();
            if (!data.success) {
                setCreateError(data.error || "Failed to create student");
                return;
            }
            const refreshed = await loadStudents();
            handleCloseSidebar();
            const newStudent = refreshed.find((s) => s.id === data.student?.id);
            if (newStudent) router.push(`/dashboard/students/${newStudent.id}`);
        } catch (err: any) {
            setCreateError(err.message || "Failed to create student");
        } finally {
            setCreating(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setSaving(true);
        setSaveError(null);
        const emailArg = selectedStudent.email === "N/A" ? undefined : selectedStudent.email;
        const { success, error: updateError } = await updateStudent(
            selectedStudent.id,
            selectedStudent.name || null,
            selectedStudent.phone || null,
            undefined,
            undefined,
            undefined,
            undefined,
            emailArg
        );
        setSaving(false);

        if (!success) {
            setSaveError(updateError || "Failed to save");
            return;
        }
        const refreshed = await loadStudents();
        const updated = refreshed.find((s) => s.id === selectedStudent.id);
        if (updated) setSelectedStudent(updated);
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
                <button
                    type="button"
                    onClick={handleOpenAddStudent}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
                >
                    Add student
                </button>
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
                title={isAddMode ? "Add student" : selectedStudent ? `Edit ${selectedStudent.name}` : "Student Details"}
            >
                {isAddMode ? (
                    <form onSubmit={handleCreateStudent} className="space-y-6">
                        {createError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                                {createError}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name *</label>
                            <input
                                type="text"
                                value={addFormName}
                                onChange={(e) => setAddFormName(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email *</label>
                            <input
                                type="email"
                                value={addFormEmail}
                                onChange={(e) => setAddFormEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={addFormPhone}
                                onChange={(e) => setAddFormPhone(formatPhone(e.target.value))}
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
                                disabled={creating}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                            >
                                {creating ? "Creating..." : "Create Student"}
                            </button>
                        </div>
                    </form>
                ) : selectedStudent ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        {saveError && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                                {saveError}
                            </div>
                        )}
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

                        <div className="pt-4 border-t border-gray-200 space-y-3">
                            <Link
                                href={`/dashboard/students/${selectedStudent.id}`}
                                className="text-sm font-medium text-black hover:underline"
                            >
                                View full profile →
                            </Link>
                            <div className="flex justify-end gap-3">
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
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-500">Select a student or add a new one.</p>
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
