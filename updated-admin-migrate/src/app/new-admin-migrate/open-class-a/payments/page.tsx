import { redirect } from "next/navigation";

export default function OpenClassAPaymentsRedirect() {
  redirect("/new-admin-migrate/open-class-a/transactions");
}
