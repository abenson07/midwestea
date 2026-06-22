import { createSupabaseAdminClient } from "@midwestea/utils";
import { getCourseCodeFromSlug, getPrimaryRouteForCourseCode } from "@/lib/courseSlugMap";
import { formatDate } from "@/lib/email";
import { isActiveClass } from "@/lib/marketing/active-classes-server";
import { checkoutDetailsUrl } from "@/lib/marketing/checkout-url";
import { programLinks } from "@/lib/marketing/nav-data";

export type BannerEnrollmentItem = {
  id: string;
  headline: string;
  detail: string;
  href: string;
};

type BannerClassRow = {
  id: string;
  class_id: string | null;
  course_code: string | null;
  enrollment_start: string | null;
  enrollment_close: string | null;
  class_start_date: string | null;
  is_online: boolean | null;
};

type MessageKind = "justOpened" | "closingSoon" | "default";

const programLabelByCode = new Map<string, string>(
  programLinks.flatMap((link) => {
    const code = getCourseCodeFromSlug(link.href.replace(/^\//, ""));
    return code ? [[code, link.label] as const] : [];
  })
);

function todayUtc(): string {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(from: string, to: string): number {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function getProgramName(courseCode: string, courseName: string | null): string {
  if (courseName?.trim()) return courseName.trim();
  return programLabelByCode.get(courseCode) ?? courseCode;
}

function getMessageKind(row: BannerClassRow, today: string): MessageKind {
  if (row.enrollment_start === today) return "justOpened";

  if (row.enrollment_close) {
    const daysUntilClose = daysBetween(today, row.enrollment_close);
    if (daysUntilClose >= 0 && daysUntilClose <= 7) return "closingSoon";
  }

  return "default";
}

function buildMessage(
  programName: string,
  kind: MessageKind,
  row: BannerClassRow,
  today: string
): { headline: string; detail: string } {
  if (kind === "justOpened") {
    return {
      headline: `${programName} class is open for enrollment.`,
      detail: "Click here to learn more",
    };
  }

  if (kind === "closingSoon" && row.enrollment_close) {
    const daysUntilClose = daysBetween(today, row.enrollment_close);
    if (daysUntilClose <= 1) {
      return { headline: `${programName} closes soon`, detail: "" };
    }
    return {
      headline: `${programName} enrollment closes in ${daysUntilClose} days`,
      detail: "",
    };
  }

  if (row.class_start_date) {
    const startDate = formatDate(row.class_start_date, "long");
    return {
      headline: `Enroll in ${programName} class today.`,
      detail: `Classes start ${startDate}`,
    };
  }

  return { headline: `Enroll in ${programName} class today`, detail: "" };
}

function buildHref(
  kind: MessageKind,
  courseCode: string,
  classId: string
): string {
  const programRoute = getPrimaryRouteForCourseCode(courseCode);
  if (kind === "justOpened" && programRoute) return programRoute;
  return checkoutDetailsUrl(classId, courseCode);
}

function sortKey(kind: MessageKind, row: BannerClassRow): [number, string, string] {
  const urgency =
    kind === "closingSoon" ? 0 : kind === "justOpened" ? 1 : 2;
  return [
    urgency,
    row.enrollment_close ?? "9999-99-99",
    row.class_start_date ?? "9999-99-99",
  ];
}

export async function getBannerEnrollmentItems(): Promise<BannerEnrollmentItem[]> {
  const supabase = createSupabaseAdminClient();
  const today = todayUtc();

  const { data: programs, error: programsError } = await supabase
    .from("courses")
    .select("course_code, course_name")
    .eq("program_type", "program");

  if (programsError) {
    console.error("Failed to fetch program courses for banner:", programsError);
    return [];
  }

  const programCodes = (programs ?? [])
    .map((row) => row.course_code)
    .filter(Boolean) as string[];

  if (programCodes.length === 0) return [];

  const courseNameByCode = new Map(
    (programs ?? []).map((row) => [row.course_code, row.course_name])
  );

  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select(
      "id, class_id, course_code, enrollment_start, enrollment_close, class_start_date, is_online"
    )
    .in("course_code", programCodes);

  if (classesError) {
    console.error("Failed to fetch classes for banner:", classesError);
    return [];
  }

  const items = (classes ?? [])
    .filter((row): row is BannerClassRow & { class_id: string; course_code: string } =>
      Boolean(row.class_id && row.course_code && isActiveClass(row))
    )
    .map((row) => {
      const courseCode = row.course_code;
      const programName = getProgramName(
        courseCode,
        courseNameByCode.get(courseCode) ?? null
      );
      const kind = getMessageKind(row, today);
      const { headline, detail } = buildMessage(programName, kind, row, today);
      return {
        item: {
          id: row.id,
          headline,
          detail,
          href: buildHref(kind, courseCode, row.class_id),
        },
        kind,
        row,
      };
    });

  items.sort((a, b) => {
    const [aUrgency, aClose, aStart] = sortKey(a.kind, a.row);
    const [bUrgency, bClose, bStart] = sortKey(b.kind, b.row);
    if (aUrgency !== bUrgency) return aUrgency - bUrgency;
    if (aClose !== bClose) return aClose.localeCompare(bClose);
    return aStart.localeCompare(bStart);
  });

  return items.map(({ item }) => item);
}
