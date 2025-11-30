"use client";

import { Logo } from "@midwestea/ui";
import { Menu, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { getSession, signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function MobileHeader() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string>("");
    const [showMenu, setShowMenu] = useState(false);

    useEffect(() => {
        getSession().then(({ session }) => {
            if (session?.user?.email) {
                setUserEmail(session.user.email);
            }
        });
    }, []);

    const handleSignOut = async () => {
        await signOut();
        router.push("/dashboard/login");
    };

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
            <div className="flex items-center justify-between h-14 px-4">
                <Logo />
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 z-30"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute top-14 right-0 w-64 bg-white border border-gray-200 rounded-bl-lg shadow-lg z-40">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                        {userEmail ? userEmail.substring(0, 2).toUpperCase() : "AD"}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium text-gray-900 truncate" title={userEmail || "Admin User"}>
                                        {userEmail || "Admin User"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-2">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </header>
    );
}
