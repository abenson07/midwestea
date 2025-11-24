"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getCourses, generateClassId, createClass, type Course } from "@/lib/classes";

// Placeholder logo component
function CompanyLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-[36px] flex items-center justify-center">
        <span className="text-2xl font-bold italic tracking-tight" style={{ fontFamily: 'serif' }}>
          Logo
        </span>
      </div>
    </div>
  );
}

export default function AddClassTestPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if authenticated, redirect if not
  useEffect(() => {
    getSession().then(({ session, error }) => {
      setChecking(false);
      if (!session || error) {
        router.push("/login");
      }
    });
  }, [router]);

  // Fetch courses on mount
  useEffect(() => {
    if (!checking) {
      loadCourses();
    }
  }, [checking]);

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    const { courses: fetchedCourses, error: fetchError } = await getCourses();
    
    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }

    if (fetchedCourses) {
      setCourses(fetchedCourses);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCourseId) {
      setError("Please select a course");
      return;
    }

    // Find the selected course
    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    if (!selectedCourse) {
      setError("Selected course not found");
      return;
    }

    setSaving(true);

    try {
      // Generate class_id
      const { classId, error: classIdError } = await generateClassId(selectedCourse.course_code);
      
      if (classIdError || !classId) {
        setError(classIdError || "Failed to generate class ID");
        setSaving(false);
        return;
      }

      // Create the class
      const result = await createClass(
        selectedCourse.id,
        selectedCourse.course_name,
        selectedCourse.course_code,
        classId
      );

      if (result.success) {
        setSuccess(`Class created successfully with ID: ${classId}`);
        setSelectedCourseId("");
      } else {
        setError(result.error || "Failed to create class");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Show loading while checking session
  if (checking) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white flex items-center justify-center relative w-full h-screen">
      <div className="flex flex-col grow h-full items-center px-16 py-0 relative shrink-0 w-full">
        {/* Navbar */}
        <div className="flex flex-col h-[72px] items-start justify-center overflow-clip relative shrink-0 w-full">
          <CompanyLogo className="h-[36px] overflow-clip relative shrink-0 w-[84px]" />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8 grow items-center justify-center min-h-0 min-w-0 relative shrink-0 w-full">
          {/* Section Title */}
          <div className="flex flex-col gap-6 items-center max-w-[480px] relative shrink-0 text-black text-center w-full">
            <p className="font-bold leading-[1.2] relative shrink-0 text-[48px] w-full">
              Add Class
            </p>
            <p className="font-normal leading-[1.5] relative shrink-0 text-[18px] w-full">
              Select a course to create a new class
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6 items-center justify-center max-w-[480px] relative shrink-0 w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
              {/* Course Dropdown */}
              <div className="flex flex-col gap-2 items-start relative shrink-0 w-full">
                <label
                  htmlFor="course"
                  className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                >
                  Course*
                </label>
                <select
                  id="course"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={loading || saving}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              {/* Success Message */}
              {success && (
                <div className="text-green-600 text-sm text-center">{success}</div>
              )}

              {/* Save Button */}
              <div className="flex flex-col gap-4 items-start relative shrink-0 w-full">
                <button
                  type="submit"
                  disabled={loading || saving || !selectedCourseId}
                  className="bg-black border border-black border-solid box-border flex gap-2 items-center justify-center px-6 py-3 relative shrink-0 w-full text-white text-[16px] font-normal leading-[1.5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors rounded-lg"
                >
                  {saving ? "Saving..." : loading ? "Loading courses..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-[5px] h-[72px] items-center relative shrink-0 w-full">
          <p className="font-normal leading-[1.5] relative shrink-0 text-black text-[14px] text-center whitespace-pre">
            © 2022 Relume
          </p>
        </div>
      </div>

      {/* Placeholder Image */}
      <div className="grow h-full min-h-0 min-w-0 relative shrink-0 bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
      </div>
    </div>
  );
}

