"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCourseById, updateCourse, getClasses, createClass, generateClassId, getPrograms, getCourses, type Course, type Class } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { LogDisplay } from "@/components/ui/LogDisplay";
import { CreateClassModal, type ClassFormData } from "@/components/ui/CreateClassModal";
import { formatCurrency } from "@midwestea/utils";
import { createSupabaseClient } from "@midwestea/utils";

function CourseDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params?.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [originalCourse, setOriginalCourse] = useState<Course | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [programs, setPrograms] = useState<Course[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Modal state
    const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);

    useEffect(() => {
        if (courseId) {
            loadCourse();
        }
        loadPrograms();
        loadCourses();
    }, [courseId]);

    const loadPrograms = async () => {
        const { programs: fetchedPrograms } = await getPrograms();
        if (fetchedPrograms) {
            setPrograms(fetchedPrograms);
        }
    };

    const loadCourses = async () => {
        const { courses: fetchedCourses } = await getCourses();
        if (fetchedCourses) {
            setCourses(fetchedCourses);
        }
    };

    // Load classes after course is loaded so we can filter by course_code
    useEffect(() => {
        if (course) {
            loadClasses();
        }
    }, [course]);

    // Handle URL params for sidebar
    useEffect(() => {
        const editParam = searchParams.get("edit");
        if (editParam === "true" && course) {
            setIsSidebarOpen(true);
        }
    }, [searchParams, course]);

    const loadCourse = async () => {
        if (!courseId) return;
        setLoading(true);
        const { course: fetchedCourse, error: fetchError } = await getCourseById(courseId);
        if (fetchError) {
            setError(fetchError);
        } else if (fetchedCourse) {
            setCourse(fetchedCourse);
            // Store original values for comparison when saving
            setOriginalCourse({ ...fetchedCourse });
        }
        setLoading(false);
    };

    const loadClasses = async () => {
        if (!courseId || !course) return;
        setLoadingClasses(true);
        const { classes: fetchedClasses, error: fetchError } = await getClasses();
        if (fetchError) {
            console.error("Error fetching classes:", fetchError);
        } else if (fetchedClasses) {
            // Filter classes by matching course_code
            const courseClasses = fetchedClasses.filter(c => c.course_code === course.course_code);
            setClasses(courseClasses);
        }
        setLoadingClasses(false);
    };

    const handleEdit = () => {
        router.push(`/dashboard/courses/${courseId}?edit=true`);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push(`/dashboard/courses/${courseId}`);
    };

    const handleClassClick = (classItem: Class) => {
        router.push(`/dashboard/classes/${classItem.id}?from=course&courseId=${courseId}`);
    };

    const handleCreateClass = async (formData: ClassFormData) => {
        if (!formData.courseId) {
            alert("Please select a program or course");
            return;
        }

        // Find the selected program/course
        const selectedCourse = [...programs, ...courses].find(c => c.id === formData.courseId);
        if (!selectedCourse) {
            alert("Selected program/course not found");
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
                formData.courseId,
                selectedCourse.course_name,
                selectedCourse.course_code,
                classId,
                formData.enrollmentOpenDate || null,
                formData.enrollmentCloseDate || null,
                formData.classStartDate || null,
                formData.classEndDate || null,
                formData.classType === 'online',
                null, // length_of_class
                formData.certificateLength ? parseInt(formData.certificateLength, 10) : null,
                parsePercentage(formData.graduationRate),
                formData.registrationLimit ? parseInt(formData.registrationLimit, 10) : null,
                parseDollars(formData.price),
                parseDollars(formData.registrationFee),
                selectedCourse.stripe_product_id || null
            );

            if (result.success) {
                await loadClasses(); // Refresh list
                setIsCreateClassModalOpen(false);
            } else {
                alert(`Failed to create class: ${result.error}`);
            }
        } catch (err) {
            alert("An unexpected error occurred");
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course || !originalCourse) return;

        setSaving(true);

        // Use original values for comparison (from when data was loaded)
        const oldValues = {
            course_name: originalCourse.course_name,
            course_code: originalCourse.course_code,
            length_of_class: originalCourse.length_of_class,
            certification_length: originalCourse.certification_length,
            graduation_rate: originalCourse.graduation_rate,
            registration_limit: originalCourse.registration_limit,
            price: originalCourse.price,
            registration_fee: originalCourse.registration_fee,
        };

        // Generate batch_id for this save operation
        const batchId = crypto.randomUUID();

        // Perform update
        const { success, error } = await updateCourse(
            course.id,
            course.course_name,
            course.course_code,
            course.length_of_class,
            course.certification_length,
            course.graduation_rate,
            course.registration_limit,
            course.price,
            course.registration_fee,
            course.stripe_product_id
        );

        if (success) {
            // Log field changes - compare against original values
            const fieldChanges: Array<{ field_name: string; old_value: string | null; new_value: string | null }> = [];

            // Compare name (maps to "name" in FIELD_LABELS)
            if (oldValues.course_name !== course.course_name) {
                fieldChanges.push({
                    field_name: "name",
                    old_value: oldValues.course_name || null,
                    new_value: course.course_name || null,
                });
            }

            // Note: course_code is not editable (read-only) to prevent foreign key constraint violations
            // So we don't need to track changes to it

            // Compare length_of_class
            if (oldValues.length_of_class !== course.length_of_class) {
                fieldChanges.push({
                    field_name: "length_of_class",
                    old_value: oldValues.length_of_class || null,
                    new_value: course.length_of_class || null,
                });
            }

            // Compare certification_length
            if (oldValues.certification_length !== course.certification_length) {
                fieldChanges.push({
                    field_name: "certification_length",
                    old_value: oldValues.certification_length ? String(oldValues.certification_length) : null,
                    new_value: course.certification_length ? String(course.certification_length) : null,
                });
            }

            // Compare graduation_rate
            if (oldValues.graduation_rate !== course.graduation_rate) {
                fieldChanges.push({
                    field_name: "graduation_rate",
                    old_value: oldValues.graduation_rate ? String(oldValues.graduation_rate) : null,
                    new_value: course.graduation_rate ? String(course.graduation_rate) : null,
                });
            }

            // Compare registration_limit
            if (oldValues.registration_limit !== course.registration_limit) {
                fieldChanges.push({
                    field_name: "registration_limit",
                    old_value: oldValues.registration_limit ? String(oldValues.registration_limit) : null,
                    new_value: course.registration_limit ? String(course.registration_limit) : null,
                });
            }

            // Compare price (stored in cents)
            if (oldValues.price !== course.price) {
                fieldChanges.push({
                    field_name: "price",
                    old_value: oldValues.price ? String(oldValues.price) : null,
                    new_value: course.price ? String(course.price) : null,
                });
            }

            // Compare registration_fee (stored in cents)
            if (oldValues.registration_fee !== course.registration_fee) {
                fieldChanges.push({
                    field_name: "registration_fee",
                    old_value: oldValues.registration_fee ? String(oldValues.registration_fee) : null,
                    new_value: course.registration_fee ? String(course.registration_fee) : null,
                });
            }

            // Log changes if any
            if (fieldChanges.length > 0) {
                try {
                    const supabase = await createSupabaseClient();
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session) {
                        const basePath = typeof window !== 'undefined' 
                            ? (window.location.pathname.startsWith('/app') ? '/app' : '')
                            : '';
                        const logResponse = await fetch(`${basePath}/api/logs/detail-update`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${session.access_token}`,
                            },
                            body: JSON.stringify({
                                reference_id: course.id,
                                reference_type: 'course',
                                field_changes: fieldChanges,
                                batch_id: batchId,
                            }),
                        });
                        
                        if (!logResponse.ok) {
                            const logError = await logResponse.json();
                            console.error('Failed to log changes:', logError);
                        }
                    }
                } catch (logError) {
                    console.error('Failed to log changes:', logError);
                    // Don't fail the save if logging fails
                }
            }

            // Reload course data and update original
            await loadCourse();
            // Small delay to show success before closing
            setTimeout(() => {
                handleCloseSidebar();
            }, 300);
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
                    <p className="text-gray-500">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-4 items-center py-8">
                    <p className="text-red-600">{error || "Course not found"}</p>
                    <Link
                        href="/dashboard/courses"
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
                    >
                        Back to Courses
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
                        href="/dashboard/courses"
                        className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
                    >
                        ← Back to Courses
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">{course.course_name}</h1>
                    <p className="text-sm text-gray-500 mt-1">{course.course_code}</p>
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Course Name</label>
                        <p className="mt-1 text-sm text-gray-900">{course.course_name}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Course Code</label>
                        <p className="mt-1 text-sm text-gray-900">{course.course_code}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Length of Class</label>
                        <p className="mt-1 text-sm text-gray-900">{course.length_of_class || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Registration Limit</label>
                        <p className="mt-1 text-sm text-gray-900">{course.registration_limit || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Certification Length</label>
                        <p className="mt-1 text-sm text-gray-900">{course.certification_length || "—"}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Graduation Rate</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {course.graduation_rate ? `${(course.graduation_rate / 100).toFixed(2)}%` : "—"}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Price</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {formatCurrency(course.price)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Registration Fee</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {formatCurrency(course.registration_fee)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Classes Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Classes</h2>
                    <button
                        onClick={() => setIsCreateClassModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-black text-white hover:bg-gray-800 h-10 px-4 py-2"
                    >
                        Add Class
                    </button>
                </div>
                <DataTable
                    data={classes}
                    columns={classColumns}
                    isLoading={loadingClasses}
                    onRowClick={handleClassClick}
                    emptyMessage="No classes found for this course."
                />
            </div>

            {/* Activity Log Section */}
            <LogDisplay referenceId={course.id} referenceType="course" />

            <DetailSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
                title={`Edit ${course.course_code}`}
            >
                {course ? (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Name</label>
                            <input
                                type="text"
                                value={course.course_name}
                                onChange={(e) => setCourse({ ...course, course_name: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Code</label>
                            <input
                                type="text"
                                value={course.course_code}
                                disabled
                                readOnly
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Course code cannot be changed (classes depend on it)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Length of Class</label>
                                <input
                                    type="text"
                                    value={course.length_of_class || ''}
                                    onChange={(e) => setCourse({ ...course, length_of_class: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Limit</label>
                                <input
                                    type="number"
                                    value={course.registration_limit || ''}
                                    onChange={(e) => setCourse({ ...course, registration_limit: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cert. Length</label>
                                <input
                                    type="number"
                                    value={course.certification_length || ''}
                                    onChange={(e) => setCourse({ ...course, certification_length: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Graduation Rate (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={course.graduation_rate ? (course.graduation_rate / 100).toFixed(2) : ''}
                                    onChange={(e) => setCourse({ ...course, graduation_rate: parseFloat(e.target.value) * 100 || null })}
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
                                    value={course.price ? (course.price / 100).toFixed(2) : ''}
                                    onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Reg. Fee ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={course.registration_fee ? (course.registration_fee / 100).toFixed(2) : ''}
                                    onChange={(e) => setCourse({ ...course, registration_fee: parseFloat(e.target.value) * 100 || null })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stripe Product ID</label>
                            <input
                                type="text"
                                value={course.stripe_product_id || ''}
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

            {/* Create Class Modal */}
            {isCreateClassModalOpen && course && (
                <CreateClassModal
                    isOpen={isCreateClassModalOpen}
                    onClose={() => setIsCreateClassModalOpen(false)}
                    onSubmit={handleCreateClass}
                    context="classes"
                    preselectedCourseId={course.id}
                    programs={programs}
                    courses={courses}
                />
            )}
        </div>
    );
}

export default function CourseDetailPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex justify-center py-8">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        }>
            <CourseDetailContent />
        </Suspense>
    );
}

