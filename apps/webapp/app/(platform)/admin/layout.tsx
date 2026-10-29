import type { Metadata } from "next";
import { AdminShell } from "./admin-shell";
import { listOpenClassesForNav } from "@/lib/admin-migrate/listOpenClasses";
import "./isolation.css";
import "./admin-migrate.css";

export const metadata: Metadata = {
  title: "Admin",
};

// The admin pages read live Supabase data on the server. Without this, Next
// prerenders them at build time and serves that snapshot until the next deploy.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const openClasses = await listOpenClassesForNav();
  return <AdminShell openClasses={openClasses}>{children}</AdminShell>;
}
