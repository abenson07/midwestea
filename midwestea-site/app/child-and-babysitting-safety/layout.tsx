import { CoursePageLayout } from "@/components/course-page-layout";

export default function ChildAndBabysittingSafetyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoursePageLayout>{children}</CoursePageLayout>;
}
