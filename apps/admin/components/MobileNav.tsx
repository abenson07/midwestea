"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BookOpen,
    Users,
    GraduationCap,
    CheckSquare,
    LayoutDashboard,
    FileText,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Courses", href: "/courses", icon: BookOpen },
    { name: "Classes", href: "/classes", icon: Users },
    { name: "Students", href: "/students", icon: GraduationCap },
    { name: "Instructors", href: "/instructors", icon: FileText },
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
