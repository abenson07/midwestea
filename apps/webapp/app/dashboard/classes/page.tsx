"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getClasses, getClassById, updateClass, deleteClass, createClass, generateClassId, getCourses, getPrograms, type Class, type Course } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { CreateClassModal, type ClassFormData } from "@/components/ui/CreateClassModal";

function ClassesPageContent() {
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
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [programs, setPrograms] = useState<Course[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadClasses();
        loadCourses();
        loadPrograms();
    }, []);

    const loadCourses = async () => {
        const { courses: fetchedCourses } = await getCourses();
        if (fetchedCourses) {
            setCourses(fetchedCourses);
        }
    };

    const loadPrograms = async () => {
        const { programs: fetchedPrograms } = await getPrograms();
        if (fetchedPrograms) {
            setPrograms(fetchedPrograms);
        }
    };

    // Handle URL params for deep linking
    useEffect(() => {
        const classId = searchParams.get("classId");
        const mode = searchParams.get("mode");
        if (classId) {
            setIsAddMode(false);
            loadClassDetail(classId);
        } else if (mode === "add") {
            setIsAddMode(true);
            setSelectedClass(null);
            setIsSidebarOpen(false);
            setIsModalOpen(true);
        } else {
            setIsSidebarOpen(false);
            setSelectedClass(null);
            setIsAddMode(false);
            setIsModalOpen(false);
        }
    }, [searchParams]);

    const loadClasses = async () => {
        setLoading(true);
        const { classes: fetchedClasses, error: fetchError } = await getClasses();

        if (fetchError) {
            console.error("Error fetching classes:", fetchError);
            setError(fetchError);
        } else if (fetchedClasses) {
            setClasses(fetchedClasses);
        }
        setLoading(false);
    };

    const loadClassDetail = async (id: string) => {
        setLoadingDetail(true);
        setIsSidebarOpen(true);
        setIsAddMode(false);
        setIsModalOpen(false);
        const { class: fetchedClass, error } = await getClassById(id);
        if (fetchedClass) {
            setSelectedClass(fetchedClass);
        }
        setLoadingDetail(false);
    };

    const handleRowClick = (classItem: Class) => {
        router.push(`/dashboard/classes/${classItem.id}?from=classes`);
    };

    const handleEditClick = (classItem: Class, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedClass(classItem);
        setIsAddMode(false);
        setIsModalOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setIsAddMode(false);
        setIsModalOpen(false);
        router.push("/dashboard/classes");
    };

    const handleAddClassClick = () => {
        setIsModalOpen(true);
        setIsAddMode(true);
    };

    const handleCreateClass = async (formData: ClassFormData) => {
        if (!formData.courseId) {
            alert("Please select a course or program");
            return;
        }

        const selectedCourse = [...courses, ...programs].find(c => c.id === formData.courseId);
        if (!selectedCourse) {
            alert("Selected course/program not found");
            return;
        }

        setSaving(true);

        try {
            // Generate class_id
            const { classId, error: classIdError } = await generateClassId(selectedCourse.course_code);
            
            if (classIdError || !classId) {
                alert(classIdError || "Failed to generate class ID");
                setSaving(false);
                return;
            }

            // Helper functions for parsing
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

            // Create the class
            const result = await createClass(
                selectedCourse.id,
                selectedCourse.course_name,
                selectedCourse.course_code,
                classId,
                formData.enrollmentOpenDate || null,
                formData.enrollmentCloseDate || null,
                formData.classStartDate || null,
                formData.classEndDate || null,
                formData.classType === 'online',
                selectedCourse.programming_offering || null,
                selectedCourse.course_image || null,
                null, // length_of_class
                formData.certificateLength ? parseInt(formData.certificateLength, 10) : null,
                formData.registrationLimit ? parseInt(formData.registrationLimit, 10) : null,
                parseDollars(formData.price),
                parseDollars(formData.registrationFee),
                selectedCourse.stripe_product_id || null
            );

            if (result.success) {
                await loadClasses(); // Refresh list
                setIsModalOpen(false);
                setIsAddMode(false);
            } else {
                alert(`Failed to create class: ${result.error}`);
            }
        } catch (err) {
            alert("An unexpected error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateClass = async (formData: ClassFormData) => {
        if (!selectedClass) return;

        setSaving(true);

        // Helper functions for parsing
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

        const { success, error } = await updateClass(
            selectedClass.id,
            formData.enrollmentOpenDate || null,
            formData.enrollmentCloseDate || null,
            formData.classStartDate || null,
            formData.classEndDate || null,
            formData.classType === 'online',
            formData.programmingOffering || null,
            selectedClass.class_image || null,
            null, // length_of_class
            formData.certificateLength ? parseInt(formData.certificateLength, 10) : null,
            formData.registrationLimit ? parseInt(formData.registrationLimit, 10) : null,
            parseDollars(formData.price),
            parseDollars(formData.registrationFee)
        );

        if (success) {
            await loadClasses(); // Refresh list
            setIsModalOpen(false);
            setIsSidebarOpen(false);
        } else {
            alert(`Failed to save: ${error}`);
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!selectedClass) return;

        setDeleting(true);
        const result = await deleteClass(selectedClass.id);

        if (result.success) {
            await loadClasses(); // Refresh list
            handleCloseSidebar();
        } else {
            alert(`Failed to delete: ${result.error}`);
        }
        setDeleting(false);
        setShowDeleteConfirm(false);
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
                <button
                    onClick={handleAddClassClick}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
                >
                    Add Class
                </button>
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
                onEditClick={handleEditClick}
                emptyMessage="No classes found."
            />


            <DetailSidebar
                isOpen={isSidebarOpen && !isAddMode}
                onClose={handleCloseSidebar}
                title={selectedClass ? `View ${selectedClass.class_id}` : "Class Details"}
            >
                {loadingDetail ? (
                    <div className="flex justify-center py-8">
                        <p className="text-gray-500">Loading details...</p>
                    </div>
                ) : selectedClass ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class Name</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedClass.class_name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Code</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedClass.course_code}</p>
                        </div>
                        <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(true);
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                            >
                                Edit Class
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">No class selected.</p>
                )}
            </DetailSidebar>

            {/* Create/Edit Class Modal */}
            {isModalOpen && (
                <CreateClassModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setIsAddMode(false);
                        if (!selectedClass) {
                            router.push("/dashboard/classes");
                        }
                    }}
                    onSubmit={isAddMode ? handleCreateClass : handleUpdateClass}
                    context="classes"
                    editingClass={selectedClass || undefined}
                    programs={programs}
                    courses={courses}
                />
            )}


            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && selectedClass && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold text-black mb-4">Delete Class</h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete <strong>{selectedClass.class_name}</strong> ({selectedClass.class_id})? 
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="px-4 py-2 text-black border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ClassesPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage scheduled classes</p>
                    </div>
                </div>
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <ClassesPageContent />
        </Suspense>
    );
}

