"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.push("/courses");
    }, [router]);

    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-gray-500">Redirecting...</p>
        </div>
    );
}
