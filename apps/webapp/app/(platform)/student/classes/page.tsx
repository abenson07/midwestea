"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatClassDate,
  getMyClassEnrollments,
  isActiveClassEnrollment,
  type StudentClassEnrollment,
} from "@/lib/student-classes";

function ClassRow({ row }: { row: StudentClassEnrollment }) {
  const classRecord = row.class;
  return (
    <Link
      href={`/student/classes/${classRecord.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-gray-900">
            {classRecord.class_name || classRecord.course_code || "Class"}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {classRecord.location || (classRecord.is_online ? "Online" : "Location TBD")}
            {" · "}
            {formatClassDate(classRecord.class_start_date)}
            {classRecord.class_close_date ? ` – ${formatClassDate(classRecord.class_close_date)}` : ""}
          </p>
        </div>
        <span className="text-xs rounded-full bg-gray-100 text-gray-800 px-2 py-1 whitespace-nowrap">
          {row.enrollmentStatus || "registered"}
        </span>
      </div>
    </Link>
  );
}

export default function StudentClassesPage() {
  const [enrollments, setEnrollments] = useState<StudentClassEnrollment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { enrollments: fetched, error: fetchError } = await getMyClassEnrollments();
      if (fetchError) setError(fetchError);
      setEnrollments(fetched);
      setLoading(false);
    };
    load();
  }, []);

  const active = (enrollments || []).filter((row) => isActiveClassEnrollment(row));
  const past = (enrollments || []).filter((row) => !isActiveClassEnrollment(row));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Classes</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-3">Active classes</h2>
            {active.length === 0 ? (
              <p className="text-sm text-gray-500">You don't have any active classes.</p>
            ) : (
              <div className="space-y-3">
                {active.map((row) => (
                  <ClassRow key={row.enrollmentId} row={row} />
                ))}
              </div>
            )}
          </section>
          <section id="past">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Past classes</h2>
            {past.length === 0 ? (
              <p className="text-sm text-gray-500">No past classes yet.</p>
            ) : (
              <div className="space-y-3">
                {past.map((row) => (
                  <ClassRow key={row.enrollmentId} row={row} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
