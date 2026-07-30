import { CoursesDemo } from "@/components/patterns/client-templates/courses";
import { MigrateSidebar } from "@/components/patterns/foundation/MigrateSidebar";

export default function CoursesMigratePage() {
  return <CoursesDemo navigation={<MigrateSidebar />} />;
}
