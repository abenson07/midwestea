import type { Metadata } from "next";
import { AdminShell } from "./admin-shell";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
