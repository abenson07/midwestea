"use client";

import { use } from "react";
import { StudentDetailDemo } from "@/components/patterns/client-templates-migrate/students";

export default function StudentProfileRoute({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = use(params);
  return <StudentDetailDemo key={studentId} studentId={studentId} />;
}
