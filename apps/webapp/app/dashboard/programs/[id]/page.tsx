"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClasses, getCourseById, updateCourse, createClass, generateClassId, getPrograms, getCourses, type Class, type Course } from "@/lib/classes";
import { DataTable } from "@/components/ui/DataTable";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { LogDisplay } from "@/components/ui/LogDisplay";
import { CreateClassModal, type ClassFormData } from "@/components/ui/CreateClassModal";
import { formatCurrency } from "@midwestea/utils";
import { createSupabaseClient } from "@midwestea/utils";

function ProgramDetailContent() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const programId = params?.id as string;

    const [program, setProgram] = useState<Course | null>(null);
    const [originalProgram, setOriginalProgram] = useState<Course | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [waitlistEntries, setWaitlistEntries] = useState<any[]>([]);
    const [programs, setPrograms] = useState<Course[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingWaitlist, setLoadingWaitlist] = useState(false);
    const [error, setError] = useState("");

    // Sidebar state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Modal state
    const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState(false);

    useEffect(() => {
        if (programId) {
            loadProgram();
        }
        loadPrograms();
        loadCourses();
    }, [programId]);

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
            // Store original values for comparison when saving
            setOriginalProgram({ ...fetchedProgram });
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
            
            // If no classes, load waitlist entries
            if (programClasses.length === 0) {
                await loadWaitlist();
            } else {
                setWaitlistEntries([]);
            }
        }
        setLoadingClasses(false);
    };

    const loadWaitlist = async () => {
        if (!program || !program.course_code) return;
        setLoadingWaitlist(true);
        try {
            const basePath = typeof window !== 'undefined' 
                ? (window.location.pathname.startsWith('/app') ? '/app' : '')
                : '';
            const response = await fetch(`${basePath}/api/waitlist/by-course-code/${program.course_code}`);
            if (response.ok) {
                const result = await response.json();
                setWaitlistEntries(result.waitlist || []);
            } else {
                console.error('Error fetching waitlist:', await response.json());
            }
        } catch (err) {
            console.error('Error fetching waitlist:', err);
        } finally {
            setLoadingWaitlist(false);
        }
    };

    const handleEdit = () => {
        router.push(`/dashboard/programs/${programId}?edit=true`);
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
        router.push(`/dashboard/programs/${programId}`);
    };

    const handleClassClick = (classItem: Class) => {
        router.push(`/dashboard/classes/${classItem.id}?from=program&programId=${programId}`);
    };

    const handleCreateClass = async (formData: ClassFormData) => {
        if (!formData.courseId) {
            alert("Please select a program or course");
            return;
        }

        // Find the selected program/course
        const selectedProgram = [...programs, ...courses].find(c => c.id === formData.courseId);
        if (!selectedProgram) {
            alert("Selected program/course not found");
            return;
        }

        setSaving(true);

        try {
            // Generate class_id
            const { classId, error: classIdError } = await generateClassId(selectedProgram.course_code);
            
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
                selectedProgram.course_name,
                selectedProgram.course_code,
                classId,
                formData.enrollmentOpenDate || null,
                formData.enrollmentCloseDate || null,
                formData.classStartDate || null,
                formData.classEndDate || null,
                formData.classType === 'online',
                selectedProgram.programming_offering || null,
                selectedProgram.course_image || null,
                null, // length_of_class
                formData.certificateLength ? parseInt(formData.certificateLength, 10) : null,
                formData.registrationLimit ? parseInt(formData.registrationLimit, 10) : null,
                parseDollars(formData.price),
                parseDollars(formData.registrationFee),
                selectedProgram.stripe_product_id || null
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
        if (!program || !originalProgram) return;

        setSaving(true);

        // Use original values for comparison (from when data was loaded)
        const oldValues = {
            course_name: originalProgram.course_name,
            course_code: originalProgram.course_code,
            programming_offering: originalProgram.programming_offering,
            course_image: originalProgram.course_image,
            length_of_class: originalProgram.length_of_class,
            certification_length: originalProgram.certification_length,
            registration_limit: originalProgram.registration_limit,
            price: originalProgram.price,
            registration_fee: originalProgram.registration_fee,
        };

        // Generate batch_id for this save operation
        const batchId = crypto.randomUUID();

        // Perform update
        const { success, error } = await updateCourse(
            program.id,
            program.course_name,
            program.course_code,
            program.programming_offering,
            program.course_image,
            program.length_of_class,
            program.certification_length,
            program.registration_limit,
            program.price,
            program.registration_fee,
            program.stripe_product_id
        );

        if (success) {
            // Log field changes - compare against original values
            const fieldChanges: Array<{ field_name: string; old_value: string | null; new_value: string | null }> = [];

            // Compare name (maps to "name" in FIELD_LABELS)
            if (oldValues.course_name !== program.course_name) {
                fieldChanges.push({
                    field_name: "name",
                    old_value: oldValues.course_name || null,
                    new_value: program.course_name || null,
                });
            }

            // Note: course_code is not editable (read-only) to prevent foreign key constraint violations
            // So we don't need to track changes to it

            // Compare programming_offering
            if (oldValues.programming_offering !== program.programming_offering) {
                fieldChanges.push({
                    field_name: "programming_offering",
                    old_value: oldValues.programming_offering || null,
                    new_value: program.programming_offering || null,
                });
            }

            // Compare course_image
            if (oldValues.course_image !== program.course_image) {
                fieldChanges.push({
                    field_name: "course_image",
                    old_value: oldValues.course_image || null,
                    new_value: program.course_image || null,
                });
            }

            // Compare length_of_class
            if (oldValues.length_of_class !== program.length_of_class) {
                fieldChanges.push({
                    field_name: "length_of_class",
                    old_value: oldValues.length_of_class || null,
                    new_value: program.length_of_class || null,
                });
            }

            // Compare certification_length
            if (oldValues.certification_length !== program.certification_length) {
                fieldChanges.push({
                    field_name: "certification_length",
                    old_value: oldValues.certification_length ? String(oldValues.certification_length) : null,
                    new_value: program.certification_length ? String(program.certification_length) : null,
                });
            }

            // Compare registration_limit
            if (oldValues.registration_limit !== program.registration_limit) {
                fieldChanges.push({
                    field_name: "registration_limit",
                    old_value: oldValues.registration_limit ? String(oldValues.registration_limit) : null,
                    new_value: program.registration_limit ? String(program.registration_limit) : null,
                });
            }

            // Compare price (stored in cents)
            if (oldValues.price !== program.price) {
                fieldChanges.push({
                    field_name: "price",
                    old_value: oldValues.price ? String(oldValues.price) : null,
                    new_value: program.price ? String(program.price) : null,
                });
            }

            // Compare registration_fee (stored in cents)
            if (oldValues.registration_fee !== program.registration_fee) {
                fieldChanges.push({
                    field_name: "registration_fee",
                    old_value: oldValues.registration_fee ? String(oldValues.registration_fee) : null,
                    new_value: program.registration_fee ? String(program.registration_fee) : null,
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
                                reference_id: program.id,
                                reference_type: 'program',
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

            // Reload program data and update original
            await loadProgram();
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

    type WaitlistEntry = {
        id: string;
        student_id: string;
        course_code: string;
        created_at: string;
        updated_at: string;
        full_name: string | null;
        email: string | null;
    };

    const waitlistColumns = [
        { 
            header: "Full Name", 
            accessorKey: "full_name" as keyof WaitlistEntry,
            cell: (item: WaitlistEntry) => item.full_name || "—"
        },
        { 
            header: "Email", 
            accessorKey: "email" as keyof WaitlistEntry,
            cell: (item: WaitlistEntry) => item.email || "—"
        },
        {
            header: "Signed Up",
            accessorKey: "created_at" as keyof WaitlistEntry,
            cell: (item: WaitlistEntry) => {
                if (!item.created_at) return "—";
                const date = new Date(item.created_at);
                return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
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
                        href="/dashboard/programs"
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
                        href="/dashboard/programs"
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
                            {formatCurrency(program.price)}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500">Registration Fee</label>
                        <p className="mt-1 text-sm text-gray-900">
                            {formatCurrency(program.registration_fee)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Classes or Waitlist Section */}
            <div>
                {classes.length > 0 ? (
                    <>
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
                            emptyMessage="No classes found for this program."
                        />
                    </>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Waitlist</h2>
                        </div>
                        <DataTable
                            data={waitlistEntries}
                            columns={waitlistColumns}
                            isLoading={loadingWaitlist}
                            emptyMessage="No waitlist entries found for this program."
                        />
                    </>
                )}
            </div>

            {/* Activity Log Section */}
            <LogDisplay referenceId={program.id} referenceType="program" />

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
                                disabled
                                readOnly
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-2 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">Program code cannot be changed (classes depend on it)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class Type</label>
                            <select
                                value={program.programming_offering || ''}
                                onChange={(e) => setProgram({ ...program, programming_offering: e.target.value || null })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                            >
                                <option value="">Select class type...</option>
                                <option value="In Person Only">In Person Only</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="Online + Skills Training">Online + Skills Training</option>
                                <option value="In Person + Homework">In Person + Homework</option>
                                <option value="Online Only">Online Only</option>
                            </select>
                        </div>

                        {(program.programming_offering !== 'Online Only' && program.programming_offering !== 'Online + Skills Training') && (
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
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Course Image URL</label>
                            <input
                                type="url"
                                value={program.course_image || ''}
                                onChange={(e) => setProgram({ ...program, course_image: e.target.value || null })}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2"
                                placeholder="https://example.com/image.jpg"
                            />
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

            {/* Create Class Modal */}
            {isCreateClassModalOpen && program && (
                <CreateClassModal
                    isOpen={isCreateClassModalOpen}
                    onClose={() => setIsCreateClassModalOpen(false)}
                    onSubmit={handleCreateClass}
                    context="classes"
                    preselectedProgramId={program.id}
                    programs={programs}
                    courses={courses}
                />
            )}
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

