"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BookOpen,
    GraduationCap,
    FolderOpen,
    CreditCard,
} from "lucide-react";

// Order: Courses, Programs, Students, Transactions (R to L)
const navigation = [
    { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
    { name: "Programs", href: "/dashboard/programs", icon: FolderOpen },
    { name: "Students", href: "/dashboard/students", icon: GraduationCap },
    { name: "Transactions", href: "/dashboard/payments", icon: CreditCard },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive
                                    ? "text-black"
                                    : "text-gray-400"
                                }`}
                        >
                            <item.icon className={`h-5 w-5 ${isActive ? "text-black" : "text-gray-400"}`} />
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
