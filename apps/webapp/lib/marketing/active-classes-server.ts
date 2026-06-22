import { createSupabaseAdminClient } from "@midwestea/utils";
import { getCourseCodeFromSlug } from "@/lib/courseSlugMap";

export type ActiveClass = {
  id: string;
  classId: string;
  className: string;
  courseCode: string;
  price: number | null;
  registrationFee: number | null;
  classStartDate: string | null;
};

export function isActiveClass(classItem: {
  is_online: boolean | null;
  enrollment_start: string | null;
  enrollment_close: string | null;
}): boolean {
  if (classItem.is_online === true) return true;
  if (classItem.enrollment_start && classItem.enrollment_close) {
    const today = new Date().toISOString().split("T")[0];
    return (
      classItem.enrollment_start <= today && classItem.enrollment_close >= today
    );
  }
  return false;
}

export function getCourseCodeFromRoute(route: string): string | null {
  const slug = route.replace(/^\//, "");
  return getCourseCodeFromSlug(slug);
}

export async function getActiveClassesForCourseCode(
  courseCode: string
): Promise<ActiveClass[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("classes")
    .select(
      "id, class_id, class_name, course_code, price, registration_fee, class_start_date, is_online, enrollment_start, enrollment_close"
    )
    .eq("course_code", courseCode)
    .order("class_start_date", { ascending: true });

  if (error) {
    console.error(`Failed to fetch classes for ${courseCode}:`, error);
    return [];
  }

  return (data ?? [])
    .filter(isActiveClass)
    .map((row) => ({
      id: row.id,
      classId: row.class_id ?? "",
      className: row.class_name ?? "",
      courseCode: row.course_code ?? courseCode,
      price: row.price,
      registrationFee: row.registration_fee,
      classStartDate: row.class_start_date,
    }))
    .filter((row) => Boolean(row.classId));
}

export async function getPrimaryActiveClassForRoute(
  route: string
): Promise<ActiveClass | null> {
  const courseCode = getCourseCodeFromRoute(route);
  if (!courseCode) return null;
  const classes = await getActiveClassesForCourseCode(courseCode);
  return classes[0] ?? null;
}

export function formatPriceFromCents(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

/** Whole-dollar amounts without trailing .00 (e.g. program tuition on enrollment bar). */
export function formatWholeDollarsFromCents(
  cents: number | null | undefined
): string {
  const formatted = formatPriceFromCents(cents);
  if (formatted.endsWith(".00")) return formatted.slice(0, -3);
  return formatted;
}

import {
  getProgramPriceCents,
  getRegisterPriceCents,
  getTotalPriceCents,
  type PriceFields,
} from "@/lib/marketing/marketing-pricing";

export { type PriceFields };

function activeClassPriceFields(activeClass: ActiveClass): PriceFields {
  return {
    price: activeClass.price,
    registrationFee: activeClass.registrationFee,
  };
}

/** Display/register price: registration fee when set, otherwise full class price. */
export function getActiveClassRegisterPriceCents(
  activeClass: ActiveClass
): number | null {
  return getRegisterPriceCents(activeClassPriceFields(activeClass));
}

/** Program total tuition when a separate registration fee exists. */
export function getActiveClassTotalPriceCents(
  activeClass: ActiveClass
): number | null {
  return getTotalPriceCents(activeClassPriceFields(activeClass));
}

export function formatActiveClassDisplayPrice(activeClass: ActiveClass): string {
  return formatPriceFromCents(getActiveClassRegisterPriceCents(activeClass));
}

/** Full program tuition (`price` column), falling back to registration fee. */
export function getActiveClassProgramPriceCents(
  activeClass: ActiveClass
): number | null {
  return getProgramPriceCents(activeClassPriceFields(activeClass));
}

/** Formats a price for prose (e.g. priceNote): $2,150 or $49.99 */
export function formatPriceForProse(cents: number | null | undefined): string {
  if (cents == null) return "";
  const amount = cents / 100;
  if (amount % 1 === 0) {
    return amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function replaceEmbeddedDollarAmount(
  text: string,
  formattedPrice: string
): string {
  return text.replace(/\$[\d,]+(?:\.\d{1,2})?/, `$${formattedPrice}`);
}

function getOrdinalSuffix(day: number): string {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = day % 100;
  return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
}

/** Formats YYYY-MM-DD (or parseable date strings) as "August 19th, 2026". */
export function formatClassStartDateOrdinal(
  dateString: string | null | undefined
): string {
  if (!dateString) return "";

  const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = isoMatch
    ? new Date(
        Number(isoMatch[1]),
        Number(isoMatch[2]) - 1,
        Number(isoMatch[3])
      )
    : new Date(dateString);

  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${month} ${day}${getOrdinalSuffix(day)}, ${year}`;
}
