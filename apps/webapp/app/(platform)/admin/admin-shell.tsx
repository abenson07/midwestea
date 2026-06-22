"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileNav } from "@/components/MobileNav";
import { getSession } from "@/lib/auth";
import { getAdminDocumentTitle } from "@/lib/admin/page-title";

export function AdminShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const isAuthPage = pathname === "/admin/login" || pathname === "/admin/otp";

    useEffect(() => {
        document.title = getAdminDocumentTitle(pathname);
    }, [pathname]);

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
                router.push("/admin/login");
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
            <MobileHeader />
            <Suspense fallback={<div className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white h-screen" />}>
                <Sidebar />
            </Suspense>
            <main className="flex-1 overflow-y-auto pt-14 pb-16 md:pt-0 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-8">
                    {children}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
