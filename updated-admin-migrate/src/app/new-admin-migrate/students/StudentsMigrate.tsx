import { StudentsDemo } from "@/components/patterns/client-templates-migrate/students";
import { listStudents } from "@/lib/staging/students";
import { toIdentityListRow } from "./fromStaging";

export async function StudentsMigrate() {
  const students = await listStudents();
  return <StudentsDemo rows={students.map(toIdentityListRow)} />;
}
