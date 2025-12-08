"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPrograms, createProgram, type Course } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatCurrency } from "@midwestea/utils";

function ProgramsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [programs, setPrograms] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
        const mode = searchParams.get("mode");
        if (mode === "add") {
            setIsAddMode(true);
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
            setIsAddMode(false);
        }
    }, [searchParams]);

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
        router.push(`/dashboard/programs/${program.id}`);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setIsAddMode(false);
        router.push("/dashboard/programs");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleCreateProgram();
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


    const columns = [
        { header: "Course Code", accessorKey: "course_code" as keyof Course, className: "font-medium" },
        { header: "Course Name", accessorKey: "course_name" as keyof Course },
        {
            header: "Price",
            accessorKey: "price" as keyof Course,
            cell: (item: Course) => formatCurrency(item.price)
        },
        {
            header: "Reg. Fee",
            accessorKey: "registration_fee" as keyof Course,
            cell: (item: Course) => formatCurrency(item.registration_fee)
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage program offerings</p>
                </div>
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
                emptyMessage="No programs found."
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title="Add New Program"
            >
                {isAddMode ? (
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
                ) : null}
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

