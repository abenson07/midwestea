import { CoursePageLayout } from "@/components/course-page-layout";

export default function ActiveShooterTrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoursePageLayout>{children}</CoursePageLayout>;
}
