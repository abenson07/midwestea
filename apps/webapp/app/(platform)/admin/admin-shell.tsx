"use client";

import { useEffect, useState } from "react";
import { Inter } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { getSession } from "@/lib/auth";
import { getAdminDocumentTitle } from "@/lib/admin/page-title";
import { AdminAccessRequired } from "./admin-access-required";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider, DemoModeProvider } from "@/components/admin-migrate/patterns/foundation";
import { WipFeaturesProvider } from "@/components/admin-migrate/patterns/foundation/WipFeaturesContext";
import { OpenClassesProvider } from "@/lib/admin-migrate/OpenClassesContext";
import type { StagingOpenClassGroups } from "@/lib/admin-migrate/openClasses";
import { themeInitScript } from "@/theme/themeInit";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export function AdminShell({
    children,
    openClasses,
}: {
    children: React.ReactNode;
    openClasses: StagingOpenClassGroups;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const isAuthPage = pathname === "/admin/login" || pathname === "/admin/otp";

    useEffect(() => {
        document.title = getAdminDocumentTitle(pathname);
    }, [pathname]);

    useEffect(() => {
        if (isAuthPage) {
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsCheckingAuth(false);
            return;
        }

        const checkAuth = async () => {
            setIsCheckingAuth(true);
            const { session, error } = await getSession();

            if (!session || error) {
                setIsAuthenticated(false);
                setIsAdmin(false);
                router.push("/admin/login");
                setIsCheckingAuth(false);
                return;
            }

            setIsAuthenticated(true);
            setUserEmail(session.user?.email ?? undefined);

            try {
                const response = await fetch("/api/admin/me", {
                    headers: { Authorization: `Bearer ${session.access_token}` },
                });
                setIsAdmin(response.ok);
            } catch {
                setIsAdmin(false);
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

    if (!isAdmin) {
        return <AdminAccessRequired userEmail={userEmail} />;
    }

    // Sidebar isn't rendered here — each page brings its own via
    // FoundationLayout (defaults to LinearSidebar). This shell only
    // provides the wrapping context: the admin-migrate-root isolation
    // boundary (see isolation.css) plus the same provider stack the source
    // app's root layout used.
    return (
        <div
            className={`admin-migrate-root ${inter.variable}`}
            style={{
                height: "100vh",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
            }}
        >
            {/* Not in <head> (this is a nested layout, not the app's root) so it
                runs slightly later than ideal, but still scoped to admin-only —
                putting it in the shared root layout would affect every route. */}
            <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            <QueryProvider>
                <ThemeProvider>
                    <WipFeaturesProvider defaultEnabled={true}>
                        <DemoModeProvider defaultEnabled={false}>
                            <OpenClassesProvider value={openClasses}>{children}</OpenClassesProvider>
                        </DemoModeProvider>
                    </WipFeaturesProvider>
                </ThemeProvider>
                <Toaster richColors position="bottom-right" />
            </QueryProvider>
        </div>
    );
}
