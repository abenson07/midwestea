import type { Metadata } from "next";
import { StudentShell } from "@/components/student-shell";

export const metadata: Metadata = {
  title: "Student Portal",
};

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StudentShell>{children}</StudentShell>;
}
