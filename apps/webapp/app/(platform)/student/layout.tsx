import type { Metadata } from "next";
import { StudentShell } from "@/components/student-shell";
import { dmSans, ppNeueCorp } from "@/lib/marketing/fonts";
import { getBannerEnrollmentItems } from "@/lib/marketing/banner-enrollment";
import "../../(marketing)/marketing.css";

export const metadata: Metadata = {
  title: "Student Portal",
};

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bannerItems = await getBannerEnrollmentItems();

  return (
    <div className={`${dmSans.variable} ${ppNeueCorp.variable} bg-background font-body text-text antialiased`}>
      <StudentShell bannerItems={bannerItems}>{children}</StudentShell>
    </div>
  );
}
