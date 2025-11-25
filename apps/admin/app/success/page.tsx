"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, getSession } from "@/lib/auth";
import { Logo } from "@midwestea/ui";

export default function SuccessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check if authenticated, redirect if not
  useEffect(() => {
    getSession().then(({ session, error }) => {
      setChecking(false);
      if (!session || error) {
        router.push("/login");
      }
    });
  }, [router]);

  const handleLogout = async () => {
    setLoading(true);
    const result = await signOut();

    if (result.success) {
      router.push("/login");
    } else {
      alert(result.error || "Failed to log out");
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (checking) {
    return (
      <div className="bg-white flex items-center justify-center w-full h-screen">
        <p>Loading...</p>
      </div>
    );
  }

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
              Confirmed!
            </p>
            <p className="font-normal leading-[1.5] relative shrink-0 text-[18px] w-full">
              You did it!
            </p>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="mt-4 px-6 py-3 bg-black text-white text-[18px] font-normal leading-[1.5] hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
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

