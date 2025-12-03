"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCourses, getCourseById, updateCourse, createCourse, type Course } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { formatCurrency } from "@midwestea/utils";

function CoursesPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    
    // Form state for adding new course
    const [newCourseData, setNewCourseData] = useState({
        courseName: "",
        courseCode: "",
        lengthOfClass: "",
        certificationLength: "",
        graduationRate: "",
        registrationLimit: "",
        price: "",
        registrationFee: "",
    });

    useEffect(() => {
        loadCourses();
    }, []);

    // Handle URL params for deep linking
    useEffect(() => {
        const courseId = searchParams.get("courseId");
        const mode = searchParams.get("mode");
        if (courseId) {
            setIsAddMode(false);
            loadCourseDetail(courseId);
        } else if (mode === "add") {
            setIsAddMode(true);
            setSelectedCourse(null);
            setIsSidebarOpen(true);
            setNewCourseData({
                courseName: "",
                courseCode: "",
                lengthOfClass: "",
                certificationLength: "",
                graduationRate: "",
                registrationLimit: "",
                price: "",
                registrationFee: "",
            });
        } else {
            setIsSidebarOpen(false);
            setSelectedCourse(null);
            setIsAddMode(false);
        }
    }, [searchParams]);

    const loadCourses = async () => {
        setLoading(true);
        const { courses: fetchedCourses, error: fetchError } = await getCourses();

        if (fetchError) {
            setError(fetchError);
        } else if (fetchedCourses) {
            setCourses(fetchedCourses);
        }
        setLoading(false);
    };

    const loadCourseDetail = async (id: string) => {
        setLoadingDetail(true);
        setIsSidebarOpen(true);
        const { course: fetchedCourse, error } = await getCourseById(id);
        if (fetchedCourse) {
            setSelectedCourse(fetchedCourse);
        }
        setLoadingDetail(false);
    };

    const handleRowClick = (course: Course) => {
        router.push(`/dashboard/courses/${course.id}`);
    };

    const handleEditClick = (course: Course, e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/dashboard/courses?courseId=${course.id}`);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        setIsAddMode(false);
        router.push("/dashboard/courses");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isAddMode) {
            await handleCreateCourse();
        } else {
            await handleUpdateCourse();
        }
    };

    const handleCreateCourse = async () => {
        if (!newCourseData.courseName || !newCourseData.courseCode) {
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

        const result = await createCourse(
            newCourseData.courseName,
            newCourseData.courseCode,
            newCourseData.lengthOfClass || null,
            newCourseData.certificationLength ? parseInt(newCourseData.certificationLength, 10) : null,
            parsePercentage(newCourseData.graduationRate),
            newCourseData.registrationLimit ? parseInt(newCourseData.registrationLimit, 10) : null,
            parseDollars(newCourseData.price),
            parseDollars(newCourseData.registrationFee),
            null
        );

        if (result.success) {
            await loadCourses(); // Refresh list
            handleCloseSidebar();
        } else {
            alert(`Failed to create course: ${result.error}`);
        }
        setSaving(false);
    };

    const handleUpdateCourse = async () => {
        if (!selectedCourse) return;

        setSaving(true);
        const { success, error } = await updateCourse(
            selectedCourse.id,
            selectedCourse.course_name,
            selectedCourse.course_code,
            selectedCourse.length_of_class,
            selectedCourse.certification_length,
            selectedCourse.graduation_rate,
            selectedCourse.registration_limit,
            selectedCourse.price,
            selectedCourse.registration_fee,
            selectedCourse.stripe_product_id
        );

        if (success) {
            await loadCourses(); // Refresh list
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
                    <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your course offerings</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                </div>
            )}

            <DataTable
                data={courses}
                columns={columns}
                isLoading={loading}
                onRowClick={handleRowClick}
                onEditClick={handleEditClick}
                emptyMessage="No courses found."
            />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={isAddMode ? "Add New Course" : selectedCourse ? `Edit ${selectedCourse.course_code}` : "Course Details"}
            >
                {loadingDetail ? (
                    <div className="flex justify-center py-8">
                        <p className="text-gray-500">Loading details...</p>
                    </div>
                ) : isAddMode ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Name*</label>
                            <input
                                type="text"
                                value={newCourseData.courseName}
                                onChange={(e) => setNewCourseData({ ...newCourseData, courseName: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Code*</label>
                            <input
                                type="text"
                                value={newCourseData.courseCode}
                                onChange={(e) => setNewCourseData({ ...newCourseData, courseCode: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Length of Class</label>
                                <input
                                    type="text"
                                    value={newCourseData.lengthOfClass}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, lengthOfClass: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Limit</label>
                                <input
                                    type="number"
                                    value={newCourseData.registrationLimit}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, registrationLimit: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cert. Length</label>
                                <input
                                    type="number"
                                    value={newCourseData.certificationLength}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, certificationLength: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Graduation Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newCourseData.graduationRate}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, graduationRate: e.target.value })}
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
                                    value={newCourseData.price}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, price: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reg. Fee ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={newCourseData.registrationFee}
                                    onChange={(e) => setNewCourseData({ ...newCourseData, registrationFee: e.target.value })}
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
                                {saving ? "Creating..." : "Create Course"}
                            </button>
                        </div>
                    </form>
                ) : selectedCourse ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Name</label>
                            <input
                                type="text"
                                value={selectedCourse.course_name}
                                onChange={(e) => setSelectedCourse({ ...selectedCourse, course_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Code</label>
                            <input
                                type="text"
                                value={selectedCourse.course_code}
                                onChange={(e) => setSelectedCourse({ ...selectedCourse, course_code: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Length of Class</label>
                                <input
                                    type="text"
                                    value={selectedCourse.length_of_class || ''}
                                    onChange={(e) => setSelectedCourse({ ...selectedCourse, length_of_class: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Limit</label>
                                <input
                                    type="number"
                                    value={selectedCourse.registration_limit || ''}
                                    onChange={(e) => setSelectedCourse({ ...selectedCourse, registration_limit: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cert. Length</label>
                                <input
                                    type="number"
                                    value={selectedCourse.certification_length || ''}
                                    onChange={(e) => setSelectedCourse({ ...selectedCourse, certification_length: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Graduation Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={selectedCourse.graduation_rate ? (selectedCourse.graduation_rate / 100).toFixed(2) : ''}
                                    onChange={(e) => setSelectedCourse({ ...selectedCourse, graduation_rate: parseFloat(e.target.value) * 100 || null })}
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
                                    value={selectedCourse.price ? (selectedCourse.price / 100).toFixed(2) : ''}
                                    onChange={(e) => setSelectedCourse({ ...selectedCourse, price: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reg. Fee ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={selectedCourse.registration_fee ? (selectedCourse.registration_fee / 100).toFixed(2) : ''}
                                    onChange={(e) => setSelectedCourse({ ...selectedCourse, registration_fee: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stripe Product ID</label>
                            <input
                                type="text"
                                value={selectedCourse.stripe_product_id || ''}
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
                    <p className="text-gray-500">Course not found.</p>
                )}
            </DetailSidebar>
        </div>
    );
}

export default function CoursesPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your course offerings</p>
                    </div>
                </div>
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <CoursesPageContent />
        </Suspense>
    );
}
