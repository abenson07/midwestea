"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudentNav } from "./StudentNav";

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isAuthPage = pathname === "/student/login" || pathname === "/student/otp";

  useEffect(() => {
    if (isAuthPage) {
      setIsAuthenticated(false);
      setIsCheckingAuth(false);
      return;
    }

    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const { session, error } = await getSession();
      if (session && !error) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push(`/student/login?next=${encodeURIComponent(pathname)}`);
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [pathname, router, isAuthPage]);

  if (!isAuthPage && isCheckingAuth) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <StudentNav />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
