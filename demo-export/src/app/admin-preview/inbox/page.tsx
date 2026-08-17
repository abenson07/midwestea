"use client";

import { useDemoModeOptional } from "@/components/patterns/foundation/DemoModeContext";
import { InboxDemo, InboxPage } from "@/components/patterns/client-templates-migrate/inbox";

export default function InboxRoute() {
  const { enabled: demo } = useDemoModeOptional();
  return demo ? <InboxPage /> : <InboxDemo />;
}
