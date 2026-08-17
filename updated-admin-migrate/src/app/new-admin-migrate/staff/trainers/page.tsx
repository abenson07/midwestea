import { redirect } from "next/navigation";

export default function StaffTrainersRedirect() {
  redirect("/new-admin-migrate/settings/trainers");
}
