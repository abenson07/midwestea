import { ProgramsDemo } from "@/components/patterns/client-templates/programs";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";

export default function ProgramsMigratePage() {
  return <ProgramsDemo navigation={<MigrateSidebar />} />;
}
