"use client";

import { useEffect, useMemo, useState } from "react";
import { FoundationLayout } from "@/components/patterns/foundation/FoundationLayout";
import { CanvasHeader } from "@/components/patterns/foundation/CanvasHeader";
import { LinearSidebar } from "@/components/patterns/foundation/LinearSidebar";
import { sampleInboxMessages, type InboxMessage } from "@/data/mocks/inbox";
import { listDemoScoped, writeDemoScoped } from "@/lib/demo/demoStore";
import { InboxList } from "./InboxList";
import { InboxReadingPane } from "./InboxReadingPane";

/** Demo-only two-pane email client — simulated inbound mail, styling reference only. */
export function InboxPage() {
  const [messages, setMessages] = useState<InboxMessage[]>(sampleInboxMessages);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setMessages(listDemoScoped<InboxMessage>("inbox", "messages") ?? sampleInboxMessages);
  }, []);

  const selected = useMemo(() => messages.find((m) => m.id === selectedId) ?? null, [messages, selectedId]);

  function selectMessage(id: string) {
    setSelectedId(id);
    const next = messages.map((m) => (m.id === id ? { ...m, status: "read" as const } : m));
    setMessages(next);
    writeDemoScoped("inbox", "messages", next);
  }

  return (
    <div style={{ height: "100%" }}>
      <FoundationLayout
        navigation={<LinearSidebar />}
        header={<CanvasHeader topbar={{ title: "Inbox" }} />}
      >
        <div style={{ display: "flex", height: "100%", minHeight: 0, boxSizing: "border-box" }}>
          <InboxList messages={messages} selectedId={selectedId} onSelect={selectMessage} />
          <InboxReadingPane message={selected} />
        </div>
      </FoundationLayout>
    </div>
  );
}
