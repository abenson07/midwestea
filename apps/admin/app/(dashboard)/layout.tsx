import { Sidebar } from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileNav } from "@/components/MobileNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50">
            <MobileHeader />
            <Sidebar />
            <main className="flex-1 overflow-y-auto pt-14 pb-16 md:pt-0 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-8">
                    {children}
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
