import type { StagingClass } from "@/lib/admin-migrate/classes";
import type { StagingCourse } from "@/lib/admin-migrate/courses";
import type { StagingEnrollment } from "@/lib/admin-migrate/enrollments";
import type { StagingClassPrerequisite, StagingPrerequisiteType } from "@/lib/admin-migrate/prerequisites";
import type { StagingStudent } from "@/lib/admin-migrate/students";
import type { ClassDetail, ClassRosterRow } from "@/components/admin-migrate/patterns/classes/classMocks";
import {
  externalLinksFor,
  formatCentsDisplay,
  formatCertLength,
  formatClassFormat,
  formatSeatLimit,
} from "../catalog/fromStaging";

export function toClassDetail(
  stagingClass: StagingClass,
  options: {
    course?: StagingCourse;
    prerequisites?: string[];
  } = {},
): ClassDetail {
  const course = options.course;
  return {
    id: stagingClass.id,
    classCode: stagingClass.classCode ?? "—",
    courseCode: stagingClass.courseCode ?? course?.code ?? "—",
    title: stagingClass.name ?? "Class",
    publishStatus: "draft",
    classFormat: formatClassFormat(stagingClass.classFormat ?? course?.classFormat),
    location: stagingClass.location || "—",
    enrollmentStart: stagingClass.enrollmentStart ?? "",
    enrollmentClose: stagingClass.enrollmentClose ?? "",
    classStart: stagingClass.classStart ?? "",
    classEnd: stagingClass.classEnd ?? "",
    classLength: stagingClass.classLength || course?.classLength || "—",
    registrationLimit: formatSeatLimit(stagingClass.registrationLimit ?? course?.registrationLimit),
    certificationLength: formatCertLength(
      stagingClass.certificationLength ?? course?.certificationLength,
    ),
    price: formatCentsDisplay(stagingClass.price ?? course?.price),
    registrationFee: formatCentsDisplay(stagingClass.registrationFee ?? course?.registrationFee),
    prerequisites: options.prerequisites ?? [],
    externalLinks: externalLinksFor(stagingClass) ?? (course ? externalLinksFor(course) : undefined),
    template: course
      ? {
          kind: course.kind,
          name: course.name,
          href: course.kind === "Program" ? `/programs/${course.id}` : `/courses/${course.id}`,
        }
      : undefined,
  };
}

export function classPrerequisiteNames(
  classId: string,
  assignments: StagingClassPrerequisite[],
  types: StagingPrerequisiteType[],
): string[] {
  const names = new Map(types.map((type) => [type.id, type.name]));
  return assignments
    .filter((row) => row.classId === classId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => names.get(row.prerequisiteTypeId))
    .filter((name): name is string => Boolean(name));
}

export function toRosterRow(enrollment: StagingEnrollment, student: StagingStudent): ClassRosterRow {
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    role: "Student",
    status: "Enrolled",
  };
}

/** Registered-enrollment count per class, for the classes list's "Enrolled" column. */
export function countEnrollmentsByClass(enrollments: StagingEnrollment[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const enrollment of enrollments) {
    if (enrollment.enrollmentStatus === "removed") continue;
    counts.set(enrollment.classId, (counts.get(enrollment.classId) ?? 0) + 1);
  }
  return counts;
}
