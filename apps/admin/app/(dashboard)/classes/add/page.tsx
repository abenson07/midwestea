"use client";

import { useState, useEffect, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getCourses, getPrograms, generateClassId, createClass, getCourseById, type Course } from "@/lib/classes";
import { Logo } from "@midwestea/ui";

function AddClassContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const programId = searchParams.get("programId");
  
  const [checking, setChecking] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || programId || "");
  const [enrollmentStart, setEnrollmentStart] = useState("");
  const [enrollmentClose, setEnrollmentClose] = useState("");
  const [classStartDate, setClassStartDate] = useState("");
  const [classCloseDate, setClassCloseDate] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [lengthOfClass, setLengthOfClass] = useState("");
  const [certificationLength, setCertificationLength] = useState("");
  const [graduationRate, setGraduationRate] = useState("");
  const [registrationLimit, setRegistrationLimit] = useState("");
  const [price, setPrice] = useState("");
  const [registrationFee, setRegistrationFee] = useState("");
  
  // Helper functions for formatting
  const formatDollars = (cents: number | null | undefined): string => {
    if (!cents && cents !== 0) return "";
    return (cents / 100).toFixed(2);
  };
  
  const parseDollars = (value: string): number | null => {
    if (!value) return null;
    const dollars = parseFloat(value);
    if (isNaN(dollars)) return null;
    return Math.round(dollars * 100);
  };
  
  const formatPercentage = (value: number | null | undefined): string => {
    if (!value && value !== 0) return "";
    return (value / 100).toFixed(2);
  };
  
  const parsePercentage = (value: string): number | null => {
    if (!value) return null;
    const percent = parseFloat(value);
    if (isNaN(percent)) return null;
    return Math.round(percent * 100);
  };
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Check if authenticated, redirect if not
  useEffect(() => {
    getSession().then(({ session, error }) => {
      setChecking(false);
      if (!session || error) {
        router.push("/login");
      }
    });
  }, [router]);

  // Load course/program if provided
  useEffect(() => {
    if (!checking && (courseId || programId)) {
      loadPreSelectedCourse();
    } else if (!checking) {
      loadCourses();
    }
  }, [checking, courseId, programId]);

  // Auto-populate fields when course is selected
  useEffect(() => {
    if (selectedCourse) {
      setLengthOfClass(selectedCourse.length_of_class || "");
      setCertificationLength(selectedCourse.certification_length?.toString() || "");
      setGraduationRate(formatPercentage(selectedCourse.graduation_rate));
      setRegistrationLimit(selectedCourse.registration_limit?.toString() || "");
      setPrice(formatDollars(selectedCourse.price));
      setRegistrationFee(formatDollars(selectedCourse.registration_fee));
    }
  }, [selectedCourse]);

  const loadPreSelectedCourse = async () => {
    setLoading(true);
    const id = courseId || programId;
    if (!id) return;
    
    const { course, error: fetchError } = await getCourseById(id);
    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }
    
    if (course) {
      setSelectedCourse(course);
      setSelectedCourseId(course.id);
    }
    setLoading(false);
  };

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

    if (!selectedCourseId) {
      setError("Please select a course");
      return;
    }

    // Find the selected course
    const courseToUse = selectedCourse || courses.find((c) => c.id === selectedCourseId);
    if (!courseToUse) {
      setError("Selected course not found");
      return;
    }

    setSaving(true);

    try {
      // Generate class_id
      const { classId, error: classIdError } = await generateClassId(courseToUse.course_code);
      
      if (classIdError || !classId) {
        setError(classIdError || "Failed to generate class ID");
        setSaving(false);
        return;
      }

      // Create the class
      const result = await createClass(
        courseToUse.id,
        courseToUse.course_name,
        courseToUse.course_code,
        classId,
        enrollmentStart || null,
        enrollmentClose || null,
        classStartDate || null,
        classCloseDate || null,
        isOnline,
        lengthOfClass || null,
        certificationLength ? parseInt(certificationLength, 10) : null,
        parsePercentage(graduationRate),
        registrationLimit ? parseInt(registrationLimit, 10) : null,
        parseDollars(price),
        parseDollars(registrationFee),
        courseToUse.stripe_product_id || null
      );

      if (result.success) {
        // Redirect back to the course/program detail page or classes list
        if (courseId) {
          router.push(`/courses/${courseId}`);
        } else if (programId) {
          router.push(`/programs/${programId}`);
        } else {
          router.push("/classes");
        }
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

  const isPreSelected = !!(courseId || programId);
  const backUrl = courseId ? `/courses/${courseId}` : programId ? `/programs/${programId}` : "/classes";

  return (
    <div className="bg-white flex items-center justify-center relative w-full h-screen">
      <div className="flex flex-col grow h-full items-center px-16 py-0 relative shrink-0 w-full">
        {/* Navbar */}
        <div className="flex flex-col h-[72px] items-start justify-center overflow-clip relative shrink-0 w-full">
          <Logo />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8 grow items-center justify-center min-h-0 min-w-0 relative shrink-0 w-full">
          {/* Section Title */}
          <div className="flex flex-col gap-6 items-center max-w-[480px] relative shrink-0 text-black text-center w-full">
            <p className="font-bold leading-[1.2] relative shrink-0 text-[48px] w-full">
              Add Class
            </p>
            <p className="font-normal leading-[1.5] relative shrink-0 text-[18px] w-full">
              {isPreSelected && selectedCourse 
                ? `Create a new class for ${selectedCourse.course_name}`
                : "Select a course to create a new class"}
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-6 items-center justify-center max-w-[480px] relative shrink-0 w-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
              {/* Course Dropdown - only show if not pre-selected */}
              {!isPreSelected && (
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
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      const course = courses.find((c) => c.id === e.target.value);
                      setSelectedCourse(course || null);
                    }}
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
              )}

              {/* Show selected course info if pre-selected */}
              {isPreSelected && selectedCourse && (
                <div className="flex flex-col gap-2 items-start relative shrink-0 w-full p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full">
                    Course
                  </label>
                  <p className="text-black text-[16px] font-medium">
                    {selectedCourse.course_code} - {selectedCourse.course_name}
                  </p>
                </div>
              )}

              {/* Length of Class and Registration Limit */}
              <div className="flex flex-row gap-4 items-start relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
                  <label
                    htmlFor="lengthOfClass"
                    className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                  >
                    Length of Class
                  </label>
                  <input
                    id="lengthOfClass"
                    type="text"
                    value={lengthOfClass}
                    onChange={(e) => setLengthOfClass(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
                  <label
                    htmlFor="registrationLimit"
                    className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                  >
                    Registration Limit
                  </label>
                  <input
                    id="registrationLimit"
                    type="number"
                    value={registrationLimit}
                    onChange={(e) => setRegistrationLimit(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full"
                  />
                </div>
              </div>

              {/* Certification Length and Graduation Rate */}
              <div className="flex flex-row gap-4 items-start relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
                  <label
                    htmlFor="certificationLength"
                    className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                  >
                    Certification Length
                  </label>
                  <input
                    id="certificationLength"
                    type="number"
                    value={certificationLength}
                    onChange={(e) => setCertificationLength(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
                  <label
                    htmlFor="graduationRate"
                    className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                  >
                    Graduation Rate (%)
                  </label>
                  <input
                    id="graduationRate"
                    type="number"
                    step="0.01"
                    value={graduationRate}
                    onChange={(e) => setGraduationRate(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full"
                  />
                </div>
              </div>

              {/* Price and Registration Fee */}
              <div className="flex flex-row gap-4 items-start relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
                  <label
                    htmlFor="price"
                    className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                  >
                    Price ($)
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
                  <label
                    htmlFor="registrationFee"
                    className="font-normal leading-[1.5] relative shrink-0 text-black text-[16px] w-full"
                  >
                    Registration Fee ($)
                  </label>
                  <input
                    id="registrationFee"
                    type="number"
                    step="0.01"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(e.target.value)}
                    disabled={loading || saving}
                    className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full"
                  />
                </div>
              </div>

              {/* Enrollment Start Date and Enrollment Close Date */}
              <div className="flex flex-row gap-4 items-start relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
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
                      className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
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
                      className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>
              </div>

              {/* Class Start Date and Class Close Date */}
              <div className="flex flex-row gap-4 items-start relative shrink-0 w-full">
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
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
                      className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-start relative shrink-0 flex-1">
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
                      className="border border-black rounded-lg px-3 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 bg-white text-black w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
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
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-2 focus:ring-black focus:ring-offset-0 disabled:opacity-50 cursor-pointer"
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

              {/* Save Button */}
              <div className="flex flex-col gap-4 items-start relative shrink-0 w-full">
                <button
                  type="submit"
                  disabled={loading || saving || (!isPreSelected && !selectedCourseId)}
                  className="bg-black border border-black border-solid box-border flex gap-2 items-center justify-center px-6 py-3 relative shrink-0 w-full text-white text-[16px] font-normal leading-[1.5] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors rounded-lg"
                >
                  {saving ? "Saving..." : loading ? "Loading..." : "Save"}
                </button>
                <Link
                  href={backUrl}
                  className="text-center text-black text-[16px] font-normal leading-[1.5] hover:underline w-full"
                >
                  Cancel
                </Link>
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

export default function AddClassPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center w-full h-screen">
        <p>Loading...</p>
      </div>
    }>
      <AddClassContent />
    </Suspense>
  );
}

