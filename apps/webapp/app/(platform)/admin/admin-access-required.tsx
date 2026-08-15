"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export function AdminAccessRequired({ userEmail }: { userEmail?: string }) {
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push("/admin/login");
    };

    return (
        <div className="flex h-screen bg-gray-50 items-center justify-center px-4">
            <div className="max-w-sm w-full text-center bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                <h1 className="text-lg font-semibold text-gray-900 mb-2">Admin access required</h1>
                <p className="text-sm text-gray-600 mb-6">
                    {userEmail ? `${userEmail} is` : "This account is"} signed in, but doesn&apos;t have
                    admin access. If you&apos;re a student, head to the student portal instead. If you
                    think this is a mistake, contact an administrator.
                </p>
                <div className="flex flex-col gap-2">
                    <Link
                        href="/student"
                        className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                    >
                        Go to student portal
                    </Link>
                    <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
