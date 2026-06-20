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

function isActiveClass(classItem: {
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

/** Display/register price: registration fee when set, otherwise full class price. */
export function getActiveClassRegisterPriceCents(
  activeClass: ActiveClass
): number | null {
  if (activeClass.registrationFee != null && activeClass.registrationFee > 0) {
    return activeClass.registrationFee;
  }
  return activeClass.price;
}

/** Program total tuition when a separate registration fee exists. */
export function getActiveClassTotalPriceCents(
  activeClass: ActiveClass
): number | null {
  const hasRegistrationFee =
    activeClass.registrationFee != null && activeClass.registrationFee > 0;
  if (hasRegistrationFee && activeClass.price != null) {
    return activeClass.price;
  }
  return null;
}

export function formatActiveClassDisplayPrice(activeClass: ActiveClass): string {
  return formatPriceFromCents(getActiveClassRegisterPriceCents(activeClass));
}

/** Full program tuition (`price` column), falling back to registration fee. */
export function getActiveClassProgramPriceCents(
  activeClass: ActiveClass
): number | null {
  return activeClass.price ?? activeClass.registrationFee;
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
