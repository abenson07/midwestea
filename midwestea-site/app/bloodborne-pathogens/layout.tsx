import { CoursePageLayout } from "@/components/course-page-layout";

export default function BloodbornePathogensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoursePageLayout>{children}</CoursePageLayout>;
}
