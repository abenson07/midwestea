"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClasses, getCourseById, updateCourse, type Class, type Course } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

function ProgramDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const programId = params?.id as string;

    const [program, setProgram] = useState<Course | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (programId) {
            loadProgram();
        }
    }, [programId]);

    // Load classes after program is loaded so we can filter by course_code
    useEffect(() => {
        if (program) {
            loadClasses();
        }
    }, [program]);

    // Handle URL params for sidebar
    useEffect(() => {
        const editParam = searchParams.get("edit");
        if (editParam === "true" && program) {
            setIsSidebarOpen(true);
        }
    }, [searchParams, program]);

    const loadProgram = async () => {
        if (!programId) return;
        setLoading(true);
        const { course: fetchedProgram, error: fetchError } = await getCourseById(programId);
        if (fetchError) {
            setError(fetchError);
        } else if (fetchedProgram) {
            setProgram(fetchedProgram);
        }
        setLoading(false);
    };

    const loadClasses = async () => {
        if (!programId || !program) return;
        setLoadingClasses(true);
        const { classes: fetchedClasses, error: fetchError } = await getClasses();
        if (fetchError) {
            console.error("Error fetching classes:", fetchError);
        } else if (fetchedClasses) {
            // Filter classes by matching course_code
            const programClasses = fetchedClasses.filter(c => c.course_code === program.course_code);
            setClasses(programClasses);
        }
        setLoadingClasses(false);
    };

    const handleEdit = () => {
        router.push(`/programs/${programId}?edit=true`);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push(`/programs/${programId}`);
    };

    const handleClassClick = (classItem: Class) => {
        router.push(`/classes/${classItem.id}`);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!program) return;

        setSaving(true);
        const { success, error } = await updateCourse(
            program.id,
            program.course_name,
            program.course_code,
            program.length_of_class,
            program.certification_length,
            program.graduation_rate,
            program.registration_limit,
            program.price,
            program.registration_fee,
            program.stripe_product_id
        );

        if (success) {
            await loadProgram();
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
                    <p className="text-gray-500">Loading program details...</p>
                </div>
            </div>
        );
    }

    if (!program) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 items-center py-8">
                    <p className="text-red-600">{error || "Program not found"}</p>
                    <Link
                        href="/programs"
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                        Back to Programs
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
                        href="/programs"
                        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                    >
                        ← Back to Programs
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{program.course_name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{program.course_code}</p>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Program Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Program Name</label>
                        <p className="mt-1 text-sm text-gray-900">{program.course_name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Program Code</label>
                        <p className="mt-1 text-sm text-gray-900">{program.course_code}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Price</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {program.price ? `$${(program.price / 100).toFixed(2)}` : "—"}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Registration Fee</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {program.registration_fee ? `$${(program.registration_fee / 100).toFixed(2)}` : "—"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Classes Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
                    <Link
                        href={`/classes/add?programId=${programId}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
                    >
                        Add Class
                    </Link>
                </div>
                <DataTable
                    data={classes}
                    columns={classColumns}
                    isLoading={loadingClasses}
                    onRowClick={handleClassClick}
                    emptyMessage="No classes found for this program."
                />
            </div>

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={`Edit ${program.course_code}`}
            >
                {program ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Name</label>
                            <input
                                type="text"
                                value={program.course_name}
                                onChange={(e) => setProgram({ ...program, course_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Code</label>
                            <input
                                type="text"
                                value={program.course_code}
                                onChange={(e) => setProgram({ ...program, course_code: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Length of Class</label>
                                <input
                                    type="text"
                                    value={program.length_of_class || ''}
                                    onChange={(e) => setProgram({ ...program, length_of_class: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Limit</label>
                                <input
                                    type="number"
                                    value={program.registration_limit || ''}
                                    onChange={(e) => setProgram({ ...program, registration_limit: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cert. Length</label>
                                <input
                                    type="number"
                                    value={program.certification_length || ''}
                                    onChange={(e) => setProgram({ ...program, certification_length: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Graduation Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={program.graduation_rate ? (program.graduation_rate / 100).toFixed(2) : ''}
                                    onChange={(e) => setProgram({ ...program, graduation_rate: parseFloat(e.target.value) * 100 || null })}
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
                                    value={program.price ? (program.price / 100).toFixed(2) : ''}
                                    onChange={(e) => setProgram({ ...program, price: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reg. Fee ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={program.registration_fee ? (program.registration_fee / 100).toFixed(2) : ''}
                                    onChange={(e) => setProgram({ ...program, registration_fee: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stripe Product ID</label>
                            <input
                                type="text"
                                value={program.stripe_product_id || ''}
                                readOnly
                                disabled
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm sm:text-sm p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
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
                    <p className="text-gray-500">Program not found.</p>
                )}
            </DetailSidebar>
        </div>
    );
}

export default function ProgramDetailPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <ProgramDetailContent />
        </Suspense>
    );
}

