import { toast } from "sonner";
import { sendTransactionReminder } from "@/lib/payments";

/** Emails the student a payment reminder for this invoice and reports the real outcome. */
export async function remindTransaction(row: { id: string; studentName: string }) {
  const { success, error } = await sendTransactionReminder(row.id);
  if (success) {
    toast.success(`Reminder sent to ${row.studentName}`);
  } else {
    toast.error(error || `Couldn't send a reminder to ${row.studentName}`);
  }
}
