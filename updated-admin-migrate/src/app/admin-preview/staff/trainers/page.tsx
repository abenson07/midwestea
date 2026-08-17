import { redirect } from "next/navigation";

export default function StaffTrainersRedirect() {
  redirect("/admin-preview/settings/trainers");
}
