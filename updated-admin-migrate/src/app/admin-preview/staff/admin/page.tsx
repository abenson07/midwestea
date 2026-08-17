import { redirect } from "next/navigation";

export default function StaffAdminsRedirect() {
  redirect("/admin-preview/settings/admins");
}
