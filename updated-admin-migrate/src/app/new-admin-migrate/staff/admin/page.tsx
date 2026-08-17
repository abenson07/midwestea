import { redirect } from "next/navigation";

export default function StaffAdminsRedirect() {
  redirect("/new-admin-migrate/settings/admins");
}
