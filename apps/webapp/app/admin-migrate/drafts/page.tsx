import { DraftsDemo } from "@/components/patterns/client-templates/drafts";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";

export default function DraftsMigratePage() {
  return <DraftsDemo navigation={<MigrateSidebar />} />;
}
