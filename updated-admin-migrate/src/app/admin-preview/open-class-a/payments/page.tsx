import { redirect } from "next/navigation";

export default function OpenClassAPaymentsRedirect() {
  redirect("/admin-preview/open-class-a/transactions");
}
