"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Award, CreditCard, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { Logo } from "@midwestea/ui";

// Launch scope is intentionally limited to Home, Profile, Certificates, and Billing.
// Class access, quizzes, and other LMS modules are deferred — don't add
// nav destinations for them without a deliberate scope decision.
const navigation = [
  { name: "Home", href: "/student", icon: Home },
  { name: "Certificates", href: "/student/certificates", icon: Award },
  { name: "Billing", href: "/student/billing", icon: CreditCard },
];

export function StudentNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/student/login");
  };

  return (
    <>
      <div className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
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
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 w-full px-1 py-1 rounded-md hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? "text-black" : "text-gray-400"}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-black" : "text-gray-400"}`} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
