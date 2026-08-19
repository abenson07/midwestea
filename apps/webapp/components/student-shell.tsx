"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudentNav } from "./StudentNav";
import { Navigation } from "@/components/marketing/navigation";
import type { BannerEnrollmentItem } from "@/lib/marketing/banner-enrollment";

export function StudentShell({
  children,
  bannerItems = [],
}: {
  children: React.ReactNode;
  bannerItems?: BannerEnrollmentItem[];
}) {
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
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
    <div className="min-h-screen bg-neutral-lightest pb-20 md:pb-0">
      <Navigation bannerItems={bannerItems} />
      <div className="mx-auto w-full max-w-6xl px-4 pt-[calc(var(--mea-nav-height)+1.5rem)] pb-10 md:px-8">
        <div className="md:grid md:grid-cols-6 md:gap-8">
          <aside className="hidden md:col-span-1 md:block">
            <div className="sticky top-[calc(var(--mea-nav-height)+1rem)]">
              <StudentNav />
            </div>
          </aside>
          <main className="md:col-span-5">{children}</main>
        </div>
      </div>
      <div className="md:hidden">
        <StudentNav />
      </div>
    </div>
  );
}
