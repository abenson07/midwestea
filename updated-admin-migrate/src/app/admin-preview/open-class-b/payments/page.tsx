import { redirect } from "next/navigation";

export default function OpenClassBPaymentsRedirect() {
  redirect("/admin-preview/open-class-b/transactions");
}
