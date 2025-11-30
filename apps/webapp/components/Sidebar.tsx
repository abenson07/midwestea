"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@midwestea/ui";
import {
  BookOpen,
  Users,
  GraduationCap,
  CheckSquare,
  FileText,
  LogOut,
  FolderOpen,
  CreditCard,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSession, signOut } from "@/lib/auth";

const navigation = [
  { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Programs", href: "/dashboard/programs", icon: FolderOpen },
  { name: "Classes", href: "/dashboard/classes", icon: Users },
  { name: "Students", href: "/dashboard/students", icon: GraduationCap },
  { name: "Instructors", href: "/dashboard/instructors", icon: FileText },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");

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
    <div className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? "text-black" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {userEmail ? userEmail.substring(0, 2).toUpperCase() : "AD"}
            </span>
          </div>
          <div className="text-sm overflow-hidden">
            <p className="font-medium text-gray-900 truncate" title={userEmail || "Admin User"}>
              {userEmail || "Admin User"}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 w-full px-1 py-1 rounded-md hover:bg-gray-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
