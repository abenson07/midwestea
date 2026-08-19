"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, FileText, User, CreditCard } from "lucide-react";
import {
  getMyClassEnrollments,
  isActiveClassEnrollment,
  type StudentClassEnrollment,
} from "@/lib/student-classes";

const primaryNav = [
  { name: "Home", href: "/student", icon: Home },
  { name: "Classes", href: "/student/classes", icon: BookOpen },
  { name: "Documents", href: "/student/documents", icon: FileText },
  { name: "Profile", href: "/student/profile", icon: User },
  { name: "Invoices", href: "/student/invoices", icon: CreditCard },
];

function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/student") return pathname === "/student";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentNav() {
  const pathname = usePathname();
  const [enrollments, setEnrollments] = useState<StudentClassEnrollment[]>([]);

  useEffect(() => {
    const load = async () => {
      const { enrollments: fetched } = await getMyClassEnrollments();
      setEnrollments(fetched || []);
    };
    load();
  }, []);

  const activeClasses = enrollments.filter((row) => isActiveClassEnrollment(row));
  const pastClasses = enrollments.filter((row) => !isActiveClassEnrollment(row));

  return (
    <>
      <div className="hidden md:block">
        <nav aria-label="Student">
          <ul className="space-y-1">
            {primaryNav.map((item) => {
              const active = isActiveHref(pathname, item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active ? "bg-white text-gray-900" : "text-gray-600 hover:bg-white/70 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${active ? "text-black" : "text-gray-400"}`} />
                    {item.name}
                  </Link>
                  {item.href === "/student/classes" && (activeClasses.length > 0 || pastClasses.length > 0) && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {activeClasses.map((row) => {
                        const href = `/student/classes/${row.class.id}`;
                        const nestedActive = pathname === href;
                        return (
                          <li key={row.enrollmentId}>
                            <Link
                              href={href}
                              className={`block truncate rounded-md px-2 py-1 text-xs ${
                                nestedActive ? "font-medium text-gray-900" : "text-gray-500 hover:text-gray-900"
                              }`}
                            >
                              {row.class.class_name || row.class.course_code || "Class"}
                            </Link>
                          </li>
                        );
                      })}
                      {pastClasses.length > 0 && (
                        <li>
                          <Link
                            href="/student/classes#past"
                            className="block rounded-md px-2 py-1 text-xs text-gray-500 hover:text-gray-900"
                          >
                            Past classes
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom"
        aria-label="Student"
      >
        <div className="flex justify-around items-center h-16 px-1">
          {primaryNav.map((item) => {
            const active = isActiveHref(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  active ? "text-black" : "text-gray-400"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
