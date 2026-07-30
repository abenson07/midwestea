"use client";

import { createSupabaseClient } from "@midwestea/utils";
import { formatCurrency } from "@midwestea/utils";
import type { Class } from "./classes";
import type {
  ProgramClassRow,
  ProgramClassStatus,
  OnlineClassRow,
  OtherClassRow,
} from "@/data/mocks/classes";

/**
 * Enrollment counts per class, keyed by the human-readable class_id
 * (enrollments.class_id references classes.class_id, not classes.id).
 */
export async function getEnrollmentCountsByClassId(): Promise<{
  counts: Record<string, number> | null;
  error: string | null;
}> {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select("class_id, enrollment_status");

    if (error) {
      return { counts: null, error: error.message };
    }

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      if (row.enrollment_status === "removed") continue;
      counts[row.class_id] = (counts[row.class_id] ?? 0) + 1;
    }
    return { counts, error: null };
  } catch (err) {
    return { counts: null, error: err instanceof Error ? err.message : "Failed to load enrollment counts" };
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isClosed(cls: Class): boolean {
  if (!cls.class_close_date) return false;
  const closeDate = new Date(cls.class_close_date);
  if (Number.isNaN(closeDate.getTime())) return false;
  return closeDate.getTime() < Date.now();
}

function programStatus(cls: Class): ProgramClassStatus {
  if (cls.enrollment_close) {
    const closeDate = new Date(cls.enrollment_close);
    if (!Number.isNaN(closeDate.getTime()) && closeDate.getTime() > Date.now()) {
      return "enrolling";
    }
  }
  return "active";
}

export function toProgramClassRow(cls: Class, enrolledCount: number): ProgramClassRow {
  return {
    id: cls.id,
    code: cls.class_id,
    name: cls.class_name,
    status: programStatus(cls),
    enrolledCount,
    capacity: cls.registration_limit ?? 0,
    price: formatCurrency(cls.price),
    startDate: formatDate(cls.class_start_date),
    endDate: formatDate(cls.class_close_date),
  };
}

export function toOnlineClassRow(cls: Class, enrolledCount: number): OnlineClassRow {
  return {
    id: cls.id,
    code: cls.class_id,
    name: cls.class_name,
    price: formatCurrency(cls.price),
    duration: cls.length_of_class ?? "—",
    enrolledCount,
    // No enable/disable field exists on the real class record today —
    // default to enabled; toggling here is local-only until a backend field exists.
    isEnabled: true,
  };
}

export function toOtherClassRow(cls: Class, totalEnrolled: number): OtherClassRow {
  return {
    id: cls.id,
    code: cls.class_id,
    name: cls.class_name,
    closedDate: formatDate(cls.class_close_date),
    totalEnrolled,
  };
}

export type BucketedClasses = {
  programClasses: ProgramClassRow[];
  onlineClasses: OnlineClassRow[];
  otherClasses: OtherClassRow[];
};

/**
 * Splits real classes into the three Classes Overview buckets:
 * - Active program classes: non-online classes that haven't closed
 * - Online classes: all is_online classes
 * - Other classes: non-online classes whose class_close_date has passed
 */
export function bucketClasses(classes: Class[], enrollmentCounts: Record<string, number>): BucketedClasses {
  const programClasses: ProgramClassRow[] = [];
  const onlineClasses: OnlineClassRow[] = [];
  const otherClasses: OtherClassRow[] = [];

  for (const cls of classes) {
    const enrolledCount = enrollmentCounts[cls.class_id] ?? 0;
    if (cls.is_online) {
      onlineClasses.push(toOnlineClassRow(cls, enrolledCount));
    } else if (isClosed(cls)) {
      otherClasses.push(toOtherClassRow(cls, enrolledCount));
    } else {
      programClasses.push(toProgramClassRow(cls, enrolledCount));
    }
  }

  return { programClasses, onlineClasses, otherClasses };
}
