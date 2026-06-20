import { CoursePageLayout } from "@/components/course-page-layout";

export default function CourseTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoursePageLayout>{children}</CoursePageLayout>;
}
