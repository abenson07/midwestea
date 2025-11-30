"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPrograms, getCourseById, updateCourse, createProgram, type Course } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

function ProgramsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [programs, setPrograms] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [selectedProgram, setSelectedProgram] = useState<Course | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    
    // Form state for adding new program
    const [newProgramData, setNewProgramData] = useState({
        programName: "",
        programCode: "",
        lengthOfClass: "",
        certificationLength: "",
        graduationRate: "",
        registrationLimit: "",
        price: "",
        registrationFee: "",
    });

    useEffect(() => {
        loadPrograms();
    }, []);

    // Handle URL params for deep linking
    useEffect(() => {
        const programId = searchParams.get("programId");
        const mode = searchParams.get("mode");
        if (programId) {
            setIsAddMode(false);
            loadProgramDetail(programId);
        } else if (mode === "add") {
            setIsAddMode(true);
            setSelectedProgram(null);
            setIsSidebarOpen(true);
            setNewProgramData({
                programName: "",
                programCode: "",
                lengthOfClass: "",
                certificationLength: "",
                graduationRate: "",
                registrationLimit: "",
                price: "",
                registrationFee: "",
            });
        } else {
            setIsSidebarOpen(false);
            setSelectedProgram(null);
            setIsAddMode(false);
        }
    }, [searchParams]);

    const loadProgramDetail = async (id: string) => {
        setLoadingDetail(true);
        setIsSidebarOpen(true);
        const { course: fetchedProgram, error } = await getCourseById(id);
        if (fetchedProgram) {
            setSelectedProgram(fetchedProgram);
        }
        setLoadingDetail(false);
    };

    const loadPrograms = async () => {
        setLoading(true);
        const { programs: fetchedPrograms, error: fetchError } = await getPrograms();
        if (fetchError) {
            setError(fetchError);
        } else if (fetchedPrograms) {
            setPrograms(fetchedPrograms);
        }
        setLoading(false);
    };

    const handleRowClick = (program: Course) => {
        router.push(`/programs/${program.id}`);
    };

    const handleEditClick = (program: Course, e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/programs?programId=${program.id}`);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setIsAddMode(false);
        router.push("/programs");
    };

    const handleAddProgramClick = () => {
        router.push("/programs?mode=add");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isAddMode) {
            await handleCreateProgram();
        } else {
            await handleUpdateProgram();
        }
    };

    const handleCreateProgram = async () => {
        if (!newProgramData.programName || !newProgramData.programCode) {
            alert("Please fill in all required fields");
            return;
        }

        setSaving(true);

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

        const result = await createProgram(
            newProgramData.programName,
            newProgramData.programCode,
            newProgramData.lengthOfClass || null,
            newProgramData.certificationLength ? parseInt(newProgramData.certificationLength, 10) : null,
            parsePercentage(newProgramData.graduationRate),
            newProgramData.registrationLimit ? parseInt(newProgramData.registrationLimit, 10) : null,
            parseDollars(newProgramData.price),
            parseDollars(newProgramData.registrationFee),
            null
        );

        if (result.success) {
            await loadPrograms(); // Refresh list
            handleCloseSidebar();
        } else {
            alert(`Failed to create program: ${result.error}`);
        }
        setSaving(false);
    };

    const handleUpdateProgram = async () => {
        if (!selectedProgram) return;

        setSaving(true);
        const { success, error } = await updateCourse(
            selectedProgram.id,
            selectedProgram.course_name,
            selectedProgram.course_code,
            selectedProgram.length_of_class,
            selectedProgram.certification_length,
            selectedProgram.graduation_rate,
            selectedProgram.registration_limit,
            selectedProgram.price,
            selectedProgram.registration_fee,
            selectedProgram.stripe_product_id
        );

        if (success) {
            await loadPrograms(); // Refresh list
            handleCloseSidebar();
        } else {
            alert(`Failed to save: ${error}`);
        }
        setSaving(false);
    };

    const columns = [
        { header: "Course Code", accessorKey: "course_code" as keyof Course, className: "font-medium" },
        { header: "Course Name", accessorKey: "course_name" as keyof Course },
        {
            header: "Price",
            accessorKey: "price" as keyof Course,
            cell: (item: Course) => item.price ? `$${(item.price / 100).toFixed(2)}` : "—"
        },
        {
            header: "Reg. Fee",
            accessorKey: "registration_fee" as keyof Course,
            cell: (item: Course) => item.registration_fee ? `$${(item.registration_fee / 100).toFixed(2)}` : "—"
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage program offerings</p>
                </div>
                <button
                    onClick={handleAddProgramClick}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
                >
                    Add Program
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <DataTable
                data={programs}
                columns={columns}
                isLoading={loading}
                onRowClick={handleRowClick}
                onEditClick={handleEditClick}
                emptyMessage="No programs found."
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={isAddMode ? "Add New Program" : selectedProgram ? `Edit ${selectedProgram.course_code}` : "Program Details"}
            >
                {loadingDetail ? (
                    <div className="flex justify-center py-8">
                        <p className="text-gray-500">Loading details...</p>
                    </div>
                ) : isAddMode ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Name*</label>
                            <input
                                type="text"
                                value={newProgramData.programName}
                                onChange={(e) => setNewProgramData({ ...newProgramData, programName: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Code*</label>
                            <input
                                type="text"
                                value={newProgramData.programCode}
                                onChange={(e) => setNewProgramData({ ...newProgramData, programCode: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Length of Class</label>
                                <input
                                    type="text"
                                    value={newProgramData.lengthOfClass}
                                    onChange={(e) => setNewProgramData({ ...newProgramData, lengthOfClass: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Limit</label>
                                <input
                                    type="number"
                                    value={newProgramData.registrationLimit}
                                    onChange={(e) => setNewProgramData({ ...newProgramData, registrationLimit: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cert. Length</label>
                                <input
                                    type="number"
                                    value={newProgramData.certificationLength}
                                    onChange={(e) => setNewProgramData({ ...newProgramData, certificationLength: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Graduation Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProgramData.graduationRate}
                                    onChange={(e) => setNewProgramData({ ...newProgramData, graduationRate: e.target.value })}
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
                                    value={newProgramData.price}
                                    onChange={(e) => setNewProgramData({ ...newProgramData, price: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reg. Fee ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newProgramData.registrationFee}
                                    onChange={(e) => setNewProgramData({ ...newProgramData, registrationFee: e.target.value })}
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
                                {saving ? "Creating..." : "Create Program"}
                            </button>
                        </div>
                    </form>
                ) : selectedProgram ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Name</label>
                            <input
                                type="text"
                                value={selectedProgram.course_name}
                                onChange={(e) => setSelectedProgram({ ...selectedProgram, course_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Program Code</label>
                            <input
                                type="text"
                                value={selectedProgram.course_code}
                                onChange={(e) => setSelectedProgram({ ...selectedProgram, course_code: e.target.value })}
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
                    <p className="text-gray-500">Program not found.</p>
                )}
            </DetailSidebar>
        </div>
    );
}

export default function ProgramsPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage program offerings</p>
                    </div>
                </div>
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <ProgramsPageContent />
        </Suspense>
    );
}

