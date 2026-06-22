import { createSupabaseAdminClient } from "@midwestea/utils";
import {
  getActiveClassesForCourseCode,
  getCourseCodeFromRoute,
  type ActiveClass,
} from "@/lib/marketing/active-classes-server";
import { checkoutDetailsUrl, waitlistUrl } from "@/lib/marketing/checkout-url";

export type PriceFields = {
  price: number | null;
  registrationFee: number | null;
};

export type CatalogCourse = PriceFields & {
  courseCode: string;
  courseName: string | null;
};

export type MarketingPricing = {
  source: "class" | "course";
  courseCode: string;
  mode: "register" | "waitlist";
  price: number | null;
  registrationFee: number | null;
  classId?: string;
  classStartDate?: string | null;
  actionUrl: string;
};

/** Display/register price: registration fee when set, otherwise full price. */
export function getRegisterPriceCents(fields: PriceFields): number | null {
  if (fields.registrationFee != null && fields.registrationFee > 0) {
    return fields.registrationFee;
  }
  return fields.price;
}

/** Program total tuition when a separate registration fee exists. */
export function getTotalPriceCents(fields: PriceFields): number | null {
  const hasRegistrationFee =
    fields.registrationFee != null && fields.registrationFee > 0;
  if (hasRegistrationFee && fields.price != null) {
    return fields.price;
  }
  return null;
}

/** Full program tuition (`price` column), falling back to registration fee. */
export function getProgramPriceCents(fields: PriceFields): number | null {
  return fields.price ?? fields.registrationFee;
}

function pricingFromClass(activeClass: ActiveClass): MarketingPricing {
  return {
    source: "class",
    courseCode: activeClass.courseCode,
    mode: "register",
    price: activeClass.price,
    registrationFee: activeClass.registrationFee,
    classId: activeClass.classId,
    classStartDate: activeClass.classStartDate,
    actionUrl: checkoutDetailsUrl(activeClass.classId, activeClass.courseCode),
  };
}

function pricingFromCatalog(catalog: CatalogCourse): MarketingPricing {
  return {
    source: "course",
    courseCode: catalog.courseCode,
    mode: "waitlist",
    price: catalog.price,
    registrationFee: catalog.registrationFee,
    actionUrl: waitlistUrl(catalog.courseCode),
  };
}

export async function getCourseCatalogByCode(
  courseCode: string
): Promise<CatalogCourse | null> {
  const map = await getCoursesCatalogByCodes([courseCode]);
  return map.get(courseCode.toUpperCase()) ?? null;
}

export async function getCoursesCatalogByCodes(
  codes: string[]
): Promise<Map<string, CatalogCourse>> {
  const unique = [...new Set(codes.map((c) => c.toUpperCase()))];
  if (unique.length === 0) return new Map();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("courses")
    .select("course_code, course_name, price, registration_fee")
    .in("course_code", unique);

  if (error) {
    console.error("Failed to fetch course catalog:", error);
    return new Map();
  }

  const map = new Map<string, CatalogCourse>();
  for (const row of data ?? []) {
    const code = row.course_code?.toUpperCase();
    if (!code) continue;
    map.set(code, {
      courseCode: code,
      courseName: row.course_name ?? null,
      price: row.price,
      registrationFee: row.registration_fee,
    });
  }
  return map;
}

export async function getMarketingPricingForCourseCode(
  courseCode: string
): Promise<MarketingPricing | null> {
  const normalized = courseCode.toUpperCase();
  const activeClasses = await getActiveClassesForCourseCode(normalized);
  const activeClass = activeClasses[0];
  if (activeClass) return pricingFromClass(activeClass);

  const catalog = await getCourseCatalogByCode(normalized);
  if (catalog) return pricingFromCatalog(catalog);

  return null;
}

export async function getMarketingPricingForRoute(
  route: string
): Promise<MarketingPricing | null> {
  const courseCode = getCourseCodeFromRoute(route);
  if (!courseCode) return null;
  return getMarketingPricingForCourseCode(courseCode);
}

export async function getMarketingPricingByCourseCodes(
  codes: string[]
): Promise<Map<string, MarketingPricing>> {
  const unique = [...new Set(codes.map((c) => c.toUpperCase()))];
  if (unique.length === 0) return new Map();

  const [catalogMap, ...classLists] = await Promise.all([
    getCoursesCatalogByCodes(unique),
    ...unique.map((code) => getActiveClassesForCourseCode(code)),
  ]);

  const result = new Map<string, MarketingPricing>();
  unique.forEach((code, index) => {
    const activeClass = classLists[index]?.[0];
    if (activeClass) {
      result.set(code, pricingFromClass(activeClass));
      return;
    }
    const catalog = catalogMap.get(code);
    if (catalog) {
      result.set(code, pricingFromCatalog(catalog));
    }
  });

  return result;
}
