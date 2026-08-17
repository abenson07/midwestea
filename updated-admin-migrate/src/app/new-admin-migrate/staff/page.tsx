import { redirect } from "next/navigation";

export default function StaffRedirect() {
  redirect("/new-admin-migrate/settings/trainers");
}
