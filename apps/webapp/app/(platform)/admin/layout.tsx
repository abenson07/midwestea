import type { Metadata } from "next";
import { AdminShell } from "./admin-shell";
import { listOpenClassesForNav } from "@/lib/admin-migrate/listOpenClasses";
import "./isolation.css";
import "./admin-migrate.css";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const openClasses = await listOpenClassesForNav();
  return <AdminShell openClasses={openClasses}>{children}</AdminShell>;
}
