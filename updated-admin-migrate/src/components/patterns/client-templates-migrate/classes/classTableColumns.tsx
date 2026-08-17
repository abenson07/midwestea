"use client";

import { pixel, proportional, type TableColumn } from "@/components/patterns/primitives/table";
import { RowClickCell } from "@/components/patterns/client-templates/shared";
import { formatCalendarMonthDay, parseCalendarDate } from "@/lib/dates";
import { classRosterFor, type ClassDetail } from "./classMocks";

export function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function isClassClosed(row: ClassDetail, today: Date = startOfToday()): boolean {
  const end = parseCalendarDate(row.classEnd);
  return Boolean(end && end < today);
}

export function isClassInRegistration(row: ClassDetail, today: Date): boolean {
  const classStart = parseCalendarDate(row.classStart);
  if (!classStart) return true;
  return today < classStart;
}

export function openClassDateLabel(row: ClassDetail, today: Date): string {
  if (isClassInRegistration(row, today)) {
    return `Registration ends ${formatCalendarMonthDay(row.enrollmentClose)}`;
  }
  return `Class ends ${formatCalendarMonthDay(row.classEnd)}`;
}

export function closedClassDateLabel(row: ClassDetail): string {
  return `Closed on ${formatCalendarMonthDay(row.classEnd)}`;
}

export function classDateLabel(row: ClassDetail, today: Date, isClosed: boolean): string {
  return isClosed ? closedClassDateLabel(row) : openClassDateLabel(row, today);
}

function seatCapacity(limit: string): number | null {
  const match = limit.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function enrolledLabel(row: ClassDetail): string {
  const enrolled = classRosterFor(row.id).filter(
    (person) => person.role === "Student" && person.status === "Enrolled",
  ).length;
  const capacity = seatCapacity(row.registrationLimit);
  if (capacity == null) return String(enrolled);
  return `${enrolled} out of ${capacity}`;
}

export function buildClassTableColumns({
  dateLabel,
  onSelect,
}: {
  dateLabel: (row: ClassDetail) => string;
  onSelect: (row: ClassDetail) => void;
}): TableColumn<ClassDetail>[] {
  return [
    {
      key: "name",
      header: "Class name",
      width: proportional(1, { minWidth: 140 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ fontWeight: 500 }}>{row.classCode}</span>
        </RowClickCell>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      width: proportional(1, { minWidth: 160 }),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>
          <span style={{ color: "var(--linear-color-ink-subtle)" }}>{dateLabel(row)}</span>
        </RowClickCell>
      ),
    },
    {
      key: "enrolled",
      header: "Enrolled",
      width: pixel(120),
      renderCell: (row) => (
        <RowClickCell onClick={() => onSelect(row)}>{enrolledLabel(row)}</RowClickCell>
      ),
    },
  ];
}
