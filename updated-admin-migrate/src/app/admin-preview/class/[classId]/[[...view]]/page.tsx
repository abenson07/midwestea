"use client";

import { use } from "react";
import { ClassDetailDemo } from "@/components/patterns/client-templates-migrate/classes";

export default function ClassCatchAllRoute({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = use(params);
  return <ClassDetailDemo key={classId} classId={classId} />;
}
