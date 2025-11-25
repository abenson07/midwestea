"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getClasses, type Class } from "@/lib/classes";
import { Logo } from "@midwestea/ui";

export default function ClassesPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if authenticated, redirect if not
  useEffect(() => {
    getSession().then(({ session, error }) => {
      setChecking(false);
      if (!session || error) {
        router.push("/login");
      } else {
        loadClasses();
      }
    });
  }, [router]);

  const loadClasses = async () => {
    setLoading(true);
    setError("");
    const { classes: fetchedClasses, error: fetchError } = await getClasses();
    
    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }

    if (fetchedClasses) {
      setClasses(fetchedClasses);
    }
    setLoading(false);
  };

  // Show loading while checking session
  if (checking) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white flex items-center justify-center relative w-full h-screen">
      <div className="flex flex-col grow h-full items-center px-16 py-0 relative shrink-0 w-full">
        {/* Navbar */}
        <div className="flex flex-col h-[72px] items-start justify-center overflow-clip relative shrink-0 w-full">
          <Logo />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8 grow items-center justify-center min-h-0 min-w-0 relative shrink-0 w-full overflow-y-auto">
          {/* Section Title */}
          <div className="flex flex-col gap-6 items-center max-w-[800px] relative shrink-0 text-black text-center w-full">
            <p className="font-bold leading-[1.2] relative shrink-0 text-[48px] w-full">
              Classes
            </p>
            <div className="flex justify-end w-full">
              <Link
                href="/add_class_test"
                className="bg-black text-white border border-black rounded-lg px-6 py-3 text-[16px] font-normal leading-[1.5] hover:bg-gray-800 transition-colors"
              >
                Add Class
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          {/* Classes List */}
          <div className="flex flex-col gap-4 items-center justify-start max-w-[800px] relative shrink-0 w-full">
            {loading ? (
              <p className="text-gray-600">Loading classes...</p>
            ) : classes.length === 0 ? (
              <p className="text-gray-600">No classes found. Click "Add Class" to create one.</p>
            ) : (
              <div className="w-full border border-black rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-[16px] font-semibold border-b border-black text-black">Class ID</th>
                      <th className="px-4 py-3 text-left text-[16px] font-semibold border-b border-black text-black">Class Name</th>
                      <th className="px-4 py-3 text-left text-[16px] font-semibold border-b border-black text-black">Course Code</th>
                      <th className="px-4 py-3 text-left text-[16px] font-semibold border-b border-black text-black">Start Date</th>
                      <th className="px-4 py-3 text-left text-[16px] font-semibold border-b border-black text-black">End Date</th>
                      <th className="px-4 py-3 text-left text-[16px] font-semibold border-b border-black text-black">Online</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((classItem) => (
                      <tr 
                        key={classItem.id} 
                        onClick={() => router.push(`/class/${classItem.id}`)}
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-[16px] text-black">{classItem.class_id}</td>
                        <td className="px-4 py-3 text-[16px] text-black">{classItem.class_name}</td>
                        <td className="px-4 py-3 text-[16px] text-black">{classItem.course_code}</td>
                        <td className="px-4 py-3 text-[16px] text-black">{formatDate(classItem.class_start_date)}</td>
                        <td className="px-4 py-3 text-[16px] text-black">{formatDate(classItem.class_close_date)}</td>
                        <td className="px-4 py-3 text-[16px] text-black">{classItem.is_online ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
