import { PayoutsDemo } from "@/components/patterns/client-templates/transactions";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";

export default function PayoutsMigratePage() {
  return <PayoutsDemo navigation={<MigrateSidebar />} />;
}
