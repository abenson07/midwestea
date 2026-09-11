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
import { CommandPaletteProvider } from "@/components/admin-migrate/patterns/foundation/command-palette";
import { OpenClassesProvider } from "@/lib/admin-migrate/OpenClassesContext";
import type { StagingOpenClassGroups } from "@/lib/admin-migrate/openClasses";
import { themeInitScript } from "@/theme/themeInit";
import { linearTokenVars } from "@/theme/linearTokens";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

function AdminShellLoading() {
    return (
        <div
            style={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--linear-color-canvas)",
            }}
        >
            <div style={{ textAlign: "center" }}>
                <div
                    style={{
                        display: "inline-block",
                        width: 28,
                        height: 28,
                        marginBottom: 14,
                        borderRadius: "50%",
                        border: "2px solid var(--linear-color-hairline-strong)",
                        borderBottomColor: "var(--linear-color-ink-subtle)",
                        animation: "admin-shell-spin 0.7s linear infinite",
                    }}
                />
                <p style={{ color: "var(--linear-color-ink-muted)", fontSize: 13 }}>Loading…</p>
            </div>
            <style>{"@keyframes admin-shell-spin { to { transform: rotate(360deg); } }"}</style>
        </div>
    );
}

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

    let content: React.ReactNode;
    if (!isAuthPage && isCheckingAuth) {
        content = <AdminShellLoading />;
    } else if (isAuthPage) {
        content = children;
    } else if (!isAuthenticated) {
        content = null;
    } else if (!isAdmin) {
        content = <AdminAccessRequired userEmail={userEmail} />;
    } else {
        // Sidebar isn't rendered here — each page brings its own via
        // FoundationLayout (defaults to LinearSidebar). This branch just
        // adds the provider stack the source app's root layout used.
        content = (
            <QueryProvider>
                <ThemeProvider>
                    <WipFeaturesProvider defaultEnabled={true}>
                        <DemoModeProvider defaultEnabled={false}>
                            <OpenClassesProvider value={openClasses}>
                                <CommandPaletteProvider>{children}</CommandPaletteProvider>
                            </OpenClassesProvider>
                        </DemoModeProvider>
                    </WipFeaturesProvider>
                </ThemeProvider>
                <Toaster richColors position="bottom-right" />
            </QueryProvider>
        );
    }

    // This wrapper (isolation class, font, blocking theme-init script, and
    // the linear token CSS vars) always renders, including while auth is
    // still being checked — it previously only wrapped the authenticated
    // branch, so the loading/login/access-required states fell outside the
    // admin-migrate-root isolation boundary (see isolation.css) entirely
    // and rendered with plain unthemed Tailwind gray instead of matching
    // the admin's actual (dark-by-default) theme.
    return (
        <div
            className={`admin-migrate-root ${inter.variable}`}
            style={{
                height: "100vh",
                fontFamily: "var(--font-inter), system-ui, sans-serif",
                ...linearTokenVars,
            } as React.CSSProperties}
        >
            <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            {content}
        </div>
    );
}
