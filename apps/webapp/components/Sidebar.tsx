"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Download,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getSession, signOut } from "@/lib/auth";

const navigation = [
  { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Programs", href: "/dashboard/programs", icon: FolderOpen },
  { name: "Classes", href: "/dashboard/classes", icon: Users },
  { name: "Students", href: "/dashboard/students", icon: GraduationCap },
  { name: "Instructors", href: "/dashboard/instructors", icon: FileText },
  { name: "Transactions", href: "/dashboard/payments", icon: CreditCard },
  { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadInvoices = async () => {
    setIsDownloading(true);
    try {
      console.log('[Sidebar] Exporting transactions to CSV...');
      const basePath = '/app';
      const csvResponse = await fetch(`${basePath}/api/export-transactions-csv`, {
        method: 'GET',
      });

      // Check content type to see if it's JSON (no invoices) or CSV
      const contentType = csvResponse.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        // No new invoices to download
        const data = await csvResponse.json();
        alert(data.message || 'No new invoices to download');
        return;
      }

      if (!csvResponse.ok) {
        const errorData = await csvResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `CSV export failed: ${csvResponse.status}`);
      }

      // Get the CSV blob
      const csvBlob = await csvResponse.blob();
      
      // Get filename from Content-Disposition header
      const contentDisposition = csvResponse.headers.get('Content-Disposition');
      let filename = `midwestea-invoices-${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      // Create download link
      const url = window.URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('[Sidebar] ✅ Invoice download complete');
    } catch (error: any) {
      console.error('[Sidebar] Error downloading invoices:', error);
      alert(`Failed to download invoices: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-gray-200 bg-white h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            // Check if we're on class detail page with a 'from' parameter
            const isClassDetailPage = pathname.startsWith('/dashboard/classes/') && pathname !== '/dashboard/classes';
            const fromParam = isClassDetailPage ? searchParams?.get('from') : null;
            
            let isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            // Override active state if we're on class detail page and have a 'from' parameter
            if (isClassDetailPage && fromParam) {
              if (fromParam === 'course' && item.name === 'Courses') {
                isActive = true;
              } else if (fromParam === 'program' && item.name === 'Programs') {
                isActive = true;
              } else if (fromParam === 'classes' && item.name === 'Classes') {
                isActive = true;
              } else if (!fromParam && item.name === 'Classes') {
                // Default to Classes if no from param
                isActive = true;
              } else {
                isActive = false;
              }
            }
            
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
        <div className="px-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleDownloadInvoices}
            disabled={isDownloading}
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors w-full ${
              isDownloading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5 text-gray-400" />
                <span>Download Invoices</span>
              </>
            )}
          </button>
        </div>
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
