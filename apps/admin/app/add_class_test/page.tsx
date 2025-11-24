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
  const [enrollmentStart, setEnrollmentStart] = useState("");
  const [enrollmentClose, setEnrollmentClose] = useState("");
  const [classStartDate, setClassStartDate] = useState("");
  const [classCloseDate, setClassCloseDate] = useState("");
  const [isOnline, setIsOnline] = useState(false);
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
        classId,
        enrollmentStart || null,
        enrollmentClose || null,
        classStartDate || null,
        classCloseDate || null,
        isOnline
      );

      if (result.success) {
        setSuccess(`Class created successfully with ID: ${classId}`);
        setSelectedCourseId("");
        setEnrollmentStart("");
        setEnrollmentClose("");
        setClassStartDate("");
        setClassCloseDate("");
        setIsOnline(false);
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
                  className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.course_code} - {course.course_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enrollment Start Date */}
              <div className="flex flex-col gap-2 items-start relative shrink-0 w-full">
                <label
                  htmlFor="enrollmentStart"
                  className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                >
                  Enrollment Start Date
                </label>
                <div className="relative w-full">
                  <input
                    id="enrollmentStart"
                    type="date"
                    value={enrollmentStart}
                    onChange={(e) => setEnrollmentStart(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
                  />
                </div>
              </div>

              {/* Enrollment Close Date */}
              <div className="flex flex-col gap-2 items-start relative shrink-0 w-full">
                <label
                  htmlFor="enrollmentClose"
                  className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                >
                  Enrollment Close Date
                </label>
                <div className="relative w-full">
                  <input
                    id="enrollmentClose"
                    type="date"
                    value={enrollmentClose}
                    onChange={(e) => setEnrollmentClose(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
                  />
                </div>
              </div>

              {/* Class Start Date */}
              <div className="flex flex-col gap-2 items-start relative shrink-0 w-full">
                <label
                  htmlFor="classStartDate"
                  className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                >
                  Class Start Date
                </label>
                <div className="relative w-full">
                  <input
                    id="classStartDate"
                    type="date"
                    value={classStartDate}
                    onChange={(e) => setClassStartDate(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
                  />
                </div>
              </div>

              {/* Class Close Date */}
              <div className="flex flex-col gap-2 items-start relative shrink-0 w-full">
                <label
                  htmlFor="classCloseDate"
                  className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                >
                  Class Close Date
                </label>
                <div className="relative w-full">
                  <input
                    id="classCloseDate"
                    type="date"
                    value={classCloseDate}
                    onChange={(e) => setClassCloseDate(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5"
                  />
                </div>
              </div>

              {/* Online Class Checkbox */}
              <div className="flex flex-col gap-2 items-start relative shrink-0 w-full">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOnline}
                    onChange={(e) => setIsOnline(e.target.checked)}
                    disabled={loading || saving}
                    className="w-4 h-4 text-black border-black rounded focus:ring-2 focus:ring-black disabled:opacity-50"
                  />
                  <span className="font-normal leading-[1.5] text-black text-[16px]">
                    Online Class
                  </span>
                </label>
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
      <div className="grow h-full min-h-0 min-w-0 relative shrink-0 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100" />
      </div>
    </div>
  );
}

