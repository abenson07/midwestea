"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getStudentById, type StudentWithEmail } from "@/lib/students";

export default function StudentPage() {
  const [student, setStudent] = useState<StudentWithEmail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { session } = await getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      const { student: fetchedStudent } = await getStudentById(session.user.id);
      setStudent(fetchedStudent);
      setLoading(false);
    };
    load();
  }, []);

  const displayName = student?.full_name || student?.email || "there";

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        {loading ? "Welcome" : `Welcome, ${displayName}`}
      </h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/student/profile"
          className="block p-6 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-1">Profile</h2>
          <p className="text-sm text-gray-500">View and edit your account details</p>
        </Link>
        <Link
          href="/student/certificates"
          className="block p-6 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-1">Certificates</h2>
          <p className="text-sm text-gray-500">View and download your certificates</p>
        </Link>
      </div>
    </div>
  );
}
