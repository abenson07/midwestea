"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getClasses, getClassById, updateClass, deleteClass, createClass, generateClassId, getCourses, type Class, type Course } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";

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
    
    // Form state for adding new class
    const [newClassData, setNewClassData] = useState({
        courseId: "",
        enrollmentStart: "",
        enrollmentClose: "",
        classStartDate: "",
        classCloseDate: "",
        isOnline: false,
        lengthOfClass: "",
        certificationLength: "",
        graduationRate: "",
        registrationLimit: "",
        price: "",
        registrationFee: "",
    });

    useEffect(() => {
        loadClasses();
        loadCourses();
    }, []);

    const loadCourses = async () => {
        const { courses: fetchedCourses } = await getCourses();
        if (fetchedCourses) {
            setCourses(fetchedCourses);
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
            setIsSidebarOpen(true);
            setNewClassData({
                courseId: "",
                enrollmentStart: "",
                enrollmentClose: "",
                classStartDate: "",
                classCloseDate: "",
                isOnline: false,
                lengthOfClass: "",
                certificationLength: "",
                graduationRate: "",
                registrationLimit: "",
                price: "",
                registrationFee: "",
            });
        } else {
            setIsSidebarOpen(false);
            setSelectedClass(null);
            setIsAddMode(false);
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
        const { class: fetchedClass, error } = await getClassById(id);
        if (fetchedClass) {
            setSelectedClass(fetchedClass);
        }
        setLoadingDetail(false);
    };

    const handleRowClick = (classItem: Class) => {
        router.push(`/dashboard/classes/${classItem.id}`);
    };

    const handleEditClick = (classItem: Class, e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/dashboard/classes?classId=${classItem.id}`);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setIsAddMode(false);
        router.push("/dashboard/classes");
    };

    const handleAddClassClick = () => {
        router.push("/dashboard/classes?mode=add");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isAddMode) {
            await handleCreateClass();
        } else {
            await handleUpdateClass();
        }
    };

    const handleCreateClass = async () => {
        if (!newClassData.courseId) {
            alert("Please select a course");
            return;
        }

        const selectedCourse = courses.find(c => c.id === newClassData.courseId);
        if (!selectedCourse) {
            alert("Selected course not found");
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
                newClassData.enrollmentStart || null,
                newClassData.enrollmentClose || null,
                newClassData.classStartDate || null,
                newClassData.classCloseDate || null,
                newClassData.isOnline,
                newClassData.lengthOfClass || null,
                newClassData.certificationLength ? parseInt(newClassData.certificationLength, 10) : null,
                parsePercentage(newClassData.graduationRate),
                newClassData.registrationLimit ? parseInt(newClassData.registrationLimit, 10) : null,
                parseDollars(newClassData.price),
                parseDollars(newClassData.registrationFee),
                selectedCourse.stripe_product_id || null
            );

            if (result.success) {
                await loadClasses(); // Refresh list
                handleCloseSidebar();
            } else {
                alert(`Failed to create class: ${result.error}`);
            }
        } catch (err) {
            alert("An unexpected error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateClass = async () => {
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
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={isAddMode ? "Add New Class" : selectedClass ? `Edit ${selectedClass.class_id}` : "Class Details"}
            >
                {loadingDetail ? (
                    <div className="flex justify-center py-8">
                        <p className="text-gray-500">Loading details...</p>
                    </div>
                ) : isAddMode ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Course Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course*</label>
                            <select
                                value={newClassData.courseId}
                                onChange={(e) => {
                                    const courseId = e.target.value;
                                    const selectedCourse = courses.find(c => c.id === courseId);
                                    setNewClassData({
                                        ...newClassData,
                                        courseId,
                                        lengthOfClass: selectedCourse?.length_of_class || "",
                                        certificationLength: selectedCourse?.certification_length?.toString() || "",
                                        graduationRate: selectedCourse?.graduation_rate ? (selectedCourse.graduation_rate / 100).toFixed(2) : "",
                                        registrationLimit: selectedCourse?.registration_limit?.toString() || "",
                                        price: selectedCourse?.price ? (selectedCourse.price / 100).toFixed(2) : "",
                                        registrationFee: selectedCourse?.registration_fee ? (selectedCourse.registration_fee / 100).toFixed(2) : "",
                                    });
                                }}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                required
                            >
                                <option value="">Select a course</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.course_code} - {course.course_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Enrollment Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Enrollment Start</label>
                                <input
                                    type="date"
                                    value={newClassData.enrollmentStart}
                                    onChange={(e) => setNewClassData({ ...newClassData, enrollmentStart: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Enrollment Close</label>
                                <input
                                    type="date"
                                    value={newClassData.enrollmentClose}
                                    onChange={(e) => setNewClassData({ ...newClassData, enrollmentClose: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        {/* Class Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class Start</label>
                                <input
                                    type="date"
                                    value={newClassData.classStartDate}
                                    onChange={(e) => setNewClassData({ ...newClassData, classStartDate: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Class End</label>
                                <input
                                    type="date"
                                    value={newClassData.classCloseDate}
                                    onChange={(e) => setNewClassData({ ...newClassData, classCloseDate: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        {/* Online Checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isOnline"
                                checked={newClassData.isOnline}
                                onChange={(e) => setNewClassData({ ...newClassData, isOnline: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <label htmlFor="isOnline" className="text-sm font-medium text-gray-700">Online Class</label>
                        </div>

                        {/* Class Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Length of Class</label>
                                <input
                                    type="text"
                                    value={newClassData.lengthOfClass}
                                    onChange={(e) => setNewClassData({ ...newClassData, lengthOfClass: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Limit</label>
                                <input
                                    type="number"
                                    value={newClassData.registrationLimit}
                                    onChange={(e) => setNewClassData({ ...newClassData, registrationLimit: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cert. Length</label>
                                <input
                                    type="number"
                                    value={newClassData.certificationLength}
                                    onChange={(e) => setNewClassData({ ...newClassData, certificationLength: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Graduation Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newClassData.graduationRate}
                                    onChange={(e) => setNewClassData({ ...newClassData, graduationRate: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newClassData.price}
                                    onChange={(e) => setNewClassData({ ...newClassData, price: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reg. Fee ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newClassData.registrationFee}
                                    onChange={(e) => setNewClassData({ ...newClassData, registrationFee: e.target.value })}
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
                                {saving ? "Creating..." : "Create Class"}
                            </button>
                        </div>
                    </form>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div className="pt-4 border-t border-gray-200 space-y-3">
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
                                    disabled={saving || deleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={saving || deleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                                >
                                    Delete Class
                                </button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <p className="text-gray-500">Class not found.</p>
                )}
            </DetailSidebar>

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

