import { marketingPageUrlForCourse } from "@/lib/marketing/marketing-site-url";

type ViewMarketingPageLinkProps = {
  courseCode: string | null | undefined;
  classId?: string | null;
  label?: string;
};

export function ViewMarketingPageLink({
  courseCode,
  classId,
  label = "View on site",
}: ViewMarketingPageLinkProps) {
  const href = marketingPageUrlForCourse(courseCode, classId);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-sm text-blue-600 hover:text-blue-800 mb-2"
    >
      {label} ↗
    </a>
  );
}
