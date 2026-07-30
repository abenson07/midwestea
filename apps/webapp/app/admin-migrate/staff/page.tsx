import { StaffDemo } from "@/components/patterns/client-templates/staff";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";

export default function StaffMigratePage() {
  return <StaffDemo navigation={<MigrateSidebar />} />;
}
