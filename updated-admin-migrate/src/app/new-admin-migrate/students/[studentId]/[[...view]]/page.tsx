import { StudentDetailDemo } from "@/components/patterns/client-templates-migrate/students";
import { getStudentById } from "@/lib/staging/students";
import { toStudentRecord } from "../../fromStaging";

export default async function StudentProfileRoute({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const stagingStudent = await getStudentById(studentId);
  const student = stagingStudent ? toStudentRecord(stagingStudent) : undefined;

  return <StudentDetailDemo key={studentId} studentId={studentId} student={student} />;
}
