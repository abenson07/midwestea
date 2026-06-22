const EXACT_PAGE_TITLES: Record<string, string> = {
  "/admin": "Courses",
  "/admin/login": "Login",
  "/admin/otp": "OTP",
  "/admin/courses": "Courses",
  "/admin/programs": "Programs",
  "/admin/classes": "Classes",
  "/admin/classes/add": "Add Class",
  "/admin/students": "Students",
  "/admin/instructors": "Instructors",
  "/admin/payments": "Transactions",
  "/admin/approvals": "Approvals",
  "/admin/reconcile": "Reconcile",
  "/admin/success": "Success",
};

const PREFIX_PAGE_TITLES: [RegExp, string][] = [
  [/^\/admin\/students\/[^/]+\/classes\/[^/]+$/, "Student Class"],
  [/^\/admin\/students\/[^/]+$/, "Student"],
  [/^\/admin\/classes\/[^/]+$/, "Class"],
  [/^\/admin\/class\/[^/]+$/, "Class"],
  [/^\/admin\/courses\/[^/]+$/, "Course"],
  [/^\/admin\/programs\/[^/]+$/, "Program"],
  [/^\/admin\/instructors\/[^/]+$/, "Instructor"],
];

function getAdminPageName(pathname: string): string {
  const exact = EXACT_PAGE_TITLES[pathname];
  if (exact) return exact;

  const prefixMatch = PREFIX_PAGE_TITLES.find(([pattern]) => pattern.test(pathname));
  if (prefixMatch) return prefixMatch[1];

  const segment = pathname.split("/").filter(Boolean)[1];
  if (!segment) return "Dashboard";

  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function getAdminDocumentTitle(pathname: string): string {
  return `Admin - ${getAdminPageName(pathname)}`;
}
