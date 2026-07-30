import { ClassDetailDemo } from "@/components/patterns/client-templates/class-detail";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";

export default function ClassDetailMigratePage() {
  return <ClassDetailDemo navigation={<MigrateSidebar />} />;
}
