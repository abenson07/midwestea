import type { StagingAdmin } from "@/lib/admin-migrate/admins";
import type { StagingCourse } from "@/lib/admin-migrate/courses";
import type { StagingLocation } from "@/lib/admin-migrate/locations";
import type { StagingPrerequisiteType, StagingTemplatePrerequisite } from "@/lib/admin-migrate/prerequisites";
import type { CatalogTemplate } from "@/components/admin-migrate/patterns/catalog/catalogMocks";
import {
  CLASS_FORMATS,
  type ClassExternalLink,
  type ClassFormat,
} from "@/components/admin-migrate/patterns/classes/classMocks";
import type { LocationRow } from "@/components/admin-migrate/patterns/locations/types";
import type {
  PrerequisiteExpiration,
  PrerequisiteInputType,
  PrerequisiteRow,
} from "@/components/admin-migrate/patterns/prerequisites/types";
import type { StaffRow } from "@/components/admin-migrate/patterns/staff/types";

export function formatCentsDisplay(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function formatClassFormat(value: string | null | undefined): ClassFormat {
  if (value && (CLASS_FORMATS as readonly string[]).includes(value)) {
    return value as ClassFormat;
  }
  return "In Person Only";
}

export function formatCertLength(years: number | null | undefined): string {
  if (years == null) return "—";
  return `${years} year${years === 1 ? "" : "s"}`;
}

export function formatSeatLimit(limit: number | null | undefined): string {
  if (limit == null) return "—";
  return `${limit} seat${limit === 1 ? "" : "s"}`;
}

export function externalLinksFor(source: {
  jbLearningLabel: string | null;
  jbLearningUrl: string | null;
  platinumEdLabel: string | null;
  platinumEdUrl: string | null;
}): ClassExternalLink[] | undefined {
  const links: ClassExternalLink[] = [];
  if (source.jbLearningUrl) {
    links.push({
      id: "jb",
      name: source.jbLearningLabel || "JB Learning",
      url: source.jbLearningUrl,
    });
  }
  if (source.platinumEdUrl) {
    links.push({
      id: "platinum",
      name: source.platinumEdLabel || "Platinum ED",
      url: source.platinumEdUrl,
    });
  }
  return links.length ? links : undefined;
}

export function prerequisiteNamesFor(
  courseUuid: string,
  assignments: StagingTemplatePrerequisite[],
  types: StagingPrerequisiteType[],
): string[] {
  const names = new Map(types.map((type) => [type.id, type.name]));
  return assignments
    .filter((row) => row.courseUuid === courseUuid)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((row) => names.get(row.prerequisiteTypeId))
    .filter((name): name is string => Boolean(name));
}

export function toCatalogTemplate(
  course: StagingCourse,
  prerequisites: string[] = [],
): CatalogTemplate {
  return {
    id: course.id,
    kind: course.kind,
    code: course.code ?? "—",
    name: course.name,
    description: "",
    defaultClassFormat: formatClassFormat(course.classFormat),
    defaultLocation: "—",
    price: formatCentsDisplay(course.price),
    registrationFee: formatCentsDisplay(course.registrationFee),
    certificationLength: formatCertLength(course.certificationLength),
    registrationLimit: formatSeatLimit(course.registrationLimit),
    classLength: course.classLength || "—",
    prerequisites,
    externalLinks: externalLinksFor(course),
  };
}

export function toStaffRow(admin: StagingAdmin): StaffRow {
  return { id: admin.id, name: admin.displayName, email: admin.email, roles: ["admin"] };
}

export function toLocationRow(location: StagingLocation): LocationRow {
  return {
    id: location.id,
    name: location.name,
    street: location.street ?? "",
    city: location.city ?? "",
    state: location.state ?? "",
    zip: location.zip ?? "",
    mapsUrl: location.mapsUrl ?? "",
  };
}

function toInputType(value: string): PrerequisiteInputType {
  if (value === "file_upload" || value === "file") return "file";
  if (value === "date" || value === "text" || value === "checkbox") return value;
  return "text";
}

function toExpiration(value: string | null): PrerequisiteExpiration {
  if (value === "fixed_date" || value === "duration_from_issue") return value;
  return "never";
}

export function toPrerequisiteRow(type: StagingPrerequisiteType): PrerequisiteRow {
  const created = type.createdAt ? type.createdAt.slice(0, 10) : "";
  return {
    id: type.id,
    name: type.name,
    description: type.description ?? "",
    inputType: toInputType(type.inputType),
    requiredByDefault: type.requiredByDefault,
    expiration: toExpiration(type.expirationRule),
    validMonths: type.expirationDurationMonths,
    createdOn: created,
    archived: Boolean(type.archivedAt),
  };
}
