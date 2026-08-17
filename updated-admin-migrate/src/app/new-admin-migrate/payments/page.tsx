import { redirect } from "next/navigation";

export default function PaymentsRedirect() {
  redirect("/new-admin-migrate/transactions");
}
