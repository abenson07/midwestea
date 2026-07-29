"use client";

import { useState } from "react";
import { Button } from "@/components/patterns/primitives/Button";

/** Visual-only "Send Reminder" action — no API call, this is a static demo. */
export function ReminderButton() {
  const [sent, setSent] = useState(false);
  return (
    <Button
      label={sent ? "Reminder sent" : "Send Reminder"}
      variant="secondary"
      size="sm"
      onClick={() => setSent(true)}
    />
  );
}
