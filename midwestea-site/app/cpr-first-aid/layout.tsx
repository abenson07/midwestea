import { CoursePageLayout } from "@/components/course-page-layout";

export default function CprFirstAidLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoursePageLayout>{children}</CoursePageLayout>;
}
