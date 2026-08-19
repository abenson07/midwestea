import { calendarDaysUntil, formatCalendarDate, todayIsoDate } from "@/lib/dates";

export type StagingOpenClass = {
  id: string;
  label: string;
  path: string;
  kind: "Program" | "Course";
  enrolledCount: number;
  className: string;
  templateName: string;
  classStart: string | null;
  classEnd: string | null;
  enrollmentClose: string | null;
};

export type StagingOpenClassGroups = {
  programs: StagingOpenClass[];
  courses: StagingOpenClass[];
};

export const EMPTY_OPEN_CLASS_GROUPS: StagingOpenClassGroups = {
  programs: [],
  courses: [],
};

export const OPEN_CLASS_NAV_LIMIT = 5;

/**
 * Which open classes occupy the first sidebar slots.
 * - most-enrolled: busiest rosters first
 * - ending-soon: classes wrapping up first
 * - starting-soon: in session first, then the next start date
 */
export const OPEN_CLASS_PRIORITY = "most-enrolled" as const;

export type OpenClassPriority = typeof OPEN_CLASS_PRIORITY;

export type OpenClassSource = {
  id: string;
  classCode: string | null;
  name: string | null;
  classStart: string | null;
  classEnd: string | null;
  enrollmentClose: string | null;
  kind?: "Program" | "Course";
  enrolledCount?: number;
  templateName?: string;
};

type RankedOpenClass = StagingOpenClass;

function isOpen(classEnd: string | null, today: string): boolean {
  if (!classEnd) return true;
  return classEnd.slice(0, 10) >= today;
}

function dateKey(value: string | null, empty: string): string {
  return value?.slice(0, 10) || empty;
}

function compareByPriority(a: RankedOpenClass, b: RankedOpenClass): number {
  if (OPEN_CLASS_PRIORITY === "most-enrolled" && a.enrolledCount !== b.enrolledCount) {
    return b.enrolledCount - a.enrolledCount;
  }
  if (OPEN_CLASS_PRIORITY === "starting-soon") {
    const start = dateKey(a.classStart, "9999-12-31").localeCompare(dateKey(b.classStart, "9999-12-31"));
    if (start !== 0) return start;
  }
  const end = dateKey(a.classEnd, "9999-12-31").localeCompare(dateKey(b.classEnd, "9999-12-31"));
  if (end !== 0) return end;
  if (a.enrolledCount !== b.enrolledCount) return b.enrolledCount - a.enrolledCount;
  return a.label.localeCompare(b.label);
}

function toRanked(row: OpenClassSource): RankedOpenClass {
  const className = row.name || row.classCode || "Class";
  return {
    id: row.id,
    label: row.classCode || className,
    path: `/class/${row.id}`,
    kind: row.kind === "Program" ? "Program" : "Course",
    enrolledCount: row.enrolledCount ?? 0,
    className,
    templateName: row.templateName || className,
    classStart: row.classStart,
    classEnd: row.classEnd,
    enrollmentClose: row.enrollmentClose,
  };
}

export function openClassHoverDateLabel(
  row: Pick<StagingOpenClass, "classStart" | "classEnd" | "enrollmentClose">,
  today: string = todayIsoDate(),
): string {
  const start = row.classStart?.slice(0, 10) ?? null;
  const close = row.enrollmentClose?.slice(0, 10) ?? null;
  const end = row.classEnd?.slice(0, 10) ?? null;
  const inRegistration = !start || today < start;

  if (inRegistration && close) {
    const days = calendarDaysUntil(close);
    if (days == null) return `Registration closes ${formatCalendarDate(close)}`;
    if (days < 0) return end ? `Class ends on ${formatCalendarDate(end)}` : `Registration closed ${formatCalendarDate(close)}`;
    if (days === 0) return "Registration closes today";
    if (days === 1) return "Registration closes in 1 day";
    return `Registration closes in ${days} days`;
  }

  if (end) return `Class ends on ${formatCalendarDate(end)}`;
  return "";
}

export function openClassStudentLabel(count: number): string {
  return `${count} ${count === 1 ? "student" : "students"}`;
}

export function groupOpenClasses(rows: OpenClassSource[], today: string): StagingOpenClassGroups {
  const open = rows.filter((row) => isOpen(row.classEnd, today)).map(toRanked).sort(compareByPriority);
  return {
    programs: open.filter((row) => row.kind === "Program"),
    courses: open.filter((row) => row.kind === "Course"),
  };
}

export function splitOpenClassNav<T>(items: T[], limit = OPEN_CLASS_NAV_LIMIT): { visible: T[]; overflow: T[] } {
  return {
    visible: items.slice(0, limit),
    overflow: items.slice(limit),
  };
}
