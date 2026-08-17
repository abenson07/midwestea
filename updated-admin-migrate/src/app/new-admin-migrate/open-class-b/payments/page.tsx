import { redirect } from "next/navigation";

export default function OpenClassBPaymentsRedirect() {
  redirect("/new-admin-migrate/open-class-b/transactions");
}
